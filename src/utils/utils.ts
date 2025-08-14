import { IOrder, IPriceTick, OrderSide, OrderType } from "@/interfaces/IOrder";
import { AssetGroup, IAsset } from "@/interfaces/IAsset";
import { ISettings } from "@/interfaces/account";

export function getBaseSymbol(symbol: string): string {
  return symbol.replaceAll("/", "");
}

export function determineOrderType(
  isMarket: boolean,
  side: OrderSide,
  wantedPrice: string,
  marketPrice: string | number | undefined
): OrderType {
  // For some reason the market price is not available
  if (!marketPrice) {
    return OrderType.Limit;
  }

  if (isMarket || wantedPrice === marketPrice) {
    return OrderType.Market;
  }

  // BUY
  if (side === OrderSide.BUY) {
    if (wantedPrice > marketPrice) {
      return OrderType.Stop;
    } else {
      return OrderType.Limit;
    }
  }

  // SELL
  if (wantedPrice < marketPrice) {
    return OrderType.Stop;
  } else {
    return OrderType.Limit;
  }
}

// Use when want to show price for existing position (SELL position -> ASK price)
export function getSidePrice(side: OrderSide, quote: IPriceTick): number {
  if (!quote) {
    return 0;
  }
  let out = quote.bidPrice;
  if (side === OrderSide.SELL) {
    out = quote.askPrice;
  }
  return parseFloat(out);
}

// Use when want to show price that should be used for new order (SELL order -> BID price (is lower))
export function getOrderCreateSidePrice(
  side: OrderSide,
  quote: IPriceTick
): number {
  if (!quote) {
    return 0;
  }
  let out = quote.askPrice;
  if (side === OrderSide.SELL) {
    out = quote.bidPrice;
  }
  return parseFloat(out);
}

// TODO remove, put to dataworker
export function getMiddlePrice(tick: IPriceTick | IAsset): number {
  if (!tick) {
    return 0;
  }
  return (parseFloat(tick.askPrice) + parseFloat(tick.bidPrice)) / 2;
}

// Use to get intented price of order
export function getOrderWantedPrice(order: IOrder): number {
  return parseFloat(order.limitPrice || order.stopPrice);
}

// return default lot size for particular group of assets (forex/metal..)
export function getDefaultLotSize(asset: IAsset, settings: ISettings): number {
  let out: number;

  if (asset && settings) {
    if (asset.category === AssetGroup.Forex) {
      out = settings.lotSizeForex;
    } else if (asset.category === AssetGroup.Metal) {
      out = settings.lotSizeMetals;
    } else if (asset.category === AssetGroup.Indices) {
      out = settings.lotSizeIndices;
    } else if (asset.category === AssetGroup.Energies) {
      out = settings.lotSizeEnergies;
    } else if (asset.category === AssetGroup.Crypto) {
      out = settings.lotSizeCrypto;
    }

    out = out || asset.minVolume;
  }

  return out || 1000;
}

// return predefined size increments/decrements for asset category
export function getVolumeSteps(asset: IAsset, settings: ISettings): string[] | undefined {
  if (asset && settings) {
    switch (asset.category) {
      case AssetGroup.Forex:
        return settings.forexAssetsVolumes;
      case AssetGroup.Metal:
        return settings.metalsAssetsVolumes;
      case AssetGroup.Energies:
        return settings.energiesAssetsVolumes;
      case AssetGroup.Indices:
        return settings.indicesAssetsVolumes;
      case AssetGroup.Crypto:
        return settings.cryptoAssetsVolumes;
      default:
        return undefined;
    }
  }
}

// returns constatns for trading day shown in asset info
export function getTradingDay(asset: IAsset): string {
  if (asset.category === AssetGroup.Crypto) {
    return "NA";
  } else if (asset.cfd) {
    return "Friday";
  }

  return "Wednesday";
}
