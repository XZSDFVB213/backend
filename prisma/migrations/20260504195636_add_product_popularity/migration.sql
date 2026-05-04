-- CreateEnum
CREATE TYPE "Popularity" AS ENUM ('A', 'B', 'C', 'D');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "popularity" "Popularity" NOT NULL DEFAULT 'C';
