-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN "reviewToken" TEXT,
ADD COLUMN "sentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_reviewToken_key" ON "Quotation"("reviewToken");
