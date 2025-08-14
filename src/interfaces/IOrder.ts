export enum TimeInForce {
  DAY = "0",
  GTC = "1",
  IOC = "3",
  FOK = "4",
}

export const TimeInForceString = {
  "0": "Day",
  "1": "GTC",
  "3": "IOC",
  "4": "FOK",
};

export enum OrderSide {
  BUY = "1",
  SELL = "2",
  BUYMIN = "3",
  SELLPLUS = "4",
  SELLSHT = "5",
  SELLSHTEX = "6",
  UNDISC = "7",
  CROSS = "8",
  CROSSSHORT = "9",
  CROSSSHORTEX = "A",
  ASDEFINED = "B",
  OPPOSITE = "C",
  SUBSCRIBE = "D",
  REDEEM = "E",
  LENDFINANCING = "F",
  BORROWFINANCING = "G",
}

export const OrderSideToName = {
  "1": "Buy",
  "2": "Sell",
  "3": "BuyMIN",
  "4": "SellPLUS",
  "5": "SellSHT",
  "6": "SellSHTEX",
  "7": "UNDISC",
  "8": "CROSS",
  "9": "CROSSSHORT",
  A: "CROSSSHORTEX",
  B: "ASDEFINED",
  C: "OPPOSITE",
  D: "SUBSCRIBE",
  E: "REDEEM",
  F: "LENDFINANCING",
  G: "BORROWFINANCING",
};

export enum PriceChange {
  Down = -1,
  None = 0,
  Up = 1,
}

export interface IPriceTick {
  symbol?: string;
  datetime?: string;
  askPrice?: string;
  bidPrice?: string;
  price?: string;
  spread?: string;
  priceChange?: PriceChange;
  askPriceChange?: PriceChange;
  bidPriceChange?: PriceChange;
}

export enum OrderType {
  Market = "1",
  Limit = "2",
  Stop = "3",
  StopLimit = "4",
  MarketOnClose = "5",
  WithOrWithout = "6",
  LimitOrBetter = "7",
  LimitWithOrWithout = "8",
  OnBasis = "9",
  OnClose = "A",
  LimitOnClose = "B",
  ForexMarket = "C",
  PreviouslyQuoted = "D",
  PreviouslyIndicated = "E",
  ForexLimit = "F",
  ForexSwap = "G",
  ForexPreviouslyQuoted = "H",
  Funari = "I",
  MarketIfTouched = "J",
  MarketWithLeftoverLimit = "K",
  PreviousFundValuationPoint = "L",
  NextFundValuationPoint = "M",
  Pegged = "P",
  OCO = "O",
}

export const AllowedOrderTypes: { label: string; value: OrderType,  disabled?: boolean }[] = [
  {
    label: "Market",
    value: OrderType.Market,
  },
  {
    label: "Limit",
    value: OrderType.Limit,
  },
  {
    label: "Stop",
    value: OrderType.Stop,
  },
  {
    label: "OCO",
    value: OrderType.OCO,
  },
];

export const TradingPanelOrderTypes: { label: string; value: OrderType, disabled?: boolean }[] = [
  {
    label: "Limit",
    value: OrderType.Limit,
  },
  {
    label: "Stop",
    value: OrderType.Stop,
  },
];

export const OrderSides = [
  { label: OrderSideToName[2], value: OrderSide.SELL },
  { label: OrderSideToName[1], value: OrderSide.BUY },
];

export const AllowedOCOTypes = AllowedOrderTypes.filter(
  (e) => e.value === OrderType.Limit || e.value === OrderType.Stop
);

export const OrderTypeToString = {
  "1": "Market",
  "2": "Limit",
  "3": "Stop",
  "4": "StopLimit",
  "5": "MarketOnClose",
  "6": "WithOrWithout",
  "7": "LimitOrBetter",
  "8": "LimitWithOrWithout",
  "9": "OnBasis",
  A: "OnClose",
  B: "LimitOnClose",
  C: "ForexMarket",
  D: "PreviouslyQuoted",
  E: "PreviouslyIndicated",
  F: "ForexLimit",
  G: "ForexSwap",
  H: "ForexPreviouslyQuoted",
  I: "Funari",
  J: "MarketIfTouched",
  K: "MarketWithLeftoverLimit",
  L: "PreviousFundValuationPoint",
  M: "NextFundValuationPoint",
  P: "Pegged",
};

export enum OrderStatus {
  NEW = "0",
  PARTIALLY_FILLED = "1",
  FILLED = "2",
  DONE_FOR_DAY = "3",
  CANCELED = "4",
  REPLACED = "5",
  PENDING_CANCEL = "6",
  STOPPED = "7",
  REJECTED = "8",
  SUSPENDED = "9",
  PENDING_NEW = "A",
  CALCULATED = "B",
  EXPIRED = "C",
  ACCEPTED_FOR_BIDDING = "D",
  PENDING_REPLACE = "E",
}

export const orderIsFilled = (order: IOrder) => {
  return (
    order.status === OrderStatus.FILLED ||
    order.status === OrderStatus.PARTIALLY_FILLED
  );
};

export const orderIsCancelled = (order: IOrder) => {
  return (
    !order.status ||
    order.status === OrderStatus.CANCELED ||
    order.status === OrderStatus.EXPIRED ||
    order.status === OrderStatus.REJECTED ||
    order.status === OrderStatus.SUSPENDED ||
    order.status === OrderStatus.STOPPED
  );
};

export const _OrderStatus = {
  "0": "NEW",
  "1": "PARTIALLY_FILLED",
  "2": "FILLED",
  "3": "DONE_FOR_DAY",
  "4": "CANCELED",
  "5": "REPLACED",
  "6": "PENDING_CANCEL",
  "7": "STOPPED",
  "8": "REJECTED",
  "9": "SUSPENDED",
  A: "PENDING_NEW",
  B: "CALCULATED",
  C: "EXPIRED",
  D: "ACCEPTED_FOR_BIDDING",
  E: "PENDING_REPLACE",
};

export interface StatusMessage {
  code: string;
  message: string;
}

export interface IOrder {
  id: string;
  ticket: string;
  account: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  limitPrice?: string;
  stopPrice?: string;
  clOrderLinkId: string;
  origClOrderId: string;
  lastQty?: string;
  orderQty?: string;
  lastPrice?: string;
  commission?: string;
  timeInForce?: TimeInForce;
  ocoId?: string;
  stopLoss?: string;
  stopLossPips?: number;
  stopLossPipsChange?: string;
  takeProfit?: string;
  takeProfitPips?: number;
  takeProfitPipsChange?: string;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  executionTime?: string;
  trailingStopLoss?: string;
  trigger: string;
  direct?: boolean;

  // additional for grouping in table
  ocoGroup?: string;
}

export interface IOCOOrdersCreate {
  oco1: Partial<IOrderCreate>;
  oco2: Partial<IOrderCreate>;
}

export interface IOrderCreate {
  id: string;
  side: OrderSide;
  account: string;
  timeInForce: TimeInForce;
  symbol: string;
  type: OrderType;
  quantity: string;
  limitPrice?: string;
  stopPrice?: string;
  stopLoss?: string;
  stopLossPips?: number;
  stopLossPipsChange?: string;
  takeProfit?: string;
  takeProfitPips?: number;
  takeProfitPipsChange?: string;
  trailingStopLoss?: string;
  direct?: boolean;
}
