import argparse
import os
import re
import sys
import unicodedata
from datetime import date, datetime
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from django.db import connection, transaction  # noqa: E402

from apps.sacramentos.models import (  # noqa: E402
    CapillaModel,
    LibroSacramentalModel,
    NotaMarginalModel,
    ParroquiaModel,
    PartidaBaseModel,
    PartidaBautismoModel,
    PartidaMatrimonioModel,
    PersonaModel,
)


MAIN_CAPILLA_ID = "c0115d06-8d59-4d1f-95f9-4540ff47caee"
NULLISH = {
    "",
    "-",
    "--",
    "---",
    "----",
    "-----",
    "------",
    "-------",
    "--------",
    "---------",
    "----------",
    "-----------",
    "NINGUNO",
    "NINUGNO",
    "NINGUNA",
    "NN",
    "N/N",
    "SIN DATOS",
    "S/D",
    "NO",
    "NULL",
}
SPANISH_MONTHS = {
    "ENERO": 1,
    "FEBRERO": 2,
    "MARZO": 3,
    "ABRIL": 4,
    "MAYO": 5,
    "JUNIO": 6,
    "JULIO": 7,
    "AGOSTO": 8,
    "SEPTIEMBRE": 9,
    "SETIEMBRE": 9,
    "OCTUBRE": 10,
    "NOVIEMBRE": 11,
    "DICIEMBRE": 12,
}


class DryRunRollback(Exception):
    def __init__(self, stats):
        self.stats = stats


def clean(value, upper=True, max_length=None):
    if value is None:
        return None
    text = str(value).replace("\x00", " ").strip()
    text = re.sub(r"\s+", " ", text)
    if upper:
        text = text.upper()
    if text.strip().upper() in NULLISH:
        return None
    if max_length and len(text) > max_length:
        return text[:max_length]
    return text or None


def normalize_key(value):
    text = clean(value) or ""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^A-Z0-9]+", " ", text).strip()


def parse_date(value):
    text = clean(value)
    if not text:
        return None

    text = text.replace(".", "/").replace("-", "/")
    match = re.search(r"\b(\d{1,2})/(\d{1,2})/(\d{2,4})\b", text)
    if match:
        day, month, year = [int(part) for part in match.groups()]
        if year < 100:
            year += 1900 if year > 30 else 2000
        try:
            return date(year, month, day)
        except ValueError:
            return None

    match = re.search(
        r"\b(\d{1,2})\s+DE\s+([A-ZÁÉÍÓÚÑ]+)\s+(?:DE\s+)?(\d{4})\b",
        text,
    )
    if match:
        day = int(match.group(1))
        month = SPANISH_MONTHS.get(normalize_key(match.group(2)))
        year = int(match.group(3))
        if month:
            try:
                return date(year, month, day)
            except ValueError:
                return None

    for fmt in ("%Y/%m/%d", "%Y-%m-%d"):
        try:
            return datetime.strptime(text[:10], fmt).date()
        except ValueError:
            pass
    return None


def parse_civil_date(value):
    return parse_date(value)


def split_person_name(full_name):
    text = clean(full_name, max_length=220)
    if not text:
        return None

    text = re.sub(r"^(P\.?|PADRE|PBRO\.?|R\.?P\.?)\s+", "", text).strip()
    text = re.sub(r"\s+", " ", text)
    parts = text.split()

    if len(parts) == 1:
        return parts[0][:100], "SIN APELLIDO", None
    if len(parts) == 2:
        return parts[0][:100], parts[1][:100], None

    # Free-text legacy names usually contain given names plus one surname.
    return " ".join(parts[:-1])[:100], parts[-1][:100], None


def build_observaciones(*parts):
    valid = [part for part in (clean(p, max_length=500) for p in parts) if part]
    return "\n".join(valid) if valid else None


def fetch_dicts(query, params=None):
    with connection.cursor() as cursor:
        cursor.execute(query, params or [])
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def get_migration_user():
    User = get_user_model()
    user = User.objects.filter(username="SuperAdmin").first()
    if not user:
        user = User.objects.filter(is_superuser=True).first()
    if not user:
        raise RuntimeError("No migration user found. Create SuperAdmin first.")
    return user


