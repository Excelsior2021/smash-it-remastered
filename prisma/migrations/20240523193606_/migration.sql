/*
  Warnings:

  - Made the column `group_id` on table `match` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_group_id_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player1_id_group_id_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player2_id_group_id_fkey";

-- AlterTable
ALTER TABLE "match" ALTER COLUMN "group_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player1_id_group_id_fkey" FOREIGN KEY ("player1_id", "group_id") REFERENCES "stat"("user_id", "group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player2_id_group_id_fkey" FOREIGN KEY ("player2_id", "group_id") REFERENCES "stat"("user_id", "group_id") ON DELETE RESTRICT ON UPDATE CASCADE;
