import {
  accountSelector,
  currentSubAccountSelector,
  currentUserSelector,
} from "@/store/account";
import {
  Box,
  createStyles,
  LoadingOverlay,
  SegmentedControl,
  Text,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import FormattedValue from "../Price/FormattedValue";
import { IUser, IUserStats } from "@/interfaces/account";
import { ApiFetch } from "@/utils/network";

enum Ranges {
  WEEK = "week",
  MONTH = "month",
}

const ranges = [
  {
    value: Ranges.WEEK,
    label: "Week",
  },
  {
    value: Ranges.MONTH,
    label: "Month",
  },
];

const requestHistoryData = async (
  type: Ranges,
  accountNumber: string
): Promise<IUserStats[]> => {
  let data: IUserStats[];
  try {
    data = await ApiFetch<any[]>(
      `/api/accounts/${accountNumber}/stats/${type}`
    );
  } catch (error) {
    if (!error || !error.response) {
      throw error;
    }
    data = [];
  }

  data.forEach((d) => (d.utcTime = new Date(d.utcTime)));
  return data;
};

const useStyles = createStyles((theme) => ({
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tr: {
      "&:nth-of-type(odd) ": {
        background:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[1],
      },
    },
    th: {
      textAlign: "left",
      fontWeight: "normal",
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
    },
    td: {
      textAlign: "right",
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
    },
  },
}));

interface AccountStatsProps {}

export function AccountStats({}: AccountStatsProps) {
  const { classes } = useStyles();
  const user = useSelector(currentUserSelector);
  const currentSubAccount = useSelector(currentSubAccountSelector);
  const [loadingActive, setLoadingActive] = useState(!user);
  const [stats, setStats] = useState<IUserStats[]>([]);
  const [statsType, setStatsType] = useState<Ranges>(Ranges.WEEK);

  useEffect(() => {
    if (!user !== loadingActive) {
      setLoadingActive(!user);
    }
  }, [user]);

  useEffect(() => {
    if (currentSubAccount) {
      requestHistoryData(statsType, currentSubAccount).then(setStats);
    }
  }, [statsType, currentSubAccount]);

  const accountColumns: {
    key: keyof IUser;
    label: string;
    cell?: (val) => any;
  }[] = useMemo(
    () =>
      user.institutional
        ? [
            {
              key: "account",
              label: "Account Number",
            },
            {
              key: "currency",
              label: "Currency",
            },
            {
              key: "daily_profitLoss",
              label: "Profit/Loss",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_openProfitLoss",
              label: "Open/Floating PL",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
          ]
        : [
            {
              key: "account",
              label: "Account Number",
            },
            {
              key: "currency",
              label: "Currency",
            },
            {
              key: "daily_openBalance",
              label: "Beginning Balance",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_deposit",
              label: "Deposit",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_withdrawal",
              label: "Withdrawal",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_adjustment",
              label: "Adjustment",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_profitLoss",
              label: "Profit/Loss",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_commission",
              label: "Brokerage",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_rollover",
              label: "SwapPL",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_mtmpl",
              label: "MTM PL",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_fees",
              label: "Fees",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_closeBalance",
              label: "Ending Balance",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_openProfitLoss",
              label: "Open/Floating PL",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
            {
              key: "daily_netEquity",
              label: "Net Equity",
              cell: (val) => <FormattedValue digits={2} value={val} />,
            },
          ],
    [user]
  );

  const marginColumns: { key: string; label: string; cell?: (val) => any }[] =
    useMemo(
      () => [
        {
          key: "creditLimit",
          label: "Credit Limit",
          cell: (val) => <FormattedValue digits={-1} value={val} />,
        },
        {
          key: "creditUsage",
          label: "Credit Usage",
          cell: (val) => <FormattedValue digits={2} value={val} />,
        },
        {
          key: "creditUsagePercent",
          label: "Credit Percent Usage",
          cell: (val) => <FormattedValue digits={2} value={val} suffix="%" />,
        },
        {
          key: "marginPercentage",
          label: "Margin Percentage",
          cell: (val) => <FormattedValue digits={2} value={val} suffix="%" />,
        },
        {
          key: "availableMargin",
          label: "Margin Available",
          cell: (val) => <FormattedValue digits={2} value={val} />,
        },
      ],
      []
    );

  return (
    <Box>
      <LoadingOverlay visible={loadingActive} />
      <Text mb={"sm"} mt={"lg"} mx={"sm"} size={"lg"} weight={"bold"}>
        Account:
      </Text>
      <table className={classes.table}>
        <tbody>
          {accountColumns.map((c) => {
            const val = (user && user[c.key]) || "-";
            return (
              <tr key={c.key}>
                <th>{c.label}</th>
                <td>{c.cell && val != "-" ? c.cell(val) : val}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Text mb={"sm"} mt={"lg"} mx={"sm"} size={"lg"} weight={"bold"}>
        Margin Usage:
      </Text>
      <table className={classes.table}>
        <tbody>
          {marginColumns.map((c) => {
            const val = (user && user[c.key]) || "-";
            return (
              <tr key={c.key}>
                <th>{c.label}</th>
                <td>{c.cell && val != "-" ? c.cell(val) : val}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/*<Text mb={"sm"} mt={"lg"} mx={"sm"} size={"lg"} weight={"bold"}>
        Stats:
      </Text>

      <SegmentedControl
        size={"sm"}
        data={ranges}
        ml={0}
        fullWidth={true}
        value={statsType}
        onChange={(val) => setStatsType(val as Ranges)}
      />

      {
        // here chart stats.map...
      }*/}
    </Box>
  );
}

export default AccountStats;
