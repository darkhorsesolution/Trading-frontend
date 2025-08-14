import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { IAsset } from "@/interfaces/IAsset";
import { IPriceTick } from "@/interfaces/IOrder";
import { getBaseSymbol } from "@/utils/utils";
import { ApiFetch } from "@/utils/network";

dayjs.extend(utc);
dayjs.extend(timezone);

type QuoteSubscriber = {
  id: string;
  symbol: string;
  resolution: number;
  onRealtimeCallback: (bar: ChartsBar) => void;
  onResetCacheNeededCallback: () => void;
};

type ChartsBar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type DatacenterCandle = {
  open: string;
  high: string;
  low: string;
  close: string;
  time: string;
  volume: string;
};

type ChartSymbol = {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  type: string;
  price_precision: number;
};

const configurationData = {
  supported_resolutions: ["1", "5", "15", "60", "240", "1D", "1W", "1M"],
  exchanges: [
    {
      value: "Spotex",
      name: "ATC Brokers Datacenter",
      desc: "ATC Brokers Datacenter",
    },
  ],
  symbols_types: [
    {
      name: "forex",
      value: "forex",
    },
  ],
};

enum ResolutionMinutes {
  M1 = "1",
  M5 = "5",
  M15 = "15",
  H1 = "60",
  H4 = "240",
  D1 = "1440",
  W1 = "10080",
  MN1 = "44640",
}

function parseResolution(resolution: string) {
  switch (resolution) {
    case "1":
      return "M1";
    case "5":
      return "M5";
    case "15":
      return "M15";
    case "60":
      return "H1";
    case "240":
      return "H4";
    case "1D":
      return "D1";
    case "1W":
      return "W1";
    case "1M":
      return "MN1";
    default:
      return "H1";
  }
}

async function downloadHistoricCandles(
  symbol: string,
  resolution: ResolutionMinutes,
  from: number,
  to: number
): Promise<Array<DatacenterCandle>> {
  try {
    const queryParams: any = {
      symbol,
      resolution: parseResolution(resolution),
      from,
      to,
    };
    return await ApiFetch<Array<DatacenterCandle>>(
      `/api/candles?${new URLSearchParams(queryParams).toString()}`
    );
  } catch (error: any) {
    throw new Error(`Datacenter request error: ${error.status}`);
  }
}

async function getExchangeBars(
  symbolInfo: any,
  resolution: ResolutionMinutes,
  periodParams: any,
  onData: any
): Promise<void> {
  const { from, to, firstDataRequest } = periodParams;

  let pageFrom: dayjs.Dayjs;
  let pageTo = dayjs.utc(to * 1000) as dayjs.Dayjs;

  if (firstDataRequest) {
    // first request - should start from closest midnight in the past
    pageFrom = (dayjs.utc(from * 1000) as dayjs.Dayjs)
      .set("hour", 0)
      .set("second", 0)
      .set("minute", 0);
  } else {
    // older request - move farther to the past - start of the month
    pageFrom = dayjs
      .utc(from * 1000)
      .set("hour", 0)
      .set("second", 0)
      .set("minute", 0)
      .set("date", 1);
  }

  const candles: Array<DatacenterCandle> = await downloadHistoricCandles(
    symbolInfo.ticker,
    resolution as ResolutionMinutes,
    pageFrom.unix(),
    pageTo.unix()
  );

  const bars: Array<ChartsBar & { date: Date }> = [];

  candles.forEach((candle, i) => {
    const time = Date.parse(candle.time) / 1000;
    if (time >= pageFrom.unix() && time <= pageTo.unix()) {
      bars.unshift({
        date: new Date(time * 1000),
        time: time * 1000,
        low: parseFloat(candle.low),
        high: parseFloat(candle.high),
        open: parseFloat(candle.open),
        close: parseFloat(candle.close),
        volume: parseFloat(candle.volume),
      });
    }
    /*
            if (i + 1 < candles.length && candleTimeDiff <= 86400 ) {
                let wantedNext = time - candleTimeDiff
                const nextTime = Date.parse(candles[i + 1].time) / 1000;
                if (nextTime != wantedNext) {
                    for (; wantedNext != nextTime; wantedNext -= candleTimeDiff) {
                        bars.unshift({
                            date: new Date(wantedNext * 1000),
                            time: wantedNext * 1000,
                            low: parseFloat(candles[i + 1].close),
                            high: parseFloat(candles[i + 1].close),
                            open: parseFloat(candles[i + 1].close),
                            close: parseFloat(candles[i + 1].close),
                            volume: 0
                        });
                    }
                }
            }

*/
  });

  let noData = false;
  noData = candles.length === 0;

  onData(bars, { noData });
}

