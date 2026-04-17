-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "cycleCount" INTEGER NOT NULL DEFAULT 1,
    "cycleUnit" TEXT NOT NULL DEFAULT 'month',
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "notifyBefore" INTEGER NOT NULL DEFAULT 3,
    "notifyHour" INTEGER NOT NULL DEFAULT 9,
    "notifyMinute" INTEGER NOT NULL DEFAULT 0,
    "notifiedAt" DATETIME,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_subscriptions" ("amount", "autoRenew", "categoryId", "createdAt", "currency", "cycleCount", "cycleUnit", "expiresAt", "icon", "id", "name", "notifiedAt", "notifyBefore", "updatedAt") SELECT "amount", "autoRenew", "categoryId", "createdAt", "currency", "cycleCount", "cycleUnit", "expiresAt", "icon", "id", "name", "notifiedAt", "notifyBefore", "updatedAt" FROM "subscriptions";
DROP TABLE "subscriptions";
ALTER TABLE "new_subscriptions" RENAME TO "subscriptions";
CREATE INDEX "subscriptions_expiresAt_idx" ON "subscriptions"("expiresAt");
CREATE INDEX "subscriptions_categoryId_idx" ON "subscriptions"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
