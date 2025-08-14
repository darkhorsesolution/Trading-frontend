import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { ApiFetch, ApiPost, IGenericResponse } from "@/utils/network";
import { IPosition, ITradeModify } from "@/interfaces/IPosition";
import { showNotification } from "@mantine/notifications";
import { IUser } from "@/interfaces/account";

export type PositionsState = {
  error?: string;
  status: "idle" | "loading" | "success" | "fail";
  positions: Array<IPosition> | null;
  netPositions: Array<IPosition> | null;
  closedPairedPositions: Array<IPosition> | null;
  positionTpEditing?: string;
  positionSlEditing?: string;
};

export const initialState: PositionsState = {
  error: null,
  status: "idle",
  netPositions: [],
  positions: [],
  closedPairedPositions: [],
};

export const loadOpenPositions = createAsyncThunk(
  "positions/open",
  async (account: string, thunkAPI) => {
    try {
      return await ApiFetch<Array<IPosition>>(
        `/api/accounts/${account}/positions/open`
      );
    } catch (error) {
      if (!error || !error.response) {
        throw error;
      }
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const loadNetPositions = createAsyncThunk(
  "positions/open/net",
  async (account: string, thunkAPI) => {
    try {
      return await ApiFetch<Array<IPosition>>(
        `/api/accounts/${account}/positions/open/net`
      );
    } catch (error) {
      if (!error || !error.response) {
        throw error;
      }
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const loadClosedPairedPositions = createAsyncThunk(
  "positions/closed/pairs",
  async (account: string, thunkAPI) => {
    try {
      return await ApiFetch<Array<IPosition>>(
        `/api/accounts/${account}/positions/closed/pairs`
      );
    } catch (error) {
      if (!error || !error.response) {
        throw error;
      }
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const cleanupPosition = createAsyncThunk(
  "positions/cleanup",
  async (positionId: string, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const { subUsers, loginAccount, currentSubAccount } = state.account;
      const account = subUsers[loginAccount];
      if (!(account as IUser).admin && !(account as IUser).institutional) {
        throw new Error("Forbidden");
      }
      return await ApiFetch<IPosition>(
        `/api/accounts/${currentSubAccount}/positions/cleanup/${positionId}`
      );
    } catch (error) {
      if (error instanceof Response) {
        return thunkAPI.rejectWithValue(await error.json());
      }
      throw error;
    }
  }
);

export const cleanupTrade = createAsyncThunk(
  "trades/cleanup",
  async (tradeId: string, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const { subUsers, loginAccount, currentSubAccount } = state.account;
      const account = subUsers[loginAccount];
      if (!(account as IUser).admin && !(account as IUser).institutional) {
        throw new Error("Forbidden");
      }
      return await ApiFetch<IPosition>(
        `/api/accounts/${currentSubAccount}/trades/cleanup/${tradeId}`
      );
    } catch (error) {
      if (error instanceof Response) {
        return thunkAPI.rejectWithValue(await error.json());
      }
      throw error;
    }
  }
);

export const closePosition = createAsyncThunk(
  "positions/close",
  async (positionId: string, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      return await ApiFetch<IPosition>(
        `/api/accounts/${state.account.currentSubAccount}/positions/close/${positionId}`
      );
    } catch (error) {
      if (error instanceof Response) {
        return thunkAPI.rejectWithValue(await error.json());
      }
      throw error;
    }
  }
);

export const closeNetPosition = createAsyncThunk(
  "positions/close/net",
  async (positionId: string, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      return await ApiFetch<IPosition>(
        `/api/accounts/${state.account.currentSubAccount}/positions/close/net/${positionId}`
      );
    } catch (error) {
      if (error instanceof Response) {
        return thunkAPI.rejectWithValue(await error.json());
      }
      throw error;
    }
  }
);

export const modifyPosition = createAsyncThunk(
  "positions/modify",
  async (positionData: ITradeModify, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      return await ApiPost<IGenericResponse>(
        `/api/accounts/${state.account.currentSubAccount}/positions/modify/${positionData.id}`,
        positionData
      );
    } catch (error) {
      if (!error || !error.response) {
        throw error;
      }
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const removePositionCb = (
  pos: IPosition,
  statePositions: Array<IPosition> | null
): Array<IPosition> => {
  const index = statePositions.findIndex((p) => p.id === pos.id);
  if (index >= 0) {
    statePositions.splice(index, 1);
  }

  return statePositions;
};

const upsertPositionCb = (
  pos: IPosition,
  statePositions: Array<IPosition> | null
): Array<IPosition> => {
  const index = statePositions.findIndex((p) => p.id === pos.id);
  if (index >= 0) {
    if (statePositions[index].closing) {
      pos.closing = true;
    }
    statePositions[index] = { ...statePositions[index], ...pos };
  } else {
    statePositions = [...statePositions, pos];
  }

  return statePositions;
};

const removeNetPositionCb = (
  pos: IPosition,
  statePositions: Array<IPosition> | null
): Array<IPosition> => {
  const index = statePositions.findIndex((p) => p.symbol === pos.symbol);
  if (index >= 0) {
    statePositions.splice(index, 1);
  }

  return statePositions;
};

const upsertNetPositionCb = (
  pos: IPosition,
  statePositions: Array<IPosition> | null
): Array<IPosition> => {
  const index = statePositions.findIndex((p) => p.symbol === pos.symbol);
  if (index >= 0) {
    if (statePositions[index].closing) {
      pos.closing = true;
    }
    statePositions[index] = { ...statePositions[index], ...pos };
  } else {
    statePositions = [...statePositions, pos];
  }

  return statePositions;
};

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    resetPositions: (state, action: PayloadAction) => {
      state.error = null;
      state.status = "idle";
      state.netPositions = [];
      state.positions = [];
      state.closedPairedPositions = [];
      state.positionSlEditing = undefined;
      state.positionTpEditing = undefined;
    },
    setPositions: (state, action: PayloadAction<Array<IPosition>>) => {
      state.positions = action.payload;
    },
    updatePositions: (state, action: PayloadAction<Array<IPosition>>) => {
      for (const p of action.payload) {
        if (!p.quantity || p.quantity === "0") {
          state.positions = removePositionCb(p, state.positions);
        } else {
          state.positions = upsertPositionCb(p, state.positions);
        }
      }
    },
    customizeStopLoss: (state, action: PayloadAction<{ id: string }>) => {
      const data = action.payload;
      const index = state.positions.findIndex(
        (position) => position.id === data.id
      );
      if (index >= 0) {
        state.positionSlEditing = data.id;
        state.positionTpEditing = undefined;
      } else {
        state.positionSlEditing = undefined;
      }
    },
    customizeTakeProfit: (state, action: PayloadAction<{ id: string }>) => {
      const data = action.payload;
      const index = state.positions.findIndex(
        (position) => position.id === data.id
      );
      if (index >= 0) {
        state.positionTpEditing = data.id;
        state.positionSlEditing = undefined;
      } else {
        state.positionTpEditing = undefined;
      }
    },
    updateNetPositions: (state, action: PayloadAction<IPosition[]>) => {
      for (const pos of action.payload) {
        if (!pos.quantity || pos.quantity === "0") {
          state.netPositions = removeNetPositionCb(pos, state.netPositions);
        } else {
          state.netPositions = upsertNetPositionCb(pos, state.netPositions);
        }
      }
    },
    updateBothPositions(
      state,
      action: PayloadAction<{ net: IPosition[]; pos: IPosition[] }>
    ) {
      let originalStringified = JSON.stringify(state.positions);
      let temp = JSON.parse(originalStringified);

      for (const p of action.payload.pos) {
        if (!p.quantity || p.quantity === "0") {
          temp = removePositionCb(p, temp);
        } else {
          temp = upsertPositionCb(p, temp);
        }
      }

      if (originalStringified !== JSON.stringify(temp)) {
        state.positions = temp;
      }

      originalStringified = JSON.stringify(state.netPositions);
      temp = JSON.parse(originalStringified);

      for (const pos of action.payload.net) {
        if (!pos.quantity || pos.quantity === "0") {
          temp = removeNetPositionCb(pos, temp);
        } else {
          temp = upsertNetPositionCb(pos, temp);
        }
      }

      if (originalStringified !== JSON.stringify(temp)) {
        state.netPositions = temp;
      }
    },
  },
  extraReducers: (builder) => {
    // builder.addCase(loadOpenPositions.pending, (state, action) => {
    //   state.status = "loading";
    // });
    builder.addCase(
      loadOpenPositions.fulfilled,
      (state, action: PayloadAction<Array<IPosition>>) => {
        state.status = "success";
        if (action.payload) {
          state.positions = action.payload;
        }
      }
    );
    //  builder.addCase(loadNetPositions.pending, (state, action) => {
    //   state.status = "loading";
    //  });
    builder.addCase(
      loadNetPositions.fulfilled,
      (state, action: PayloadAction<Array<IPosition>>) => {
        state.status = "success";
        if (action.payload) {
          state.netPositions = action.payload.filter(
            (p) => p.quantity && p.quantity !== "0"
          );
        }
      }
    );
    // builder.addCase(loadNetPositions.rejected, (state, action) => {
    //    state.status = "fail";
    //  });
    builder.addCase(
      loadClosedPairedPositions.fulfilled,
      (state, action: PayloadAction<Array<IPosition>>) => {
        state.status = "success";
        if (action.payload) {
          state.closedPairedPositions = action.payload;
        }
      }
    );
    builder.addCase(
      closePosition.pending,
      (state, action: { meta: { arg: string } }) => {
        let foundIndex = state.positions.findIndex(
          (p) => p.id === action.meta.arg
        );
        if (foundIndex !== -1) {
          state.positions[foundIndex].closing = true;
          state.positions = [...state.positions];
        }
      }
    );
    builder.addCase(
      closePosition.rejected,
      (state, action: PayloadAction<any>) => {}
    );
    builder.addCase(
      closeNetPosition.rejected,
      (state, action: PayloadAction<any>) => {}
    );
    builder.addCase(
      modifyPosition.rejected,
      (state, action: PayloadAction<any, string, any, any>) => {}
    );
    builder.addCase(
      modifyPosition.fulfilled,
      (state, action: PayloadAction<any>) => {}
    );
  },
});

export const {
  updateNetPositions,
  updatePositions,
  updateBothPositions,
  resetPositions,
} = positionsSlice.actions;
const { reducer } = positionsSlice;

export const openPositionsSelector = (state: RootState) =>
  state.positions.positions;

export const closedPositionsSelector = (state: RootState) =>
  state.positions.closedPairedPositions;

export const netPositionsSelector = (state: RootState) =>
  state.positions.netPositions;
export default reducer;
