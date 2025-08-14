import {
  ColumnDef,
  createColumnHelper,
  ColumnDefTemplate,
  CellContext,
} from "@tanstack/react-table";
import {
  IOrder,
  OrderSideToName,
  OrderType,
  OrderTypeToString,
} from "@/interfaces/IOrder";
import React from "react";
import { Text, Group } from "@mantine/core";
import { IAsset } from "@/interfaces/IAsset";

export interface IPairedTrade {
  id: string;
  symbol: string;
  type: string;
  quantity: string;
  openTime?: string;
  openPrice?: string;
  stopLoss?: string;
  takeProfit?: string;
  closeTime?: string;
  closePrice?: string;
  commission?: string;
  netPL?: string;
  comment: string;
  precision: number;
  asset: IAsset;
}

export const columnHelper = createColumnHelper<IPairedTrade>();

export const getOrderType = (o: IOrder): React.ReactNode => {
  return o.type === OrderType.OCO
    ? "OCO"
    : formatOrderType(
        `${OrderSideToName[o.side]} ${
          o.type !== OrderType.Market ? OrderTypeToString[o.type] : ""
        }`
      );
};

export const formatOrderType = (type: string): React.ReactNode => (
  <Group>
    <Text color={type.toLowerCase().indexOf("buy") !== -1 ? "green" : "red"}>
      {type}
    </Text>
  </Group>
);

export type OrdersTableBaseProps = {
  orders: IOrder[];
  actions?: ColumnDefTemplate<CellContext<IOrder, unknown>>;
  columns: ColumnDef<IOrder>[];
  setColumnsVisibility?: (any) => void;
};
