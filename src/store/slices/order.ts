import { api } from "@/store/api";
import {
  IOCOOrdersCreate,
  IOrderCreate,
  StatusMessage,
} from "@/interfaces/IOrder";

export const orderSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    placeOCOOrders: builder.mutation<StatusMessage, IOCOOrdersCreate>({
      query: (orders: IOCOOrdersCreate) => ({
        url: `/accounts/${orders.oco1.account}/orders/oco/create`,
        method: "POST",
        body: orders,
        headers: {
          timestamp: new Date().getTime().toString(),
        },
      }),
      invalidatesTags: (result, error) => {
        return [{ type: "Order", id: "0" }];
      },
    }),
    placeOrder: builder.mutation<StatusMessage, Partial<IOrderCreate>>({
      query: (order: IOrderCreate) => ({
        url: `/accounts/${order.account}/orders/create`,
        method: "POST",
        body: order,
        headers: {
          timestamp: new Date().getTime().toString(),
        },
      }),
      invalidatesTags: (result, error, { id }) => {
        return [{ type: "Order", id: id }];
      },
    }),
  }),
});

export const { usePlaceOrderMutation, usePlaceOCOOrdersMutation } = orderSlice;
