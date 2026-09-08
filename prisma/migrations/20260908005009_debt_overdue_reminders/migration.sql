-- CreateTable
CREATE TABLE "DebtOverdueReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monthKey" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "debtId" TEXT NOT NULL,
    CONSTRAINT "DebtOverdueReminder_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DebtOverdueReminder_debtId_monthKey_key" ON "DebtOverdueReminder"("debtId", "monthKey");
