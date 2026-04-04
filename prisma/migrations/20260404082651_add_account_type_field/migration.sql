-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('HUMAN', 'BOT', 'SYSTEM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "type" "AccountType" NOT NULL DEFAULT 'HUMAN';
