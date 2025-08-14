import { ComponentProps } from "@/components";
import PriceButton from "@/components/Price/PriceButton";
import {
  IOrderCreate,
  OrderSide,
  OrderType,
  TimeInForce,
} from "@/interfaces/IOrder";
import { useSelector } from "react-redux";
import {
  Box,
  Checkbox,
  createStyles,
  Flex,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import React, { useState } from "react";
import { symbolQuoteSelector } from "@/store/quotes";
import { currentSubAccountSelector, settingsSelector } from "@/store/account";
import {
  determineOrderType,
  getDefaultLotSize,
  getMiddlePrice,
} from "@/utils/utils";
import { fixPrecision, IAsset } from "@/interfaces/IAsset";
import ResponsiveNumberInput from "@/components/ResponsiveNumberInput";
import { assetsState } from "@/store/assets";
import { usePlaceOrderMutation } from "@/store/slices/order";

export interface OrderCreateProps extends ComponentProps {
  symbol: string;
  embedded?: boolean;
  closeAction?: () => void;
}

const useStyles = createStyles((theme) => ({
  input: {
    input: {
      fontSize: "12px",
    },
  },
  button: {
    paddingTop: "5px",
    paddingBottom: "5px",
  },
  middlePrice: {
    fontWeight: "bold",
    justifyContent: "center",
    fontSize: theme.fontSizes.lg,
    "&>*": {
      fontSize: "inherit",
    },
  },
}));

const OrderCreate = ({ symbol, embedded, closeAction }: OrderCreateProps) => {
  const { classes } = useStyles();
  const settings = useSelector(settingsSelector);
  const currentSubAccount = useSelector(currentSubAccountSelector);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(symbol);
  const { assets } = assetsState;
  const asset: IAsset = assets.find((a) => a.symbol === selectedSymbol);
  const quote = useSelector(symbolQuoteSelector(selectedSymbol));
  const lotSize = getDefaultLotSize(asset, settings)
  const [qty, setQty] = useState<number | "">(lotSize);
  const [entryPrice, setEntryPrice] = useState<number | "">(
    getMiddlePrice(quote)
  );
  const [busy, setBusy] = useState(false);
  const [isMarket, setIsMarket] = useState(true);
  const [placeOrder] = usePlaceOrderMutation();

  const executePlaceOrder = async (
    side: OrderSide,
    type: OrderType,
    price: string
  ) => {
    const order: Partial<IOrderCreate> = {
      side: side,
      symbol,
      quantity: qty.toString(),
      type,
      account: currentSubAccount,
      timeInForce: TimeInForce.GTC,
      direct: settings.directOrders,
    };

    if (type === OrderType.Stop || type === OrderType.StopLimit) {
      order.stopPrice = fixPrecision(price, asset.pricePrecision);
    }
    if (type === OrderType.Limit || type === OrderType.StopLimit) {
      order.limitPrice = fixPrecision(price, asset.pricePrecision);
    }

    setBusy(true);
    await placeOrder(order);
    setBusy(false);

    if (closeAction) {
      closeAction();
    }
  };

  const middlePrice = getMiddlePrice(quote);

  return (
    <>
      <Group grow p={0} style={{ alignItems: "flex-end" }}>
        {!embedded && (
          <Select
            size="xs"
            label="Asset"
            placeholder="Pick one"
            searchable
            data={assets.map((asset) => ({
              label: asset.symbol,
              value: asset.symbol,
            }))}
            defaultValue={selectedSymbol}
            onSearchChange={setSelectedSymbol}
            onChange={setSelectedSymbol}
            searchValue={selectedSymbol}
            nothingFound="No options"
            w={120}
          />
        )}

        <ResponsiveNumberInput
          className={classes.input}
          min={Math.min(asset ? asset.minVolume : Infinity, lotSize)}
          max={asset ? asset.maxVolume : 0}
          step={lotSize || (asset ? asset.volumeStep : 0)}
          precision={asset ? asset.volumePrecision : 0}
          removeTrailingZeros={false}
          onChange={setQty}
          label="Size"
          defaultValue={qty}
          parser={ResponsiveNumberInput.defaultParser}
          formatter={ResponsiveNumberInput.defaultFormatter}
          style={{ maxWidth: "initial", flex: "1" }}
        />
        <ResponsiveNumberInput
          className={classes.input}
          min={0}
          step={1 / Math.pow(10, asset ? asset.pricePrecision : 0)}
          precision={asset ? asset.pricePrecision : 0}
          defaultValue={entryPrice}
          disabled={isMarket}
          label="Entry price"
          onChange={setEntryPrice}
          style={{ maxWidth: "initial", flex: "1" }}
        />
        <Checkbox
          style={{ maxWidth: "fit-content" }}
          label={"Market"}
          checked={isMarket}
          onChange={(event) => setIsMarket(event.currentTarget.checked)}
        />
      </Group>
      {asset && (
        <Flex
          gap={0}
          p={1}
          w={"100%"}
          justify="flex-start"
          align="center"
          direction="row"
          wrap="nowrap"
          pos={"relative"}
          title={"Open order panel"}
        >
          <LoadingOverlay visible={busy} />

          <Box w={"40%"}>
            <PriceButton
              orderType={
                isMarket
                  ? OrderType.Market
                  : determineOrderType(
                    isMarket,
                    OrderSide.SELL,
                    entryPrice.toString(),
                    middlePrice
                  )
              }
              size={embedded ? "sm" : "lg"}
              onClick={!settings.tableRowDblClick ? executePlaceOrder : null}
              onDblClick={settings.tableRowDblClick ? executePlaceOrder : null}
              side={OrderSide.SELL}
              quote={quote}
              entryPrice={entryPrice || 0}
              asset={asset}
            />
          </Box>
          <Box w={"20%"}>
            <Stack align={"center"} spacing={0} h={"100%"}>
              <Text size={"xs"} c={"dimmed"} tt={"uppercase"}>
                Spread
              </Text>
              <Text weight={"bold"} size={embedded ? "sm" : "lg"}>
                {quote?.spread ? quote.spread : "0.0"}
              </Text>
            </Stack>
          </Box>
          <Box w={"40%"}>
            <PriceButton
              orderType={
                isMarket
                  ? OrderType.Market
                  : determineOrderType(
                    isMarket,
                    OrderSide.BUY,
                    entryPrice.toString(),
                    middlePrice
                  )
              }
              size={embedded ? "sm" : "lg"}
              onClick={!settings.tableRowDblClick ? executePlaceOrder : null}
              onDblClick={settings.tableRowDblClick ? executePlaceOrder : null}
              side={OrderSide.BUY}
              quote={quote}
              entryPrice={entryPrice || 0}
              asset={asset}
            />
          </Box>
        </Flex>
      )}
    </>
  );
};
export default OrderCreate;
