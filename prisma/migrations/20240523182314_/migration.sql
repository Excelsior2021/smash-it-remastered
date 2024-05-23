-- DropForeignKey
ALTER TABLE "stat" DROP CONSTRAINT "stat_group_id_fkey";

-- AddForeignKey
ALTER TABLE "stat" ADD CONSTRAINT "stat_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
