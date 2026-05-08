/*
  Warnings:

  - The values [Makhachkala] on the enum `City` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "City_new" AS ENUM ('Derbent', 'Madjalis', 'Dagestanskie_Ogni', 'Kasumkent', 'Belidzhi', 'Kaspiysk', 'Izberbash');
ALTER TABLE "User" ALTER COLUMN "city" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "city" TYPE "City_new" USING ("city"::text::"City_new");
ALTER TYPE "City" RENAME TO "City_old";
ALTER TYPE "City_new" RENAME TO "City";
DROP TYPE "City_old";
ALTER TABLE "User" ALTER COLUMN "city" SET DEFAULT 'Derbent';
COMMIT;
