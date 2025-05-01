import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { bytea } from "./utils";

const withdrawalStatus = ["requested", "relayed", "success", "need_claim", "failed"] as const;
export type WithdrawalStatus = (typeof withdrawalStatus)[number];
const withdrawalStatusEnum = t.pgEnum("withdrawal_status", withdrawalStatus);

export const withdrawalSchema = table(
  "withdrawals",
  {
    uuid: t.varchar("uuid").primaryKey(),
    status: withdrawalStatusEnum("status").default("requested").notNull(),
    pubkey: t.varchar("pubkey", { length: 66 }).notNull(),
    recipient: t.varchar("recipient", { length: 42 }).notNull(),
    withdrawalHash: t.varchar("withdrawal_hash", { length: 66 }).notNull(),
    contractWithdrawal: t.json("contract_withdrawal").notNull(),
    singleWithdrawalProof: bytea("single_withdrawal_proof"),
    l1TxHash: t.varchar("l1_tx_hash", { length: 66 }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    t.uniqueIndex("idx_withdrawals_pubkey").on(table.pubkey),
    t.uniqueIndex("idx_withdrawals_recipient").on(table.recipient),
  ],
);
