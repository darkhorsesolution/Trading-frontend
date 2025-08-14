import { IUser } from "@/interfaces/account";
import {
  Box,
  Button,
  clsx,
  createStyles,
  Group,
  LoadingOverlay,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import FormattedValue, { formatValue } from "../Price/FormattedValue";
import Constants from "@/utils/Constants";
import { IconUser } from "@tabler/icons";
import { useSelector } from "react-redux";
import { backofficeOpenSelector, setBackofficeOpen } from "@/store/workspace";
import { useAppDispatch } from "@/pages/_app";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  boIcon: {
    color: theme.colors.blue[7],
    "&.open": {
      color: theme.colors.gray[3],
    },
  },
  statsBox: {
    border: 1,
  },
  iframeWrapper: {
    position: "absolute",
    height: "calc(100% - 68px)",
    width: "100%",
    zIndex: 1000,
    top: "68px",
    display: "flex",
    background:
      theme.colorScheme === "dark"
        ? theme.colors.gray[9]
        : theme.colors.gray[9],
  },
  iframe: {
    width: "100%",
    height: "100%",
    display: "flex",
    flex: 1,
    border: 0,
    "&.loading": {
      display: "none",
    },
  },
}));

interface AccountStatsPanelProps {
  user: IUser;
}

const formatDetailedCredit = (user: IUser): string => {
  let out = `Limit: ${formatValue(user.creditLimit, 0)}\nUsage: ${formatValue(
    user.creditUsage,
    2
  )}\nUsage %: ${formatValue(user.creditUsagePercent, 2)}`;
  if (!user.institutional) {
    out += `\nNotification: 80%\nLiquidation: 100%`;
  }

  return out;
};

const valueProps = {
  p: 0,
  m: 0,
  mt: -2,
  size: "sm",
};
const labelProps = {
  p: 0,
  m: 0,
  color: "dimmed",
  size: "sm",
};
const boxProps = {
  style: { minWidth: "100px" },
  spacing: 0,
  align: "center",
};

const AccountStatsPanel = ({ user }: AccountStatsPanelProps) => {
  const [loadingActive, setLoadingActive] = useState(!user);
  const backofficeOpen = useSelector(backofficeOpenSelector);
  const [backofficeLoaded, setBackofficeLoaded] = useState(false);
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const handler = (url, { shallow }) => {
      dispatch(setBackofficeOpen(false))
      setBackofficeLoaded(false);
    }
    router.events.on("routeChangeComplete", handler)

    return () => {
      router.events.off("routeChangeComplete", handler)
    }
  })

  useEffect(() => {
    if (loadingActive !== !user) {
      setLoadingActive(!user);
    }
  }, [user]);

  useEffect(() => {
    setBackofficeLoaded(false);
  }, [backofficeOpen]);


  if (loadingActive || !user) {
    return (
      <Group noWrap={true}>
        <LoadingOverlay visible={loadingActive} />
      </Group>
    );
  }

  const creditWarning = parseFloat(user.creditUsagePercent) >= 80;

  const dailyProfitLoss = () => (
    <Stack title="Profit/Loss" style={{ minWidth: "90px" }} {...boxProps}>
      <Text {...labelProps}>P/L</Text>
      <Text
        {...valueProps}
        color={parseFloat(user.daily_profitLoss) < 0 ? "red.5" : "green"}
      >
        <FormattedValue
          calcSize={false}
          style={{ marginRight: "5px" }}
          digits={2}
          value={parseFloat(user.daily_profitLoss || "0").toFixed(
            Constants.DefaultNumberPrecision
          )}
        />
      </Text>
    </Stack>
  );

  const balance = () => (
    <Stack
      title="Available Balance in your account"
      style={{ minWidth: "90px" }}
      {...boxProps}
    >
      <Text {...labelProps}>Balance</Text>
      <Text
        {...valueProps}
        color={parseFloat(user.total_balance) < 0 ? "red.5" : "green"}
      >
        <FormattedValue
          calcSize={false}
          style={{ marginRight: "5px" }}
          digits={2}
          value={parseFloat(user.total_balance || "0").toFixed(
            Constants.DefaultNumberPrecision
          )}
        />
      </Text>
    </Stack>
  );

  const openPL = () => (
    <Stack title="Open Profit/Loss" {...boxProps}>
      <Text {...labelProps}>O/P/L</Text>
      <Text
        {...valueProps}
        color={parseFloat(user.total_openProfitLoss) < 0 ? "red.5" : "green"}
      >
        <FormattedValue
          calcSize={false}
          style={{ marginLeft: "0", marginRight: "5px" }}
          digits={2}
          value={user.total_openProfitLoss || "-"}
        />
      </Text>
    </Stack>
  );

  const netEquity = () => (
    <Stack title="Net Equity" {...boxProps}>
      <Text {...labelProps}>Equity</Text>
      <Text
        {...valueProps}
        color={parseFloat(user.total_netEquity) < 0 ? "red.5" : "green"}
      >
        <FormattedValue
          calcSize={false}
          style={{ marginRight: "5px" }}
          digits={2}
          value={parseFloat(user.total_netEquity || "0").toFixed(
            Constants.DefaultNumberPrecision
          )}
        />
      </Text>
    </Stack>
  );

  const usedCredit = () => (
    <Stack title={formatDetailedCredit(user)} {...boxProps}>
      <Text span {...labelProps}>
        Used Credit
      </Text>
      <Text color={creditWarning ? "red" : null} {...valueProps}>
        <FormattedValue
          calcSize={false}
          digits={2}
          value={user.creditUsagePercent ? user.creditUsagePercent : "-"}
          suffix={user.creditUsagePercent ? `%` : undefined}
        />
      </Text>
    </Stack>
  );
  return (
    <Group noWrap={true}>
      {!user.admin && (
        <Group noWrap={true}>
          {user.institutional ? (
            <>
              {openPL()}
              {dailyProfitLoss()}
            </>
          ) : (
            <>
              {balance()}
              {openPL()}
              {netEquity()}
            </>
          )}
          {usedCredit()}
        </Group>
      )}

      {process.env.NEXT_PUBLIC_BACKOFFICE_URL && (
        <Button
          leftIcon={<IconUser size={16} />}
          compact={true}
          variant={backofficeOpen ? "filled" : "subtle"}
          onClick={() => dispatch(setBackofficeOpen(!backofficeOpen))}
        >
          {backofficeOpen ? "Close" : "Open"} Backoffice
        </Button>
      )}
      {
        <Modal.Root
          opened={backofficeOpen}
          onClose={close}
          fullScreen
          radius={0}
          transitionProps={{ transition: "fade", duration: 200 }}
        >
          <Modal.Content mt={"70px"}>
            <Modal.Body h={"100%"} p={0}>
              <LoadingOverlay visible={!backofficeLoaded} />
              <iframe
                onLoad={() => setBackofficeLoaded(true)}
                className={clsx(
                  classes.iframe,
                  !backofficeLoaded ? "loading" : undefined
                )}
                src={process.env.NEXT_PUBLIC_BACKOFFICE_URL}
              />
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>
      }
    </Group>
  );
};

export default React.memo(AccountStatsPanel, (prev, next) => {
  if (!next.user) {
    return false;
  }

  return !(
    !prev.user ||
    prev.user.total_balance !== next.user.total_balance ||
    prev.user.total_openProfitLoss !== next.user.total_openProfitLoss ||
    prev.user.total_netEquity !== next.user.total_netEquity ||
    prev.user.creditUsagePercent !== next.user.creditUsagePercent
  );
});
