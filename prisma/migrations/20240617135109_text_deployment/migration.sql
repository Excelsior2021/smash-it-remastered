-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_group_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "email_verified" TIMESTAMP(3),
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "email_verification" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_password" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reset_password_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_id_key" ON "email_verification"("id");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_email_key" ON "email_verification"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_token_key" ON "email_verification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_id_key" ON "reset_password"("id");

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_email_key" ON "reset_password"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_token_key" ON "reset_password"("token");

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification" ADD CONSTRAINT "email_verification_email_fkey" FOREIGN KEY ("email") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_password" ADD CONSTRAINT "reset_password_email_fkey" FOREIGN KEY ("email") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE CASCADE;