def get_or_create_person_by_legacy(legacy_source, legacy_ref, defaults):
    person = PersonaModel.objects.filter(
        legacy_source=legacy_source,
        legacy_ref=legacy_ref,
    ).first()
    if person:
        return person, False
    person = PersonaModel.objects.create(
        legacy_source=legacy_source,
        legacy_ref=legacy_ref,
        **defaults,
    )
    return person, True


def create_free_text_person(full_name, legacy_source, legacy_ref, tipo_persona):
    parsed = split_person_name(full_name)
    if not parsed:
        return None, False
    nombres, apellido_paterno, apellido_materno = parsed
    return get_or_create_person_by_legacy(
        legacy_source,
        legacy_ref,
        {
            "nombres": nombres,
            "apellido_paterno": apellido_paterno or "SIN APELLIDO",
            "apellido_materno": apellido_materno,
            "tipo_persona": tipo_persona,
        },
    )


def get_or_create_priest(name, priest_cache):
    key = normalize_key(name)
    if not key:
        return None, False
    if key in priest_cache:
        return priest_cache[key], False
    person, created = create_free_text_person(
        name,
        "access_sacerdote_nombre",
        key[:80],
        "SACERDOTE",
    )
    if person:
        person.estado_civil = "CONSAGRADO"
        person.sexo = person.sexo or "M"
        person.save(update_fields=["estado_civil", "sexo"])
        priest_cache[key] = person
    return person, created


def ensure_book(capilla, tipo_sacramento, numero_libro, fecha_apertura):
    numero = clean(numero_libro, max_length=50) or "SIN LIBRO"
    book, _ = LibroSacramentalModel.objects.get_or_create(
        capilla=capilla,
        tipo_sacramento=tipo_sacramento,
        numero_libro=numero,
        defaults={
            "fecha_apertura": fecha_apertura or date(1900, 1, 1),
            "estado": "ABIERTO",
        },
    )
    return book


def migrate_external_chapels(stats):
    parroquia, created = ParroquiaModel.objects.get_or_create(
        nombre="PARROQUIAS EXTERNAS",
        defaults={
            "diocesis": "ARQUIDIÓCESIS DE LA PAZ",
            "estado": "ACTIVA",
        },
    )
    stats["parroquias_externas_created"] += int(created)

    rows = fetch_dicts(
        """
        select parregistro, parnombre, parjurisdiccion, parlugar, parotro, parhabilitado
        from staging_access.stg_tabparroquias
        order by parregistro
        """
    )
    for row in rows:
        legacy_ref = clean(row["parregistro"], max_length=80)
        if not legacy_ref:
            continue
        chapel = CapillaModel.objects.filter(
            legacy_source="access_tabparroquias",
            legacy_ref=legacy_ref,
        ).first()
        if chapel:
            stats["capillas_externas_skipped"] += 1
            continue
        nombre = clean(row["parnombre"], max_length=150) or f"PARROQUIA EXTERNA {legacy_ref}"
        CapillaModel.objects.create(
            parroquia=parroquia,
            nombre=nombre,
            ciudad=clean(row["parlugar"], max_length=100) or "SIN CIUDAD",
            municipio=clean(row["parjurisdiccion"], max_length=100) or "SIN JURISDICCION",
            direccion=clean(row["parotro"]),
            capacidad_personas=0,
            estado="ACTIVA" if clean(row["parhabilitado"]) == "S" else "INACTIVA",
            legacy_source="access_tabparroquias",
            legacy_ref=legacy_ref,
        )
        stats["capillas_externas_created"] += 1


def migrate_base_people(stats):
    rows = fetch_dicts(
        """
        select percodigo, perregistro, pernombres, perapellido1, perapellido2,
               perlugarn, perfechanacimiento, persexo
        from staging_access.stg_tabpersona
        order by perregistro
        """
    )
    people_map = {}
    for row in rows:
        legacy_ref = clean(row["perregistro"], max_length=80)
        if not legacy_ref:
            stats["personas_skipped"] += 1
            continue

        sexo = clean(row["persexo"])
        fecha_nacimiento = parse_date(row["perfechanacimiento"])
        person, created = get_or_create_person_by_legacy(
            "access_tabpersona",
            legacy_ref,
            {
                "nombres": clean(row["pernombres"], max_length=100) or "SIN NOMBRE",
                "apellido_paterno": clean(row["perapellido1"], max_length=100) or "SIN APELLIDO",
                "apellido_materno": clean(row["perapellido2"], max_length=100),
                "fecha_nacimiento": fecha_nacimiento,
                "lugar_nacimiento": clean(row["perlugarn"], max_length=150),
                "sexo": "M" if sexo == "HOMBRE" else "F" if sexo == "MUJER" else None,
                "tipo_persona": "FIEL",
            },
        )
        people_map[legacy_ref] = person
        stats["personas_created" if created else "personas_skipped"] += 1
    return people_map


