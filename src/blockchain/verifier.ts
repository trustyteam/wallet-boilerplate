import { isDocument } from '@typegoose/typegoose';
import TransactionModel from '../models/Transaction';
import queue from '../utils/queue';

const WALLET = 'xxxwallet';
const getBlockchainTransaction = () => { return {} };
const platformValue = (value: string | number): number | string => { return value};
const confirmTransaction = async (): Promise<void> => {
  const transactions = await TransactionModel.find({
    confirmed: false,
  }).populate('wallet');

  if (!transactions.length) return;

  console.log(`[Tx Verify] Verifying ${transactions.length} transaction`);
  const promises = transactions.map(async transaction => {
    try {
      const trx = getBlockchainTransaction();

      if (!trx) return;

      const blockHash: string = "";
      const blockNumber: number | null = null;
      const confirmations: number = 0;
      if (transaction.blockHash === null) {
        transaction.blockHash = blockHash;
      }

      if (transaction.blockNumber === null) {
        transaction.blockNumber = blockNumber;
      }

      console.log(
        `Transaction with hash ${transaction.hash} has ${confirmations} confirmation(s)`,
      );

      if (confirmations > 0) {
        console.log(
          `Transaction with hash ${transaction.hash} has been successfully confirmed`,
        );
        transaction.confirmed = true;
      }

      transaction.confimations = confirmations;

      await transaction.save();

      // Broadcast the event
      if (isDocument(transaction.wallet)) {
        const broadcast = queue(
          `${WALLET}:confirmedTransactions:${transaction.wallet.apiKey}`,
        );
        broadcast.add({
          address: transaction.to,
          value: platformValue(transaction.value),
        });
      }
      
    } catch (e) {
      console.log(e);
    }
  });
  // TODO
  // We should give up if transaction is failing

  await Promise.all(promises);
};

export default async function(): Promise<void> {
    // we detect on new block
    confirmTransaction();
  
}
