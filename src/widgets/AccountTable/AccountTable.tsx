import {
  ColumnDef,
  createColumnHelper,
  RowSelectionState,
} from "@tanstack/react-table";
import { IUser } from "@/interfaces/account";
import Table from "@/components/Table";
import { useSelector } from "react-redux";
import { accountSelector, setActiveSubAccount } from "@/store/account";
import { Widgets } from "@/lib/WidgetRegister";
import FormattedValue from "@/components/Price/FormattedValue";
import { Box, createStyles } from "@mantine/core";
import { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";
import { useAppDispatch } from "@/pages/_app";
import React, { useEffect, useState } from "react";
import { reduceColumnsToMap } from "../Tables";
import AccountsFilter from "./Filter";
import { modals } from "@mantine/modals";
import { Modals } from "@/components/Modals";
import Tab from "../Tab";
import { useLocalStorage } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "100%",
    ".mantine-ScrollArea-scrollbar": {
      zIndex: 1000,
    },
  },
}));

export type AccountTableProps = IDockviewPanelProps<{
  settingsOpen: boolean;
}>;

const AccountTable = ({ params, api }: AccountTableProps) => {
  const dispatch = useAppDispatch();
  const { classes } = useStyles();
  const columnHelper = createColumnHelper<Partial<IUser>>();
  const { subUsers, currentSubAccount, user, loginAccount } =
    useSelector(accountSelector);
  const [search, setSearch] = useState<string>("");
  const columns: ColumnDef<Partial<IUser>>[] = React.useMemo(
    () => [
      columnHelper.accessor("account", {
        header: "Account",
        size: 5,
        maxSize: 5,
        meta: { right: true },
        cell: (data) => (
          <div style={{ textAlign: "right" }}>
            {data.row.original.account === currentSubAccount
              ? `* ${data.row.original.account}`
              : data.row.original.account}
          </div>
        ),
      }),
      columnHelper.accessor("total_balance", {
        header: "Balance",
        meta: { right: true },
        cell: (data) => (
          <FormattedValue
            digits={2}
            style={{ textAlign: "right" }}
            value={data.getValue()}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("total_openProfitLoss", {
        header: "Open P/L",
        meta: { right: true },
        cell: (data) => (
          <FormattedValue
            digits={2}
            style={{ textAlign: "right" }}
            value={data.getValue()}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("total_netEquity", {
        header: "Net Equity",
        meta: { right: true },
        cell: (data) => (
          <FormattedValue
            digits={2}
            style={{ textAlign: "right" }}
            value={data.getValue()}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("marginPercentage", {
        header: "Margin %",
        meta: { right: true },
        cell: (data) => (
          <FormattedValue
            digits={2}
            style={{ textAlign: "right" }}
            value={data.getValue()}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("creditLimit", {
        header: "Credit Limit",
        meta: { right: true },
        cell: (data) => (
          <FormattedValue
            digits={2}
            style={{ textAlign: "right" }}
            value={data.getValue()}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("creditUsage", {
        header: "Credit Usage",
        meta: { right: true },
        cell: (data) => (
          <FormattedValue
            digits={2}
            style={{ textAlign: "right" }}
            value={data.getValue()}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("creditUsagePercent", {
        header: "Credit Usage %",
        meta: { right: true },
        cell: (data) => (
          <FormattedValue
            digits={2}
            style={{ textAlign: "right" }}
            value={data.getValue()}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("availableMargin", {
        header: "Available Margin",
        meta: { right: true },
        cell: (data) => (
          <FormattedValue
            digits={2}
            style={{ textAlign: "right" }}
            value={data.getValue()}
          />
        ),
        enableSorting: true,
      }),
    ],
    [currentSubAccount]
  );

  const [settings, setSettings] = useLocalStorage<{
    columns: Record<string, boolean>;
  }>({
    key: `settings-${api.id}`,
    getInitialValueInEffect: false,
    defaultValue: {
      columns: reduceColumnsToMap(columns as ColumnDef<unknown>[]),
    },
  });

  useEffect(() => {
    if (params.settingsOpen) {
      modals.openContextModal({
        modal: Modals.TableWidgetSettingsModal,
        title: "Accounts Table Settings",
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
      <Table<IUser>
        key={JSON.stringify(settings)}
        data={Object.values(subUsers).filter(
          (u) =>
            !u.admin &&
            (!search ||
              u.account.toLowerCase().indexOf(search.toLowerCase()) !== -1)
        )}
        columns={columns as ColumnDef<IUser>[]}
        onRowDblClick={(row) => {
          dispatch(setActiveSubAccount(row.original.account));
        }}
        onSelectionChange={(row: RowSelectionState) => {
          return;
        }}
        settings={settings}
        setSettings={setSettings}
      />
      {subUsers[loginAccount]?.admin && (
        <AccountsFilter onSearch={(val) => setSearch(val.trim())} />
      )}
    </Box>
  );
};

Widgets.register(AccountTable, "accounts_table", {
  closable: true,
  title: "Accounts",
  tabComponent: (props: IDockviewPanelHeaderProps) => (
    <Tab {...props} withSetting={true} />
  ),
});

export default AccountTable;
