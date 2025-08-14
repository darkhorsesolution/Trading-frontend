export interface ITransaction {
  id: string;
  account: string;
  currency: string;
  moneyType: string;
  moneyAmt: string;
  text: string;
  dateOfInterest: bigint;
}
