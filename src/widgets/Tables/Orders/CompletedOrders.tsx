import { ColumnDef } from "@tanstack/react-table";
import {
  IOrder,
  OrderSideToName,
  OrderType,
  OrderTypeToString,
} from "@/interfaces/IOrder";
import Table from "@/components/Table";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { closedPositionsSelector } from "@/store/positions";
import { ordersSelector } from "@/store/orders";
import { Box, createStyles } from "@mantine/core";
import { Time } from "@/components/Time";
import FormattedValue from "@/components/Price/FormattedValue";
import { Widgets } from "@/lib/WidgetRegister";
import { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";
import { columnHelper, IPairedTrade, formatOrderType } from "./Orders";
import ProfitLoss from "@/components/Price/ProfitLoss";
import { ITrade } from "@/interfaces/ITrade";
import { assetsState } from "@/store/assets";
import Constants from "@/utils/Constants";
import { IAsset, fixPrecision } from "@/interfaces/IAsset";
import Price from "@/components/Price/Price";
import { reduceColumnsToMap } from "..";
import { IPosition } from "@/interfaces/IPosition";
import { getESTDate } from "@/lib/time";
import Filter, { defaultPresets } from "@/components/Filter";
import { modals } from "@mantine/modals";
import { Modals } from "@/components/Modals";
import Tab from "@/widgets/Tab";
import { useLocalStorage } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "100%",
  },
}));

export type CompletedOrdersTableProps = IDockviewPanelProps<{
  settingsOpen: boolean;
}>;

