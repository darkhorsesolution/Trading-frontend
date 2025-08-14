import {
  AllowedOrderTypes,
  IOCOOrdersCreate,
  IOrder,
  IOrderCreate,
  IPriceTick,
  OrderSide,
  OrderType,
  TimeInForce,
  TimeInForceString,
} from "@/interfaces/IOrder";
import { IAsset } from "@/interfaces/IAsset";
import { useSelector } from "react-redux";
import { assetsState } from "@/store/assets";
import {
  ActionIcon,
  Box,
  Button,
  CloseButton,
  createStyles,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useAppDispatch } from "@/pages/_app";
import React, { useEffect, useState } from "react";
import { symbolQuoteSelector } from "@/store/quotes";
import {
  usePlaceOCOOrdersMutation,
  usePlaceOrderMutation,
} from "@/store/slices/order";
import { accountSelector, settingsSelector } from "@/store/account";
import { IUser } from "@/interfaces/account";
import { cancelOrder, modifyOrder, setEditedOrder } from "@/store/orders";
import { TpSlType, TpSlValues } from "./TpSlInputs";
import OcoOrder, { OcoData } from "./OcoOrder";
import OrderSingleType from "./OrderSingleType";
import { ComponentProps } from "@/components";
import {
  getDefaultLotSize,
  getMiddlePrice,
  getOrderCreateSidePrice,
} from "@/utils/utils";
import { SearchIcon } from "lucide-react";
import { IconX } from "@tabler/icons";
import { NumberInputProps } from "@mantine/core/lib/NumberInput/NumberInput";
import ResponsiveNumberInput from "@/components/ResponsiveNumberInput";

const useStyles = createStyles((theme) => ({
  ocoGroup: {
    ">*": {
      flex: "0 0 auto",
    },
  },
  trailingStopRow: {
    minHeight: "65px",
  },
  stretch: {
    alignItems: "stretch",
  },
  grouping: {
    border: `1px solid ${theme.white}`,
    borderRight: 0,
    borderRadius: "5px 0 0 5px",
    width: "10px",
    height: "55px",
    marginTop: "20px",
    marginRight: "15px",
  },
  oconumber: {
    position: "absolute",
    zIndex: 10,
    top: "50%",
    marginTop: "-10px",
    left: "-10px",
  },
  marginimpact: {
    display: "flex",
    gap: "1rem",
  },
}));

interface VolumeInputProps extends NumberInputProps {
  defaultValue: number;
  asset: IAsset;
  onChange?: (value: number) => void;
  disabled?: boolean;
  inputWidth?: number;
  steps?: string[];
}

export const VolumeInput = ({
  defaultValue,
  asset,
  onChange,
  disabled,
  inputWidth,
  size = "lg",
  step,
  label,
  steps,
}: VolumeInputProps) => {
  return (
    <ResponsiveNumberInput
      label={label === "" ? undefined : "Volume"}
      min={Math.min(asset.minVolume, step)}
      max={asset.maxVolume}
      step={step || asset.volumeStep}
      precision={asset.volumePrecision}
      disabled={disabled}
      onChange={onChange}
      value={defaultValue}
      parser={ResponsiveNumberInput.defaultParser}
      formatter={ResponsiveNumberInput.defaultFormatter}
      w={inputWidth}
      size={size}
      noClampOnBlur
      removeTrailingZeros={false}
      steps={steps}
    />
  );
};

export function getOrderPrice(order: IOrder): number {
  if (order.stopPrice) {
    return parseFloat(order.stopPrice);
  } else if (order.limitPrice) {
    return parseFloat(order.limitPrice);
  }

  if (order.lastPrice) {
    return parseFloat(order.lastPrice);
  }

  return 0;
}

export interface OrderPanelProps extends ComponentProps {
  mobile?: boolean;
  order?: IOrder;
  defaultSymbol?: string;
  symbolChangeAction?: (symbol: string) => void;
  closeAction?: () => void;
}

