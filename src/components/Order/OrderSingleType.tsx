import { Checkbox, Group, Paper, SegmentedControl, Stack } from "@mantine/core";
import TpSlInputs, { TpSlValues } from "./TpSlInputs";
import { OrderSides, OrderSide, OrderType } from "@/interfaces/IOrder";
import { IAsset } from "@/interfaces/IAsset";
import ResponsiveNumberInput from "@/components/ResponsiveNumberInput";

interface OrderSingleTypeProps {
  classes: { [key in keyof any]: string };
  side: OrderSide;
  setSide: React.Dispatch<React.SetStateAction<OrderSide>>;
  orderExists: boolean;
  price: number | "";
  setPrice: React.Dispatch<React.SetStateAction<number | "">>;
  quotePrice: number;
  orderType: OrderType;
  tp: TpSlValues;
  sl: TpSlValues;
  setTp: React.Dispatch<React.SetStateAction<TpSlValues>>;
  setSl: React.Dispatch<React.SetStateAction<TpSlValues>>;
  trailingStop: string | null;
  setTrailingStop: React.Dispatch<React.SetStateAction<string | null>>;
  trailingStopPrice: string;
  asset: IAsset;
}

const OrderSingleType = ({
  classes,
  side,
  setSide,
  orderExists,
  price,
  setPrice,
  orderType,
  asset,
  quotePrice,
  tp,
  sl,
  setTp,
  setSl,
  trailingStop,
  setTrailingStop,
  trailingStopPrice,
}: OrderSingleTypeProps) => {
  return (
    <>
      <SegmentedControl
        color={side === OrderSide.BUY ? "green" : "red"}
        value={side}
        disabled={orderExists}
        onChange={setSide as (any) => void}
        data={OrderSides}
      />
      <ResponsiveNumberInput
        min={0}
        step={1 / Math.pow(10, asset.pricePrecision)}
        precision={asset.pricePrecision}
        removeTrailingZeros={true}
        value={price}
        readOnly={orderType === OrderType.Market}
        onChange={setPrice}
        label="Price"
        size={"lg"}
        disabled={orderType === OrderType.Market}
      />
      <Stack spacing={"sm"}>
        <TpSlInputs
          side={side}
          precision={asset.pricePrecision}
          tpValue={tp}
          slValue={sl}
          tpOnChange={setTp}
          slOnChange={setSl}
          price={
            orderType === OrderType.Market ? quotePrice : price || quotePrice
          }
        />
        <Paper p={"sm"} withBorder>
          <Checkbox
            label={"Trailing Stop"}
            checked={trailingStop !== null}
            value={1}
            onChange={(val) => {
              setTrailingStop(!val.target.checked ? null : "0");
            }}
          />
          {trailingStop !== null && (
            <Paper p={"sm"}>
              <Group grow={true}>
                <ResponsiveNumberInput
                  label="Percents"
                  formatter={(value) =>
                    !Number.isNaN(parseFloat(value))
                      ? `${value} %`.replace(
                          /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      : "%"
                  }
                  min={0}
                  step={1 / Math.pow(10, 2)}
                  precision={2}
                  defaultValue={parseFloat(trailingStop || "0")}
                  onChange={(val) => setTrailingStop(val.toString())}
                  w={100}
                />
                <ResponsiveNumberInput
                  precision={asset.pricePrecision}
                  removeTrailingZeros={true}
                  value={parseFloat(trailingStopPrice)}
                  readOnly={true}
                  onChange={setPrice}
                  label={`Trigger Price (${
                    side === OrderSide.BUY ? "bid" : "ask"
                  })`}
                  disabled={orderType === OrderType.Market}
                />
              </Group>
            </Paper>
          )}
        </Paper>
      </Stack>
    </>
  );
};

export default OrderSingleType;
