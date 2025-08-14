import { IOrder, IOrderCreate, OrderSide } from "@/interfaces/IOrder";
import { Checkbox, Paper, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import ResponsiveNumberInput from "@/components/ResponsiveNumberInput";
import { ITrade } from "@/interfaces/ITrade";
import { ITradeModify } from "@/interfaces/IPosition";

export enum InputActivated {
  TP,
  SL,
}

export interface TpSlInputsProps {
  side?: OrderSide;
  precision: number;
  tpValue: TpSlValues;
  slValue: TpSlValues;
  tpOnChange: (val: TpSlValues) => void;
  slOnChange: (val: TpSlValues) => void;
  price: number;
  onClickInput?: (InputActivated) => void;
}

export enum TpSlType {
  SL = "stopLoss",
  TP = "takeProfit",
}

export class TpSlValues {
  value: number | "";
  pips: number | "";
  pipsChange: string | "";
  enabled: boolean;

  constructor(
    value: number | "" = "",
    pips: number | "" = "",
    pipsChange: string | "" = "",
    enabled: boolean = false
  ) {
    this.value = value;
    this.pips = pips;
    this.pipsChange = pipsChange;
    this.enabled = enabled;
  }

  fillData(
    container: Partial<IOrderCreate> | ITradeModify | Partial<IOrderCreate>,
    type: TpSlType
  ) {
    if (this.enabled) {
      if (type === TpSlType.SL) {
        if (this.value) {
          container.stopLoss = this.value.toString();
        }
        if (this.pips) {
          container.stopLossPips = this.pips;
          container.stopLossPipsChange = this.pipsChange;
        }
      } else {
        if (this.value) {
          container.takeProfit = this.value.toString();
        }
        if (this.pips) {
          container.takeProfitPips = this.pips;
          container.takeProfitPipsChange = this.pipsChange;
        }
      }
    }
  }

  withValueFromPrice(
    quotePrice: number,
    precision: number,
    side: OrderSide,
    type: TpSlType
  ): TpSlValues {
    if (type === TpSlType.SL) {
      return getNewPipsSl(side, precision, quotePrice, this.pips || 0);
    } else {
      return getNewPipsTp(side, precision, quotePrice, this.pips || 0);
    }
  }

  withValue(newValue: number | ""): TpSlValues {
    return new TpSlValues(newValue, this.pips, this.pipsChange, this.enabled);
  }

  withEnabled(enabled: boolean) {
    return new TpSlValues(this.value, this.pips, this.pipsChange, enabled);
  }

  static fromOrder(model: IOrder | null, type: TpSlType): TpSlValues {
    const out = new TpSlValues("", "", "", false);
    if (model) {
      out.value = model[type] ? parseFloat(model[type]) : undefined;
      out.pips = model[`${type}Pips`];
      out.pipsChange = model[`${type}PipsChange`];
      out.enabled = !!out.value || !!out.pips;
    }

    return out;
  }

  static fromTrade(model: ITrade | null, type: TpSlType): TpSlValues {
    const out = new TpSlValues("", "", "", false);
    if (model) {
      out.value = model[type] ? parseFloat(model[type]) : undefined;
      out.enabled = !!out.value;
    }

    return out;
  }
}

function getNewPipsSl(
  side: OrderSide,
  precision: number,
  price: number,
  pips: number
): TpSlValues {
  const sign = side ? (side === OrderSide.SELL ? -1 : 1) : 0;
  const pipsChange = -((pips || 0) / Math.pow(10, precision)) * (sign || 1);
  return new TpSlValues(
    sign ? parseFloat((price + pipsChange).toFixed(precision)) : "",
    pips,
    pipsChange.toString(),
    true
  );
}

function getNewPipsTp(
  side: OrderSide,
  precision: number,
  price: number,
  pips: number
): TpSlValues {
  const sign = side ? (side === OrderSide.SELL ? -1 : 1) : 0;
  const pipsChange = ((pips || 0) / Math.pow(10, precision)) * (sign || 1);
  return new TpSlValues(
    sign ? parseFloat((price + pipsChange).toFixed(precision)) : "",
    pips,
    pipsChange.toString(),
    true
  );
}

const TpSlInputs = ({
  side,
  precision,
  tpValue: tpVal,
  tpOnChange,
  slValue: slVal,
  slOnChange,
  price,
  onClickInput,
}: TpSlInputsProps) => {
  useEffect(() => {
    if (!side) {
      return;
    }
    if (slVal.value && slVal.pips) {
      slOnChange(getNewPipsSl(side, precision, price, slVal.pips));
    }
    if (tpVal.value && tpVal.pips) {
      tpOnChange(getNewPipsTp(side, precision, price, tpVal.pips));
    }
  }, [price, side]);

  return (
    <>
      <Paper p={"sm"} withBorder style={{ flex: 1 }}>
        <Text size={"sm"}>
          <Checkbox
            label={"Stop Loss"}
            checked={slVal.enabled}
            onChange={(e) =>
              slOnChange(slVal.withEnabled(e.currentTarget.checked))
            }
          />
        </Text>

        {slVal.enabled && (
          <Stack spacing={"xs"} mt={"sm"}>
            {side && (
              <ResponsiveNumberInput
                min={0}
                step={1}
                precision={0}
                value={slVal.pips || ""}
                placeholder="Points"
                onChange={(val) =>
                  slOnChange(getNewPipsSl(side, precision, price, val || 0))
                }
              />
            )}
            <ResponsiveNumberInput
              onClick={
                onClickInput ? () => onClickInput(InputActivated.SL) : undefined
              }
              min={0}
              step={1 / Math.pow(10, precision)}
              precision={precision}
              value={slVal.value}
              placeholder="Value"
              onChange={(val) => slOnChange(new TpSlValues(val, "", "", true))}
              removeTrailingZeros={true}
            />
          </Stack>
        )}
      </Paper>
      <Paper p={"sm"} withBorder style={{ flex: 1 }}>
        <Text size={"sm"}>
          <Checkbox
            label={"Take Profit"}
            checked={tpVal.enabled}
            onChange={(e) =>
              tpOnChange(tpVal.withEnabled(e.currentTarget.checked))
            }
          />
        </Text>
        {tpVal.enabled && (
          <Stack spacing={"xs"} mt={"sm"}>
            {side && (
              <ResponsiveNumberInput
                min={0}
                step={1}
                precision={0}
                value={tpVal.pips || ""}
                placeholder="Points"
                onChange={(val) =>
                  tpOnChange(getNewPipsTp(side, precision, price, val || 0))
                }
              />
            )}
            <ResponsiveNumberInput
              onClick={
                onClickInput ? () => onClickInput(InputActivated.TP) : undefined
              }
              min={0}
              step={1 / Math.pow(10, precision)}
              precision={precision}
              value={tpVal.value}
              placeholder="Value"
              onChange={(val) => tpOnChange(new TpSlValues(val, "", "", true))}
              removeTrailingZeros={true}
            />
          </Stack>
        )}
      </Paper>
    </>
  );
};

export default TpSlInputs;
