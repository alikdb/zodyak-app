-- CreateTable
CREATE TABLE "Combination" (
    "id" SERIAL NOT NULL,
    "sequence" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Combination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Combination_sequence_key" ON "Combination"("sequence");
