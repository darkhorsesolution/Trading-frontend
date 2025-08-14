import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { IMessage } from "@/interfaces/IMessage";
import { ApiFetch, ApiPost, IGenericResponse } from "@/utils/network";
import { ListResponse } from "@/interfaces/api";
import { showNotification } from "@mantine/notifications";

export type MessagesState = {
  messages: Array<IMessage> | null;
  status: "idle" | "loading" | "error";
};

export const initialState: MessagesState = {
  messages: [],
  status: "idle",
};

export const loadMessages = createAsyncThunk(
  "messages",
  async (account: string, thunkAPI) => {
    try {
      return await ApiFetch<Array<IMessage>>(
        `/api/accounts/${account}/messages/list`
      );
    } catch (error) {
      if (!error || !error.response) {
        throw error;
      }
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const upsertMessage = createAsyncThunk(
  "messages/upsert",
  async (message: Partial<IMessage>, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      return await ApiPost<any>(`/api/admin/messages/upsert`, message);
    } catch (error) {
      if (error instanceof Response) {
        const response: IGenericResponse = await error.json();
        return thunkAPI.rejectWithValue(response);
      }
      throw error;
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadMessages.pending, (state, action) => {
      state.status = "loading";
    });
    builder.addCase(
      loadMessages.fulfilled,
      (state, action: PayloadAction<Array<IMessage>>) => {
        state.status = "idle";
        if (action.payload) {
          state.messages = action.payload;
        }
      }
    );
    builder.addCase(
      loadMessages.rejected,
      (state, action: PayloadAction<any>) => {
        state.status = "error";
        showNotification({
          title: "Cannot load messages",
          message: action.payload?.message || "",
          color: "red",
        });
      }
    );
    builder.addCase(
      upsertMessage.fulfilled,
      (state, action: PayloadAction<any>) => {
        showNotification({
          title: "Message stored",
          message: "",
          color: "green",
        });
      }
    );
    builder.addCase(
      upsertMessage.rejected,
      (state, action: PayloadAction<any>) => {
        showNotification({
          title: "Cannot store message",
          message: action.payload?.message || "",
          color: "red",
        });
      }
    );
  },
});

export const {} = messagesSlice.actions;
const { reducer } = messagesSlice;
export const messagesSelector = (state: RootState) => state.messages;

export default reducer;
