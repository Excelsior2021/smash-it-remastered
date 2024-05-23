-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player1_id_group_id_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player2_id_group_id_fkey";

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player1_id_group_id_fkey" FOREIGN KEY ("player1_id", "group_id") REFERENCES "stat"("user_id", "group_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player2_id_group_id_fkey" FOREIGN KEY ("player2_id", "group_id") REFERENCES "stat"("user_id", "group_id") ON DELETE NO ACTION ON UPDATE CASCADE;
