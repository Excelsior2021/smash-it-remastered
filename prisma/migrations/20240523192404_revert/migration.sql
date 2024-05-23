/*
  Warnings:

  - The primary key for the `stat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `stat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player1_id_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player2_id_fkey";

-- DropIndex
DROP INDEX "stat_id_key";

-- AlterTable
ALTER TABLE "stat" DROP CONSTRAINT "stat_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "stat_pkey" PRIMARY KEY ("user_id", "group_id");

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player1_id_group_id_fkey" FOREIGN KEY ("player1_id", "group_id") REFERENCES "stat"("user_id", "group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player2_id_group_id_fkey" FOREIGN KEY ("player2_id", "group_id") REFERENCES "stat"("user_id", "group_id") ON DELETE RESTRICT ON UPDATE CASCADE;
