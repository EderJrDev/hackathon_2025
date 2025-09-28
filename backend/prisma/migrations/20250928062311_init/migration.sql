-- CreateEnum
CREATE TYPE "AuthorizationStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateTable
CREATE TABLE "exam_authorizations" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "pacientName" TEXT NOT NULL,
    "pacientBirth" TIMESTAMP(3) NOT NULL,
    "status" "AuthorizationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_authorizations_protocol_key" ON "exam_authorizations"("protocol");
