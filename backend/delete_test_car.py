import sqlite3

# Path to your database
db_path = r'C:\Users\jayan\Desktop\Suresha Travels\backend\instance\auth.db'

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if the vehicles table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in cursor.fetchall()]
if 'vehicle' not in tables:
    print("No 'vehicles' table found. Please check your database schema.")
    conn.close()
    exit()

# Delete the vehicle named 'Test Car'
cursor.execute("DELETE FROM vehicle WHERE name = ?", ('Test Car',))
conn.commit()

print("Deleted 'Test Car' from vehicle table (if it existed).")

# Close the connection
conn.close() 