import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { IPriceTick } from "@/interfaces/IOrder";

export type QuoteState = {
  quotes: { [key: string]: IPriceTick };
  lastUpdate: Date;
};

export const initialState: QuoteState = {
  quotes: {},
  lastUpdate: new Date(),
};

const quoteSlice = createSlice({
  name: "quotes",
  initialState,
  reducers: {
    onUpdate: (state, action: PayloadAction<{ [key: string]: IPriceTick }>) => {
      state.lastUpdate = new Date();
      for (const symbol in action.payload) {
        if (
          !state.quotes[symbol] ||
          state.quotes[symbol].datetime !== action.payload[symbol].datetime
        ) {
          state.quotes[symbol] = action.payload[symbol];
        }
      }
    },
  },
});

export const emptyTick: IPriceTick = {
  askPrice: "0",
  bidPrice: "0",
  price: "0",
};

export const quoteSelector = (state: RootState) => state.quotes;
export const symbolQuoteSelector =
  (symbol: string, defaultTick: IPriceTick = emptyTick) =>
  (state: RootState) =>
    state.quotes.quotes[symbol] || defaultTick;
export default quoteSlice.reducer;

export const quotesActions = quoteSlice.actions;
