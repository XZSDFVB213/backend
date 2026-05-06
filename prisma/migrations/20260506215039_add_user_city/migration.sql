-- CreateEnum
CREATE TYPE "City" AS ENUM ('Derbent', 'Madjalis', 'Makhachkala', 'Kaspiysk', 'Izberbash');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" "City" NOT NULL DEFAULT 'Derbent';
