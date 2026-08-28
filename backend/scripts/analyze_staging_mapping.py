import os

import psycopg2


def connect():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB", "fidessystem_db"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "JHAIR12345"),
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=os.getenv("POSTGRES_PORT", "5432"),
    )


CHECKS = [
    ("personas_total", "select count(*) from staging_access.stg_tabpersona"),
    ("personas_perregistro_distinct", "select count(distinct perregistro) from staging_access.stg_tabpersona"),
    ("personas_perregistro_null", "select count(*) from staging_access.stg_tabpersona where nullif(trim(perregistro),'') is null"),
    ("personas_nombre_null", "select count(*) from staging_access.stg_tabpersona where nullif(trim(pernombres),'') is null"),
    ("personas_apellido1_null", "select count(*) from staging_access.stg_tabpersona where nullif(trim(perapellido1),'') is null"),
    ("sexo_distinct", "select coalesce(persexo,'<NULL>'), count(*) from staging_access.stg_tabpersona group by persexo order by count(*) desc"),
    ("bautismos_total", "select count(*) from staging_access.stg_tabbautismo"),
    ("bautismos_perregistro_match", "select count(*) from staging_access.stg_tabbautismo b join staging_access.stg_tabpersona p on b.perregistro=p.perregistro"),
    ("bautismos_sin_persona", "select count(*) from staging_access.stg_tabbautismo b left join staging_access.stg_tabpersona p on b.perregistro=p.perregistro where p.perregistro is null"),
    ("bautismos_ubicacion_distinct", "select count(*) from (select baulibro,baupagina,baupartida from staging_access.stg_tabbautismo group by 1,2,3) x"),
    ("bautismos_ubicacion_duplicada", "select count(*) from (select baulibro,baupagina,baupartida,count(*) c from staging_access.stg_tabbautismo group by 1,2,3 having count(*)>1) x"),
    ("matrimonios_total", "select count(*) from staging_access.stg_tabmatrimonio"),
    ("mat_novios_match", "select count(*) from staging_access.stg_tabmatrimonio m join staging_access.stg_tabpersona p on m.perregistronovio=p.perregistro"),
    ("mat_novias_match", "select count(*) from staging_access.stg_tabmatrimonio m join staging_access.stg_tabpersona p on m.perregistronovia=p.perregistro"),
    ("mat_ubicacion_duplicada", "select count(*) from (select matlibrom,matpaginam,matpartidam,count(*) c from staging_access.stg_tabmatrimonio group by 1,2,3 having count(*)>1) x"),
    ("parroquias_habilitado", "select coalesce(parhabilitado,'<NULL>'), count(*) from staging_access.stg_tabparroquias group by parhabilitado order by count(*) desc"),
    ("sacerdotes_habilitado", "select coalesce(sachabilitado,'<NULL>'), count(*) from staging_access.stg_tabsacerdotes group by sachabilitado order by count(*) desc"),
]


SAMPLES = [
    (
        "bautismos_sin_persona_sample",
        """
        select b.baucodigo, b.bauregistro, b.perregistro, b.baulibro, b.baupagina, b.baupartida
        from staging_access.stg_tabbautismo b
        left join staging_access.stg_tabpersona p on b.perregistro=p.perregistro
        where p.perregistro is null
        limit 10
        """,
    ),
    (
        "bautismos_duplicados_sample",
        """
        select baulibro, baupagina, baupartida, count(*)
        from staging_access.stg_tabbautismo
        group by 1,2,3
        having count(*) > 1
        order by count(*) desc
        limit 10
        """,
    ),
    (
        "parroquias_sample",
        """
        select parcodigo, parregistro, parnombre, parjurisdiccion, parlugar, parhabilitado
        from staging_access.stg_tabparroquias
        limit 10
        """,
    ),
    (
        "sacerdotes_sample",
        """
        select saccodigo, sacregistro, sacnombre, sachabilitado
        from staging_access.stg_tabsacerdotes
        limit 10
        """,
    ),
    (
        "misa_sample",
        """
        select misacodigo, misaregistro, misaparroquia, misafecharegistro,
               misapersonasolicitante, misapara, misafecharealizacion,
               misahora, cosservicio, coscosto
        from staging_access.stg_tabmisa
        limit 10
        """,
    ),
    (
        "bautismo_libros_top",
        """
        select baulibro, count(*)
        from staging_access.stg_tabbautismo
        group by baulibro
        order by count(*) desc
        limit 30
        """,
    ),
    (
        "bautismo_folios_no_numericos",
        """
        select baupagina, count(*)
        from staging_access.stg_tabbautismo
        where baupagina !~ '^[0-9]+$'
        group by baupagina
        order by count(*) desc
        limit 30
        """,
    ),
    (
        "bautismo_partidas_no_numericas",
        """
        select baupartida, count(*)
        from staging_access.stg_tabbautismo
        where baupartida !~ '^[0-9]+$'
        group by baupartida
        order by count(*) desc
        limit 30
        """,
    ),
    (
        "matrimonio_civil_fecha_sample",
        """
        select matlugarfechamatcivil
        from staging_access.stg_tabmatrimonio
        where nullif(trim(matlugarfechamatcivil),'') is not null
        limit 30
        """,
    ),
    (
        "capilla_destino",
        """
        select id, nombre
        from capillas
        where id = 'c0115d06-8d59-4d1f-95f9-4540ff47caee'
        """,
    ),
]


def main():
    with connect() as conn:
        with conn.cursor() as cur:
            for name, query in CHECKS:
                print(f"\n## {name}")
                cur.execute(query)
                for row in cur.fetchall():
                    print(row)

            for name, query in SAMPLES:
                print(f"\n## {name}")
                cur.execute(query)
                for row in cur.fetchall():
                    print(row)


if __name__ == "__main__":
    main()
