import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { IConnectionState, ILog, LogEvent } from "@/interfaces/ILog";
import { showNotification } from "@mantine/notifications";

export type LogsState = {
  logs: Array<ILog> | null;
  systemLogs: Array<ILog> | null;
  connectionLogs: Array<IConnectionState> | null;
};

export const initialState: LogsState = {
  logs: [],
  systemLogs: [],
  connectionLogs: [],
};

export interface LogsQuery {
  page?: number;
  from?: string;
  to?: string;
  search?: string;
  paginate?: boolean;
}

export enum LogColors {
  Error = "red",
  Warn = "orange",
  Info = "blue",
  Debug = "grey",
}

export const getLogColor = (log: ILog): LogColors => {
  switch (log.type) {
    case "error":
      return LogColors.Error;
    case "warn":
      return LogColors.Warn;
    case "info":
      return LogColors.Info;
    default:
      return LogColors.Debug;
  }
};

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    addConnectionState: (state, action: PayloadAction<IConnectionState>) => {
      state.connectionLogs.unshift(action.payload);
      if (state.connectionLogs.length > 5) {
        state.connectionLogs.pop();
      }
    },
    setLogs: (state, action: PayloadAction<Array<ILog>>) => {
      state.logs = [...action.payload];
    },
    addClientEvent: (state, action: PayloadAction<LogEvent>) => {
      state.logs.unshift({
        account: "",
        id: "",
        ip: "",
        type: "",
        createdAt: "",
        event: action.payload,
      });
    },
    addLog: (state, action: PayloadAction<ILog>) => {
      const log = { ...action.payload };
      state.logs.unshift(log);

      if (log.id) {
        showNotification({
          title: log.message,
          message: "",
          color: getLogColor(log),
        });
      }
    },
  },
  extraReducers: (builder) => {},
});

export const { setLogs, addLog, addConnectionState, addClientEvent } =
  logsSlice.actions;
const { reducer } = logsSlice;
export const logsSelector = (state: RootState) => state.logs;
export const lastConnectionStatesSelector = (state: RootState) =>
  state.logs.connectionLogs;

export default reducer;
