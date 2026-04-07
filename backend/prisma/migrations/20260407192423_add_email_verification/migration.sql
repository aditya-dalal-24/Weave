/*
  Warnings:

  - You are about to drop the column `authProvider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_emailVerificationToken_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authProvider",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "isEmailVerified",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3);
