import { IAsset } from "@/interfaces/IAsset";
import { ComponentProps } from "@/components";
import { useAppDispatch } from "@/pages/_app";
import React, { useEffect, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { Identifier, XYCoord } from "dnd-core";
import { setSymbolDrag } from "@/store/workspace";
import {
  Accordion,
  ActionIcon,
  Box,
  clsx,
  createStyles,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import OrderCreate from "@/components/Order/OrderCreatePanel";
import { useSelector } from "react-redux";
import { symbolQuoteSelector } from "@/store/quotes";
import Price from "@/components/Price/Price";
import { PriceChange } from "@/interfaces/IOrder";
import { IconArrowsMoveVertical, IconStar } from "@tabler/icons";
import { Device, useDevice } from "@/services/UseDevice";
import { classNames } from "@/utils/css";

export interface DragItem {
  index: number;
  id: string;
}

export enum HoverType {
  Up = 1,
  Down = 2,
}

export const MarketRowDrag = "MarketRowDrag";

interface PriceSectionProps {
  asset: IAsset;
  onClick?: () => void;
}

const PriceSection = ({ asset, onClick }: PriceSectionProps) => {
  const quote = useSelector(symbolQuoteSelector(asset.symbol));
  const device = useDevice();

  return (
    <Box
      style={{
        flexDirection: "row",
        display: "flex",
      }}
      ml={"auto"}
      onClick={onClick}
    >
      <Box w={80}>
        <Price
          smallerLastLetters={asset.smallerDigits}
          biggerLetters={device === Device.Mobile}
          price={
            quote
              ? parseFloat(quote.bidPrice).toFixed(asset.pricePrecision)
              : "-"
          }
          priceChange={quote ? quote.bidPriceChange : PriceChange.None}
          align="right"
          title="Bid price"
        />
      </Box>
      <Box w={40} style={{ alignSelf: "center" }}>
        <Text size={"sm"} align={"center"}>
          {quote ? quote.spread : "-"}
        </Text>
      </Box>
      <Box w={80}>
        <Price
          smallerLastLetters={asset.smallerDigits}
          biggerLetters={device === Device.Mobile}
          price={
            quote
              ? parseFloat(quote.askPrice).toFixed(asset.pricePrecision)
              : "-"
          }
          priceChange={quote ? quote.askPriceChange : PriceChange.None}
          align="left"
          title="Ask price"
        />
      </Box>
    </Box>
  );
};

export type MarketRowProps = {
  asset: IAsset;
  index: number;
  priceSection?: boolean;
  expandable?: boolean;
  moveCard?: (dragIndex: number, hoverIndex: number) => void;
  hoverCard?: (dragIndex: number, hoverIndex: number) => void;
  hovered?: HoverType;
  expanded?: boolean;
  last?: boolean;
  onOpenChart?: (symbol: string) => void;
  device?: Device;
} & ComponentProps;

const useStyles = createStyles((theme) => ({
  hovered: {
    "&.up": {
      borderTopWidth: 5,
      borderTopStyle: "solid",
      borderTopColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[7]
          : theme.colors.gray[7],
    },
    "&.down": {
      borderBottomWidth: 5,
      borderBottomStyle: "solid",
      borderBottomColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[7]
          : theme.colors.gray[2],
    },
  },
  move: {
    cursor: "move",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.blue[7]
        : theme.colors.gray[5],
  },
  accordionControl: {
    ".mantine-Accordion-label": {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    ".mantine-Accordion-chevron": {
      marginLeft: 0,
    },
  },
}));

const MarketRow = ({
  asset,
  index,
  priceSection,
  moveCard,
  hoverCard,
  hovered,
  expanded,
  children,
  last,
  device,
}: MarketRowProps) => {
  const { symbol } = asset;
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  let handlerId, drop, drag, isDragging, preview, opacity;

  const ref = useRef<HTMLButtonElement>(null);

  if (moveCard) {
    [{ handlerId }, drop] = useDrop<
      DragItem,
      void,
      { handlerId: Identifier | null }
    >({
      accept: MarketRowDrag,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        };
      },
      hover: (item: DragItem, monitor) => {
        if (!ref.current) {
          return;
        }

        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) {
          hoverCard(-1, -1);
          return;
        }

        const hoverBoundingRect = ref.current?.getBoundingClientRect();

        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 4;

        const clientOffset = monitor.getClientOffset();

        const hoverClientY =
          (clientOffset as XYCoord).y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        hoverCard(dragIndex, hoverIndex);
      },
      drop(item: DragItem, monitor) {
        if (!ref.current) {
          return;
        }

        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) {
          return;
        }

        const hoverBoundingRect = ref.current?.getBoundingClientRect();

        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 4;

        const clientOffset = monitor.getClientOffset();

        const hoverClientY =
          (clientOffset as XYCoord).y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        moveCard(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex;
      },
    });

    [{ isDragging, opacity }, drag, preview] = useDrag({
      type: MarketRowDrag,
      item: () => {
        return { id: asset.symbol, index };
      },
      end() {
        hoverCard(-1, -1);
      },
      collect: (monitor: any) => {
        return { isDragging: monitor.isDragging(), opacity: 0.5 };
      },
    });

    drag(drop(ref));

    useEffect(() => {
      if (isDragging) {
        dispatch(setSymbolDrag(true));
      } else {
        dispatch(setSymbolDrag(false));
      }
    }, [isDragging]);
  }

  return (
    <Accordion.Item
      style={{
        border: last ? 0 : undefined,
        opacity: isDragging ? opacity : undefined,
        padding: "0 !important",
      }}
      value={symbol}
      p={0}
      ref={preview}
      data-handler-id={handlerId}
    >
      <Box
        p={0}
        sx={{ display: "flex", alignItems: "center" }}
        className={clsx(
          expanded ? "expanded" : "",
          hovered
            ? `${classes.hovered} ${hovered === HoverType.Down ? "down" : "up"}`
            : ""
        )}
      >
        {(device === Device.Desktop || device === Device.Default) && (
          <ActionIcon
            ref={moveCard ? ref : null}
            size={"xs"}
            variant={"subtle"}
            className={classNames(classes.move, "dimmed")}
          >
            <IconArrowsMoveVertical />
          </ActionIcon>
        )}
        <Accordion.Control
          px={"sm"}
          py={0}
          className={classes.accordionControl}
        >
          <Group
            noWrap={true}
            p={0}
            style={{ gap: 1 }}
            position={"apart"}
            py={0}
          >
            <Text
              weight={"bold"}
              size={device === Device.Mobile ? "xs" : "md"}
              truncate={true}
            >
              {symbol}
            </Text>
            {priceSection && <PriceSection asset={asset} />}
          </Group>
        </Accordion.Control>
        {children}
      </Box>

      <Accordion.Panel>
        <Box>
          {expanded && (
            <Stack>
              <OrderCreate embedded={true} symbol={asset.symbol} />
            </Stack>
          )}
        </Box>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default MarketRow;
