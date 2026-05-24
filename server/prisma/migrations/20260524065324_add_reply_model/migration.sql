-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('Agent', 'Customer');

-- CreateTable
CREATE TABLE "Reply" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "senderType" "SenderType" NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
