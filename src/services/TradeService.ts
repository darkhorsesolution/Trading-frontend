import { IMessage } from "@/interfaces/IMessage";
import { IOCOOrdersCreate, IOrder } from "@/interfaces/IOrder";
import { IGenericResponse } from "@/utils/network";

export interface IMeta {
  timestamp: string;
  ip: string;
  userID?: string;
}

const GetAccountOpenNetPositions = async (
  account: string
): Promise<[number, any, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/positions/open/net`
  );
  const positions = await res.json();
  return [
    res.status,
    positions.map ? positions.map((pos) => ({ ...pos, account })) : [],
    res,
  ];
};

const GetAccountOpenPositions = async (
  account: string
): Promise<[number, any, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/positions/open`
  );
  const positions = await res.json();
  return [
    res.status,
    positions.map ? positions.map((pos) => ({ ...pos, account })) : [],
    res,
  ];
};

const GetAccountClosedPairedPositions = async (
  account: string
): Promise<[number, any, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/positions/closed/pairs`
  );
  const positions = await res.json();
  return [
    res.status,
    positions.map ? positions.map((pos) => ({ ...pos, account })) : [],
    res,
  ];
};

const GetAccountClosedPositions = async (account: string) => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/positions/closed`
  );
  const positions = await res.json();
  return positions.map((pos) => ({ ...pos, account }));
};

const GetAccountLogs = async (
  account: string,
  page: string,
  perPage: string
): Promise<[number, any, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/logs?page=${page}&perPage=${perPage}`
  );
  return [res.status, await res.json(), res];
};

const GetSystemLogs = async (
  page: string,
  perPage: string
): Promise<[number, any, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/logs?page=${page}&perPage=${perPage}`
  );
  return [res.status, await res.json(), res];
};

const GetAccountOrders = async (account: string) => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/orders`
  );
  return await res.json();
};

const CleanupPosition = async (
  positionId: string,
  account: string,
  meta: IMeta
): Promise<[number, any]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/positions/${positionId}/cleanup`,
    {
      method: "DELETE",
      body: JSON.stringify({
        account,
      }),
      headers: { ...meta },
    }
  );
  return [res.status, await res.json()];
};

const CleanupTrade = async (
  tradeId: string,
  account: string,
  meta: IMeta
): Promise<[number, any]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/trades/${tradeId}/cleanup`,
    {
      method: "DELETE",
      body: JSON.stringify({
        account,
      }),
      headers: { ...meta },
    }
  );
  return [res.status, await res.json()];
};

const ClosePosition = async (
  positionId: string,
  account: string,
  meta: IMeta
): Promise<[number, any]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/positions/${positionId}`,
    {
      method: "DELETE",
      body: JSON.stringify({
        account,
      }),
      headers: { ...meta },
    }
  );
  return [res.status, await res.json()];
};

const CloseNetPosition = async (
  symbol: string,
  account: string,
  meta: IMeta
): Promise<[number, any]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/positions/net/${symbol}`,
    {
      method: "DELETE",
      body: JSON.stringify({
        account,
      }),
      headers: { ...meta },
    }
  );
  return [res.status, await res.json()];
};

const ModifyPosition = async (
  positionId: string,
  account: string,
  takeProfit: string,
  stopLoss: string,
  meta: IMeta
) => {
  const body: Record<string, string> = {};
  if (takeProfit) {
    body.takeProfit = takeProfit;
  }
  if (stopLoss) {
    body.stopLoss = stopLoss;
  }

  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/positions/${positionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { ...meta },
    }
  );
  return await res.json();
};

const ModifyOrder = async (
  account: string,
  orderId: string,
  orderData: Partial<IOrder>,
  meta: IMeta
) => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/orders/${orderId}`,
    {
      method: "PUT",
      body: JSON.stringify(orderData),
      headers: { ...meta },
    }
  );
  return [res.status, await res.json()];
};

const CreateOrder = async (
  order: IOrder,
  account: string,
  meta: IMeta
): Promise<[number, IGenericResponse, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/orders`,
    {
      method: "POST",
      body: JSON.stringify(order),
      headers: { ...meta },
    }
  );
  return [res.status, await res.json(), res];
};

const CreateOCOOrders = async (
  ocoData: IOCOOrdersCreate,
  account: string,
  meta: IMeta
): Promise<[number, IGenericResponse, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/orders/oco`,
    {
      method: "POST",
      body: JSON.stringify(ocoData),
      headers: { ...meta },
    }
  );
  return [res.status, await res.json(), res];
};

const CancelOrder = async (
  orderId: string,
  account: string,
  meta: IMeta
): Promise<[number, any]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/accounts/${account}/orders/${orderId}`,
    {
      method: "DELETE",
      body: JSON.stringify({}),
      headers: { ...meta },
    }
  );
  return [res.status, await res.json()];
};

const GetCandles = async (
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<[number, any]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/candles/spotex:${symbol}?resolution=${resolution}&from=${from}&to=${to}`
  );
  return [res.status, await res.json()];
};

const GetSymbols = async (): Promise<[number, any]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/candles/symbols/spotex`
  );
  return [res.status, await res.json()];
};

const CreateMessage = async (
  message: IMessage
): Promise<[number, IGenericResponse, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${process.env.API_URL}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ ...message }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return [res.status, await res.json(), res];
};

const UpdateMessage = async (
  message: IMessage
): Promise<[number, IGenericResponse, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${process.env.API_URL}/messages/${
      message.id
    }`,
    {
      method: "PUT",
      body: JSON.stringify({ ...message }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return [res.status, await res.json(), res];
};

const DeleteMessage = async (
  id: string
): Promise<[number, IGenericResponse, Response]> => {
  const res = await fetch(
    `${process.env.API_SCHEMA || "https"}://${
      process.env.API_URL
    }/messages/${id}`,
    {
      method: "DELETE",
    }
  );
  return [res.status, await res.json(), res];
};

export {
  CreateOrder,
  CreateOCOOrders,
  ModifyOrder,
  CancelOrder,
  GetAccountOrders,
  GetAccountOpenNetPositions,
  GetAccountOpenPositions,
  GetAccountClosedPairedPositions,
  GetAccountClosedPositions,
  ClosePosition,
  CleanupPosition,
  CleanupTrade,
  CloseNetPosition,
  GetAccountLogs,
  GetSystemLogs,
  ModifyPosition,
  GetCandles,
  GetSymbols,
  CreateMessage,
  UpdateMessage,
  DeleteMessage,
};
