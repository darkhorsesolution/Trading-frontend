import {
  ColumnDef,
  createColumnHelper,
  Row,
  RowSelectionState,
} from "@tanstack/react-table";
import { IClosableTrade, ITrade } from "@/interfaces/ITrade";
import { useSelector } from "react-redux";
import ProfitLoss from "@/components/Price/ProfitLoss";
import {
  cleanupPosition,
  cleanupTrade,
  closePosition,
  openPositionsSelector,
} from "@/store/positions";
import {
  IconLock,
  IconLockOff,
  IconLockOpen,
  IconMinus,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons";
import {
  ActionIcon,
  Box,
  Checkbox,
  Group,
  LoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";
import Table from "@/components/Table";
import { Time } from "@/components/Time";
import React, { use, useEffect, useState } from "react";
import { Widgets } from "@/lib/WidgetRegister";
import { useAppDispatch } from "@/pages/_app";
import ValueWithCurrency from "@/components/Price/ValueWithCurrency";
import Constants from "@/utils/Constants";
import FormattedValue from "@/components/Price/FormattedValue";
import { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";
import { SideIcons } from "./common";
import {
  floatingTradePanelSelector,
  setFloatingTradePanel,
} from "@/store/workspace";
import { TradePanelProps } from "@/components/Trade/TradePanel";
import { accountSelector, settingsSelector } from "@/store/account";
import { assetsState } from "@/store/assets";
import { IOrder } from "@/interfaces/IOrder";
import { ordersSelector } from "@/store/orders";
import { IPosition } from "@/interfaces/IPosition";
import Price from "@/components/Price/Price";
import { fixPrecision, IAsset } from "@/interfaces/IAsset";
import { reduceColumnsToMap } from "..";
import { modals } from "@mantine/modals";
import { Modals } from "@/components/Modals";
import Tab from "@/widgets/Tab";
import { Check } from "lucide-react";

export type OpenOrdersProps =
  | IDockviewPanelProps<{
    settingsOpen: boolean;
    adminLock?: boolean;
  }>
  | {
    params: { settingsOpen: boolean; adminLock?: boolean };
    api: undefined;
    containerApi: undefined;
  };

const columnHelper = createColumnHelper<IClosableTrade>();

const OpenOrders = (props: OpenOrdersProps) => {
  const dispatch = useAppDispatch();
  const userSettings = useSelector(settingsSelector);
  const { user, subUsers, loginAccount } = useSelector(accountSelector);
  const positions = useSelector(openPositionsSelector);
  const orders = useSelector(ordersSelector);
  const internalActions = userSettings.enableInternalActions;

  const rowActivation = { onRowClick: undefined, onRowDblClick: undefined };
  if (userSettings) {
    if (userSettings.tableRowDblClick) {
      rowActivation.onRowDblClick = (trade: ITrade) => {
        dispatch(setFloatingTradePanel({ trade } as TradePanelProps));
      };
    } else {
      rowActivation.onRowClick = (trade: ITrade) => {
        dispatch(setFloatingTradePanel({ trade } as TradePanelProps));
      };
    }
  }

  const clean = (cb: () => void) => {
    modals.openContextModal({
      centered: true,
      modal: Modals.ConfirmModal,
      innerProps: {
        children: (
          <Box mb={"md"} px={"xs"}>
            <Text size="lg">
              This will be an internal close.
              <br />
              <br /> Do you want to continue?
            </Text>
            <Text size={"sm"}>
              This order will be closed internally with the same entry price.
            </Text>
          </Box>
        ),
        onConfirm: async () => {
          await dispatch(cb);
          modals.closeAll();
        },
      },
    });
  };

  useEffect(() => {
    //console.log("orders changed", positions);
  }, [positions]);

  useEffect(() => {
    (props.api as { internalActions?: boolean }).internalActions =
      internalActions;
  }, [internalActions]);

  const columns: ColumnDef<IClosableTrade>[] = React.useMemo(
    () => [
      columnHelper.group({
        id: "1",
        columns: [
          {
            accessorKey: "openaction",
            header: ({ table }) => null,
            cell: ({ row, getValue }) =>
              row.getCanExpand() ? (
                <Checkbox
                  // @ts-ignore
                  indeterminate={"true"}
                  icon={row.getIsSelected() ? IconMinus : IconPlus}
                  onChange={(e) => {
                    row.getToggleExpandedHandler()();
                    row.getToggleSelectedHandler()(e);
                  }}
                  checked={row.getIsSelected()}
                />
              ) : null,
            size: 0,

            footer: (props) => props.column.id,
          },
          columnHelper.accessor("id", {
            header: "Order #",
            cell: ({ row, getValue }) => (
              <Text truncate={true} style={{ marginLeft: `${row.depth}em` }}>
                {row.depth > 0 ? row.original.orderId : getValue().toString()}
              </Text>
            ),
            enableSorting: true,
            size: 100,
          }),
          columnHelper.accessor("symbol", {
            header: "Symbol",
            cell: ({ row, getValue }) => <div>{getValue().toString()}</div>,
            enableSorting: true,
            minSize: 90,
            size: 90,
          }),
          columnHelper.accessor("executionTime", {
            header: "Time",
            cell: ({ row, getValue }) => (
              <Time absolute={true} date={getValue()} />
            ),
            enableSorting: true,
            minSize: 180,
            size: 180,
          }),
          columnHelper.accessor("side", {
            header: "Type",
            cell: ({ row, getValue }) => {
              return SideIcons[getValue()];
            },
            enableSorting: true,
            size: 80,
            maxSize: 80,
            enableResizing: true,
          }),
          columnHelper.accessor("quantity", {
            header: "Size",
            cell: ({ row, getValue }) => (
              <FormattedValue
                digits={row.original.asset.cfd ? 2 : 0}
                value={parseFloat(getValue())}
              />
            ),
            enableSorting: true,
            size: 100,
          }),
          columnHelper.accessor("price", {
            header: "Entry Price",
            cell: ({ row, getValue }) => (
              <Price
                price={fixPrecision(
                  getValue(),
                  row.original.asset.pricePrecision
                )}
                className={""}
                smallerLastLetters={row.original.asset.smallerDigits}
              />
            ),
            enableSorting: true,
            size: 100,
          }),
          columnHelper.accessor("stopLoss", {
            header: "Stop Loss",
            cell: ({ row, getValue }) =>
              !row.depth && (
                <Price
                  price={fixPrecision(
                    row.original.stopLoss,
                    row.original.asset.pricePrecision
                  )}
                  className={""}
                  smallerLastLetters={row.original.asset.smallerDigits}
                />
              ),
            enableSorting: true,
            size: 100,
          }),
          columnHelper.accessor("takeProfit", {
            header: "Take Profit",
            cell: ({ row, getValue }) =>
              !row.depth && (
                <Price
                  price={fixPrecision(
                    row.original.takeProfit,
                    row.original.asset.pricePrecision
                  )}
                  className={""}
                  smallerLastLetters={row.original.asset.smallerDigits}
                />
              ),
            enableSorting: true,
            size: 100,
          }),
          columnHelper.accessor("currentPrice", {
            header: "Price",
            cell: ({ row, getValue }) =>
              !row.depth && (
                <Price
                  price={fixPrecision(
                    getValue(),
                    row.original.asset.pricePrecision
                  )}
                  className={""}
                  smallerLastLetters={row.original.asset.smallerDigits}
                />
              ),
            enableSorting: true,
            size: 100,
          }),
          columnHelper.accessor("commission", {
            header: "Commission",
            cell: ({ row, getValue }) => (
              <ValueWithCurrency
                value={parseFloat(getValue() as string)}
                currency={null}
                precision={Constants.CommissionValuePrecision}
              />
            ),
            enableSorting: true,
            size: 80,
          }),
        ],
      }),
      columnHelper.group({
        id: "2",
        columns: [
          columnHelper.accessor("pl", {
            header: "P/L",
            cell: ({ row, getValue }) => (
              <ProfitLoss profitLoss={getValue()} pl={0} />
            ),
            enableSorting: true,
            size: 80,
          }),
        ],
      }),
      columnHelper.group({
        id: "3",
        columns: [
          columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row, getValue }) => {
              if ((row.original as IClosableTrade).closing) {
                return "closing";
              }
              return (
                <Group>
                  {props.params.adminLock && internalActions && (
                    <ActionIcon
                      title="Cleanup (internal close)"
                      variant={"light"}
                      size={"xs"}
                      onClick={(e) => {
                        clean(() => {
                          if (row.depth) {
                            dispatch(cleanupTrade(row.original.id));
                          } else {
                            dispatch(cleanupPosition(row.original.id));
                          }
                        });
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                  {row.depth === 0 && (
                    <>
                      <ActionIcon
                        title="Modify"
                        variant={"light"}
                        size={"xs"}
                        onClick={() =>
                          dispatch(
                            setFloatingTradePanel({
                              trade: row.original as ITrade,
                            } as TradePanelProps)
                          )
                        }
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        title="Close"
                        variant={"light"}
                        size={"xs"}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await dispatch(closePosition(row.original.id));
                        }}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    </>
                  )}
                </Group>
              );
            },
            minSize: 100,
            enableSorting: false,
          }),
          columnHelper.display({
            id: "comment",
            header: "Comment",
            cell: ({ row }) => (
              <div style={{ textAlign: "right", textTransform: "lowercase" }}>
                {row.original.comment}
              </div>
            ),
            enableSorting: true,
            enableHiding: true,
            minSize: 100,
            maxSize: 200,
          }),
        ],
      }),
    ],
    [props.params]
  );
  const [settings, setSettings] = useState<{
    columns: Record<string, boolean>;
  }>(
    React.useMemo(
      () => ({
        columns: reduceColumnsToMap(columns as ColumnDef<unknown>[]),
      }),
      []
    )
  );

  useEffect(() => {
    if (props.params.settingsOpen) {
      modals.openContextModal({
        modal: Modals.TableWidgetSettingsModal,
        title: "Open Orders Table Settings",
        innerProps: {
          settings,
          columns,
          setSettings,
        },
        onClose() {
          setTimeout(() =>
            props.api.updateParameters({ ...props.params, settingsOpen: false })
          );
        },
      });
    }
  }, [props.params.settingsOpen]);

  return (
    <Stack spacing={0} style={{ height: "100%" }}>
      <LoadingOverlay visible={status === "loading"} />
      <OpenOrdersTable
        {...props}
        columns={[...columns]}
        {...rowActivation}
        settings={settings}
        setSettings={setSettings}
        active={props.api ? props.api.isVisible : true}
        totalBalance={user && user.total_balance ? user.total_balance : "0.00"}
        positions={positions}
        orders={orders}
      />
    </Stack>
  );
};

const buildComment = (openOrder: IOrder): string => {
  return `[${openOrder?.ocoGroup ? "oco/" : ""}${openOrder?.trigger || "-"}]`;
};

function sortTrades(a: ITrade, b: ITrade): number {
  if (a.orderId < b.orderId) {
    return -1;
  }
  if (a.orderId > b.orderId) {
    return 1;
  }
  return 0;
}

interface OpenOrdersTableProps extends IDockviewPanelProps {
  columns: ColumnDef<IClosableTrade>[];
  onRowClick?: (trade: ITrade) => void;
  onRowDblClick?: (trade: ITrade) => void;
  settings?: any;
  setSettings?: (any) => void;
  active: boolean;
  totalBalance: string;
  orders: IOrder[];
  positions: IPosition[];
}

const OpenOrdersTable = React.memo(
  ({
    columns,
    settings,
    setSettings,
    api,
    totalBalance,
    orders,
    positions,
  }: OpenOrdersTableProps) => {
    const assets = assetsState.assets;
    const floatinTradePanel = useSelector(floatingTradePanelSelector);
    const [selected, onSelectionChange] = useState<RowSelectionState>({});
    const filteredTrades: IClosableTrade[] = [];
    let pl: number = 0;
    let balance = parseFloat(totalBalance);

    for (const position of positions) {
      const openTrade = position.trades[0];

      let openOrder: IOrder;
      for (const order of orders) {
        if (order.id === openTrade.clOrderId) {
          openOrder = order;
          break;
        }
      }

      const asset =
        assets.find((a) => a.symbol === position.symbol) || ({} as IAsset);

      const out = {
        ...openTrade,
        closing: position.closing,
        currentPrice: position.currentPrice,
        quantity: position.quantity,
        id: position.id,
        pl: position.grossPL,
        comment: openOrder ? buildComment(openOrder) : undefined,
        asset,
        side: position.side,
        price: position.avgPrice,
        commission: position.brokerage,
      } as IClosableTrade;

      if (!position.hedged) {
        out.subRows = position.trades
          .filter((t) => t.remaining?.remainingQty !== "0")
          .map((t) => ({
            ...(t as ITrade),
            currentPrice: out.currentPrice,
            quantity: t.remaining?.remainingQty || t.quantity,
            asset,
          }));
      }

      pl += parseFloat(out.pl);
      filteredTrades.push(out);
    }

    let equity = balance - pl;

    columns[0].footer = () => (
      <>
        <Box pl={"xs"}>
          <Text display={"inline"} pr={"xs"} weight={"bold"} size={"sm"}>
            Balance:&nbsp;
          </Text>
          <FormattedValue
            value={balance}
            digits={2}
            style={{ display: "inline" }}
          />
        </Box>
        <Box>
          <Text display={"inline"} pr={"xs"} weight={"bold"} size={"sm"}>
            Equity:&nbsp;
          </Text>
          <FormattedValue
            value={equity}
            digits={2}
            style={{ display: "inline" }}
          />
        </Box>
      </>
    );
    columns[1].footer = () => (
      <FormattedValue
        pl={3}
        key={pl}
        digits={Constants.ProfitLossValuePrecision as any}
        value={pl}
      />
    );
    columns[2].footer = () => null;

    useEffect(() => {
      const panel = (api as any).panel;
      if (api && panel && panel.params && panel.params.items !== filteredTrades.length) {
        api.updateParameters({ items: filteredTrades.length });
      }
    }, [positions, api]);

    return (
      <Table
        onSelectionChange={onSelectionChange}
        data={filteredTrades.sort(sortTrades)}
        columns={columns}
        selected={selected}
        settings={settings}
        setSettings={setSettings}
        active={
          floatinTradePanel
            ? floatinTradePanel.trade && floatinTradePanel.trade.id
            : undefined
        }
        defaultSort={{
          id: "executionTime",
          desc: false,
        }}
        footer={true}
      />
    );
  },
  (prevProps, nextProps) => {
    if (nextProps.active) {
      return false;
    }
    if (nextProps.totalBalance !== prevProps.totalBalance) {
      return false;
    }
    if (nextProps.positions.length !== prevProps.positions.length) {
      return false;
    }
    if (nextProps.orders.length !== prevProps.orders.length) {
      return false;
    }
    return true;
  }
);

Widgets.register(OpenOrders, "open_orders", {
  closable: true,
  title: "Open orders",
  description:
    "Displays a list of all currently open trades, including information such as instrument, volume, entry price, and profit/loss status, helping traders to manage their portfolio and track their overall performance.",
  tabComponent: (
    props: IDockviewPanelHeaderProps & { internalActions: () => boolean }
  ) => (
    <Tab
      {...props}
      withSetting={
        (props.api as { internalActions?: boolean })!.internalActions ? (
          <ActionIcon
            size={"sm"}
            onClick={() => {
              props.api.updateParameters({
                ...props.params,
                adminLock: !props.params.adminLock,
              });
            }}
          >
            {props.params.adminLock ? (
              <IconLockOpen size={14} />
            ) : (
              <IconLock size={14} />
            )}
          </ActionIcon>
        ) : (
          true
        )
      }
      text={
        <>
          {props.api.title}
          {props.params.items ? ` (${props.params.items})` : null}
        </>
      }
    />
  ),
});

export default OpenOrders;
