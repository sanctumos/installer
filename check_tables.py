import sqlite3

conn = sqlite3.connect('db/sanctum_ui.db')
cursor = conn.cursor()

# Check all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("All tables in database:")
for table in tables:
    print(f"  - {table[0]}")

# Check rate_limits table specifically
cursor.execute("PRAGMA table_info(rate_limits)")
columns = cursor.fetchall()
print(f"\nrate_limits table columns:")
for col in columns:
    print(f"  - {col[1]} ({col[2]})")

conn.close()
