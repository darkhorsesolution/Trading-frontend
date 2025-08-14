import WebSocket from "ws";
import { Message } from "./Message";

export type WsClient = {
  id: string;
  remoteAddress: string;
  client: WebSocket;

  isConnected(): boolean;
  send(message: Message): void;
};

export enum WSEvents {
  Connected = "connected",
  Disconnected = "disconnected",
  Quote = "t",
  Quotes = "ts",
  Position = "p",
  NetPosition = "np",
  Account = "a",
  Trade = "tr",
  Order = "o",
  OCOOrders = "oco",
  Log = "l",
  Trading = "trading",
  Positions = "P",
  Message = "m",
}
