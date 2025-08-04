/*
  Warnings:

  - You are about to drop the column `city` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Address` table. All the data in the column will be lost.
  - The `image` column on the `ProductVariant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Address" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "postalCode";

-- AlterTable
ALTER TABLE "public"."ProductVariant" DROP COLUMN "image",
ADD COLUMN     "image" TEXT[];
