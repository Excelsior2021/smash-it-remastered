-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_group_id_fkey";

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
