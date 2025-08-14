import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { IOrder, OrderType, TimeInForceString } from "@/interfaces/IOrder";
import Table from "@/components/Table";
import React, { useEffect, useState } from "react";
import { IconMinus, IconPlus, IconX } from "@tabler/icons";
import { useSelector } from "react-redux";
import {
  cancelOrder,
  ordersSelector,
  setEditedOrder,
  editedOrderSelector,
} from "@/store/orders";
import { ActionIcon, Flex } from "@mantine/core";
import { Time } from "@/components/Time";
import { Widgets } from "@/lib/WidgetRegister";
import { useAppDispatch } from "@/pages/_app";
import { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";
import FormattedValue from "@/components/Price/FormattedValue";
import { getOrderType } from "./Orders";
import { assetsState } from "@/store/assets";
import { IAsset, fixPrecision } from "@/interfaces/IAsset";
import Price from "@/components/Price/Price";
import { reduceColumnsToMap } from "..";
import { settingsSelector } from "@/store/account";
import { modals } from "@mantine/modals";
import { Modals } from "@/components/Modals";
import Tab from "@/widgets/Tab";
import { quoteSelector } from "@/store/quotes";
import { getOrderCreateSidePrice, getSidePrice } from "@/utils/utils";
import { useLocalStorage } from "@mantine/hooks";

type IOrderRow = IOrder & { subRows?: IOrder[]; asset: IAsset };
export type PendingOrdersTableProps = IDockviewPanelProps<{
  settingsOpen: boolean;
}>;

function sanitizeOrders(
  orders: IOrder[],
  assets: IAsset[]
): [IOrderRow[], number] {
  const ordersMap: Record<string, IOrderRow[]> = {};
  let pendingOrders: IOrderRow[] = [];
  let count = 0;

  for (const order of orders) {
    if (order.deletedAt) {
      continue;
    }

    const asset = assets.find((a) => a.symbol === order.symbol);

    if (!order.ocoGroup) {
      pendingOrders.push({
        ...order,
        stopLoss: fixPrecision(order.stopLoss, asset.pricePrecision),
        takeProfit: fixPrecision(order.takeProfit, asset.pricePrecision),
        asset: asset || ({} as IAsset),
      });
      continue;
    }

    if (!ordersMap[order.ocoGroup]) {
      ordersMap[order.ocoGroup] = [];
    }

    ordersMap[order.ocoGroup].push({
      ...order,
      stopLoss: fixPrecision(order.stopLoss, asset.pricePrecision),
      takeProfit: fixPrecision(order.takeProfit, asset.pricePrecision),
      asset: asset || ({} as IAsset),
    });
  }

  count = pendingOrders.length;

  for (const ocoGroup of Object.keys(ordersMap)) {
    let ocoItems = ordersMap[ocoGroup];
    pendingOrders.push({
      ...ocoItems[0],
      id: ocoGroup,
      type: OrderType.OCO,
      createdAt: ocoItems[0].createdAt,
      updatedAt: ocoItems[0].updatedAt,
      symbol: ocoItems[0].symbol,
      subRows: ocoItems,
      asset: ocoItems[0].asset,
    } as IOrderRow);
    count += ordersMap[ocoGroup].length;
  }

  return [pendingOrders, count];
}

const PendingOrdersTable = ({ api, params }: PendingOrdersTableProps) => {
  const dispatch = useAppDispatch();
  const columnHelper = createColumnHelper<IOrderRow>();
  const userSettings = useSelector(settingsSelector);
  const editedOrder = useSelector(editedOrderSelector);
  const { assets } = assetsState;
  const orders = useSelector(ordersSelector);
  const { quotes } = useSelector(quoteSelector);

  const columns = React.useMemo<ColumnDef<IOrderRow>[]>(
    () => [
      columnHelper.group({
        id: "controlgroup",
        header: "OCO",
        cell: ({ row }) => (
          <Flex
            justify={"left"}
            align={"center"}
            direction={"row"}
            gap={"xs"}
            pl={`${row.depth}rem`}
            h={"100%"}
          >
            {row.getCanExpand() ? (
              <ActionIcon
                variant={"light"}
                size={"xs"}
                {...{
                  onClick: row.getToggleExpandedHandler(),
                }}
              >
                {row.getIsExpanded() ? (
                  <IconMinus size={10} />
                ) : (
                  <IconPlus size={10} />
                )}
              </ActionIcon>
            ) : (
              ""
            )}
          </Flex>
        ),
        size: 66,
        minSize: 66,
        maxSize: 66,
        enableSorting: false,
      }),
      columnHelper.accessor("id", {
        header: "Order #",
        cell: (data) => <div>{data.getValue() || "-"}</div>,
        enableSorting: true,
      }),
      columnHelper.accessor("symbol", {
        header: "Symbol",
        cell: (data) => <div>{data.getValue()}</div>,
        enableSorting: true,
      }),
      columnHelper.accessor("createdAt", {
        header: "Time",
        cell: ({ row, getValue }) => <Time date={getValue()} absolute={true} />,
        enableSorting: true,
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (data) => <div>{getOrderType(data.row.original)}</div>,
        enableSorting: true,
      }),
      columnHelper.accessor("orderQty", {
        header: "Size",
        cell: ({ row, getValue }) =>
          !row.original.subRows ? (
            <FormattedValue
              digits={row.original.asset.cfd ? 2 : 0}
              value={parseFloat(getValue())}
            />
          ) : (
            ""
          ),
        enableSorting: true,
      }),
      columnHelper.display({
        header: "Price",
        cell: ({ row, getValue }) => {
          const { limitPrice, stopPrice, asset, subRows } = row.original;
          return !subRows ? (
            <Price
              price={
                limitPrice
                  ? fixPrecision(limitPrice, asset.pricePrecision)
                  : fixPrecision(stopPrice, asset.pricePrecision)
              }
              className={""}
              smallerLastLetters={asset.smallerDigits}
            />
          ) : (
            ""
          );
        },
        enableSorting: true,
      }),
      columnHelper.display({
        header: "Stop Loss",
        cell: ({ row, getValue }) =>
          !row.original.subRows ? (
            <Price
              price={row.original.stopLoss}
              className={""}
              smallerLastLetters={row.original.asset.smallerDigits}
            />
          ) : (
            ""
          ),
        enableSorting: true,
      }),
      columnHelper.display({
        header: "Take Profit",
        cell: ({ row, getValue }) =>
          !row.original.subRows ? (
            <Price
              price={row.original.takeProfit}
              className={""}
              smallerLastLetters={row.original.asset.smallerDigits}
            />
          ) : (
            ""
          ),
        enableSorting: true,
      }),
      columnHelper.display({
        header: "Market Price",
        cell: ({ row, getValue }) => (
          <Price
            price={getOrderCreateSidePrice(
              row.original.side,
              quotes[row.original.symbol]
            )}
            className={""}
            smallerLastLetters={row.original.asset.smallerDigits}
          />
        ),
        enableSorting: true,
        size: 100,
      }),
      columnHelper.accessor("timeInForce", {
        header: "Duration",
        cell: ({ row, getValue }) => <div>{TimeInForceString[getValue()]}</div>,
        enableSorting: true,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (data) =>
          data.row.original.subRows ? null : (
            <ActionIcon
              title="Close"
              variant={"light"}
              size={"xs"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (editedOrder && data.row.original.id === editedOrder.id) {
                  dispatch(setEditedOrder(null));
                }
                dispatch(cancelOrder(data.row.original.id));
              }}
            >
              <IconX size={16} />
            </ActionIcon>
          ),
        size: 50,
      }),
    ],
    [quotes]
  );

  const [settings, setSettings] = useLocalStorage<{ columns: Record<string, boolean>}>({
    key: `settings-${api.id}`,
    getInitialValueInEffect: false,
    defaultValue: {
      columns: reduceColumnsToMap(columns as ColumnDef<unknown>[]),
    },
  });

  const [pendingOrders, count] = sanitizeOrders(orders, assets);

  useEffect(() => {
    if (api) {
      api.updateParameters({ items: count });
    }
  }, [orders]);

  const onRowActivation = (row: Row<IOrderRow>) => {
    if (editedOrder && editedOrder.id === row.original.id) {
      dispatch(setEditedOrder(null));
    } else {
      dispatch(setEditedOrder(row.original.id));
    }
  };

  const rowActivation = { onRowClick: undefined, onRowDblClick: undefined };
  if (userSettings) {
    if (userSettings.tableRowDblClick) {
      rowActivation.onRowDblClick = onRowActivation;
    } else {
      rowActivation.onRowClick = onRowActivation;
    }
  }

  useEffect(() => {
    if (params.settingsOpen) {
      modals.openContextModal({
        modal: Modals.TableWidgetSettingsModal,
        title: "Active orders settings",
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
    <Table
      key={JSON.stringify(settings)}
      data={pendingOrders}
      columns={columns}
      defaultSort={{
        id: "createdAt",
        desc: false,
      }}
      onRowDblClick={rowActivation.onRowDblClick}
      onRowClick={rowActivation.onRowClick}
      active={editedOrder ? editedOrder.id : undefined}
      settings={settings}
      setSettings={setSettings}
    />
  );
};

Widgets.register(PendingOrdersTable, "active_orders", {
  closable: true,
  title: "Active Orders",
  description:
    "The actove orders module allows traders to set automatic trades at a specified price in the future for more flexible and hands-off trading.",
  tabComponent: (props: IDockviewPanelHeaderProps) => (
    <Tab
      {...props}
      withSetting={true}
      text={
        <>
          {props.api.title}
          {props.params.items ? ` (${props.params.items})` : null}
        </>
      }
    />
  ),
});

export default PendingOrdersTable;