def migrate_priests(stats):
    priest_cache = {}
    rows = fetch_dicts(
        """
        select sacregistro, sacnombre
        from staging_access.stg_tabsacerdotes
        order by sacregistro
        """
    )
    for row in rows:
        legacy_ref = clean(row["sacregistro"], max_length=80)
        if not legacy_ref:
            continue
        parsed = split_person_name(row["sacnombre"])
        if not parsed:
            continue
        nombres, apellido_paterno, apellido_materno = parsed
        person, created = get_or_create_person_by_legacy(
            "access_tabsacerdotes",
            legacy_ref,
            {
                "nombres": nombres,
                "apellido_paterno": apellido_paterno,
                "apellido_materno": apellido_materno,
                "sexo": "M",
                "estado_civil": "CONSAGRADO",
                "tipo_persona": "SACERDOTE",
            },
        )
        priest_cache[normalize_key(row["sacnombre"])] = person
        stats["sacerdotes_created" if created else "sacerdotes_skipped"] += 1
    return priest_cache


def migrate_baptisms(stats, capilla, people_map, priest_cache, migration_user):
    source_people = {
        row["perregistro"]: row
        for row in fetch_dicts(
            """
            select perregistro, perpadre, permadre
            from staging_access.stg_tabpersona
            """
        )
    }
    rows = fetch_dicts(
        """
        select *
        from staging_access.stg_tabbautismo
        order by bauregistro
        """
    )
    for row in rows:
        legacy_ref = clean(row["bauregistro"], max_length=80)
        if not legacy_ref:
            stats["bautismos_skipped"] += 1
            continue
        if PartidaBaseModel.objects.filter(legacy_source="access_tabbautismo", legacy_ref=legacy_ref).exists():
            stats["bautismos_skipped"] += 1
            continue

        sacrament_date = parse_date(row["baufechabautismo"])
        bautizado = people_map.get(clean(row["perregistro"], max_length=80))
        if not sacrament_date or not bautizado:
            stats["bautismos_errors"] += 1
            continue

        person_row = source_people.get(clean(row["perregistro"], max_length=80), {})
        padre, _ = create_free_text_person(
            person_row.get("perpadre"),
            "access_bautismo_padre",
            f"{legacy_ref}:PADRE",
            "PADRE_MADRE",
        )
        madre, _ = create_free_text_person(
            person_row.get("permadre"),
            "access_bautismo_madre",
            f"{legacy_ref}:MADRE",
            "PADRE_MADRE",
        )
        padrino, _ = create_free_text_person(
            row["baunombrepadrino"],
            "access_bautismo_padrino",
            f"{legacy_ref}:PADRINO",
            "PADRINO_MADRINA",
        )
        madrina_name = row["baunombremadrina"] or row["baumadrina"]
        madrina, _ = create_free_text_person(
            madrina_name,
            "access_bautismo_madrina",
            f"{legacy_ref}:MADRINA",
            "PADRINO_MADRINA",
        )
        celebrante, _ = get_or_create_priest(row["baupadre1"], priest_cache)
        certificador, _ = get_or_create_priest(row["baupadre2"], priest_cache)

        book = ensure_book(capilla, "BAUTISMO", row["baulibro"], sacrament_date)
        partida = PartidaBaseModel.objects.create(
            libro=book,
            numero_folio=clean(row["baupagina"], max_length=50) or "SIN FOLIO",
            numero_partida=clean(row["baupartida"], max_length=50) or "SIN PARTIDA",
            fecha_sacramento=sacrament_date,
            sacerdote_celebrante=celebrante,
            sacerdote_certificador=certificador,
            observaciones=build_observaciones(
                f"LEGACY BAUTISMO {legacy_ref}",
                row["baunotasinternas"],
                f"REG. CIVIL: {clean(row['bauregistrocivil']) or ''} LIBRO: {clean(row['baulibrocivil']) or ''} PARTIDA: {clean(row['baupartidacivil']) or ''}",
            ),
            registrado_por=migration_user,
            legacy_source="access_tabbautismo",
            legacy_ref=legacy_ref,
        )
        bautismo = PartidaBautismoModel.objects.create(
            partida=partida,
            bautizado=bautizado,
            padre=padre,
            madre=madre,
            padrino=padrino,
            madrina=madrina,
            hijo_legitimo=True,
        )

        marginal = clean(row["baunotasmarginales"])
        if marginal:
            spouse, _ = create_free_text_person(
                row["baupersonam"],
                "access_bautismo_conyuge_marginal",
                f"{legacy_ref}:CONYUGE",
                "HISTORICO",
            )
            spouse_text = f"CONYUGE: {spouse}" if spouse else None
            NotaMarginalModel.objects.create(
                partida_bautismo=bautismo,
                tipo_anotacion="MATRIMONIO",
                partida_origen=None,
                descripcion=build_observaciones(
                    marginal,
                    spouse_text,
                    f"PARROQUIA/CAPILLA MATRIMONIO: {clean(row['bauparroquiam']) or ''}",
                )
                or marginal,
                fecha_decreto=sacrament_date,
                autorizado_por=certificador or celebrante or bautizado,
                parroquia_externa_nombre=clean(row["bauparroquiam"], max_length=150),
            )
            stats["notas_marginales_created"] += 1

        stats["bautismos_created"] += 1


