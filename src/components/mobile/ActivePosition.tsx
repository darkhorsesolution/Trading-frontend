import { IPosition } from "@/interfaces/IPosition";
import {
  Stack,
  Text,
  Accordion,
  Group,
  Flex,
  Button,
} from "@mantine/core";
import Symbol from "@/components/Symbol";
import Price from "@/components/Price/Price";
import ProfitLoss from "@/components/Price/ProfitLoss";
import { useSelector } from "react-redux";
import { accountSelector } from "@/store/account";
import FormattedValue from "@/components/Price/FormattedValue";
import { OrderSide } from "@/interfaces/IOrder";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface MobileActivePosition {
  position: IPosition;
  onManage: (string) => void;
}
const MobileActivePosition = ({ position, onManage }: MobileActivePosition) => {
  const { user } = useSelector(accountSelector);

  return (
    <Accordion.Item value={position.id} key={position.id}>
      <Accordion.Control>
        <Group noWrap position={"apart"}>
          <Symbol pnl={position.side === OrderSide.BUY ? 1 : -1}>
            {position.symbol}
          </Symbol>
          <Stack spacing={0} w={"25%"}>
            <Text size={"xs"} c={"dimmed"}>
              Qty
            </Text>
            <FormattedValue
              value={position.quantity}
              digits={position.asset?.cfd ? 2 : 0}
              size={"sm"}
            />
          </Stack>
          <Stack spacing={0} style={{ minWidth: "20%", flex: 1 }}>
            <Text size={"xs"} c={"dimmed"}>
              P/L
            </Text>
            <ProfitLoss
              weight={"bold"}
              profitLoss={position.netPL}
              currency={user.currency}
            />
          </Stack>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack py={"sm"} style={{gap: 0}}>
          <Text size={"xs"}>{position.id}</Text>
          <Text size={"xs"}>{dayjs(position.executionTime).local().format('YYYY/MM/DD h:mm:ss.SSS A')}</Text>
          <Text size={"xs"}>SL: {position.trades[0].stopLoss || 0}</Text>
          <Text size={"xs"}>TP: {position.trades[0].takeProfit || 0}</Text>
        </Stack>
        <Stack mt={"sm"}>
          <Button style={{ fontWeight: 500}} size={"sm"} onClick={() => onManage(position.id)}>
            Modify
          </Button>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
};
export default MobileActivePosition;
