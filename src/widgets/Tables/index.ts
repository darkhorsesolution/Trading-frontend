import {
  AccessorKeyColumnDef,
  ColumnDef,
  DisplayColumnDef,
  GroupColumnDef,
} from "@tanstack/react-table";

export * from "./Orders/ActiveOrders";
export * from "./Orders/CompletedOrders";
export * from "./Positions/OpenOrders";
export * from "./Positions/NetPositions";

export const findColumnName = (
  columns: ColumnDef<unknown>[],
  columnKey: string
): string => {
  let columnName: string;

  columns.every((curr) => {
    const accessor = curr as AccessorKeyColumnDef<unknown>;
    const display = curr as DisplayColumnDef<unknown>;
    const groupAccessor = curr as GroupColumnDef<unknown>;
    if (groupAccessor.columns) {
      groupAccessor.columns.every((curr) => {
        const display = curr as DisplayColumnDef<unknown>;
        const accessor = curr as AccessorKeyColumnDef<unknown>;
        if (accessor.accessorKey === columnKey) {
          columnName = accessor.header as string;
          return false;
        } else if (display.id === columnKey) {
          columnName = display.header as string;
          return false;
        }
        return true;
      });
    } else if (accessor.accessorKey === columnKey) {
      columnName = accessor.header as string;
    } else if (display.id === columnKey) {
      columnName = display.header as string;
    }

    return !columnName;
  });

  return columnName;
};

export const reduceColumnsToMap = (
  columns: ColumnDef<unknown>[]
): Record<string, boolean> => {
  return columns.reduce((acc, curr) => {
    const accessor = curr as AccessorKeyColumnDef<unknown>;
    const display = curr as DisplayColumnDef<unknown>;
    const groupAccessor = curr as GroupColumnDef<unknown>;

    if (groupAccessor.columns) {
      groupAccessor.columns.forEach((curr) => {
        const accessor = curr as AccessorKeyColumnDef<unknown>;
        const display = curr as DisplayColumnDef<unknown>;
        if (accessor.accessorKey) {
          acc[accessor.accessorKey] = true;
        } else if (display.id) {
          acc[display.id] = true;
        }
      });
    } else if (accessor.accessorKey) {
      acc[accessor.accessorKey] = true;
    } else if (display.id) {
      acc[display.id] = true;
    }

    return acc;
  }, {});
};
