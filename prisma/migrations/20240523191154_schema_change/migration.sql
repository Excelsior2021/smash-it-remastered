/*
  Warnings:

  - The primary key for the `stat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `stat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player1_id_group_id_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player2_id_group_id_fkey";

-- AlterTable
ALTER TABLE "stat" DROP CONSTRAINT "stat_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "stat_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "stat_id_key" ON "stat"("id");

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "stat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "stat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
