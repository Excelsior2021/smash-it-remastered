/*
  Warnings:

  - Made the column `matches` on table `stat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `win_ratio` on table `stat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "stat" ALTER COLUMN "matches" SET NOT NULL,
ALTER COLUMN "win_ratio" SET NOT NULL;
