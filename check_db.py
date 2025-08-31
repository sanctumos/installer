import sqlite3

conn = sqlite3.connect('db/sanctum_ui.db')
cursor = conn.cursor()

# Check all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("All tables in database:")
for table in tables:
    print(f"  - {table[0]}")

# Check if rate_limits table exists
cursor.execute("PRAGMA table_info(rate_limits)")
columns = cursor.fetchall()
if columns:
    print(f"\nrate_limits table columns:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
else:
    print("\nrate_limits table does not exist")

conn.close()
