-- AlterTable
CREATE SEQUENCE account_id_seq;
ALTER TABLE "Account" ALTER COLUMN "id" SET DEFAULT nextval('account_id_seq');
ALTER SEQUENCE account_id_seq OWNED BY "Account"."id";
