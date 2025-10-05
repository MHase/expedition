# This command makes to migrate Prisma and change to the D1 database, either local or remote.

```
<!-- will generate migration folder and sql file -->

bunx wrangler d1 migrations create [DB_NAME] create_auth_table
```

```
<!-- for generate sql statement -->

bunx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script \
  --output migrations/0001_create_auth_table.sql
```

```
<!-- if we want to create next migration simply use this script with proper url to local DB -->

bunx prisma migrate diff \
  --from-url file:./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/8ce2e1484ae32130ad04f418b68376bbc3b5b70fda8b4720d48d1ccd3a5e70cb.sqlite \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script \
  --output migrations/0002_create_payments_table.sql


<!-- but to omit confusion with complex url etc. use bash script for generating migration -->

./prisma/generate-migration.sh create_payments_table

<!-- it will output the same migrations as previous command in file 0002_create_payments_table.sql -->


```

# Migrate the database model to D1.

- `bunx wrangler d1 migrations apply [DB_NAME] --local`
- `bunx wrangler d1 migrations apply [DB_NAME] --remote`

- `bunx prisma generate`



### Summary
1. run script `./prisma/generate-migration.sh create_[name]_table` with proper argument
2. run migration to D1 with e.g. `bunx wrangler d1 migrations apply [DB_NAME] --local`
3. `bunx prisma generate`