CREATE TYPE "public"."withdrawal_status" AS ENUM('requested', 'relayed', 'success', 'need_claim', 'failed');

CREATE TABLE "withdrawals" (
	"withdrawal_hash" varchar(66) PRIMARY KEY NOT NULL,
	"status" "withdrawal_status" DEFAULT 'requested' NOT NULL,
	"pubkey" varchar(66) NOT NULL,
	"recipient" varchar(42) NOT NULL,
	"contract_withdrawal" json NOT NULL,
	"single_withdrawal_proof" "bytea",
	"l1_tx_hash" varchar(66),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_withdrawals_pubkey" ON "withdrawals" USING btree ("pubkey");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_withdrawals_recipient" ON "withdrawals" USING btree ("recipient");