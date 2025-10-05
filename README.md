This is starter template for saas, contains:
* fe - react with tanstack router, shadcn, better-auth
* be - prisma, better-auth

both created to be deployed on CF.

To properly start working simply find `mono-saas` in whole project (‼️ except this readme) and replace with proper saas name

Remember to setup db locally (run inside `apps/backend`):
1. bunx wrangler d1 migrations apply [DB_NAME] --local
2. bunx prisma generate
