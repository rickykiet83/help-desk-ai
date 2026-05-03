/*
  Warnings:

  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_pkey",
ADD COLUMN     "senderEmail" TEXT,
ADD COLUMN     "senderName" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "category" DROP NOT NULL,
ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id");
