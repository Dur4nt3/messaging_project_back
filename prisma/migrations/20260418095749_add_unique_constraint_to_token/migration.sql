/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `TokenBlacklist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TokenBlacklist_token_key" ON "TokenBlacklist"("token");
