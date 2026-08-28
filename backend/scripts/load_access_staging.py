import argparse
import csv
import json
import os
import re
from pathlib import Path

import psycopg2
from psycopg2 import sql


DEFAULT_SCHEMA = "staging_access"


def normalize_identifier(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9_]+", "_", value).strip("_").lower()
    if not value:
        value = "col"
    if value[0].isdigit():
        value = f"c_{value}"
    return value[:60]


def unique_identifiers(names):
    seen = {}
    result = []
    for name in names:
        base = normalize_identifier(name)
        candidate = base
        index = 2
        while candidate in seen:
            suffix = f"_{index}"
            candidate = f"{base[:60 - len(suffix)]}{suffix}"
            index += 1
        seen[candidate] = True
        result.append(candidate)
    return result


def connect():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB", "fidessystem_db"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "JHAIR12345"),
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=os.getenv("POSTGRES_PORT", "5432"),
    )


def create_metadata_table(cur, schema):
    cur.execute(
        sql.SQL(
            """
            CREATE TABLE IF NOT EXISTS {}.migration_manifest (
                id bigserial PRIMARY KEY,
                source_file text NOT NULL,
                access_table text NOT NULL,
                staging_table text NOT NULL,
                csv_file text NOT NULL,
                row_count integer NOT NULL,
                columns_json jsonb NOT NULL,
                loaded_at timestamptz NOT NULL DEFAULT now()
            )
            """
        ).format(sql.Identifier(schema))
    )


def load_table(cur, schema, source_file, table_info, replace):
    access_table = table_info["access_table"]
    staging_table = normalize_identifier(table_info["staging_table"])
    csv_file = Path(table_info["csv_file"])
    original_columns = [column["name"] for column in table_info["columns"]]
    pg_columns = unique_identifiers(original_columns)

    if replace:
        cur.execute(
            sql.SQL("DROP TABLE IF EXISTS {}.{}").format(
                sql.Identifier(schema),
                sql.Identifier(staging_table),
            )
        )

    column_defs = [
        sql.SQL("{} text").format(sql.Identifier(column))
        for column in pg_columns
    ]
    column_defs.extend(
        [
            sql.SQL("__legacy_table text NOT NULL DEFAULT {}").format(sql.Literal(access_table)),
            sql.SQL("__legacy_row_number integer"),
            sql.SQL("__loaded_at timestamptz NOT NULL DEFAULT now()"),
        ]
    )

    cur.execute(
        sql.SQL("CREATE TABLE IF NOT EXISTS {}.{} ({})").format(
            sql.Identifier(schema),
            sql.Identifier(staging_table),
            sql.SQL(", ").join(column_defs),
        )
    )

    inserted = 0
    if replace:
        with csv_file.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            rows = []
            for row_number, row in enumerate(reader, start=1):
                rows.append(
                    [
                        None if row.get(original) == "" else row.get(original)
                        for original in original_columns
                    ]
                    + [row_number]
                )

        if rows:
            insert_columns = [sql.Identifier(column) for column in pg_columns]
            insert_columns.append(sql.Identifier("__legacy_row_number"))
            placeholders = sql.SQL(", ").join(sql.Placeholder() for _ in insert_columns)

            cur.executemany(
                sql.SQL("INSERT INTO {}.{} ({}) VALUES ({})").format(
                    sql.Identifier(schema),
                    sql.Identifier(staging_table),
                    sql.SQL(", ").join(insert_columns),
                    placeholders,
                ),
                rows,
            )
            inserted = len(rows)

    cur.execute(
        sql.SQL(
            """
            INSERT INTO {}.migration_manifest
                (source_file, access_table, staging_table, csv_file, row_count, columns_json)
            VALUES (%s, %s, %s, %s, %s, %s::jsonb)
            """
        ).format(sql.Identifier(schema)),
        (
            source_file,
            access_table,
            staging_table,
            str(csv_file),
            int(table_info["row_count"]),
            json.dumps(table_info["columns"], ensure_ascii=False),
        ),
    )

    return staging_table, len(pg_columns), inserted


def main():
    parser = argparse.ArgumentParser(description="Load Access CSV exports into PostgreSQL staging tables.")
    parser.add_argument("--manifest", default="backend/legacy_exports/manifest.json")
    parser.add_argument("--schema", default=DEFAULT_SCHEMA)
    parser.add_argument("--replace", action="store_true", help="Drop and reload staging tables.")
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8-sig"))

    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(sql.Identifier(args.schema)))
            create_metadata_table(cur, args.schema)

            loaded = []
            for table_info in manifest["tables"]:
                table_name, column_count, inserted = load_table(
                    cur,
                    args.schema,
                    manifest["source"],
                    table_info,
                    args.replace,
                )
                loaded.append((table_info["access_table"], table_name, table_info["row_count"], column_count, inserted))

    for access_table, staging_table, row_count, column_count, inserted in loaded:
        print(f"{access_table} -> {args.schema}.{staging_table}: {inserted}/{row_count} rows, {column_count} columns")


if __name__ == "__main__":
    main()
