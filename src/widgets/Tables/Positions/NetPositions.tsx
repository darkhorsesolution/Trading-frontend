import {
  ColumnDef,
  createColumnHelper,
  RowSelectionState,
} from "@tanstack/react-table";
import { useSelector } from "react-redux";
import ProfitLoss from "@/components/Price/ProfitLoss";
import { IconX } from "@tabler/icons";
import {
  ActionIcon,
  Box,
  LoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { Widgets } from "@/lib/WidgetRegister";
import { useAppDispatch } from "@/pages/_app";
import FormattedValue from "@/components/Price/FormattedValue";
import { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";
import { SideIcons } from "./common";
import { closeNetPosition, netPositionsSelector } from "@/store/positions";
import { assetsState } from "@/store/assets";
import { fixPrecision, IAsset } from "@/interfaces/IAsset";
import Price from "@/components/Price/Price";
import { accountSelector } from "@/store/account";
import Constants from "@/utils/Constants";
import { reduceColumnsToMap } from "..";
import Table from "@/components/Table";
import { IPosition } from "@/interfaces/IPosition";
import { modals } from "@mantine/modals";
import { Modals } from "@/components/Modals";
import Tab from "@/widgets/Tab";
import { useLocalStorage } from "@mantine/hooks";

export type NetPositionsProps = IDockviewPanelProps<{
  settingsOpen: boolean;
}>;

const NetPositions = (props: NetPositionsProps) => {
  const columnHelper = createColumnHelper<IPosition>();
  const { assets } = assetsState;
  const netPositions = useSelector(netPositionsSelector);
  const dispatch = useAppDispatch();
  const columns: ColumnDef<IPosition>[] = React.useMemo(
    () => [
      columnHelper.group({
        id: "1",
        columns: [
          columnHelper.accessor("symbol", {
            header: "Symbol",
            cell: ({ row, getValue }) => <div>{getValue().toString()}</div>,
            enableSorting: true,
            minSize: 90,
            size: 90,
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
                digits={row.original.asset?.cfd ? 2 : 0}
                value={parseFloat(getValue())}
              />
            ),
            enableSorting: true,
            size: 100,
          }),
          columnHelper.accessor("avgPrice", {
            header: "Avg. Entry Price",
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
          columnHelper.display({
            id: "price",
            header: "Price",
            cell: ({ row, getValue }) => (
              <Price
                price={fixPrecision(
                  row.original.currentPrice,
                  row.original.asset.pricePrecision
                )}
                className={""}
                smallerLastLetters={row.original.asset.smallerDigits}
              />
            ),
            enableSorting: true,
            size: 100,
          }),
        ],
      }),
      columnHelper.group({
        id: "2",
        columns: [
          columnHelper.accessor("grossPL", {
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
              return (
                <ActionIcon
                  title="Close"
                  variant={"light"}
                  size={"xs"}
                  onClick={async (e) => {
                    e.stopPropagation();
                    await dispatch(closeNetPosition(row.original.symbol));
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              );
            },
            size: 100,
            enableSorting: false,
          }),
        ],
      }),
    ],
    []
  );
  const { user } = useSelector(accountSelector);

  const [settings, setSettings] = useLocalStorage<{ columns: Record<string, boolean> }>({
    key: `settings-${props.api.id}`,
    getInitialValueInEffect: false,
    defaultValue: {
      columns: reduceColumnsToMap(columns as ColumnDef<unknown>[]),
    },
  });

  useEffect(() => {
    if (props.params.settingsOpen) {
      modals.openContextModal({
        modal: Modals.TableWidgetSettingsModal,
        title: "Net Positions Settings",
        innerProps: {
          settings,
          columns,
          setSettings,
        },
        onClose() {
          props.api.updateParameters({ ...props.params, settingsOpen: false });
        },
      });
    }
  }, [props.params.settingsOpen]);

  return (
    <Stack spacing={0} style={{ height: "100%" }}>
      <LoadingOverlay visible={status === "loading"} />
      <NetPositionsTable
        key={JSON.stringify(settings)}
        {...props}
        settings={settings}
        setSettings={setSettings}
        columns={columns}
        active={props.api ? props.api.isVisible : true}
        positions={netPositions.map((p) => ({
          ...p,
          asset: assets.find((a) => a.symbol === p.symbol) || ({} as IAsset),
        }))}
        totalBalance={user && user.total_balance ? user.total_balance : "0.00"}
      />
    </Stack>
  );
};

interface NetPositionsTableProps extends IDockviewPanelProps {
  totalBalance: string;
  positions: IPosition[];
  columns: ColumnDef<IPosition>[];
  settings?: any;
  setSettings?: (any) => void;
  active: boolean;
}

const NetPositionsTable = React.memo(
  ({
    api,
    setSettings,
    settings,
    columns,
    positions,
    totalBalance,
  }: NetPositionsTableProps) => {
    const [selected, onSelectedChanged] = useState<RowSelectionState>({});
    const pl: number = positions.reduce(
      (acc, curr) => parseFloat(curr.grossPL) + acc,
      0
    );
    const balance = parseFloat(totalBalance);
    const equity = balance - pl;

    columns[0].footer = () => (
      <>
        <Box>
          <Text display={"inline"} pr={"xs"} weight={"bold"} size={"sm"}>
            Balance:
          </Text>
          <FormattedValue
            value={balance}
            digits={2}
            style={{ display: "inline" }}
          />
        </Box>
        <Box>
          <Text display={"inline"} pr={"xs"} weight={"bold"} size={"sm"}>
            Equity:
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

    useEffect(() => {
      const panel = (api as any).panel;
      if (api && panel && panel.params && panel.params.items !== positions.length) {
        api.updateParameters({ items: positions.length });
      }
    }, [positions, api]);

    return (
      <Table
        onSelectionChange={onSelectedChanged}
        selected={selected}
        data={positions.map((row: IPosition) => ({
          ...row,
          subRows: row.trades,
        }))}
        columns={[...columns]}
        settings={settings}
        setSettings={setSettings}
        defaultSort={{
          id: "symbol",
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
    if (nextProps.positions.length !== prevProps.positions.length) {
      return false;
    }
    return true;
  }
);

Widgets.register(NetPositions, "net_positions", {
  closable: true,
  title: "Net positions",
  description: "Displays a list of net positions",
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

export default NetPositions;
