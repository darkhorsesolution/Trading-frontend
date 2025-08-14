import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { RootState } from "./index";
import { IChartWidgetProps } from "@/widgets/Charts/Charts";
import { v4 as uuid } from "uuid";
import { ApiPost, IGenericResponse } from "@/utils/network";
import { ISettings } from "@/interfaces/account";
import { TradePanelProps } from "@/components/Trade/TradePanel";

const debouncedPromise = (delay) => {
  let timeoutId: NodeJS.Timeout;
  let failsafe: (reson?: any) => void;

  const debouncedFunction = () => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      if (failsafe) {
        failsafe("another action called before completing the debounce");
      }

      // Set a new timeout
      timeoutId = setTimeout(() => {
        failsafe = undefined;
        resolve("Debounced promise resolved after " + delay + " milliseconds");
      }, delay);

      failsafe = reject;
    });
  };

  return debouncedFunction;
};

const delayedUpdateAction = debouncedPromise(2000);

export const updateWorkspaces = createAsyncThunk(
  "workspace/upsert",
  async (data: Partial<IWorkspace>, thunkAPI) => {
    // update workspace in-app first
    thunkAPI.dispatch(upsertWorkspace(data));

    const state: RootState = thunkAPI.getState() as RootState;
    if (!state.account.settings.syncWorkspaces) {
      return { data: null }; // indicate no chage in thunk flow (no db call/no sync)
    }

    const account = state.account.subUsers[state.account.loginAccount].admin
      ? state.account.loginAccount
      : state.account.currentSubAccount;
    const workspaces = state.workspace.workspaces;

    // promise either resolves itself after a timeout or throws an error if cancelled by repeated call
    try {
      await delayedUpdateAction();
    } catch (e) {
      return null; // indicate disposed thunk action (no db call/no sync)
    }

    try {
      return await ApiPost<ISettings>(
        `/api/accounts/${account}/settings/update`,
        {
          workspaces,
        } as Partial<ISettings>
      );
    } catch (error) {
      if (error instanceof Response) {
        const response: IGenericResponse = await error.json();
        return thunkAPI.rejectWithValue(response);
      }
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  "workspace/delete",
  async (id: string, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    if (!state.workspace.workspaces.find((w) => w.id === id)) {
      throw new Error(`Cannot delete workspace ${id}`);
    }

    const newData = state.workspace.workspaces.filter((w) => w.id !== id);
    try {
      return await ApiPost<ISettings>(
        `/api/accounts/${state.account.currentSubAccount}/settings/update`,
        {
          workspaces: newData,
        } as Partial<ISettings>
      );
    } catch (error) {
      if (error instanceof Response) {
        const response: IGenericResponse = await error.json();
        return thunkAPI.rejectWithValue(response);
      }
    }
  }
);

export const FloatingTypesSizes: Record<
  FloatingTypes,
  { x: number; y: number }
> = {
  OrderPanel: {
    x: 480,
    y: 480,
  },
  OrderCreate: {
    x: 480,
    y: 480,
  },
  AssetInfo: {
    x: 414,
    y: 620,
  },
};

export enum FloatingTypes {
  OrderPanel = "OrderPanel",
  OrderCreate = "OrderCreate",
  //TradePanel = "TradePanel"
  AssetInfo = "AssetInfo",
}

export type FloatingComponentProps<T = any> = {
  index?: number;
  workspaceId?: string;
  type: FloatingTypes;
  position?: { x: number; y: number };
} & T;

export type IWorkspace = {
  id: string;
  error?: boolean;
  name: string;
  hidden: boolean;
  value: unknown;
  floating?: Array<FloatingComponentProps>;
};

export type WorkspaceState = {
  currentWorkspaceId: string;
  workspaces: Array<IWorkspace>;
  workspacesLoadedAt: number;
  workspacesSyncing: boolean;
  floatingTradePanel: TradePanelProps | null;
  symbolDragged: boolean;
  backofficeOpen: boolean;
};

const defaultLayout = {
  grid: {
    root: {
      type: "branch",
      data: [
        {
          type: "branch",
          data: [
            {
              type: "leaf",
              data: {
                views: ["accounts_table", "trading_charts", "trading_charts_2"],
                activeView: "trading_charts_2",
                id: "1",
              },
              size: "50%",
            },
            {
              type: "leaf",
              data: {
                views: [
                  "net_positions",
                  "open_orders",
                  "active_orders",
                  "completed_orders",
                  "logs",
                ],
                activeView: "net_positions",
                id: "4",
              },
              size: "50%",
            },
          ],
        },
      ],
    },
    orientation: "HORIZONTAL",
  },
  panels: {
    market: {
      id: "market",
      contentComponent: "market",
      tabComponent: "market",
      title: "Market",
    },
    accounts_table: {
      id: "accounts_table",
      contentComponent: "accounts_table",
      tabComponent: "accounts_table",
      title: "Accounts",
    },
    trading_charts: {
      id: "trading_charts",
      contentComponent: "trading_charts",
      tabComponent: "trading_charts",
      params: {
        title: "EURUSD - 1H",
        symbol: "EURUSD",
        interval: "60",
      },
      title: "Charts",
    },
    trading_charts_2: {
      id: "trading_charts_2",
      contentComponent: "trading_charts",
      tabComponent: "trading_charts",
      params: {
        title: "EURUSD - 15M",
        symbol: "EURUSD",
        interval: "15",
      },
      title: "Charts",
    },
    net_positions: {
      id: "net_positions",
      contentComponent: "net_positions",
      tabComponent: "net_positions",
      params: {
        items: 1,
      },
      title: "Net Positions",
    },
    open_orders: {
      id: "open_orders",
      contentComponent: "open_orders",
      tabComponent: "open_orders",
      params: {
        items: 4,
      },
      title: "Open Orders",
    },
    active_orders: {
      id: "active_orders",
      contentComponent: "active_orders",
      tabComponent: "active_orders",
      params: {
        items: 1,
      },
      title: "Active Orders",
    },
    completed_orders: {
      id: "completed_orders",
      contentComponent: "completed_orders",
      tabComponent: "completed_orders",
      title: "Completed Orders",
    },
    logs: {
      id: "logs",
      contentComponent: "logs",
      tabComponent: "default",
      title: "Logs",
    },
  },
  activeGroup: "4",
};

export const initialState: WorkspaceState = {
  currentWorkspaceId: "initial",
  workspaces: [
    {
      id: "initial",
      name: "EURUSD",
      hidden: false,
      value: defaultLayout,
      floating: [],
    },
  ],
  workspacesLoadedAt: 0,
  workspacesSyncing: false,
  floatingTradePanel: null,
  symbolDragged: false,
  backofficeOpen: false,
};

const fixedPositionWidgets = ["market", "assets"];

const AddNewPanel = (props) => {
  const options = {
    id: props.component + uuid(),
    ...props,
  };

  if (fixedPositionWidgets.indexOf(props.component) === -1) {
    options.position = {
      direction: "right",
    };
  } else if (global.layout.groups.length > 0) {
    options.position = {
      direction: "within",
      referenceGroup: global.layout.groups[0],
    };
  }

  global.layout.addPanel(options);
};

const workspaceSlice = createSlice({
  name: "layouts",
  initialState,
  reducers: {
    setBackofficeOpen: (state, action: PayloadAction<boolean>) => {
      state.backofficeOpen = action.payload
    },
    switchWorkspace: (state, action: PayloadAction<string>) => {
      if (state.workspaces.findIndex((w) => w.id === action.payload) === -1) {
        console.warn("Workspace cannot be found");
        return
      }
      state.currentWorkspaceId = action.payload;
    },
    loadWorkspaces: (
      state,
      action: PayloadAction<{
        currentWorkspaceId: string;
        workspaces: IWorkspace[];
      } | null>
    ) => {
      if (!action.payload) {
        state.currentWorkspaceId = initialState.currentWorkspaceId;
        state.workspaces = initialState.workspaces;
      } else {
        state.workspaces = action.payload.workspaces;
        let activeW = state.workspaces.find((w) => !w.hidden);
        if (activeW) {
          state.currentWorkspaceId = activeW.id;
        } else {
          state.currentWorkspaceId = action.payload.currentWorkspaceId;
        }
      }
      state.workspacesLoadedAt = new Date().getTime();
    },
    resetWorkspaces: (state, action: PayloadAction) => {
      state.workspacesLoadedAt = 0;
    },
    upsertWorkspace: (state, action: PayloadAction<Partial<IWorkspace>>) => {
      const index = state.workspaces.findIndex(
        (w) => w.id === (action.payload.id || state.currentWorkspaceId)
      );
      const nameIndex = state.workspaces.findIndex(
        (w) => w.name === action.payload.name && w.id !== action.payload.id
      );
      if (nameIndex !== -1) {
        throw new Error("Workspace with this name already exists");
      }

      const current: IWorkspace = {
        ...state.workspaces[index],
        ...action.payload,
        id: action.payload.id || state.currentWorkspaceId,
      };

      current.name = current.name.trim();
      if (!current.name) {
        throw new Error("Cannot set workspace with empty name");
      }

      if (index >= 0) {
        state.workspaces[index] = current;
      } else {
        state.workspaces.push(current);
        state.currentWorkspaceId = action.payload.id;
      }
    },
    toggleWorkspaceVisiblity: (state, action: PayloadAction<string>) => {
      const wantedId = action.payload;
      const index = state.workspaces.findIndex((w) => w.id === wantedId);
      if (index >= 0) {
        state.workspaces[index] = {
          ...state.workspaces[index],
          hidden: !state.workspaces[index].hidden,
        };
      }
    },
    newChart: (state, action: PayloadAction<IChartWidgetProps>) => {
      if (global.layout) {
        AddNewPanel({
          component: "trading_charts",
          tabComponent: "trading_charts",
          params: {
            symbol: action.payload.symbol,
            interval: "15",
            title: action.payload.symbol,
          },
        });
      }
    },
    upsertPanel: (state, action: PayloadAction<FloatingComponentProps>) => {
      const index = state.workspaces.findIndex(
        (workspace) => workspace.id === state.currentWorkspaceId
      );
      if (index >= 0) {
        if (!state.workspaces[index].floating) {
          state.workspaces[index].floating = [];
        }
        const floatingIndex = action.payload.index;
        if (floatingIndex || floatingIndex === 0) {
          state.workspaces[index].floating[floatingIndex] = action.payload;
        } else {
          state.workspaces[index].floating.push({
            ...action.payload,
            index: state.workspaces[index].floating.length,
          });
        }
      }
    },
    closePanel: (state, action: PayloadAction<number>) => {
      const wsIndex = state.workspaces.findIndex(
        (workspace) => workspace.id === state.currentWorkspaceId
      );
      if (wsIndex >= 0 && state.workspaces[wsIndex].floating) {
        const flIndex = state.workspaces[wsIndex].floating.findIndex(
          (f) => f.index === action.payload
        );
        state.workspaces[wsIndex].floating.splice(flIndex, 1);
      }
    },
    setFloatingTradePanel: (state, action: PayloadAction<TradePanelProps>) => {
      state.floatingTradePanel = action.payload || null;
    },
    setSymbolDrag: (state, action: PayloadAction<boolean>) => {
      state.symbolDragged = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateWorkspaces.pending, (state, action) => {
      state.workspacesSyncing = true;
    });
    builder.addCase(updateWorkspaces.fulfilled, (state, action) => {
      if (!action.payload) {
        return;
      }

      // payload could be 'true', but no object, so at least unset the syncing
      state.workspacesSyncing = false;

      if (action.payload.data) {
        // state.workspaces = action.payload.data.workspaces || [];
      }
    });
    builder.addCase(updateWorkspaces.rejected, (state, action) => {
      state.workspacesSyncing = false;
    });
    builder.addCase(deleteWorkspace.pending, (state, action) => {
      state.workspacesSyncing = true;
    });
    builder.addCase(deleteWorkspace.fulfilled, (state, action) => {
      if (!action.payload) {
        return;
      }

      state.workspacesSyncing = false;
      if (action.payload.data) {
        state.workspaces = action.payload.data.workspaces || [];
      }
    });
    builder.addCase(deleteWorkspace.rejected, (state, action) => {
      state.workspacesSyncing = false;
    });
  },
});

export { AddNewPanel };
export const {
  switchWorkspace,
  loadWorkspaces,
  upsertWorkspace,
  toggleWorkspaceVisiblity,
  setFloatingTradePanel,
  resetWorkspaces,
  setSymbolDrag,
  setBackofficeOpen
} = workspaceSlice.actions;

/* order panels */
export const { upsertPanel, closePanel, newChart } = workspaceSlice.actions;

/* input selectors - not exported */
const workspacesInputSelector = (state: RootState) =>
  state.workspace.workspaces;
const currentWorkspaceInputSelector = (state: RootState) =>
  state.workspace.currentWorkspaceId;

/* output selectors */
export const workspaceSelector = (state: RootState) => state.workspace;
export const backofficeOpenSelector = (state: RootState) => state.workspace.backofficeOpen;
export const floatingTradePanelSelector = (state: RootState) =>
  state.workspace.floatingTradePanel;

export const currentWorkspaceSelector = createSelector(
  [workspacesInputSelector, currentWorkspaceInputSelector],
  (workspaces, currentWorkspaceId) =>
    workspaces[
    workspaces.findIndex((workspace) => {
      return workspace.id === currentWorkspaceId;
    })
    ]
);

export default workspaceSlice.reducer;

export const getWorkspaces = (state: RootState) => state.workspace.workspaces;
