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


def print_rows(cur, title, query):
    print(f"\n{title}")
    cur.execute(query)
    for row in cur.fetchall():
        print(row)


def main():
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'staging_access'
                  AND table_name <> 'migration_manifest'
                ORDER BY table_name
                """
            )
            tables = [row[0] for row in cur.fetchall()]

            print(f"TABLES: {len(tables)}")
            for table in tables:
                cur.execute(f"SELECT COUNT(*) FROM staging_access.{table}")
                print(f"{table}: {cur.fetchone()[0]}")

            for table in [
                "stg_tabpersona",
                "stg_tabbautismo",
                "stg_tabmatrimonio",
                "stg_tabparroquias",
                "stg_tabsacerdotes",
                "stg_tabmisa",
            ]:
                cur.execute(
                    """
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = 'staging_access'
                      AND table_name = %s
                    ORDER BY ordinal_position
                    """,
                    (table,),
                )
                print(f"\n{table} columns:")
                print(", ".join(row[0] for row in cur.fetchall()))

            print_rows(
                cur,
                "sample personas",
                """
                SELECT percodigo, perregistro, pernombres, perapellido1,
                       perapellido2, perfechanacimiento, persexo
                FROM staging_access.stg_tabpersona
                LIMIT 5
                """,
            )
            print_rows(
                cur,
                "sample bautismos",
                """
                SELECT baucodigo, bauregistro, baulibro, baupagina,
                       baupartida, baufechabautismo, perregistro
                FROM staging_access.stg_tabbautismo
                LIMIT 5
                """,
            )
            print_rows(
                cur,
                "sample matrimonios",
                """
                SELECT matcodigo, matregistro, matlibrom, matpaginam,
                       matpartidam, matfechamatrimonio,
                       perregistronovio, perregistronovia
                FROM staging_access.stg_tabmatrimonio
                LIMIT 5
                """,
            )


if __name__ == "__main__":
    main()