const columns: ColumnDef<IPairedTrade>[] = [
  columnHelper.accessor("id", {
    header: "Ticket #",
    cell: (data) => <div>{data.getValue()}</div>,
    enableSorting: true,
    size: 100,
  }),
  columnHelper.accessor("symbol", {
    header: "Symbol",
    cell: (data) => <div>{data.getValue()}</div>,
    enableSorting: true,
    minSize: 90,
    size: 90,
  }),
  columnHelper.accessor("openTime", {
    header: "Time",
    cell: ({ row, getValue }) => <Time date={getValue()} absolute={true} />,
    enableSorting: true,
    minSize: 200,
    size: 200,
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: ({ row }) => {
      return formatOrderType(row.original.type);
    },
    enableSorting: true,
    size: 100,
    maxSize: 100,
    enableResizing: true,
  }),
  columnHelper.accessor("quantity", {
    header: "Size",
    cell: ({ row, getValue }) => (
      <FormattedValue digits={2} value={parseFloat(getValue())} />
    ),
    enableSorting: true,
    minSize: 100,
  }),
  columnHelper.accessor("openPrice", {
    header: "Entry Price",
    cell: ({ row, getValue }) => (
      <Price
        price={getValue()}
        className={""}
        smallerLastLetters={row.original.asset.smallerDigits}
      />
    ),
    enableSorting: true,
    minSize: 100,
  }),
  columnHelper.accessor("stopLoss", {
    header: "Stop Loss",
    cell: ({ row, getValue }) => (
      <Price
        price={getValue()}
        className={""}
        smallerLastLetters={row.original.asset.smallerDigits}
      />
    ),
    enableSorting: true,
    size: 100,
  }),
  columnHelper.accessor("takeProfit", {
    header: "Take Profit",
    cell: ({ row, getValue }) => (
      <Price
        price={getValue()}
        className={""}
        smallerLastLetters={row.original.asset.smallerDigits}
      />
    ),
    enableSorting: true,
    size: 100,
  }),
  columnHelper.accessor("closeTime", {
    header: "Close Time",
    cell: ({ row, getValue }) =>
      getValue() ? <Time date={getValue()} absolute={true} /> : "-",
    enableSorting: true,
    minSize: 200,
    size: 200,
  }),
  columnHelper.accessor("closePrice", {
    header: "Close Price",
    cell: ({ row, getValue }) => (
      <Price
        price={getValue()}
        className={""}
        smallerLastLetters={row.original.asset.smallerDigits}
      />
    ),
    enableSorting: true,
    minSize: 100,
  }),
  columnHelper.accessor("commission", {
    header: "Commission",
    cell: ({ row }) =>
      row.original.commission ? (
        <FormattedValue
          digits={2}
          value={parseFloat(row.original.commission)}
        />
      ) : (
        "-"
      ),
    enableSorting: true,
    size: 80,
  }),
  columnHelper.accessor("netPL", {
    header: "Net P/L",
    cell: ({ row, getValue }) => (
      <div style={{ textAlign: "right" }}>
        <ProfitLoss profitLoss={getValue()} />
      </div>
    ),
    enableSorting: true,
    size: 80,
  }),
  columnHelper.accessor("comment", {
    header: "Comment",
    cell: (data) => (
      <div style={{ textAlign: "right", textTransform: "lowercase" }}>
        {data.getValue()}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    minSize: 100,
    maxSize: 200,
  }),
];

const buildComment = (
  openOrder?: IOrder,
  closeOrder?: IOrder,
  closeTrade?: ITrade
): string => {
  let out = `${openOrder?.ocoGroup ? "oco/" : ""}${openOrder?.trigger || "-"}/`;
  if (closeTrade && closeTrade.trigger) {
    out += closeTrade.trigger;
  } else if (closeOrder && closeOrder.trigger) {
    out += closeOrder.trigger;
  } else {
    out += "-";
  }

  return `[${out}]`;
};

const buildType = (openTrade?: ITrade, openOrder?: IOrder): string => {
  let out;
  if (openTrade) {
    out = `${OrderSideToName[openTrade.side]}`;
  } else if (openOrder) {
    out = `${OrderSideToName[openOrder.side]}`;
  }
  if (openOrder) {
    out += ` ${
      openOrder.type !== OrderType.Market
        ? OrderTypeToString[openOrder.type]
        : ""
    }`;
  }

  return out;
};

const sanitizeCompletedEntries = (
  closedPositions: IPosition[],
  orders: IOrder[],
  assets: IAsset[],
  from: string,
  to: string
): IPairedTrade[] => {
  const paired: IPairedTrade[] = [];
  const takenOrderIds: string[] = [];

  for (const position of closedPositions) {
    const openTrade = position.trades[0];
    const closeTrade = position.trades[1];

    if (
      (openTrade.executionTime < from || openTrade.executionTime > to) &&
      (!closeTrade ||
        closeTrade.executionTime < from ||
        closeTrade.executionTime > to)
    ) {
      continue;
    }

    let openOrder, closeOrder: IOrder;

    for (const order of orders) {
      if (order.id === openTrade.clOrderId) {
        openOrder = order;
      } else if (order.id === closeTrade.clOrderId) {
        closeOrder = order;
      }

      if (openOrder && closeOrder) {
        break;
      }
    }

    if (openOrder) {
      takenOrderIds.push(openOrder.id);
    }
    if (closeOrder) {
      takenOrderIds.push(closeOrder.id);
    }

    const asset = assets.find((a) => a.symbol === position.symbol);
    if (!asset) {
      console.warn(`Asset ${position.symbol} not found!`);
      continue;
    }

    let qty = "";
    if (parseFloat(position.quantity) >= 0) {
      qty = position.quantity;
    } else {
      qty = openTrade.quantity;
    }

    paired.push({
      ...position,
      type: buildType(openTrade, openOrder),
      commission: position.brokerage,
      comment: buildComment(openOrder, closeOrder, closeTrade),
      quantity: qty,
      openTime: openTrade.executionTime,
      openPrice: fixPrecision(openTrade.price, asset.pricePrecision),
      stopLoss: fixPrecision(openTrade.stopLoss, asset.pricePrecision),
      takeProfit: fixPrecision(openTrade.takeProfit, asset.pricePrecision),
      closeTime: closeTrade?.executionTime,
      closePrice: fixPrecision(closeTrade?.price, asset.pricePrecision),
      precision: asset
        ? asset.pricePrecision
        : Constants.DefaultNumberPrecision,
      asset,
    });
  }

  for (const order of orders.filter(
    (o) => o.deletedAt && takenOrderIds.indexOf(o.id) === -1 && !o.status
  )) {
    if (order.createdAt < from || order.createdAt > to) {
      continue;
    }

    const asset = assets.find((a) => a.symbol === order.symbol);
    if (!asset) {
      console.warn(`Asset ${order.symbol} not found!`);
      continue;
    }

    paired.push({
      id: order.id,
      symbol: order.symbol,
      type: buildType(undefined, order),
      comment: buildComment(order),
      quantity: order.lastQty,
      openTime: order.createdAt,
      openPrice: fixPrecision(order.lastPrice, asset.pricePrecision),
      stopLoss: fixPrecision(order.stopLoss, asset.pricePrecision),
      takeProfit: fixPrecision(order.takeProfit, asset.pricePrecision),
      closeTime: order.deletedAt,
      precision: asset
        ? asset.pricePrecision
        : Constants.DefaultNumberPrecision,
      asset,
    });
  }

  return paired;
};

const CompletedOrdersTable = ({ api, params }: CompletedOrdersTableProps) => {
  const { classes, cx } = useStyles();
  const orders = useSelector(ordersSelector);
  const closedPositions = useSelector(closedPositionsSelector);
  const { assets } = assetsState;

  const [settings, setSettings] = useLocalStorage<{
    columns: Record<string, boolean>;
  }>({
    key: `settings-${api.id}`,
    getInitialValueInEffect: false,
    defaultValue: {
      columns: reduceColumnsToMap(columns as ColumnDef<unknown>[]),
    },
  });

  const viewport = useRef<HTMLDivElement>(null);

  const [filterFrom, setFilterFrom] = useState<Date | null>(
    getESTDate(new Date(), -1)
  );
  const [filterTo, setFilterTo] = useState<Date | null>(
    getESTDate(new Date(), 0)
  );
  const [usedRange, setUsedRange] = useState<Date[]>([filterFrom, filterTo]);
  const scrollToBottom = () => {
    if (viewport && viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const paired = sanitizeCompletedEntries(
    closedPositions,
    orders,
    assets,
    filterFrom.toISOString(),
    filterTo.toISOString()
  );

  const search = (dateFrom: Date | null, dateTo: Date | null) => {
    const from = getESTDate(dateFrom, -1);
    const to = getESTDate(dateTo);

    setFilterFrom(from);
    setFilterTo(to);
    setUsedRange([from, to]);
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  };

  useEffect(() => {
    if (params.settingsOpen) {
      modals.openContextModal({
        modal: Modals.TableWidgetSettingsModal,
        title: "Completed Orders Table Settings",
        innerProps: {
          settings,
          columns,
          setSettings,
        },
        onClose() {
          api.updateParameters({ ...params, settingsOpen: false });
        },
      });
    }
  }, [params.settingsOpen]);

  return (
    <Box className={classes.wrapper}>
      <Table
        key={JSON.stringify(settings)}
        scrollRef={viewport}
        data={paired}
        columns={columns}
        settings={settings}
        setSettings={setSettings}
        defaultSort={{
          id: "closeTime",
          desc: false,
        }}
      />
      <Filter presets={defaultPresets} onSearch={search} />
    </Box>
  );
};

Widgets.register(CompletedOrdersTable, "completed_orders", {
  closable: true,
  title: "Completed orders",
  description:
    "Record of all completed trades, displaying information such as instrument, volume, price, and date.",
  tabComponent: (props: IDockviewPanelHeaderProps) => (
    <Tab {...props} withSetting={true} />
  ),
});

export default CompletedOrdersTable;
