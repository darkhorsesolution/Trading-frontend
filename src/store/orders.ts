import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { ApiFetch, ApiPost, IGenericResponse } from "@/utils/network";
import {
  IOrder,
  IOrderCreate,
  IPriceTick,
  OrderType,
} from "@/interfaces/IOrder";
import { showNotification } from "@mantine/notifications";
import { ListResponse } from "@/interfaces/api";
import { PriceTickCollection } from "@/dataworker";
import Constants from "@/utils/Constants";
import { getOrderCreateSidePrice, getOrderWantedPrice } from "@/utils/utils";

export type OrdersState = {
  status: "idle" | "loading" | "success" | "fail";
  orders: Array<IOrder>; // all orders
  pendingOrders: Array<IOrder>;
  editedOrderID: string | null; // for editing in Order component
  createOrderSymbol: string | null; // for opening sidebar Order component for specific symbol
};

export const initialState: OrdersState = {
  status: "idle",
  orders: [],
  pendingOrders: [],
  editedOrderID: null,
  createOrderSymbol: null,
};

export const modifyOrder = createAsyncThunk(
  "orders/modify",
  async ({ id, ...patch }: Partial<IOrderCreate>, thunkAPI) => {
    const state: any = thunkAPI.getState();
    try {
      return await ApiPost<IGenericResponse>(
        `/api/accounts/${state.account.currentSubAccount}/orders/modify/${id}`,
        patch
      );
    } catch (error) {
      if (error instanceof Response) {
        const response: IGenericResponse = await error.json();
        return thunkAPI.rejectWithValue(response);
      }
      throw error;
    }
  }
);

