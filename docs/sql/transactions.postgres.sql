-- Creates the table used by TransactionOrmEntity in Postgres / Railway
-- Run once per database. Safe to re-run thanks to IF NOT EXISTS clauses.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "phoneNumber" varchar(10) NOT NULL,
  "amount" integer NOT NULL,
  "userId" varchar(64) NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_transactions_phoneNumber"
  ON "transactions" ("phoneNumber");

CREATE INDEX IF NOT EXISTS "IDX_transactions_userId"
  ON "transactions" ("userId");
