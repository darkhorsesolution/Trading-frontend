import { ITrade } from "@/interfaces/ITrade";
import { OrderSide } from "./IOrder";
import { IAsset } from "@/interfaces/IAsset";

export interface IPosition {
  id: string;
  account: string;
  symbol: string;
  side: OrderSide;
  trades: Array<ITrade>;
  quantity: string;
  brokerage: string;
  grossPL: string;
  netPL: string;
  entryPrice: string;
  avgPrice: string;
  asset?: IAsset;
  hedged: boolean;

  executionTime: Date;
  currentPrice: string;
  closing?: boolean;
}

export interface ITradeModify {
  id: string;
  stopLoss?: string;
  stopLossPips?: number;
  stopLossPipsChange?: string;
  trailingStopLoss?: string;
  takeProfit?: string;
  takeProfitPips?: number;
  takeProfitPipsChange?: string;
}

export const GetPositionDirection = (position: Partial<IPosition>): OrderSide =>
  parseFloat(position.quantity) > 0 ? OrderSide.BUY : OrderSide.SELL;
