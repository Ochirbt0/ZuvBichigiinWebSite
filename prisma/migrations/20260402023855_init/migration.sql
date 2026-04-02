/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,lessonId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `levelId` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "difficulty";

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "levelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "level";

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_lessonId_key" ON "Progress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
