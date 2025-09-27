/*
  Warnings:

  - You are about to drop the column `endTime` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientCpf` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientEmail` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientPhone` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the `schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specialties` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `patientBirth` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `availabilities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_specialtyId_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "endTime",
DROP COLUMN "notes",
DROP COLUMN "patientCpf",
DROP COLUMN "patientEmail",
DROP COLUMN "patientPhone",
DROP COLUMN "startTime",
ADD COLUMN     "patientBirth" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "availabilities" DROP COLUMN "dayOfWeek",
DROP COLUMN "duration",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "isActive";

-- DropTable
DROP TABLE "schedules";

-- DropTable
DROP TABLE "specialties";
