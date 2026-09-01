-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Couple" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inviteCode" TEXT NOT NULL,
    "leisureBudget" DECIMAL NOT NULL DEFAULT 0,
    "mode" TEXT NOT NULL DEFAULT 'conjunto',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Couple" ("createdAt", "id", "inviteCode", "leisureBudget") SELECT "createdAt", "id", "inviteCode", "leisureBudget" FROM "Couple";
DROP TABLE "Couple";
ALTER TABLE "new_Couple" RENAME TO "Couple";
CREATE UNIQUE INDEX "Couple_inviteCode_key" ON "Couple"("inviteCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