const OrderPanel = React.memo(
  ({ order, ...rest }: OrderPanelProps) => {
    const { user } = useSelector(accountSelector);
    const { assets } = assetsState;

    return (
      <OrderDetail
        key={order ? order.symbol : ""}
        assets={assets}
        user={user}
        order={order}
        {...rest}
      />
    );
  },
  (prevProps: OrderPanelProps, nextProps: OrderPanelProps): boolean => {
    return (
      prevProps.order === nextProps.order &&
      prevProps.defaultSymbol === nextProps.defaultSymbol
    );
  }
);

interface OrderDetailProps {
  mobile?: boolean;
  order: IOrder;
  assets: IAsset[];
  defaultSymbol?: string;
  user: IUser;
  closeAction?: () => void;
  symbolChangeAction?: (symbol: string) => void;
}

function getTrailingStopPrice(
  orderSide: OrderSide,
  quote: IPriceTick,
  trailingStopPercents: number,
  precision: number
): string {
  const currentPrice = getOrderCreateSidePrice(orderSide, quote);
  let trPrice: number;
  if (orderSide === OrderSide.SELL) {
    trPrice = currentPrice * (1 - trailingStopPercents / 100);
  } else {
    trPrice = currentPrice * (1 + trailingStopPercents / 100);
  }

  return trPrice.toFixed(precision);
}

