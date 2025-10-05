-- CreateTable
CREATE TABLE "user_profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "characterClassId" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_profile_characterClassId_fkey" FOREIGN KEY ("characterClassId") REFERENCES "character_class" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "character_class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "perks" TEXT NOT NULL,
    "soloMultiplier" REAL NOT NULL DEFAULT 0.7,
    "groupMultiplier" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "expedition" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_expedition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userProfileId" TEXT NOT NULL,
    "expeditionId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "user_expedition_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_expedition_expeditionId_fkey" FOREIGN KEY ("expeditionId") REFERENCES "expedition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userProfileId" TEXT NOT NULL,
    "expeditionId" TEXT,
    "exerciseType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "metValue" REAL NOT NULL,
    "points" REAL NOT NULL,
    "isSolo" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "workoutDate" DATETIME NOT NULL,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "workout_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workout_expeditionId_fkey" FOREIGN KEY ("expeditionId") REFERENCES "expedition" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workout_photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workout_photo_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "artifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "pointsValue" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_artifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userProfileId" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expeditionId" TEXT,
    CONSTRAINT "user_artifact_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_artifact_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "artifact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_type" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "metValue" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_userId_key" ON "user_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "expedition_inviteCode_key" ON "expedition"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "user_expedition_userProfileId_expeditionId_key" ON "user_expedition"("userProfileId", "expeditionId");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_type_name_key" ON "exercise_type"("name");
