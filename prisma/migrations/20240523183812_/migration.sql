-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player2_id_group_id_fkey";

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player2_id_group_id_fkey" FOREIGN KEY ("player2_id", "group_id") REFERENCES "stat"("user_id", "group_id") ON DELETE CASCADE ON UPDATE CASCADE;
