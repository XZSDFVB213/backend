-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "cardNumber" TEXT,
    "discountCardId" TEXT,
    "userId" TEXT,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_receiptNumber_key" ON "Purchase"("receiptNumber");

-- CreateIndex
CREATE INDEX "Purchase_cardNumber_idx" ON "Purchase"("cardNumber");

-- CreateIndex
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_discountCardId_fkey" FOREIGN KEY ("discountCardId") REFERENCES "DiscountCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
