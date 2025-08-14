import { VolumeInput } from "@/components/Order/Order";
import {
  TpSlType,
  TpSlValues,
} from "@/components/Order/TpSlInputs";
import PriceButton from "@/components/Price/PriceButton";
import ResponsiveNumberInput from "@/components/ResponsiveNumberInput";
import { IAsset, fixPrecision } from "@/interfaces/IAsset";
import {
  IOrderCreate,
  IPriceTick,
  OrderSide,
  OrderSideToName,
  OrderSides,
  OrderType,
  TimeInForce,
  TradingPanelOrderTypes,
} from "@/interfaces/IOrder";
import { ISettings } from "@/interfaces/account";
import { currentSubAccountSelector } from "@/store/account";
import { usePlaceOrderMutation } from "@/store/slices/order";
import {
  getDefaultLotSize,
  getMiddlePrice,
  getVolumeSteps,
} from "@/utils/utils";
import {
  Box,
  Button,
  Flex,
  LoadingOverlay,
  SegmentedControl,
  Stack,
  Text,
  createStyles,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useStyles = createStyles((theme) => ({
  segmentedControls: {
    borderColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[2],
  },
}));

export interface TradingPanelParams {
  asset: IAsset;
  quote: IPriceTick;
  settings: ISettings;
  expanded: boolean;
  defaults: {
    timeInForce: TimeInForce;
  };
}

const TradingPanel = ({
  asset,
  settings,
  quote,
  expanded,
  defaults,
}: TradingPanelParams) => {
  const { classes } = useStyles();
  const [placeOrder] = usePlaceOrderMutation();
  const currentSubAccount = useSelector(currentSubAccountSelector);

  const [order, setOrder] = useState<Partial<IOrderCreate>>({
    type: OrderType.Market,
    side: OrderSides[0].value,
    quantity: getDefaultLotSize(asset, settings).toString(),
  });

  const [tp, setTp] = useState<TpSlValues>(new TpSlValues());
  const [sl, setSl] = useState<TpSlValues>(new TpSlValues());
  const [customPrice, setCustomPrice] = useState<string>("0");

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (defaults.timeInForce === TimeInForce.FOK || defaults.timeInForce === TimeInForce.IOC) {

      if (order.type === OrderType.Stop || order.type === OrderType.StopLimit) {
        setOrder({ ...order, type: OrderType.Limit })
      }
    }
  }, [defaults.timeInForce, order]);

  const executePlaceOrder = async (
    side: OrderSide,
    type: OrderType,
    price: string
  ) => {
    const data: Partial<IOrderCreate> = {
      ...order,
      symbol: asset.symbol,
      side: side,
      type,
      direct: settings.directOrders,
      timeInForce: defaults.timeInForce,
      account: currentSubAccount,
    };

    tp.fillData(data, TpSlType.TP);
    sl.fillData(data, TpSlType.SL);

    if (type === OrderType.Stop || type === OrderType.StopLimit) {
      data.stopPrice = fixPrecision(price, asset.pricePrecision);
    }
    if (type === OrderType.Limit || type === OrderType.StopLimit) {
      data.limitPrice = fixPrecision(price, asset.pricePrecision);
    }

    if (data.type === OrderType.Stop) {
      data.stopPrice = price.toString();
    } else if (data.type === OrderType.Limit) {
      data.limitPrice = price.toString();
    }

    setBusy(true);
    await placeOrder(data);
    setBusy(false);
  };

  useEffect(() => {
    setOrder({
      ...order,
      quantity: getDefaultLotSize(asset, settings).toString(),
    });
  }, [settings, asset]);

  const quotePrice = getMiddlePrice(quote);

  useEffect(() => {
    setCustomPrice(quotePrice.toString())
    setOrder({
      ...order,
      type: OrderType.Limit,
      side: OrderSide.SELL,
    })
  }, [expanded]);

  return (
    <Stack pos={"relative"} pt={"xs"}>
      <LoadingOverlay visible={busy} />
      <Flex
        gap={0}
        p={1}
        w={"100%"}
        justify="flex-start"
        align="center"
        direction="row"
        wrap="nowrap"
        pos={"relative"}
      >
        <Box w={"40%"}>
          <PriceButton
            orderType={OrderType.Market}
            size={"sm"}
            onClick={!settings.tableRowDblClick ? executePlaceOrder : undefined}
            onDblClick={
              settings.tableRowDblClick ? executePlaceOrder : undefined
            }
            side={OrderSide.SELL}
            quote={quote}
            entryPrice={parseFloat(quote.bidPrice)}
            asset={asset}
          />
        </Box>
        <Box w={"20%"}>
          <Stack align={"center"} spacing={0} h={"100%"}>
            <Text size={"xs"} c={"dimmed"} tt={"uppercase"}>
              Spread
            </Text>
            <Text weight={"bold"} size={"lg"}>
              {quote?.spread ? quote.spread : "0.0"}
            </Text>
          </Stack>
        </Box>
        <Box w={"40%"}>
          <PriceButton
            orderType={OrderType.Market}
            size={"sm"}
            onClick={!settings.tableRowDblClick ? executePlaceOrder : undefined}
            onDblClick={
              settings.tableRowDblClick ? executePlaceOrder : undefined
            }
            side={OrderSide.BUY}
            quote={quote}
            entryPrice={parseFloat(quote.askPrice)}
            asset={asset}
          />
        </Box>
      </Flex>
      <VolumeInput
        label=""
        asset={asset}
        defaultValue={parseFloat(order.quantity || "0")}
        size={"xs"}
        onChange={(val: number | "") =>
          setOrder({
            ...order,
            quantity: val.toString(),
          })
        }
        step={getDefaultLotSize(asset, settings)}
        steps={getVolumeSteps(asset, settings)}
      />
      {expanded && !!quotePrice && (
        <Stack>
          <SegmentedControl
            className={classes.segmentedControls}
            data={OrderSides}
            onChange={(val) =>
              setOrder({
                ...order,
                side: val as OrderSide,
              })
            }
            defaultValue={OrderSides[0].value}
          />
          <SegmentedControl
            className={classes.segmentedControls}
            data={defaults.timeInForce === TimeInForce.FOK || defaults.timeInForce === TimeInForce.IOC ? TradingPanelOrderTypes.map(t => {
              if (t.value === OrderType.Stop || t.value === OrderType.StopLimit) {
                return { ...t, disabled: true }
              }
              return t
            }) : TradingPanelOrderTypes}
            onChange={(val) =>
              setOrder({
                ...order,
                type: val as OrderType,
              })
            }
            value={order.type}
          />
          <ResponsiveNumberInput
            min={0}
            step={1 / Math.pow(10, asset.pricePrecision)}
            precision={asset.pricePrecision}
            removeTrailingZeros={true}
            defaultValue={quotePrice}
            label={`${order.side === OrderSide.BUY ? "Buy" : "Sell"} ${order.type === OrderType.Stop ? "stop" : "limit"} price`}
            onChange={(v) => setCustomPrice((v || 0).toString())}
          />
          <Button
            size={"xs"}
            onClick={() => {
              executePlaceOrder(order.side, order.type, customPrice);
            }}
          >
            Place {OrderSideToName[order.side]} Order
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default TradingPanel;
