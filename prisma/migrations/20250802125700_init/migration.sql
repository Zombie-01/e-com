/*
  Warnings:

  - You are about to drop the column `image` on the `Color` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Product` table. All the data in the column will be lost.
  - Added the required column `image` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Color" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "images";

-- AlterTable
ALTER TABLE "public"."ProductVariant" ADD COLUMN     "image" TEXT NOT NULL;
