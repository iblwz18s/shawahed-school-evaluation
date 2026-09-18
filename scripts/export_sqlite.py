import sqlite3
import json

conn = sqlite3.connect('prisma/dev.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations';").fetchall()]
print("Tables found:", tables)

data = {}
for table in tables:
    rows = cursor.execute(f"SELECT * FROM {table}").fetchall()
    data[table] = [dict(row) for row in rows]
    print(f"{table}: {len(data[table])} rows")

with open('prisma/sqlite_dump.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Dump completed successfully to prisma/sqlite_dump.json")
