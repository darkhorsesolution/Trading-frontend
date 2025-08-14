import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import ProfitLoss from "@/components/Price/ProfitLoss";
import { useSelector } from "react-redux";
import { accountSelector } from "@/store/account";
import { OrderSide } from "@/interfaces/IOrder";
import Symbol from "@/components/Symbol";
import FormattedValue from "@/components/Price/FormattedValue";
import Price from "@/components/Price/Price";
import TradePanel from "@/components/Trade/TradePanel";
import { IPosition } from "@/interfaces/IPosition";
import { IconChevronLeft } from "@tabler/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { symbolQuoteSelector } from "@/store/quotes";

dayjs.extend(utc);
dayjs.extend(timezone);

interface props {
  position: IPosition;
  onGoBack: () => void;
}

const MobileActivePositionDetail = ({ position, onGoBack }: props) => {
  const { user } = useSelector(accountSelector);
  const quote = useSelector(
    symbolQuoteSelector(position ? position.symbol : "")
  );

  return position ? (
    <Stack h={"100%"} p={"md"}>
      <Group>
        <ActionIcon size={"md"} onClick={onGoBack}>
          <IconChevronLeft />
        </ActionIcon>
        <Text mx={"auto"} size={"sm"}>
          {position.id}
        </Text>
        <ActionIcon size={"md"} style={{ visibility: "hidden" }}></ActionIcon>
      </Group>
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
      <Flex mt="xs" gap={"xs"} align={"start"} direction={"column"}>
        <Text size={"xs"}>
          {dayjs(position.executionTime)
            .local()
            .format("YYYY/MM/DD h:mm:ss.SSS A")}
        </Text>
        <Flex align="start">
          <Price
            size="xs"
            style={{ paddingLeft: 0 }}
            price={position.entryPrice}
            title={"Average price"}
          />
          <Text
            size="xs"
            style={{ flex: 1, alignSelf: "center", marginBottom: "auto" }}
          >
            ⟶
          </Text>
          <Price
            size="xs"
            price={position.currentPrice}
            style={{ paddingRight: 0 }}
            title={"Current price"}
          />
        </Flex>
        <Group>
          <Text size={"xs"} w={25}>
            Bid:
          </Text>
          <Price
            size="xs"
            price={quote.bidPrice}
            style={{ paddingLeft: 0 }}
            title={"Bid"}
          />
        </Group>
        <Group>
          <Text size={"xs"} w={25}>
            Ask:
          </Text>
          <Price
            size="xs"
            price={quote.askPrice}
            style={{ paddingLeft: 0 }}
            title={"Ask"}
          />
        </Group>
        <Flex style={{ flex: "1" }} gap={"xs"}>
          {position.trades[0].stopLoss && (
            <Text size="xs">SL: {position.trades[0].stopLoss}</Text>
          )}
          {position.trades[0].takeProfit && (
            <Text size="xs">TP: {position.trades[0].takeProfit}</Text>
          )}
        </Flex>
      </Flex>
      <TradePanel
        trade={position.trades[0]}
        mobile={true}
        onUpdate={() => {}}
      />
    </Stack>
  ) : (
    <Stack h={"100%"} p={"md"}>
      Position has been closed
      <Button component="a" href="/app/positions">
        Back
      </Button>
    </Stack>
  );
};

export default MobileActivePositionDetail;
