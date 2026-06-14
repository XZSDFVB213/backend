-- CreateTable
CREATE TABLE "DiscountCard" (
    "id" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCard_cardNumber_key" ON "DiscountCard"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCard_userId_key" ON "DiscountCard"("userId");

-- AddForeignKey
ALTER TABLE "DiscountCard" ADD CONSTRAINT "DiscountCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
