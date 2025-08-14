import React from "react";
import { ActionIcon, Button, Flex, Group, Stack, Text } from "@mantine/core";
import OrderEdit from "@/components/mobile/OrderEdit";
import { IOrder } from "@/interfaces/IOrder";
import { IconChevronLeft } from "@tabler/icons";
import Symbol from "../Symbol";
import FormattedValue from "../Price/FormattedValue";
import { assetsState } from "@/store/assets";
import { getOrderType } from "@/widgets/Tables/Orders/Orders";

interface props {
  order: IOrder;
  onGoBack: () => void;
}
const MobilePendingOrderDetail = ({ order, onGoBack }: props) => {
  const { assets } = assetsState;
  const asset = assets.find((a) => a.symbol === order.symbol);

  return order ? (
    <Stack h={"100%"} p={"md"}>
      <Group>
        <ActionIcon size={"md"} onClick={onGoBack}>
          <IconChevronLeft />
        </ActionIcon>
        <Text mx={"auto"} size={"sm"}>{order.id}</Text>
        <ActionIcon size={"md"} style={{ visibility: "hidden" }}></ActionIcon>
      </Group>
      <Group noWrap position={"apart"}>
        <Symbol pnl={0}>
          {order.symbol}
        </Symbol>
        <Stack spacing={0} w={"25%"}>
          <Text size={"xs"} c={"dimmed"}>
            Qty
          </Text>
          <FormattedValue
            value={order.orderQty}
            digits={asset?.cfd ? 2 : 0}
            size={"sm"}
          />
        </Stack>
        <Stack spacing={0} style={{ minWidth: "20%" }}>
            <Text size={"xs"} c={"dimmed"}>
              Type
            </Text>
            {getOrderType(order)}
          </Stack>
      </Group>
      <Flex mt="xs" gap={"xs"} align={"start"} direction={"column"}>
        <Text size={"xs"}>{new Date(order.createdAt).toUTCString()}</Text>
      </Flex>
      <OrderEdit order={order} onUpdate={() => {}} />
    </Stack>
  ) : (
    <Stack h={"100%"} p={"md"}>
      Order has been closed
      <Button component="a" href="/app/positions">
        Back
      </Button>
    </Stack>
  );
};

export default MobilePendingOrderDetail;
