-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."ProductVariant" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
