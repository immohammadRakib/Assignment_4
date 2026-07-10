/*
  Warnings:

  - The values [CANCELED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [AVAILABLE,RENTED,SUSPENDED] on the enum `PropertyStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `totalPrice` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `pricePerDay` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[bookingId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `landlordId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingId` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ActiveStatus" ADD VALUE 'DELETED';

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');
ALTER TABLE "public"."payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PropertyStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');
ALTER TABLE "public"."properties" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "properties" ALTER COLUMN "status" TYPE "PropertyStatus_new" USING ("status"::text::"PropertyStatus_new");
ALTER TYPE "PropertyStatus" RENAME TO "PropertyStatus_old";
ALTER TYPE "PropertyStatus_new" RENAME TO "PropertyStatus";
DROP TYPE "public"."PropertyStatus_old";
ALTER TABLE "properties" ALTER COLUMN "status" SET DEFAULT 'APPROVED';
COMMIT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "landlordId" TEXT NOT NULL,
ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "propertyId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "pricePerDay" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "status" SET DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "bookingId" TEXT NOT NULL,
ALTER COLUMN "rating" SET DEFAULT 5;

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- CreateIndex
CREATE INDEX "bookings_tenantId_propertyId_idx" ON "bookings"("tenantId", "propertyId");

-- CreateIndex
CREATE INDEX "bookings_startDate_endDate_idx" ON "bookings"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "properties_location_city_idx" ON "properties"("location", "city");

-- CreateIndex
CREATE INDEX "properties_pricePerDay_idx" ON "properties"("pricePerDay");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");

-- CreateIndex
CREATE INDEX "reviews_propertyId_idx" ON "reviews"("propertyId");

-- CreateIndex
CREATE INDEX "reviews_comment_idx" ON "reviews"("comment");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
