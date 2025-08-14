import { IAsset } from "@/interfaces/IAsset";

export const majors = [
  "EURUSD",
  "USDJPY",
  "GBPUSD",
  "USDCAD",
  "USDCHF",
  "AUDUSD",
  "NZDUSD",
];

export const minors = [
  "EURGBP",
  "EURCHF",
  "EURJPY",
  "GBPJPY",
  "CHFJPY",
  "GBPCHF",
  "EURCAD",
  "EURAUD",
  "EURNZD",
  "GBPAUD",
  "GBPCAD",
  "CADJPY",
  "AUDJPY",
  "NZDJPY",
];

export type AssetsState = {
  assets: Array<IAsset> | null;
};

export const assetsState: AssetsState = {
  assets: [],
};

export function sortAssets(a, b: IAsset): number {
  if (a.symbol < b.symbol) {
    return -1;
  }
  if (a.symbol > b.symbol) {
    return 1;
  }
  return 0;
}

export const setAssets = (listOfAssets: Array<IAsset>) => {
  assetsState.assets = listOfAssets;
  assetsState.assets.sort(sortAssets);
};
