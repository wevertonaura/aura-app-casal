-- CreateTable
CREATE TABLE "FixedBillReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dueDate" DATETIME NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fixedBillId" TEXT NOT NULL,
    CONSTRAINT "FixedBillReminder_fixedBillId_fkey" FOREIGN KEY ("fixedBillId") REFERENCES "FixedBill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FixedBill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "category" TEXT NOT NULL,
    "totalInstallments" INTEGER,
    "dueDay" INTEGER NOT NULL DEFAULT 5,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coupleId" TEXT NOT NULL,
    CONSTRAINT "FixedBill_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FixedBill" ("amount", "category", "coupleId", "createdAt", "id", "name", "startDate", "totalInstallments") SELECT "amount", "category", "coupleId", "createdAt", "id", "name", "startDate", "totalInstallments" FROM "FixedBill";
DROP TABLE "FixedBill";
ALTER TABLE "new_FixedBill" RENAME TO "FixedBill";
CREATE INDEX "FixedBill_coupleId_idx" ON "FixedBill"("coupleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "FixedBillReminder_fixedBillId_dueDate_key" ON "FixedBillReminder"("fixedBillId", "dueDate");
