-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_player1_id_group_id_fkey";

-- DropForeignKey
ALTER TABLE "stat" DROP CONSTRAINT "stat_group_id_fkey";

-- AddForeignKey
ALTER TABLE "stat" ADD CONSTRAINT "stat_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player1_id_group_id_fkey" FOREIGN KEY ("player1_id", "group_id") REFERENCES "stat"("user_id", "group_id") ON DELETE CASCADE ON UPDATE CASCADE;
