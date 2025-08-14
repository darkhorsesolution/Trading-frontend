import { io, Socket } from "socket.io-client";
import { expose } from "comlink";
import { WSEvents } from "./interfaces/WsClient";
import { IPriceTick } from "./interfaces/IOrder";
import { IPosition } from "./interfaces/IPosition";

type EventsCallbacks = {
  [key in WSEvents]?: (data: any) => void;
};

export type PriceTickCollection = { [key: string]: IPriceTick };

let quotes: PriceTickCollection = {};
let positions: Record<string, IPosition> = {};
let netPositions: Record<string, IPosition> = {};

class DataWorker {
  socket: Socket = null;
  accountNumber: string;
  connected: boolean = false;
  cbs: EventsCallbacks = {};

  constructor(apiUrl, wsToken, accountNumber: string) {
    this.socket = io(apiUrl, {
      auth: {
        token: wsToken,
      },
      query: {
        env: "api",
        account: accountNumber,
        server: process.env.NEXT_PUBLIC_SERVER,
      },
      transports: ["websocket"],
    });
    this.accountNumber = accountNumber;

    this.socket.on("connect", () => {
      this.connected = true;
      this.emit(WSEvents.Connected, null);
    });
    this.socket.on("disconnect", (reason) => {
      this.connected = false;
      this.emit(WSEvents.Disconnected, null);
    });
    this.socket.on("connect_error", (e) => {
      console.log("connect_error", e);
      if (e.message === "websocket error") {
        setTimeout(() => {
          this.socket.connect();
        }, 1000);
      }
    });
    this.socket.on(WSEvents.Quote, (data: IPriceTick) => {
      quotes[data.symbol] = data;
    });
    this.socket.on(WSEvents.Quotes, (data: PriceTickCollection) => {
      quotes = data;
    });
    this.socket.on(WSEvents.Position, (data: IPosition) => {
      if (data.account === this.accountNumber) {
        positions[data.id] = data;
      }
    });
    this.socket.on(WSEvents.Positions, (data: IPosition[]) => {
      if (data.length && data[0].account === this.accountNumber) {
        for (const position of data) {
          positions[position.id] = position;
        }
      }
    });
    this.socket.on(WSEvents.NetPosition, (data: IPosition) => {
      if (data.account === this.accountNumber) {
        netPositions[data.symbol] = data;
      }
    });
  }

  onEvent(event: WSEvents, cb: (data: any) => void) {
    this.cbs[event] = cb;
    this.socket.on(event, this.emit.bind(this, event));

    if (event === WSEvents.Connected && this.connected) {
      this.emit(WSEvents.Connected, null)
    } else if (event === WSEvents.Disconnected && !this.connected) {
      this.emit(WSEvents.Disconnected, null)
    }
  }

  emit(event: WSEvents, data: any) {
    if (event === WSEvents.Message) {
      this.cbs[event](data);
      return;
    }

    if (
      this.cbs[event] &&
      (!data || data.connected !== undefined || data.length || Object.keys(data).length > 0)
    ) {
      if (event === WSEvents.Positions) {
        if (!data.length || data[0].account !== this.accountNumber) {
          return;
        }
      } else if (event === WSEvents.Account) {
        // backend returns nested structur { daily: {...}, ...}, but node's prisma uses flat structure. This helps to normalize it:
        for (const key of Object.keys(data.daily)) {
          data[`daily_${key}`] = data.daily[key];
        }
        for (const key of Object.keys(data.total)) {
          data[`total_${key}`] = data.total[key];
        }
        delete data.daily;
        delete data.total;
      } else if (event === WSEvents.OCOOrders) {
        if (!data.oco1 || data.oco1.account !== this.accountNumber) {
          return;
        }
      } else if (data && data.account && data.account !== this.accountNumber) {
        // ignore all other messages not intended for current account(s)
        return;
      }

      this.cbs[event](data);
    }
  }

  public async getQuotes(): Promise<PriceTickCollection> {
    return quotes;
  }

  public async getQuote(symbol: string): Promise<IPriceTick> {
    return quotes[symbol];
  }

  public async getPositions(): Promise<Record<string, IPosition>> {
    const toEmit = positions;
    return toEmit;
  }

  public async getNetPositions(): Promise<Record<string, IPosition>> {
    const toEmit = netPositions;
    return toEmit;
  }

  close() {
    this.socket.removeAllListeners();
    this.socket.close();
  }
}

expose(DataWorker);

export default DataWorker;
