/*
  Warnings:

  - You are about to drop the column `acceptedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "acceptedAt",
ADD COLUMN     "acceptedAtTime" TIMESTAMP(3);
