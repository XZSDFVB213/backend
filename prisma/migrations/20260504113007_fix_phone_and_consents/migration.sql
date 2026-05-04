/*
  Warnings:

  - You are about to drop the column `acceptedAtTime` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "acceptedAtTime",
ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ALTER COLUMN "acceptedPolicy" DROP NOT NULL,
ALTER COLUMN "acceptedTerms" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;