def migrate_marriages(stats, capilla, people_map, priest_cache, migration_user):
    rows = fetch_dicts(
        """
        select *
        from staging_access.stg_tabmatrimonio
        order by matregistro
        """
    )
    for row in rows:
        legacy_ref = clean(row["matregistro"], max_length=80)
        if not legacy_ref:
            stats["matrimonios_skipped"] += 1
            continue
        if PartidaBaseModel.objects.filter(legacy_source="access_tabmatrimonio", legacy_ref=legacy_ref).exists():
            stats["matrimonios_skipped"] += 1
            continue

        sacrament_date = parse_date(row["matfechamatrimonio"])
        novio = people_map.get(clean(row["perregistronovio"], max_length=80))
        novia = people_map.get(clean(row["perregistronovia"], max_length=80))
        if not sacrament_date or not novio or not novia:
            stats["matrimonios_errors"] += 1
            continue

        testigo_1, _ = create_free_text_person(row["mattestigo1"], "access_matrimonio_testigo", f"{legacy_ref}:TESTIGO1", "TESTIGO")
        testigo_2, _ = create_free_text_person(row["mattestigo2"], "access_matrimonio_testigo", f"{legacy_ref}:TESTIGO2", "TESTIGO")
        padrino, _ = create_free_text_person(row["matpadrino1"], "access_matrimonio_padrino", f"{legacy_ref}:PADRINO", "PADRINO_MADRINA")
        madrina, _ = create_free_text_person(row["matpadrino2"], "access_matrimonio_madrina", f"{legacy_ref}:MADRINA", "PADRINO_MADRINA")
        celebrante, _ = get_or_create_priest(row["matpadre1"], priest_cache)
        certificador, _ = get_or_create_priest(row["matpadre2"], priest_cache)

        book = ensure_book(capilla, "MATRIMONIO", row["matlibrom"], sacrament_date)
        partida = PartidaBaseModel.objects.create(
            libro=book,
            numero_folio=clean(row["matpaginam"], max_length=50) or "SIN FOLIO",
            numero_partida=clean(row["matpartidam"], max_length=50) or "SIN PARTIDA",
            fecha_sacramento=sacrament_date,
            sacerdote_celebrante=celebrante,
            sacerdote_certificador=certificador,
            observaciones=build_observaciones(
                f"LEGACY MATRIMONIO {legacy_ref}",
                row["matnotasinternas"],
                row["matnotasmarginales"],
                f"MATRIMONIO CIVIL ORIGINAL: {clean(row['matlugarfechamatcivil']) or ''}",
            ),
            registrado_por=migration_user,
            legacy_source="access_tabmatrimonio",
            legacy_ref=legacy_ref,
        )
        PartidaMatrimonioModel.objects.create(
            partida=partida,
            novio=novio,
            novia=novia,
            testigo_1=testigo_1,
            testigo_2=testigo_2,
            padrino=padrino,
            madrina=madrina,
            reg_civil_oficialia=clean(row["matrc"], max_length=50),
            reg_civil_libro=clean(row["matlibro"], max_length=50),
            reg_civil_partida=clean(row["matpartida"], max_length=50),
            reg_civil_fecha=parse_civil_date(row["matlugarfechamatcivil"]),
        )
        stats["matrimonios_created"] += 1


