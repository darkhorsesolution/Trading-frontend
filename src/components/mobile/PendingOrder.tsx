import { Stack, Text, Accordion, Group, Button, Box } from "@mantine/core";
import Symbol from "@/components/Symbol";
import FormattedValue from "@/components/Price/FormattedValue";
import { IOrder, OrderSide } from "@/interfaces/IOrder";
import { getOrderType } from "@/widgets/Tables/Orders/Orders";
import { IAsset } from "@/interfaces/IAsset";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface IMobilePendingOrderProps {
  order: IOrder;
  asset?: IAsset;
  onManage: (string) => void;
}
const MobilePendingOrder = ({
  order,
  asset,
  onManage,
}: IMobilePendingOrderProps) => {
  return (
    <Accordion.Item value={order.id} key={order.id}>
      <Accordion.Control>
        <Group noWrap position={"apart"}>
          <Symbol pnl={order.side === OrderSide.BUY ? 1 : -1}>
            {order.symbol}
          </Symbol>
          <Stack spacing={0} w={"30%"}>
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
      </Accordion.Control>
      <Accordion.Panel>
      <Stack py={"sm"} style={{gap: 0}}>
          <Text size={"xs"}>{order.id}</Text>
          <Text size={"xs"}>{dayjs(order.executionTime || order.createdAt).local().format('YYYY/MM/DD h:mm:ss.SSS A')}</Text>
          <Text size={"xs"}>SL: {order.stopLoss || 0}</Text>
          <Text size={"xs"}>TP: {order.takeProfit || 0}</Text>
        </Stack>
        <Stack mt={"sm"}>
          <Button
            style={{ fontWeight: 500 }}
            size={"sm"}
            onClick={() => onManage(order.id)}
          >
            Modify
          </Button>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
};
export default MobilePendingOrder;
