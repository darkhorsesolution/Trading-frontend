import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store/index";
import { IUser, ISettings } from "@/interfaces/account";
import { ApiFetch, ApiPost, IGenericResponse } from "@/utils/network";
import { showNotification } from "@mantine/notifications";
import { LogColors } from "./logs";
import LocalStorageService from "@/services/LocalStorageService";

/*
* AM - Asset Manager
IB - Introducing Broker
MM - Market Maker
MV - Market view
SB - Sub Broker
Subscriber - Subscriber
T - Trading
* */
export type AccountState = {
  user: IUser | null;
  subUsers: { [key: string]: IUser } | null;
  currentSubAccount: string;
  currentSubUserId: string;
  loginAccount: string /* this is the account which was used to log in */;
  settings: ISettings | null;
  loading: boolean;
};

export const initialState: AccountState = {
  user: null,
  subUsers: {},
  currentSubAccount: "",
  currentSubUserId: "",
  loginAccount: null,
  settings: null,
  loading: false,
};

export const loadSettings = createAsyncThunk(
  "account/settings/load",
  async (account: string, thunkAPI) => {
    try {
      return await ApiFetch<ISettings>(
        `/api/accounts/${account}/settings/load`
      );
    } catch (error) {
      if (error instanceof Response) {
        const response: IGenericResponse = await error.json();
        return thunkAPI.rejectWithValue(response);
      }
    }
  }
);

export const updateSettings = createAsyncThunk(
  "account/settings",
  async (settings: ISettings & { silent?: boolean }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const account = state.account.subUsers[state.account.loginAccount].admin
      ? state.account.loginAccount
      : state.account.currentSubAccount;

    try {
      return await ApiPost<IGenericResponse>(
        `/api/accounts/${account}/settings/update`,
        settings
      );
    } catch (error) {
      if (error instanceof Response) {
        const response: IGenericResponse = await error.json();
        return thunkAPI.rejectWithValue(response);
      }
    }
  }
);

export const toggle2FA = createAsyncThunk(
  "account/settings/2fa/toggle",
  async (account: string, thunkAPI) => {
    try {
      return await ApiPost<IGenericResponse>(
        `/api/accounts/${account}/settings/2fa/toggle`,
        {}
      );
    } catch (error) {
      if (error instanceof Response) {
        const response: IGenericResponse = await error.json();
        return thunkAPI.rejectWithValue(response);
      }
    }
  }
);

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<ISettings>) => {
      const newSettings = { ...action.payload };
      if (!newSettings.watchedAssets) {
        newSettings.watchedAssets = [];
      }
      state.settings = newSettings;
    },
    setLoginAccount: (state, action: PayloadAction<string>) => {
      if (!state.loginAccount) {
        // yes, only once
        state.loginAccount = action.payload;
      }
    },
    setActiveSubAccount: (state, action: PayloadAction<string>) => {
      state.currentSubAccount = action.payload;
      state.user = state.subUsers[state.currentSubAccount];
      state.currentSubUserId = state.user.id;
      LocalStorageService.saveAccountNumber(state.currentSubAccount);
    },
    updateAccount: (state, action: PayloadAction<IUser>) => {
      const acc = action.payload.account.toString();
      state.subUsers[acc] = {
        ...state.subUsers[acc],
        ...action.payload,
      };
      state.user = state.subUsers[state.currentSubAccount] as IUser;
    },
    setSubAccounts: (state, action: PayloadAction<Array<IUser>>) => {
      const subAccounts = action.payload.reduce((acc, subAccount) => {
        acc[subAccount.account] = subAccount;
        return acc;
      }, {});

      state.subUsers = {
        ...state.subUsers,
        ...subAccounts,
      };
    },
  },
  extraReducers: (builder) => {
    // update settings
    builder.addCase(updateSettings.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(updateSettings.fulfilled, (state, action) => {
      state.settings = { ...state.settings, ...action.meta.arg };
      state.loading = false;
      if (!action.meta.arg.silent) {
        showNotification({
          title: "Settings updated",
          message: action.payload.message,
          color: LogColors.Info,
        });
      }
    });
    builder.addCase(
      updateSettings.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        showNotification({
          title: "Settings not updated",
          message: action.payload.message,
          color: LogColors.Error,
        });
      }
    );
    builder.addCase(toggle2FA.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(toggle2FA.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(toggle2FA.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
    });
    builder.addCase(loadSettings.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(
      loadSettings.fulfilled,
      (state, action: PayloadAction<ISettings>) => {
        state.settings = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(
      loadSettings.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
      }
    );
  },
});

const { reducer } = accountSlice;

export const {
  setLoginAccount,
  setActiveSubAccount,
  updateAccount,
  setSubAccounts,
  setSettings,
} = accountSlice.actions;

export const accountSelector = (state: RootState) => state.account;
export const currentUserSelector = (state: RootState) => state.account.user;
export const settingsSelector = (state: RootState) => state.account.settings;
export const settingsLoadingSelector = (state: RootState) =>
  state.account.loading;
export const currentSubAccountSelector = (state: RootState) =>
  state.account.currentSubAccount;
export const currentUserIdSelector = (state: RootState) =>
  state.account.currentSubUserId;
export const loginAccountSelector = (state: RootState) =>
  state.account.loginAccount;
export default reducer;
