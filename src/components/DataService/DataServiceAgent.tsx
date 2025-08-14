import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/pages/_app";
import { quotesActions } from "@/store/quotes";
import {
  ActionIcon,
  Box,
  createStyles,
  Group,
  HoverCard,
  Text,
} from "@mantine/core";
import { ISettings, IUser } from "@/interfaces/account";
import {
  currentSubAccountSelector,
  currentUserIdSelector,
  loadSettings,
  setActiveSubAccount,
  setLoginAccount,
  setSettings,
  setSubAccounts,
  settingsSelector,
  updateAccount,
} from "@/store/account";
import {
  loadClosedPairedPositions,
  loadOpenPositions,
  resetPositions,
  updateBothPositions,
} from "@/store/positions";
import {
  loadOrders,
  mutatePendingTpSl,
  resetOrders,
  updateOrder,
  updateOrders,
  updateOrdersWithQuotes,
} from "@/store/orders";
import { IconPlugConnected, IconPlugConnectedX } from "@tabler/icons";
import {
  LogColors,
  addConnectionState,
  addLog,
  lastConnectionStatesSelector,
  logsSelector,
} from "@/store/logs";
import { IPosition } from "@/interfaces/IPosition";
import { useSelector } from "react-redux";
import { Session } from "next-auth";
import { loadNetPositions } from "@/store/positions";
import { wrap, Remote, proxy, releaseProxy } from "comlink";
import Worker from "worker-loader!@/dataworker";
import DataWorker, { PriceTickCollection } from "@/dataworker";
import { WSEvents } from "@/interfaces/WsClient";
import { loadMessages } from "@/store/messages";
import { LogEvent } from "@/interfaces/ILog";
import { IMessage } from "@/interfaces/IMessage";
import { showNotification } from "@mantine/notifications";
import { PayloadAction } from "@reduxjs/toolkit";
import { loadWorkspaces, resetWorkspaces } from "@/store/workspace";
import LocalStorageService from "@/services/LocalStorageService";
import { sounds } from "@/services/Sounds";
import useSound from "use-sound";
import { ITrade } from "@/interfaces/ITrade";

export type DataServiceProps = {
  server?: string;
  session: Session;
  render: boolean;
};

const useStyles = createStyles((theme) => ({
  status: {},
  green: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.green[7]
        : theme.colors.green[9],
  },
  red: {
    color:
      theme.colorScheme === "dark" ? theme.colors.red[5] : theme.colors.red[9],
  },
}));

let serializedStats: Record<string, string> = {};

let worker: Remote<DataWorker> = null;