export const loadOrders = createAsyncThunk(
  "orders",
  async (account: string, thunkAPI) => {
    try {
      return await ApiFetch<ListResponse<IOrder>>(
        `/api/accounts/${account}/orders/all`
      );
    } catch (error) {
      if (!error || !error.response) {
        throw error;
      }
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancel",
  async (orderId: string, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      return await ApiFetch<any>(
        `/api/accounts/${state.account.currentSubAccount}/orders/cancel/${orderId}`
      );
    } catch (error) {
      if (error instanceof Response) {
        const response: IGenericResponse = await error.json();
        return thunkAPI.rejectWithValue(response);
      }
      throw error;
    }
  }
);

function populateOcoGroup(o: IOrder) {
  if (o.ocoId) {
    if (o.id < o.ocoId) {
      o.ocoGroup = `${o.id}-${o.ocoId}`;
    } else {
      o.ocoGroup = `${o.ocoId}-${o.id}`;
    }
  } else {
    o.ocoGroup = "";
  }
}

export function mutatePendingTpSl(order: IOrder, quote?: IPriceTick) {
  if (order.deletedAt || !quote) {
    return;
  }

  const currentPrice =
    order.type === OrderType.Market
      ? getOrderCreateSidePrice(order.side, quote)
      : getOrderWantedPrice(order);

  if (order.stopLossPipsChange) {
    order.stopLoss = (
      currentPrice + parseFloat(order.stopLossPipsChange)
    ).toFixed(Constants.TpSlPrecision);
  }

  if (order.takeProfitPipsChange) {
    order.takeProfit = (
      currentPrice + parseFloat(order.takeProfitPipsChange)
    ).toFixed(Constants.TpSlPrecision);
  }
}

const upsertOrder = (
  order: IOrder,
  stateOrders: Array<IOrder> | null
): Array<IOrder> => {
  const index = stateOrders.findIndex((existing) => existing.id === order.id);
  if (index >= 0) {
    stateOrders[index] = order;
  } else {
    stateOrders = [...stateOrders, order];
  }
  return stateOrders;
};

const removeOrder = (
  order: IOrder,
  stateOrders: Array<IOrder> | null
): Array<IOrder> => {
  const index = stateOrders.findIndex((existing) => existing.id === order.id);
  if (index >= 0) {
    stateOrders.splice(index, 1);
  }
  return stateOrders;
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrders(state, action: PayloadAction) {
      state.status = "idle";
      state.orders = [];
      state.pendingOrders = [];
      state.editedOrderID = null;
    },
    updateOrdersWithQuotes: (
      state,
      action: PayloadAction<PriceTickCollection>
    ) => {
      // compute correct tp/sl for active orders (if pips used)
      // TODO: this could be probably removed and completely for fixed prices (limit/stop)
      for (const order of state.pendingOrders) {
        if (!order.deletedAt) {
          mutatePendingTpSl(order, action.payload[order.symbol]);
          state.orders = upsertOrder(order, state.orders);
        }
      }
    },
    updateOrder: (state, action: PayloadAction<IOrder>) => {
      const newOrder = action.payload;
      populateOcoGroup(newOrder);

      state.orders = upsertOrder(newOrder, state.orders);
      if (!newOrder.deletedAt) {
        state.pendingOrders = upsertOrder(newOrder, state.pendingOrders);
      } else {
        state.pendingOrders = removeOrder(newOrder, state.pendingOrders);
      }
    },
    updateOrders: (state, action: PayloadAction<IOrder[]>) => {
      const [oco1, oco2] = action.payload;
      populateOcoGroup(oco1);
      populateOcoGroup(oco2);

      state.orders = upsertOrder(oco1, state.orders);
      state.orders = upsertOrder(oco2, state.orders);
      if (!oco1.deletedAt) {
        state.pendingOrders = upsertOrder(oco1, state.pendingOrders);
      } else {
        state.pendingOrders = removeOrder(oco1, state.pendingOrders);
      }
      if (!oco2.deletedAt) {
        state.pendingOrders = upsertOrder(oco2, state.pendingOrders);
      } else {
        state.pendingOrders = removeOrder(oco2, state.pendingOrders);
      }
    },
    setEditedOrder: (state, action: PayloadAction<string | null>) => {
      state.editedOrderID = action.payload;
      state.createOrderSymbol = null;
    },
    setCreateOrder: (state, action: PayloadAction<string | null>) => {
      state.createOrderSymbol = action.payload;
      state.editedOrderID = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadOrders.pending, (state, action) => {
      state.status = "loading";
    });
    builder.addCase(
      loadOrders.fulfilled,
      (state, action: PayloadAction<ListResponse<IOrder>>) => {
        state.status = "success";
        if (action.payload) {
          state.orders = action.payload.data;
          state.orders.forEach(populateOcoGroup);
          state.pendingOrders = state.orders.filter((o) => !o.deletedAt);
        }
      }
    );
    builder.addCase(
      loadOrders.rejected,
      (state, action: PayloadAction<any>) => {
        state.status = "fail";
        showNotification({
          title: "Cannot load position",
          message: action.payload.message || "",
          color: "red",
        });
      }
    );
    builder.addCase(modifyOrder.pending, (state, action) => {
      state.status = "loading";
    });
    builder.addCase(
      modifyOrder.fulfilled,
      (state, action: PayloadAction<IGenericResponse>) => {
        state.status = "success";
      }
    );
    builder.addCase(
      modifyOrder.rejected,
      (state, action: PayloadAction<any>) => {
        state.status = "fail";
        console.log(action);
        showNotification({
          title: "Cannot modify position",
          message: action.payload.message || "",
          color: "red",
        });
      }
    );
    builder.addCase(
      cancelOrder.rejected,
      (state, action: PayloadAction<any>) => {}
    );
  },
});

export const {
  updateOrder,
  updateOrders,
  setEditedOrder,
  updateOrdersWithQuotes,
  resetOrders,
  setCreateOrder,
} = ordersSlice.actions;
const { reducer } = ordersSlice;

export const ordersSelector = (state: RootState) => state.orders.orders;
export const pendingOrdersSelector = (state: RootState) =>
  state.orders.pendingOrders;
export const editedOrderSelector = (state: RootState) =>
  state.orders.pendingOrders.find((o) => o.id === state.orders.editedOrderID) ||
  null;
export const createOrderSelector = (state: RootState) =>
  state.orders.createOrderSymbol;
null;

export default reducer;
