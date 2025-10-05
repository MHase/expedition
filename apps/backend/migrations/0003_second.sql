-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_expedition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetPoints" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "inviteCode" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "expedition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user_profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_expedition" ("createdAt", "createdById", "description", "duration", "endDate", "id", "inviteCode", "isPublic", "name", "startDate", "status", "targetPoints", "updatedAt") SELECT "createdAt", "createdById", "description", "duration", "endDate", "id", "inviteCode", "isPublic", "name", "startDate", "status", "targetPoints", "updatedAt" FROM "expedition";
DROP TABLE "expedition";
ALTER TABLE "new_expedition" RENAME TO "expedition";
CREATE UNIQUE INDEX "expedition_inviteCode_key" ON "expedition"("inviteCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
