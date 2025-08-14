import { IAsset, fixPrecision } from "@/interfaces/IAsset";
import { accountSelector } from "@/store/account";
import { assetsState } from "@/store/assets";
import { symbolQuoteSelector } from "@/store/quotes";
import { Table, Text, createStyles } from "@mantine/core";
import React from "react";
import { useSelector } from "react-redux";
import { ComponentProps } from "@/components";
import FormattedValue from "../Price/FormattedValue";
import { getMiddlePrice, getTradingDay } from "@/utils/utils";
import { IPriceTick } from "@/interfaces/IOrder";
import { Decimal } from "decimal.js";

// https://nordfx.com/691-forex-point.html
// https://www.cashbackforex.com/tools/pip-calculator/
const getPointValue = (
  asset: IAsset,
  baseCurrencyRate: number,
  invertedCurrentRate: number
): string => {
  if (asset.pointValue) {
    return `${asset.pointValue} ${asset.baseCurrency}`;
  }

  const pip = new Decimal(10).pow(-asset.pricePrecision + 1);
  const contractSize = new Decimal(
    parseInt(asset.contractSize.replace(/[,.]/, ""))
  );

  let rate;
  if (baseCurrencyRate) {
    rate = new Decimal(baseCurrencyRate);
  } else if (invertedCurrentRate) {
    rate = new Decimal(1).div(new Decimal(invertedCurrentRate));
  }
  let out = pip.mul(contractSize);

  if (rate) {
    out = out.div(rate);
  }
  return out.toString();
};

const getMinimumChange = (pricePrecision: number): number => {
  if (typeof pricePrecision !== "number" || pricePrecision < 0) {
    throw new Error("Price precision must be a non-negative number.");
  }

  // Calculate the minimum change based on the precision
  const minimumChange = 1 / Math.pow(10, pricePrecision);

  return minimumChange;
};

const splitMarketHours = (input: string): string[] => {
  const fromToParts = input.split(" - ");
  const out = [
    fromToParts[0].substring(0, 3),
    fromToParts[0].substring(3),
    " - ",
    fromToParts[1].substring(0, 3),
    fromToParts[1].substring(3),
  ];

  return out;
};

const useStyles = createStyles((theme) => ({
  table: {
    tbody: {
      tr: {
        th: {
          fontWeight: "normal",
        },
      },
    },
  },
  hyphen: {
    width: "130px",
    textAlign: "center",
  },
}));

export interface AssetInfoProps extends ComponentProps {
  symbol: string;
}

const AssetInfo = ({ symbol }: AssetInfoProps) => {
  const { assets } = assetsState;
  const { user } = useSelector(accountSelector);
  const asset = assets.find((a) => a.symbol === symbol);
  const { classes } = useStyles();
  let toUsdQuote: IPriceTick;
  let fromUsdQuote: IPriceTick;
  if (`${asset.asset0}${user.currency}` !== symbol) {
    toUsdQuote = useSelector(
      symbolQuoteSelector(`${user.currency}${asset.asset1}`)
    );
    fromUsdQuote = useSelector(
      symbolQuoteSelector(`${asset.asset1}${user.currency}`)
    );
  }

  return (
    <>
      <Text weight={"bold"}>{`${symbol} Contract Specification`}</Text>
      <Table className={classes.table}>
        <tbody>
          <tr>
            <th>Min. change</th>
            <td>{getMinimumChange(asset.pricePrecision)}</td>
          </tr>
          <tr>
            <th>Base currency</th>
            <td>{asset.baseCurrency}</td>
          </tr>
          <tr>
            <th>Margin</th>
            <td>{user.marginPercentage}</td>
          </tr>
          <tr>
            <th>Contract size</th>
            <td>{asset.contractSize}</td>
          </tr>
          <tr>
            <th>Min. Trade size</th>
            <td>
              <FormattedValue
                digits={asset.minVolume > 1000 ? 0 : -1}
                value={asset.minVolume}
              />
            </td>
          </tr>
          <tr>
            <th>Volume increment</th>
            <td>
              <FormattedValue
                digits={asset.volumeStep > 1000 ? 0 : -1}
                value={asset.volumeStep}
              />
            </td>
          </tr>
          <tr>
            <th>Point value</th>
            <td>
              <FormattedValue
                digits={2}
                value={getPointValue(
                  asset,
                  getMiddlePrice(toUsdQuote),
                  getMiddlePrice(fromUsdQuote)
                )}
              />
            </td>
          </tr>
          <tr>
            <th>Execution</th>
            <td>Market</td>
          </tr>
          <tr>
            <th>Swap type</th>
            <td>In points</td>
          </tr>
          <tr>
            <th>Swap (long)</th>
            <td>{fixPrecision(asset.swapLongAmt, 3)}</td>
          </tr>
          <tr>
            <th>Swap (short)</th>
            <td>{fixPrecision(asset.swapShortAmt, 3)}</td>
          </tr>
          <tr>
            <th>3-days swap</th>
            <td>{getTradingDay(asset)}</td>
          </tr>
        </tbody>
      </Table>

      <Text weight={"bold"}>Market Hours</Text>
      <Table className={classes.table}>
        <tbody>
          {asset.marketHours.map((day, dayI) => (
            <tr key={dayI}>
              {splitMarketHours(day).map((m, i) => (
                <td key={i} className={m === " - " ? classes.hyphen : null}>
                  {m}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default React.memo(AssetInfo, (prevProps, nextProps) => {
  if (prevProps.symbol !== nextProps.symbol) {
    return false;
  }

  return true;
});