def empty_stats():
    keys = [
        "parroquias_externas_created",
        "capillas_externas_created",
        "capillas_externas_skipped",
        "personas_created",
        "personas_skipped",
        "sacerdotes_created",
        "sacerdotes_skipped",
        "bautismos_created",
        "bautismos_skipped",
        "bautismos_errors",
        "matrimonios_created",
        "matrimonios_skipped",
        "matrimonios_errors",
        "notas_marginales_created",
    ]
    return {key: 0 for key in keys}


def run(execute):
    stats = empty_stats()
    capilla = CapillaModel.objects.get(es_sede_principal=True)
    migration_user = get_migration_user()

    with transaction.atomic():
        migrate_external_chapels(stats)
        people_map = migrate_base_people(stats)
        priest_cache = migrate_priests(stats)
        migrate_baptisms(stats, capilla, people_map, priest_cache, migration_user)
        migrate_marriages(stats, capilla, people_map, priest_cache, migration_user)

        if not execute:
            raise DryRunRollback(stats)

    return stats


def dry_run_report():
    stats = empty_stats()
    capilla = CapillaModel.objects.get(es_sede_principal=True)
    get_migration_user()

    stats["capilla_destino"] = str(capilla)

    stats["personas_base_total"] = len(fetch_dicts("select perregistro from staging_access.stg_tabpersona"))
    stats["personas_base_ya_migradas"] = PersonaModel.objects.filter(legacy_source="access_tabpersona").count()
    stats["sacerdotes_catalogo_total"] = len(fetch_dicts("select sacregistro from staging_access.stg_tabsacerdotes"))
    stats["parroquias_externas_total"] = len(fetch_dicts("select parregistro from staging_access.stg_tabparroquias"))

    baptism_rows = fetch_dicts(
        """
        select bauregistro, baufechabautismo, baulibro, baupagina, baupartida, perregistro
        from staging_access.stg_tabbautismo
        """
    )
    marriage_rows = fetch_dicts(
        """
        select matregistro, matfechamatrimonio, matlibrom, matpaginam, matpartidam,
               perregistronovio, perregistronovia, matlugarfechamatcivil
        from staging_access.stg_tabmatrimonio
        """
    )
    person_refs = {
        row["perregistro"]
        for row in fetch_dicts("select perregistro from staging_access.stg_tabpersona")
    }

    stats["bautismos_total"] = len(baptism_rows)
    stats["bautismos_fecha_invalida"] = sum(1 for row in baptism_rows if not parse_date(row["baufechabautismo"]))
    stats["bautismos_sin_persona"] = sum(1 for row in baptism_rows if row["perregistro"] not in person_refs)
    stats["bautismos_ya_migrados"] = PartidaBaseModel.objects.filter(legacy_source="access_tabbautismo").count()

    stats["matrimonios_total"] = len(marriage_rows)
    stats["matrimonios_fecha_invalida"] = sum(1 for row in marriage_rows if not parse_date(row["matfechamatrimonio"]))
    stats["matrimonios_sin_novio"] = sum(1 for row in marriage_rows if row["perregistronovio"] not in person_refs)
    stats["matrimonios_sin_novia"] = sum(1 for row in marriage_rows if row["perregistronovia"] not in person_refs)
    stats["matrimonios_civil_fecha_extraible"] = sum(1 for row in marriage_rows if parse_civil_date(row["matlugarfechamatcivil"]))
    stats["matrimonios_ya_migrados"] = PartidaBaseModel.objects.filter(legacy_source="access_tabmatrimonio").count()

    stats["dry_run"] = "validation only; no rows inserted"
    return stats


def main():
    parser = argparse.ArgumentParser(description="Migrate Access staging data into FidesSystem final tables.")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true", help="Run all transformations and roll back.")
    mode.add_argument("--execute", action="store_true", help="Persist the migration.")
    args = parser.parse_args()

    if args.dry_run:
        stats = dry_run_report()
    else:
        stats = run(execute=True)

    print("Migration summary")
    for key, value in stats.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
