export interface IAsset {
  name: string;
  symbol: string;
  asset0: string;
  asset1: string;
  pricePrecision?: number;
  volumePrecision?: number;
  askPrice?: string;
  bidPrice?: string;
  minVolume?: number;
  maxVolume?: number;
  volumeStep?: number;
  category?: AssetGroup;
  currency?: string;
  smallerDigits?: number;
  swapLongAmt?: string;
  swapShortAmt?: string;
  cfd: boolean;
  baseCurrency: string;
  contractSize: string;
  pointValue: number;
  marketHours: string[];
}

export enum AssetGroup {
  Forex = "forex",
  Metal = "metals",
  Indices = "indices",
  Energies = "energies",
  Crypto = "crypto",
}

export type EmphPrice = [string, string];

export const emphasizePrice = (
  price: string,
  smallerLastDigits: number
): EmphPrice => {
  let lastLetter: string;
  let base: string;
  if (smallerLastDigits && price && price.length > 0) {
    lastLetter = price.slice(-smallerLastDigits);
    base = price.slice(0, -smallerLastDigits);
  } else {
    base = price;
  }

  return [base, lastLetter];
};

export const fixPrecision = (
  number: string | number,
  precision: number,
  log?: boolean
): string => {
  if (log) {
    console.log(number, (0).toFixed(precision));
  }
  if (!number) {
    return (0).toFixed(precision);
  }

  if (typeof number === "number") {
    return number.toFixed(precision);
  } else {
    return parseFloat(number).toFixed(precision);
  }
};
