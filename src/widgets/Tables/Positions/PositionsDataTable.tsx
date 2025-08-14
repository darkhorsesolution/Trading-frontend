import {
  AccessorKeyColumnDef,
  ColumnDef,
  ColumnSort,
  RowSelectionState,
} from "@tanstack/react-table";
import { IPosition } from "@/interfaces/IPosition";
import { ITrade } from "@/interfaces/ITrade";
import Table from "@/components/Table";
import {
  Box,
  Checkbox,
  LoadingOverlay,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import React, { useState } from "react";

interface PositionsDataTableProps {
  positions: IPosition[];
  columns: ColumnDef<IPosition | ITrade>[];
  positionTpEditing?: string;
  positionSlEditing?: string;
  selection: RowSelectionState;
  onSelectionChanged: (RowSelectionState) => void;
  api: any;
  params: any;
  defaultSort?: ColumnSort;
}

const PositionsDataTable = React.memo<PositionsDataTableProps>(
  ({
    positions,
    columns,
    selection,
    onSelectionChanged,
    api,
    params,
    defaultSort,
  }) => {
    const [settings, setSettings] = useState({
      columns: columns.reduce((acc, curr) => {
        if ((curr as AccessorKeyColumnDef<IPosition>).accessorKey) {
          const key = (curr as AccessorKeyColumnDef<IPosition>)
            .accessorKey as string;
          acc[key] = true;
        }
        return acc;
      }, {}),
    });

    return (
      <Stack spacing={0} style={{ height: "100%" }}>
        <LoadingOverlay visible={status === "loading"} />
        <Modal
          opened={params.settingsOpen}
          onClose={() =>
            api.updateParameters({ ...params, settingsOpen: false })
          }
          centered={true}
          title="Settings"
        >
          <Text fw={700}>Columns:</Text>
          {Object.keys(settings.columns).map((columnKey) => {
            const columnDef = (
              columns as AccessorKeyColumnDef<IPosition>[]
            ).find((c) => c.accessorKey === columnKey);
            return (
              <Box key={columnKey} px={1}>
                <Checkbox
                  pb={3}
                  label={(columnDef?.header as string) || columnKey}
                  checked={settings.columns[columnKey]}
                  onChange={(e) => {
                    settings.columns[columnKey] = e.target.checked;
                    setSettings({ ...settings });
                  }}
                />
              </Box>
            );
          })}
        </Modal>
        <Table
          onSelectionChange={onSelectionChanged}
          data={positions.map((row: IPosition) => ({
            ...row,
            subRows: row.trades,
          }))}
          columns={columns}
          selected={selection}
          settings={settings}
          setSettings={setSettings}
          defaultSort={defaultSort}
        />
      </Stack>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.params !== nextProps.params) {
      return false;
    }

    if (
      JSON.stringify(prevProps.selection) !==
      JSON.stringify(nextProps.selection)
    ) {
      return false;
    }

    // user wants to edit something, clicked on the editable field => render new version
    if (
      nextProps.positionSlEditing !== prevProps.positionSlEditing ||
      nextProps.positionTpEditing !== prevProps.positionTpEditing
    ) {
      return false;
    }

    return (
      !!nextProps.positionSlEditing ||
      !!nextProps.positionTpEditing ||
      nextProps.positions === prevProps.positions ||
      JSON.stringify(nextProps.positions) ===
        JSON.stringify(prevProps.positions)
    );
  }
);

export default PositionsDataTable;
