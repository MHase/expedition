#!/bin/bash
set -e  # Exit on error



# Migration name from argument
MIGRATION_NAME=$1
if [ -z "$MIGRATION_NAME" ]; then
  echo "Error: Please provide a migration name (e.g., ./generate-migration.sh add_users_table)"
  exit 1
fi

# Create a temporary SQLite database
TEMP_DB="temp.db"
rm -f "$TEMP_DB" # Remove the temp.db if it exists
sqlite3 "$TEMP_DB" "VACUUM;"  # Initialize empty DB

# Apply all existing migrations (assuming they’re numbered sequentially)
for sql_file in migrations/*.sql; do
  if [ -f "$sql_file" ]; then
    echo "Applying $sql_file to temporary database..."
    cat "$sql_file" | sqlite3 "$TEMP_DB"
  fi
done

# Calculate the next migration number (e.g., 0002)
NEXT_NUM=$(printf "%04d" $(ls migrations/*.sql 2>/dev/null | wc -l | awk '{print $1 + 1}'))

# Generate the new migration
bunx prisma migrate diff \
  --from-url "file:./$TEMP_DB" \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script \
  --output "migrations/${NEXT_NUM}_${MIGRATION_NAME}.sql"

# Clean up
rm "$TEMP_DB"
echo "Generated migration: migrations/${NEXT_NUM}_${MIGRATION_NAME}.sql"