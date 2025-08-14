import { IAsset } from "./IAsset";
import { OrderSide } from "./IOrder";

export interface ITrade {
  id: string;
  side: OrderSide;
  account: string;
  symbol: string;
  tradeDate: string;
  transactTime: string;
  orderId: string;
  clOrderId: string;
  commission: string;
  price: string;
  quantity: string;
  executionTime?: string;
  createdAt?: string;
  takeProfit?: string;
  stopLoss?: string;
  trailingStopLoss?: string;
  trigger?: string;
  hedged: boolean;

  remaining?: {
    remainingQty: string;
    remainingPercent: string;
    remainingCommission: string;
  };
}

export type IClosableTrade = ITrade & {
  pl?: string;
  closing?: boolean;
  comment?: string;
  asset: IAsset;
  currentPrice: string;
  subRows?: IClosableTrade[];
};
