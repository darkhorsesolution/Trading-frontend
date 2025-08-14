import {
  ColumnDef,
  ColumnSort,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  HeaderGroup,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons";
import {
  Box,
  clsx,
  createStyles,
  Group,
  ScrollArea,
  Stack,
} from "@mantine/core";

export type TableProps<T> = {
  data: Array<T>;
  columns: Array<ColumnDef<T>>;
  onSelectionChange?: (row: RowSelectionState) => void;
  onRowDblClick?: (row: any) => void;
  onRowClick?: (row: any) => void;
  selected?: RowSelectionState;
  active?: string;
  settings?: any;
  setSettings?: (any) => void;
  defaultSort?: ColumnSort;
  footer?: boolean;
  scrollRef?: React.MutableRefObject<HTMLDivElement>;
};

const useStyles = createStyles((theme) => ({
  wrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    padding: 0,
    ".mantine-ScrollArea-scrollbar": {
      zIndex: 11,
    },
  },
  table: {
    flex: 1,
    position: "relative",
    borderCollapse: "collapse",
    width: "100%",
    border: 0,
  },
  row: {
    "&.child": {
      background: theme.colorScheme === "dark" ? theme.black : theme.white,
    },
    "&.active, &:hover": {
      background:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[1],
    },
    "&.activable": {
      cursor: "pointer",
    },
  },
  selectedRow: {
    background:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[3],
  },
  cell: {
    fontSize: theme.fontSizes.sm,
    padding: theme.spacing.sm,
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[1]
    }`,
    whiteSpace: "nowrap",
    ":last-child": {
      paddingRight: "20px",
    },
  },
  header: {
    th: {
      zIndex: 10,
      position: "sticky",
      top: 0,

      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[6],

      background:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[1],
      "&:hover": {
        background:
          theme.colorScheme === "dark"
            ? theme.colors.dark[5]
            : theme.colors.gray[2],
      },
    },
  },
  footer: {
    th: {
      zIndex: 10,
      position: "sticky",
      bottom: 0,
      padding: 0,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[6],
      background:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[1],
    },
  },
  headerColumn: {
    userSelect: "none",
    fontSize: theme.fontSizes.sm,
    padding: theme.spacing.xs,
    "&.comment, &.netPL, &.right": {
      justifyContent: "end",
      marginRight: "5px",
    },
  },
  headerSortable: {
    cursor: "pointer",
  },
  resizer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: "100%",
    backgroundColor: "transparent",
    cursor: "ew-resize",
    ":hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2],
    },
  },
}));

const Table = <T,>({
  data,
  columns,
  active,
  defaultSort,
  settings,
  setSettings,
  selected,
  onRowDblClick,
  onRowClick,
  footer,
  scrollRef,
}: TableProps<T>) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>(
    defaultSort ? [defaultSort] : []
  );
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const { classes } = useStyles();

  const isDevelopment = false; /* || process.env.NODE_ENV === "development"*/
  const [columnVisibility, setColumnVisibility] = useState(settings?.columns);

  useEffect(() => {
    if (setSettings) {
      setSettings({
        columns: columnVisibility,
      });
    }
  }, [columnVisibility]);

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 999999999999,
      },
    },
    getRowId: (row: any) => {
      return row.id;
    },
    state: {
      sorting,
      rowSelection,
      expanded,
      columnVisibility,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row: any) => row.subRows,
    onSortingChange: setSorting,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: isDevelopment,
    columnResizeMode: "onChange",
    debugHeaders: isDevelopment,
    debugColumns: isDevelopment,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  });

  useEffect(() => {
    selected && setRowSelection(selected);
  }, [selected]);

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  return (
    <Stack className={classes.wrapper} spacing={0}>
      <ScrollArea
        style={{
          zIndex: 11,
          height: "100%",
          width: "100%",
        }}
        scrollHideDelay={250}
        viewportRef={scrollRef}
      >
        <table
          className={clsx(classes.table)}
          style={{ minWidth: table.getTotalSize() + "px" }}
        >
          <TableHead
            headerGroups={headerGroups}
            columnVisibility={table.getState().columnVisibility}
            selected={selected}
            sortedColumn={getSortedHeader(table.getHeaderGroups())}
          />
          <tbody>
            {rows.map((row, i) => {
              return (
                <tr
                  onDoubleClick={
                    onRowDblClick ? () => onRowDblClick(row) : undefined
                  }
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  key={row.id + i}
                  className={[
                    classes.row,
                    row.getIsExpanded() ? "expanded" : null,
                    row.depth > 0 ? "child" : null,
                    active === row.original.id ? "active" : null,
                    (onRowDblClick || onRowClick) && !row.getCanExpand()
                      ? "activable"
                      : null,
                  ].join(" ")}
                >
                  {row.getVisibleCells().map((cell, n) => {
                    return (
                      <td
                        key={cell.id}
                        className={classes.cell}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          {footer && (
            <TableFooter
              footerGroups={table
                .getFooterGroups()
                .filter((f, i, arr) => f.id !== "" && i + 1 === arr.length)}
            />
          )}
        </table>
      </ScrollArea>
    </Stack>
  );
};

interface TableFooterProps {
  footerGroups: HeaderGroup<any>[];
}

const TableFooter = React.memo(
  ({ footerGroups }: TableFooterProps) => {
    const { classes } = useStyles();
    return (
      <tfoot className={clsx(classes.footer)}>
        {footerGroups.map((footerGroup, i, arr) => {
          return (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ paddingBottom: "2px" }}
                >
                  <Group className={classes.headerColumn}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </Group>
                </th>
              ))}
            </tr>
          );
        })}
      </tfoot>
    );
  },
  (prevProps, nextProps) => {
    return false;
  }
);
interface TableHeadProps {
  headerGroups: HeaderGroup<any>[];
  selected: any;
  sortedColumn: [string, string | false];
  columnVisibility: Record<string, boolean>;
}

const TableHead = React.memo(
  ({ headerGroups }: TableHeadProps) => {
    if (!headerGroups) {
      return null;
    }

    const { classes } = useStyles();
    return (
      <thead className={clsx(classes.header)}>
        {headerGroups.map((headerGroup, i, arr) => {
          if (i + 1 !== arr.length) {
            return null;
          }
          return (
            <tr key={i}>
              {headerGroup.headers.map((header, ii) => {
                return (
                  <th
                    colSpan={header.colSpan}
                    {...{
                      key: Math.random(),
                      colSpan: header.colSpan,
                      style: {
                        width: header.column.getCanResize()
                          ? header.getSize()
                          : null,
                      },
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <Group
                        {...{
                          className: clsx(
                            classes.headerColumn,
                            header.id,
                            header.column.getCanSort()
                              ? classes.headerSortable
                              : "",
                            (header.column.columnDef.meta as any)?.right
                              ? "right"
                              : ""
                          ),
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                        style={{ gap: "4px" }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <IconChevronUp size={12} />,
                          desc: <IconChevronDown size={12} />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </Group>
                    )}
                    {/* resizer */}
                    {header.column.getCanResize() && (
                      <Box
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `${classes.resizer} ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`,
                        }}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>
    );
  },
  (prevProps, nextProps): boolean => {
    const isResizing = !!nextProps.headerGroups.find(
      (g) => !!g.headers.find((h) => h.column.getIsResizing())
    );
    if (isResizing) {
      return false;
    }

    if (
      JSON.stringify(prevProps.columnVisibility) !==
      JSON.stringify(nextProps.columnVisibility)
    ) {
      return false;
    }

    if (prevProps.headerGroups !== nextProps.headerGroups) {
      return false;
    }

    if (
      JSON.stringify(prevProps.sortedColumn) !=
      JSON.stringify(nextProps.sortedColumn)
    ) {
      return false;
    }

    if (
      JSON.stringify(prevProps.selected) !== JSON.stringify(nextProps.selected)
    ) {
      return false;
    }

    return true;
  }
);

const getSortedHeader = (headerGroups: any[]): [string, string | false] => {
  for (const group of headerGroups) {
    for (const header of group.headers) {
      if (header.column.getIsSorted()) {
        return [header.column.id, header.column.getIsSorted()];
      }
    }
  }

  return ["", false];
};

export default Table;
