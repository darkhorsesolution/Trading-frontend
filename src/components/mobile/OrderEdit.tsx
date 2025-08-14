import {
  IOrder,
  IOrderCreate,
  OrderType,
  TimeInForce,
  TimeInForceString,
} from "@/interfaces/IOrder";
import { assetsState } from "@/store/assets";
import { Button, Flex, Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { useAppDispatch } from "@/pages/_app";
import React, { useEffect, useState } from "react";
import { cancelOrder, modifyOrder } from "@/store/orders";
import { ComponentProps } from "@/components";
import { getOrderPrice } from "../Order/Order";
import ResponsiveNumberInput from "@/components/ResponsiveNumberInput";
import TpSlInputs, { TpSlValues, TpSlType } from "../Order/TpSlInputs";
import { modals } from "@mantine/modals";
import { Modals } from "../Modals";

export interface OrderEditProps extends ComponentProps {
  order?: IOrder;
  onUpdate?: () => void;
}

const OrderEdit = ({ order, onUpdate }: OrderEditProps) => {
  const { assets } = assetsState;
  const asset = assets.find((a) => a.symbol === order.symbol);
  const priceDisabled = order.type === OrderType.Market;
  const [price, setPrice] = useState<number | "">(getOrderPrice(order));
  const [sl, setSl] = useState(TpSlValues.fromOrder(order, TpSlType.SL));
  const [tp, setTp] = useState(TpSlValues.fromOrder(order, TpSlType.TP));
  const [busy, setBusy] = useState(false);
  const [duration, setDuration] = useState(order.timeInForce);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (tp.pips && !tp.value && order.takeProfit) {
      setTp(tp.withValue(parseFloat(order.takeProfit)));
    }
    if (sl.pips && !sl.value && order.stopLoss) {
      setSl(sl.withValue(parseFloat(order.stopLoss)));
    }
  }, [order]);

  const modify = async () => {
    const orderData: Partial<IOrderCreate> = {
      id: order.id,
      type: order.type,
      symbol: order.symbol,
      quantity: order.orderQty,
      timeInForce: duration,
    };

    sl.fillData(orderData, TpSlType.SL);
    tp.fillData(orderData, TpSlType.TP);

    if (orderData.type === OrderType.Stop) {
      orderData.stopPrice = price.toString();
    } else if (orderData.type === OrderType.Limit) {
      orderData.limitPrice = price.toString();
    }

    setBusy(true);
    await dispatch(modifyOrder(orderData));
    setBusy(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  const cancel = async () => {
    modals.openContextModal({
      centered: true,
      modal: Modals.ConfirmModal,
      title: "Cancel?",
      innerProps: {
        onConfirm: async () => {
          await dispatch(cancelOrder(order.id));
          modals.closeAll();
          if (onUpdate) {
            onUpdate();
          }
        },
      },
    });
  };

  return (
    <>
      <Flex align={"center"} justify={"flex-start"} gap={10}>
        <Text size={"sm"}>Price</Text>

        <ResponsiveNumberInput
          style={{ flex: "1" }}
          min={0}
          step={1 / Math.pow(10, asset.pricePrecision)}
          precision={asset.pricePrecision}
          removeTrailingZeros={true}
          value={price}
          readOnly={priceDisabled}
          onChange={setPrice}
          disabled={priceDisabled}
        />
      </Flex>

      <Stack>
        <TpSlInputs
          side={order.side}
          precision={asset.pricePrecision}
          tpValue={tp}
          slValue={sl}
          tpOnChange={setTp}
          slOnChange={setSl}
          price={price || 0}
        />
      </Stack>

      <Flex align={"center"} justify={"flex-start"} gap={10}>
        <Text size={"sm"}>Order Duration</Text>
        <SegmentedControl
          w={"auto"}
          style={{ flex: 1 }}
          value={duration}
          onChange={(val) => setDuration(val as TimeInForce)}
          color={"blue"}
          data={[
            { label: TimeInForceString[0], value: TimeInForce.DAY },
            { label: TimeInForceString[1], value: TimeInForce.GTC },
          ]}
        />
      </Flex>

      <Group>
        <Button
          disabled={busy}
          onClick={modify}
          style={{ flex: 1, fontWeight: 500 }}
          size={"sm"}
          display={"inline-block"}
        >
          Update Order
        </Button>
        <Button
          color="red"
          style={{ flex: 1, fontWeight: 500 }}
          disabled={busy}
          size={"sm"}
          display={"inline-block"}
          onClick={cancel}
        >
          Cancel Order
        </Button>
      </Group>
    </>
  );
};

export default OrderEdit;