const OrderDetail = ({
  mobile,
  order,
  defaultSymbol,
  assets,
  user,
  closeAction,
  symbolChangeAction,
}: OrderDetailProps) => {
  const dispatch = useAppDispatch();
  const [createOrder] = usePlaceOrderMutation();
  const [createOCOOrders] = usePlaceOCOOrdersMutation();
  const userSettings = useSelector(settingsSelector);

  const o = order;

  const [selectedSymbol, setSelectedSymbol] = useState(
    o ? o.symbol : defaultSymbol || ""
  );

  useEffect(() => {
    if (defaultSymbol) {
      setSelectedSymbol(defaultSymbol);
    }
  }, [defaultSymbol]);

  let asset = assets.find((a) => a.symbol === selectedSymbol);
  const quote = useSelector(symbolQuoteSelector(selectedSymbol));

  const { classes } = useStyles();
  const [dirty, setDirty] = useState(true);
  const [orderType, setOrderType] = useState(o ? o.type : OrderType.Limit);
  const [side, setSide] = useState(o ? o.side : OrderSide.SELL);
  const [duration, setDuration] = useState(o ? o.timeInForce : TimeInForce.DAY);

  const [volume, setVolume] = useState(
    asset ? getDefaultLotSize(asset, userSettings) : 0
  );

  const [sl, setSl] = useState(TpSlValues.fromOrder(o, TpSlType.SL));
  const [tp, setTp] = useState(TpSlValues.fromOrder(o, TpSlType.TP));
  const [price, setPrice] = useState<number | "">(o ? getOrderPrice(o) : "");
  const [oco1, setOco1] = useState<OcoData>({
    price: quote ? getMiddlePrice(quote) : 0,
    side: OrderSide.BUY,
    type: OrderType.Stop,
  });
  const [oco2, setOco2] = useState<OcoData>({
    price: quote ? getMiddlePrice(quote) : 0,
    side: OrderSide.BUY,
    type: OrderType.Stop,
  });
  const [trailingStop, setTrailingStop] = useState(
    (o && o.trailingStopLoss) || null
  );

  useEffect(() => {
    if (!selectedSymbol) {
      return;
    }

    setPrice(o ? getOrderPrice(o) : getOrderCreateSidePrice(side, quote));
    setVolume(getDefaultLotSize(asset, userSettings));
    setOco1({
      ...oco1,
      price: quote ? getMiddlePrice(quote) : 0,
    });
    setOco2({
      ...oco2,
      price: quote ? getMiddlePrice(quote) : 0,
    });
  }, [selectedSymbol]);

  useEffect(() => {
    if (order) {
      setVolume(parseFloat(order.orderQty));
    }
  }, [order]);

  useEffect(() => {
    if (orderType === OrderType.Market || !price) {
      setPrice(getOrderCreateSidePrice(side, quote));
    }
  }, [quote, orderType, side]);

  const modifyOrderWrapper = React.useCallback(
    async (e) => {
      const orderData: Partial<IOrderCreate> = {
        id: o.id,
        side: side,
        account: user.account,
        timeInForce: duration,
        symbol: asset.symbol,
        type: orderType,
        quantity: volume.toString(),
        trailingStopLoss: trailingStop || undefined,
      };

      sl.fillData(orderData, TpSlType.SL);
      tp.fillData(orderData, TpSlType.TP);

      if (orderData.type === OrderType.Stop) {
        orderData.stopPrice = price.toString();
      } else if (orderData.type === OrderType.Limit) {
        orderData.limitPrice = price.toString();
      }

      await dispatch(modifyOrder(orderData));
    },
    [o, duration, sl, sl, tp, trailingStop, price, side, orderType, volume]
  );

  const createOrderWrapper = React.useCallback(
    async (e) => {
      if (orderType === OrderType.OCO) {
        const ordersData: IOCOOrdersCreate = {
          oco1: {
            side: oco1.side,
            account: user.account,
            timeInForce: duration,
            symbol: asset.symbol,
            type: oco1.type,
            quantity: volume.toString(),
          },
          oco2: {
            side: oco2.side,
            account: user.account,
            timeInForce: duration,
            symbol: asset.symbol,
            type: oco2.type,
            quantity: volume.toString(),
          },
        };

        if (oco1.type === OrderType.Stop) {
          ordersData.oco1.stopPrice = oco1.price.toString();
        } else {
          ordersData.oco1.limitPrice = oco1.price.toString();
        }

        if (oco2.type === OrderType.Stop) {
          ordersData.oco2.stopPrice = oco2.price.toString();
        } else {
          ordersData.oco2.limitPrice = oco2.price.toString();
        }

        await createOCOOrders(ordersData);
      } else {
        const orderData: Partial<IOrderCreate> = {
          side: side,
          account: user.account,
          timeInForce: duration,
          symbol: asset.symbol,
          type: orderType,
          quantity: volume.toString(),
          trailingStopLoss: trailingStop || undefined,
          direct: userSettings.directOrders,
        };

        sl.fillData(orderData, TpSlType.SL);
        tp.fillData(orderData, TpSlType.TP);

        if (orderData.type === OrderType.Stop) {
          orderData.stopPrice = price.toString();
        } else if (orderData.type === OrderType.Limit) {
          orderData.limitPrice = price.toString();
        }

        await createOrder(orderData);
      }

      if (closeAction) {
        closeAction();
      }
    },
    [
      asset,
      side,
      duration,
      orderType,
      volume,
      trailingStop,
      tp,
      sl,
      price,
      oco1,
      oco2,
    ]
  );

  const quotePrice = getOrderCreateSidePrice(side, quote);
  return (
    <>
      {order && closeAction && (
        <Box display={"flex"} title={"order"} mb={"md"}>
          <Text>Order {order.id}</Text>
          <CloseButton
            ml={"auto"}
            aria-label="Close Order component"
            size={"sm"}
            onClick={closeAction}
          />
        </Box>
      )}

      {symbolChangeAction && !o && (
        <Select
          mb={"md"}
          placeholder="Select asset..."
          searchable
          data={assets.map((asset) => ({
            label: asset.symbol,
            value: asset.symbol,
          }))}
          w={"100%"}
          label={"Pick an asset"}
          icon={<SearchIcon />}
          disabled={!!order}
          defaultValue={selectedSymbol}
          onSearchChange={setSelectedSymbol}
          onChange={(s) => {
            symbolChangeAction(s);
            setSelectedSymbol(s);
          }}
          searchValue={selectedSymbol}
          nothingFound="No options"
        />
      )}

      {closeAction && symbolChangeAction && asset && (
        <Group title={"asset"} mb={"md"}>
          <Text size={"xl"} weight={"bold"}>
            {asset.name}
          </Text>
          {!o && (
            <ActionIcon
              radius={"xl"}
              size={"md"}
              style={{ width: 32, height: 32 }}
              variant={"light"}
              onClick={() => {
                setSelectedSymbol("");
                closeAction();
              }}
            >
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
      )}

      {asset && (
        <>
          <Stack w={"100%"}>
            <Stack spacing={0}>
              <Text size={"sm"}>Order type</Text>
              <SegmentedControl
                disabled={!!o}
                data={AllowedOrderTypes}
                title={"Order type"}
                onChange={(val) => setOrderType(val as OrderType)}
                defaultValue={o ? o.type : OrderType.Market}
              />
            </Stack>
            <VolumeInput
              defaultValue={volume}
              asset={asset}
              disabled={!!order}
              onChange={setVolume}
              size={"lg"}
              step={getDefaultLotSize(asset, userSettings)}
            />
            <Stack spacing={"lg"} w={"100%"}>
              {/* OCO */}
              {orderType === OrderType.OCO && (
                <OcoOrder
                  mobile={mobile}
                  classes={classes}
                  asset={asset}
                  quote={quote}
                  setOco1={setOco1}
                  setOco2={setOco2}
                  oco1={oco1}
                  oco2={oco2}
                  volume={volume}
                  user={user}
                />
              )}
              {/* OTHER THAN OCO */}
              {[OrderType.Market, OrderType.Limit, OrderType.Stop].indexOf(
                orderType
              ) !== -1 && (
                  <OrderSingleType
                    classes={classes}
                    asset={asset}
                    side={side}
                    setSide={setSide}
                    orderExists={!!o}
                    orderType={orderType}
                    price={price}
                    quotePrice={quotePrice}
                    setPrice={setPrice}
                    tp={tp}
                    sl={sl}
                    setTp={setTp}
                    setSl={setSl}
                    trailingStop={trailingStop}
                    setTrailingStop={setTrailingStop}
                    trailingStopPrice={getTrailingStopPrice(
                      side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY,
                      quote,
                      parseFloat(trailingStop || "0"),
                      asset.pricePrecision
                    )}
                  />
                )}
            </Stack>
            <Stack spacing={0}>
              <Text size={"sm"}>Order Duration</Text>
              <SegmentedControl
                value={duration}
                onChange={(val) => setDuration(val as TimeInForce)}
                color={"blue"}
                data={[
                  { label: TimeInForceString[0], value: TimeInForce.DAY },
                  { label: TimeInForceString[1], value: TimeInForce.GTC },
                ]}
              />
            </Stack>
          </Stack>

          <Group mt={"md"}>
            {!order && (
              <Button
                size={"lg"}
                disabled={!dirty}
                style={{ flex: 1 }}
                display={"inline-block"}
                onClick={createOrderWrapper}
              >
                Place Order
              </Button>
            )}
            {order && !parseInt(order.status || "0") && (
              <>
                <Button
                  disabled={!dirty}
                  onClick={modifyOrderWrapper}
                  style={{ flex: 1 }}
                  display={"inline-block"}
                >
                  Update Order
                </Button>
                <Button
                  color="red"
                  style={{ flex: 1 }}
                  display={"inline-block"}
                  onClick={async () => {
                    await dispatch(cancelOrder(order.id))
                      .unwrap()
                      .then(() => dispatch(setEditedOrder(null)));
                  }}
                >
                  Cancel Order
                </Button>
              </>
            )}
          </Group>
        </>
      )}
    </>
  );
};

export default OrderPanel;