const DataServiceAgent = ({ session, render }: DataServiceProps) => {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastTradingActive, setLastTradingActive] = useState<Date | null>(null);
  const currentSubAccount = useSelector(currentSubAccountSelector);
  const userId = useSelector(currentUserIdSelector);
  const settings = useSelector(settingsSelector);
  const connectionStates = useSelector(lastConnectionStatesSelector);
  const { classes, cx } = useStyles();
  const wsToken = session ? session.wsToken : "";
  const { logs, connectionLogs } = useSelector(logsSelector);
  const [playOrderExecution] = useSound(sounds.orderExecution);
  const [playOrderRejection] = useSound(sounds.orderRejection);
  const [playOrderSubmission] = useSound(sounds.orderSubmissionModification);
  const [playNotification] = useSound(sounds.notification);
  const [playConnect] = useSound(sounds.connect);
  const [playDisconnect] = useSound(sounds.disconnect);
  const [isExecutionAllowed, setIsExecutionAllowed] = useState(true);

  let reloading = false;
  const reloadFromWebWorker = async (withQuotes: boolean) => {
    if (!worker || reloading) {
      return;
    }

    const start = performance.now();
    reloading = true;

    let quotes: PriceTickCollection;
    let positions: Record<string, IPosition>;
    let netPositions: Record<string, IPosition>;

    try {
      if (withQuotes) {
        quotes = await worker.getQuotes();
      }
      positions = await worker.getPositions();
      netPositions = await worker.getNetPositions();
    } catch (e) {
      console.log("WS proxy released during update");
      reloading = false;
      return;
    }

    if (withQuotes) {
      dispatch(quotesActions.onUpdate(quotes));
      dispatch(updateOrdersWithQuotes(quotes));
    }

    if (Object.keys(positions).length || Object.keys(netPositions).length) {
      dispatch(
        updateBothPositions({
          pos: Object.values(positions),
          net: Object.values(netPositions),
        })
      );
    }
    reloading = false;
    //  console.log("update took", performance.now() - start);
  };

  const socketInitializer = async () => {
    if (worker) {
      await worker.close();
      await worker[releaseProxy]();
    }
    const RemoteChannel = wrap<typeof DataWorker>(new Worker());

    worker = await new RemoteChannel(
      process.env.NEXT_PUBLIC_WEBSOCKET,
      wsToken,
      currentSubAccount
    );
    console.log(`Worker initialized for account ${currentSubAccount}`);

    worker.onEvent(
      WSEvents.Connected,
      proxy((data) => {
        setIsConnected(true);
      })
    );
    worker.onEvent(
      WSEvents.Disconnected,
      proxy((data) => {
        setIsConnected(false);
      })
    );
    worker.onEvent(
      WSEvents.NetPosition,
      proxy((data) => {
        reloadFromWebWorker(false);
      })
    );
    worker.onEvent(
      WSEvents.Positions,
      proxy((data) => {
        reloadFromWebWorker(false);
      })
    );
    worker.onEvent(
      WSEvents.Position,
      proxy((data) => {
        reloadFromWebWorker(false);
      })
    );
    worker.onEvent(
      WSEvents.OCOOrders,
      proxy(async (data) => {
        try {
          const quote = await worker.getQuote(data.oco1.symbol);
          mutatePendingTpSl(data.oco1, quote);
          mutatePendingTpSl(data.oco2, quote);
          dispatch(updateOrder(data.oco1));
          dispatch(updateOrder(data.oco2));
        } catch (e) {
          console.error(e);
        }
      })
    );
    worker.onEvent(
      WSEvents.Log,
      proxy((log) => {
        if (log.type === "debug" || log.admin) {
          return;
        }

        try {
          dispatch(addLog(log));
        } catch (e) {
          console.error(e);
        }
      })
    );
    worker.onEvent(
      WSEvents.Order,
      proxy(async (order) => {
        try {
          const quote = await worker.getQuote(order.symbol);
          mutatePendingTpSl(order, quote);
          dispatch(updateOrder(order));
        } catch (e) {
          console.error(e);
        }
      })
    );
    worker.onEvent(
      WSEvents.OCOOrders,
      proxy((ocodata) => {
        dispatch(updateOrders([ocodata.oco1, ocodata.oco2]));
      })
    );
    worker.onEvent(
      WSEvents.Message,
      proxy((msg: IMessage) => {
        if (msg.userId !== userId) {
          return;
        }
        dispatch(
          addLog({
            event: LogEvent.NOTIFICATION,
            message: "New message received",
            type: "",
            id: "",
            account: "",
            ip: "",
            createdAt: "",
          })
        );
        dispatch(loadMessages(currentSubAccount));
        showNotification({
          title: "New message received",
          message: msg.subject,
          color: LogColors.Info,
        });
      })
    );
    worker.onEvent(
      WSEvents.Account,
      proxy((account: IUser) => {
        try {
          const serializedNew = JSON.stringify(account);
          if (
            !serializedStats[account.account] ||
            serializedStats[account.account] !== serializedNew
          ) {
            serializedStats[account.account] = serializedNew;
            dispatch(updateAccount(account));
          }
        } catch (e) {
          console.error(e);
        }
      })
    );
    let tradesDebouncer: NodeJS.Timeout;
    worker.onEvent(
      WSEvents.Trade,
      proxy((trade: ITrade) => {
        clearTimeout(tradesDebouncer);
        tradesDebouncer = setTimeout(
          () => dispatch(loadClosedPairedPositions(trade.account)),
          50
        );
      })
    );
    worker.onEvent(
      WSEvents.Trading,
      proxy((tradingState) => {
        tradingState.time = new Date();
        console.log(
          `TradingState: ${tradingState.connected} ${tradingState.time}`
        );
        if (tradingState.connected === undefined) {
          tradingState.connected = false;
        }

        setLastTradingActive(
          tradingState.connected ? tradingState.time : new Date(0)
        );
        dispatch(addConnectionState(tradingState));
      })
    );
  };

  function reloadPositions() {
    dispatch(loadClosedPairedPositions(currentSubAccount));
    dispatch(loadOpenPositions(currentSubAccount));
    dispatch(loadNetPositions(currentSubAccount));
  }

  useEffect(() => {
    return () => {
      // important so after unmounting & mounting again it will reload settings
      dispatch(resetWorkspaces());
    };
  }, []);

  // buffered quotes/positions updates
  useEffect(() => {
    if (!settings) {
      return;
    }
    const timer = setInterval(
      () => reloadFromWebWorker(true),
      settings.quotesRate || 1000
    );
    //   const timerPositions = setInterval(
    //     reloadPositions,
    //     settings.pollingRate || 10000
    //   );
    return () => {
      clearTimeout(timer);
      //  clearTimeout(timerPositions);
    };
  }, [currentSubAccount, settings]);

  /* Load login account details */
  useEffect(() => {
    if (!session) return;

    const loggedUser: IUser = { ...session.user };
    const lastAccountNumber = LocalStorageService.getAccountNumber();
    const subUsers = session.user.subUsers || [];

    dispatch(setLoginAccount(loggedUser.account));
    dispatch(setSubAccounts([loggedUser, ...subUsers]));
    if (subUsers.find((a) => a.account == lastAccountNumber)) {
      dispatch(setActiveSubAccount(lastAccountNumber));
    } else {
      dispatch(setActiveSubAccount(session.user.account));
      dispatch(setSettings(session.user.settings));
    }
  }, [session]);

  /* Load subaccount when switching */
  useEffect(() => {
    if (!currentSubAccount) return;

    const reloadSettingsUser = session.user.admin
      ? session.user.account
      : currentSubAccount;

    // load settings/workspaces for switched account (if admin - use login account)
    dispatch(loadSettings(reloadSettingsUser)).then(
      (data: PayloadAction<ISettings, string, any>) => {
        const workspaces = data.payload.workspaces;
        const workspacesValid = workspaces && workspaces.length;
        dispatch(
          loadWorkspaces(
            workspacesValid
              ? { currentWorkspaceId: workspaces[0].id, workspaces }
              : null
          )
        );

        // first clear orders without any async action
        dispatch(resetOrders());
        dispatch(resetPositions());

        // reload fresh positions + other entries
        reloadPositions();
        dispatch(loadOrders(currentSubAccount));
        dispatch(loadMessages(currentSubAccount));
      }
    );
  }, [currentSubAccount]);

  useEffect(() => {
    if (wsToken && currentSubAccount) {
      socketInitializer();
    }
  }, [wsToken, currentSubAccount]);

  function isActiveRecently() {
    if (!lastTradingActive) {
      return false;
    }

    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - lastTradingActive.getTime();
    const secondsDifference = timeDifference / 1000;

    // Check if the seconds difference is greater than 10
    if (secondsDifference < 10) {
      return true;
    } else {
      return false;
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isActiveRecently()) {
        setLastTradingActive(new Date(0));
        dispatch(addConnectionState({ connected: false, time: new Date() }));
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [lastTradingActive]);

  useEffect(() => {
    if (connectionLogs.length < 0 || !settings || !settings.sounds) {
      return;
    }
    const log = connectionLogs[0];
    const prevLog = connectionLogs[1] || { connected: false };

    if (log && log.connected !== prevLog.connected) {
      if (log.connected) {
        playConnect();
      } else {
        playDisconnect();
      }
    }
  }, [connectionLogs]);

  useEffect(() => {
    if (!logs.length || !settings || !settings.sounds) {
      return;
    }
    const log = logs[0];
    console.log("Log Event", log.event);

    switch (log.event) {
      case LogEvent.EXECUTION:
        if (isExecutionAllowed) {
          playOrderExecution();
          setIsExecutionAllowed(false);
          setTimeout(() => {
            setIsExecutionAllowed(true);
          }, 500);
        }
        break;
      case LogEvent.MODIFICATION:
        playOrderSubmission();
        break;
      case LogEvent.SUBMISSION:
        //   playOrderSubmission();
        break;
      case LogEvent.REJECTION:
        playOrderRejection();
        break;
      case LogEvent.NOTIFICATION:
        playNotification();
        break;
    }
  }, [logs]);

  const activeRecently = isActiveRecently();
  return render ? (
    <Group position="center">
      <HoverCard width={280} shadow="md" position={"left"}>
        <HoverCard.Target>
          <ActionIcon
            size={"lg"}
            className={cx(
              classes.status,
              isConnected && activeRecently ? classes.green : classes.red
            )}
          >
            {isConnected && activeRecently ? (
              <IconPlugConnected />
            ) : (
              <IconPlugConnectedX />
            )}
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size={"sm"}>
            {isConnected
              ? "Connected to server"
              : "Check your internet connection"}
          </Text>
          <Text size={"sm"}>
            {activeRecently ? "Trading active" : "Trading disabled"}
          </Text>
          {connectionStates &&
            connectionStates.map((s, k) => (
              <Box key={k}>
                <Text className={s.connected ? classes.green : classes.red}>
                  {s.time.toUTCString()}
                </Text>
              </Box>
            ))}
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  ) : null;
};

export default React.memo(DataServiceAgent, (prevProps, nextProps) => {
  if (prevProps.session.expires != nextProps.session.expires) {
    const oldExpire = Date.parse(prevProps.session.expires);
    const newExpire = Date.parse(nextProps.session.expires);
    if (newExpire - oldExpire > 86400) {
      return false;
    }
  } else if (prevProps.render !== nextProps.render) {
    return false;
  }

  return true;
});
