-- CreateTable
CREATE TABLE "Print" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "line" TEXT NOT NULL,
    "signedBy" TEXT,
    "ink" TEXT NOT NULL,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Print_ink_createdAt_idx" ON "Print"("ink", "createdAt");

-- CreateIndex
CREATE INDEX "Print_createdAt_idx" ON "Print"("createdAt");
