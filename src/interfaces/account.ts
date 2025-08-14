import { IWorkspace } from "@/store/workspace";
import { Session } from "@prisma/client";

export enum AccountType {
  AssetManager = "AM",
  IntroducingBroker = "IB",
  MarketMaker = "MM",
  MarketView = "MV",
  SubBroker = "SB",
  Subscriber = "Subscriber",
  Trader = "T",
}

export interface IWatchedAsset {
  symbol: string;
  index: number;
}

export interface ISettings {
  quotesRate?: number; // how often quotes from webworker should be pushed to app (in batches)
  pollingRate?: number; // how often the app should call rest endpoints to refresh (replace) positions
  workspaces?: IWorkspace[]; // serialized list of layouts
  watchedAssets?: IWatchedAsset[]; // list of assets for Market widget
  syncWorkspaces?: boolean; // controls persistence of workspaces
  sounds: boolean;
  tableRowDblClick: boolean; // controls order buy/sell buttons/table row functionality
  twoFactorUrl?: string; // url for 2fa app to scan
  twoFactorBase32?: string; // 2fa secret - should be only on backend
  updatedAt?: Date;
  directOrders: boolean;
  enableInternalActions: boolean;
  forexAssets: boolean;
  metalsAssets: boolean;
  indicesAssets: boolean;
  energiesAssets: boolean;
  cryptoAssets: boolean;
  lotSizeForex?: number;
  lotSizeMetals?: number;
  lotSizeIndices?: number;
  lotSizeEnergies?: number;
  lotSizeCrypto?: number;
  forexAssetsVolumes?: string[];
  metalsAssetsVolumes?: string[];
  indicesAssetsVolumes?: string[];
  energiesAssetsVolumes?: string[];
  cryptoAssetsVolumes?: string[];
}

export interface IUser {
  account: string;
  id: string;
  status: string;
  accountType: string;
  currency: string;
  settings?: ISettings;
  subUsers?: IUser[];
  admin?: boolean;
  platform: string;
  institutional: boolean;

  total_balance: string;
  total_equity: string;
  total_adjustment: string;
  total_commission: string;
  total_rollover: string;
  total_dividend: string;
  total_profitLoss: string;
  total_openProfitLoss: string;
  total_netEquity: string;

  daily_openBalance: string;
  daily_deposit: string;
  daily_withdrawal: string;
  daily_adjustment: string;
  daily_profitLoss: string;
  daily_commission: string;
  daily_rollover: string;
  daily_mtmpl: string;
  daily_fees: string;
  daily_closeBalance: string;
  daily_openProfitLoss: string;
  daily_netEquity: string;

  marginPercentage?: string;
  creditLimit?: string;
  creditUsage?: string;
  creditAvailable?: string;
  creditUsagePercent?: string;
  availableMargin?: string;

  lastMessageSeen?: string;

  sessions: Session[];
}

export interface IUserStats {
  account: string;
  estDate: string;
  utcTime: Date;
  balance: string;
  netEquity: string;
  profitLoss: string;
  openProfitLoss: string;
}

export function GetUserAccounts(user: IUser) {
  return [user.account, ...(user.subUsers || []).map((acc) => acc.account)];
}

export function FindSubUserByAccount(
  user: IUser,
  accNumber: string
): IUser | null {
  return [user, ...(user.subUsers || [])].find((u) => u.account === accNumber);
}
