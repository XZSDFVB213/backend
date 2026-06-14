/*
  Warnings:

  - You are about to drop the column `lastUsedAt` on the `DiscountCard` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DiscountCard` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DiscountCard" DROP CONSTRAINT "DiscountCard_userId_fkey";

-- AlterTable
ALTER TABLE "DiscountCard" DROP COLUMN "lastUsedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "lastDiscountUsedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DiscountCard" ADD CONSTRAINT "DiscountCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