export default class Datafeed {
  allAssets: Array<IAsset>;
  quotesSubscriber: QuoteSubscriber = null;

  constructor(assets: Array<IAsset>) {
    this.allAssets = assets;
  }

  onReady(callback: any) {
    setTimeout(() => callback(configurationData), 0);
  }

  getAllSymbols(): Array<ChartSymbol> {
    let allSymbols: Array<ChartSymbol> = [];

    for (const exchange of configurationData.exchanges) {
      const symbols = this.allAssets.map((asset: IAsset) => ({
        symbol: asset.symbol,
        full_name: asset.symbol,
        description: asset.symbol,
        exchange: exchange.value,
        type: configurationData.symbols_types[0].value,
        price_precision: asset.pricePrecision,
      }));

      allSymbols = [...allSymbols, ...symbols];
    }

    return allSymbols;
  }

  async searchSymbols(
    userInput: any,
    exchange: any,
    symbolType: any,
    onResultReadyCallback: any
  ) {
    const foundSymbols = this.getAllSymbols().filter((symbol) => {
      return (
        symbol.description.toLowerCase().indexOf(userInput.toLowerCase()) !==
          -1 ||
        symbol.symbol.toLowerCase().indexOf(userInput.toLowerCase()) !== -1
      );
    });

    onResultReadyCallback(foundSymbols);
  }

  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: any,
    onResolveErrorCallback: any
  ) {
    // retrieve additional data
    let symbolInfo: any;

    const symbols: Array<ChartSymbol> = this.getAllSymbols();
    const symbol = symbols.find(
      (chartSymbol: ChartSymbol) => chartSymbol.symbol === symbolName
    );

    if (!symbol) {
      onResolveErrorCallback("Cannot find symbol " + symbolName);
      return;
    }

    symbolInfo = {
      ticker: symbol.symbol,
      name: symbol.symbol,
      description: symbol.description,
      type: symbol.type,
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: symbol.exchange,
      minmov: 1,
      pricescale: Math.pow(10, symbol.price_precision),
      has_intraday: true,
      has_no_volume: true,
      has_weekly_and_monthly: false,
      has_empty_bars: false, // don't allow gaps during weekend or dropouts
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: "streaming",
    };

    setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
  }

  async getBars(
    symbol: any,
    resolution: any,
    periodData: any,
    onData: any,
    onErr: any
  ) {
    try {
      await getExchangeBars(symbol, resolution, periodData, onData);
    } catch (error) {
      console.error(`Error getting exchange bars: ${error}`);
      onErr(error);
    }
  }

  onNewTick(tick: IPriceTick) {
    if (!this.quotesSubscriber) return;

    if (this.quotesSubscriber.symbol !== tick.symbol) {
      return;
    }

    if (tick.askPriceChange === 0) {
      // skip no update
      return;
    }

    const price = parseFloat(tick.askPrice);
    this.quotesSubscriber.onRealtimeCallback({
      time: Date.parse(tick.datetime),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 0,
    });
  }

  subscribeBars(
    symbolInfo: any,
    resolution: any,
    onRealtimeCallback: any,
    subscribeUID: any,
    onResetCacheNeededCallback: any
  ) {
    this.quotesSubscriber = {
      id: subscribeUID,
      symbol: getBaseSymbol(symbolInfo.name),
      resolution: resolution,
      onRealtimeCallback: onRealtimeCallback,
      onResetCacheNeededCallback: onResetCacheNeededCallback,
    };
  }

  unsubscribeBars(subscriberUID: string) {
    if (subscriberUID === this.quotesSubscriber?.id) {
      this.quotesSubscriber = null;
    }
  }
}
