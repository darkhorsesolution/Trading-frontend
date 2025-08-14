import {
  IPriceTick,
  OrderSide,
  OrderType,
  OrderTypeToString,
  PriceChange,
} from "@/interfaces/IOrder";
import React from "react";
import {
  Box,
  ButtonProps,
  clsx,
  createStyles,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconNote } from "@tabler/icons";
import { IAsset } from "@/interfaces/IAsset";
import { emptyTick } from "@/store/quotes";

export type PriceButtonProps = {
  side: OrderSide;
  quote: IPriceTick;
  entryPrice: number;
  asset: IAsset,
  onClick?: (side: OrderSide, type: OrderType, price: string) => void;
  onDblClick?: (side: OrderSide, type: OrderType, price: string) => void;
  className?: string;
  orderType?: OrderType;
} & ButtonProps;

const useStyles = createStyles((theme) => ({
  buy: {
    border: `1px solid ${theme.colors.green[5]}`,
    backgroundColor: theme.fn.rgba(theme.colors.green[5], 0.2),
    "&:hover": {
      backgroundColor: theme.fn.rgba(theme.colors.green[5], 0.3),
    },
  },
  sell: {
    border: `1px solid ${theme.colors.red[5]}`,
    backgroundColor: theme.fn.rgba(theme.colors.red[5], 0.2),
    "&:hover": {
      backgroundColor: theme.fn.rgba(theme.colors.red[5], 0.3),
    },
  },
  wrapper: {
    borderRadius: theme.radius.md,
    background: "pink"
  },
  priceButton: {
    gap: 0,
    flexWrap: "nowrap",
    padding: theme.spacing.sm,
    paddingRight: 0,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    width: "100%",
    ".price-text": {
      height: "20px",
      display: "flex",
      alignItems: "end",
      lineHeight: "1",
      "&>div": {
        lineHeight: "inherit",
        display: "flex",
        alignItems: "end"
      }
    },
    ".last-letter": {
      fontSize: theme.fontSizes.xs,
      alignSelf: "start"
    },
    ".bigger-letter": {
      fontSize: theme.fontSizes.xxl,
    },
  },
}));

const getWantedPrice = (quotePrice: string, entryPrice: number, isMarket: boolean, asset: IAsset): string => {
  const numeric = parseFloat(isMarket ? quotePrice : entryPrice.toString());
  if (isNaN(numeric)) {
    return "-";
  }
  return numeric.toFixed(asset.pricePrecision);
};

const PriceButton = ({
  side,
  quote,
  entryPrice,
  asset,
  size = "md",
  className = "",
  onClick,
  onDblClick,
  orderType,
}: PriceButtonProps) => {
  const { classes } = useStyles();
  if (!quote) {
    quote = emptyTick
  }

  const clsDirection = [0, "buy", "sell"][side];
  const smallerLastLetters = asset.smallerDigits || 0;
  let lastLetter: string;
  const isMarket = orderType === OrderType.Market
  const sideQuotePrice = side === OrderSide.BUY ? quote.askPrice : quote.bidPrice
  let price = getWantedPrice(sideQuotePrice, entryPrice, isMarket, asset);
  const originalWantedPrice= price
  const priceChange = isMarket ? (side === OrderSide.BUY ? quote.askPriceChange : quote.bidPriceChange) : PriceChange.None
  const marketPrice = price;

  if (smallerLastLetters && price.toString().length > 0) {
    lastLetter = price.toString().slice(-smallerLastLetters);
    price = price.toString().slice(0, -smallerLastLetters);
  }

  const priceParts = price.split(".")
  return (
    <UnstyledButton
      className={clsx(classes.wrapper, classes[clsDirection], className)}
      onClick={
        onClick
          ? () =>
              onClick(
                side,
                orderType,
                orderType === OrderType.Market ? marketPrice : originalWantedPrice
              )
          : undefined
      }
      onDoubleClick={
        onDblClick
          ? () =>
              onDblClick(
                side,
                orderType,
                orderType === OrderType.Market ? marketPrice : originalWantedPrice
              )
          : undefined
      }
      w={"100%"}
      style={{ flex: 1 }}
    >
      <Group
        className={classes.priceButton}
        position="apart"
      >
        <Stack spacing={0}>
          <Text size={"xs"} tt={"uppercase"} className="text">
            {clsDirection}{" "}
            {orderType !== OrderType.Market && OrderTypeToString[orderType]}
          </Text>
          <Box className={"price-text" }>
            <Text size={size} weight={"bold"}>
              {priceParts[0]}.{priceParts[1] && priceParts[1].slice(0, -2)}{priceParts[1] && priceParts[1].length > 0 && <span className={"bigger-letter"}>{priceParts[1].slice(-2)}</span>}
              {smallerLastLetters && (
                <span className="last-letter">{lastLetter}</span>
              )}
            </Text>
          </Box>
        </Stack>
        <Group w={24} h={"100%"} className="arrows">
        {priceChange === PriceChange.Up && <IconArrowUp />}
        {priceChange === PriceChange.Down && <IconArrowDown />}
        </Group>
      </Group>
    </UnstyledButton>
  );
};

export default React.memo(PriceButton);
