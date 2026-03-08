-- CreateTable
CREATE TABLE "Combination" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sequence" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Combination_sequence_key" ON "Combination"("sequence");
