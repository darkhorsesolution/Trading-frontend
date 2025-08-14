import { combineReducers } from "redux";
import quotes from "./quotes";
import workspace from "./workspace";
import account from "./account";
import axios from "axios";
import { api } from "@/store/api";
import positions from "@/store/positions";
import orders from "@/store/orders";
import logs from "@/store/logs";
import messages from "@/store/messages";

const rootReducer = combineReducers({
  quotes,
  workspace,
  account,
  orders,
  positions,
  logs,
  messages,
  [api.reducerPath]: api.reducer,
});

export const AxiosInstance = axios.create({
  withCredentials: true,
  baseURL: `/api`,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
