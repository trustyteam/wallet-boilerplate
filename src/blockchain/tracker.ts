import { isDocument } from '@typegoose/typegoose';
import Account from '../models/Account';
import TransactionModel from '../models/Transaction';
import addresses from './addresses';

const getBlockchainTransaction = () => {
  return {};
};

export default async function(): Promise<void> {
  console.log('Listening to transaction on the blockchain...');

    const trx = getBlockchainTransaction();

    if(!trx) return;

    const address: string = "";
    const hash: string = "";
    const value: number = 0;

    if (address && !addresses.has(address)) return;

    try {
      TransactionModel.findOneAndUpdate(
        { hash },
        {
          to: address,
          hash,
          value,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        async (_err, transaction) => {
          if (_err) throw new Error(_err);
          const account = await Account.findOne({
            address: {
              $in: [address, transaction.to],
            },
          }).populate('wallet');

          if (account && isDocument(account.wallet)) {
            transaction.wallet = account.wallet.id;
            await transaction.save();
          }

          console.log(`Found incoming transaction to ${address}`);
          console.log(`Transaction value is: ${value}`);
          console.log(`Transaction hash is: ${hash}`);
        },
      );
    } catch (error) {
      console.log(error);
    }

      
}
