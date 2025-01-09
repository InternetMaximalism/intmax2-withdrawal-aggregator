import { type Event, Prisma as EventPrisma } from "../../../../node_modules/.prisma/event-client";
import {
  Prisma as WithdrawalPrisma,
  WithdrawalStatus,
} from "../../../../node_modules/.prisma/withdrawal-client";

export { EventPrisma, WithdrawalPrisma, WithdrawalStatus, type Event };
