import { createNetworkClient, eventPrisma } from "@intmax2-withdrawal-aggregator/shared";
import { WITHDRAWAL_EVENT_NAMES } from "../types";
import { handleAllWithdrawalEvents } from "./event.service";
import { batchUpdateWithdrawalStatusTransactions } from "./withdrawal.service";

export const performJob = async (): Promise<void> => {
  const events = await eventPrisma.event.findMany({
    where: {
      name: {
        in: WITHDRAWAL_EVENT_NAMES,
      },
    },
  });

  const ethereumClient = createNetworkClient("ethereum");
  const currentBlockNumber = await ethereumClient.getBlockNumber();

  const { directWithdrawals, claimableWithdrawals, claimedWithdrawals } =
    await handleAllWithdrawalEvents(ethereumClient, currentBlockNumber, events);

  await batchUpdateWithdrawalStatusTransactions(
    directWithdrawals,
    claimableWithdrawals,
    claimedWithdrawals,
  );

  await eventPrisma.$transaction(
    WITHDRAWAL_EVENT_NAMES.map((eventName) =>
      eventPrisma.event.upsert({
        where: {
          name: eventName,
        },
        create: {
          name: eventName,
          lastBlockNumber: currentBlockNumber,
        },
        update: {
          lastBlockNumber: currentBlockNumber,
        },
      }),
    ),
  );
};
