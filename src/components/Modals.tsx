import React, { ReactNode, useState } from "react";
import { findColumnName } from "@/widgets";
import { ColumnDef } from "@tanstack/react-table";
import { ContextModalProps } from "@mantine/modals";
import { Box, Button, Checkbox, Text } from "@mantine/core";

const TableWidgetSettingsModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  setSettings: (data: { columns: Record<string, boolean> }) => void;
  settings: { columns: Record<string, boolean> };
  columns: ColumnDef<unknown>[];
}>) => {
  const [modalSettings, setModalSettings] = useState(innerProps.settings);

  return (
    <>
      <Text fw={700}>Columns:</Text>
      {Object.keys(modalSettings.columns).map((columnKey) => {
        const columnName = findColumnName(
          innerProps.columns as ColumnDef<unknown>[],
          columnKey
        );
        return (
          <Box key={columnKey} px={1}>
            <Checkbox
              pb={3}
              label={columnName || columnKey}
              defaultChecked={modalSettings.columns[columnKey]}
              onChange={(e) => {
                const cloned = JSON.parse(JSON.stringify(modalSettings));
                cloned.columns[columnKey] = e.target.checked;
                setModalSettings(cloned);
                innerProps.setSettings(cloned);
              }}
            />
          </Box>
        );
      })}
    </>
  );
};

const WidgetSettingsModal = <T extends Record<string, never>>({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  setSettings: (T) => void;
  settings: T;
  children: any;
}>) => <>{innerProps.children}</>;

const ConfirmModal = ({
  innerProps,
}: ContextModalProps<{ onConfirm: () => void; children?: ReactNode }>) => (
  <Box style={{ textAlign: "center" }}>
    {innerProps.children && innerProps.children}
    <Button size={"sm"} onClick={innerProps.onConfirm}>
      Confirm
    </Button>
  </Box>
);

const NewsModal = <T extends { onConfirm?: () => void }>({
  innerProps,
}: ContextModalProps<{
  onConfirm?: () => void;
  children: any;
  title: string;
}>) => (
  <Box style={{ textAlign: "center" }}>
    <Text size={"xl"}>{innerProps.title}</Text>
    {innerProps.children}
    {innerProps.onConfirm && (
      <Button size={"sm"} onClick={innerProps.onConfirm}>
        Confirm
      </Button>
    )}
  </Box>
);

export enum Modals {
  TableWidgetSettingsModal = "tablesSettings",
  WidgetSettingsModal = "widgetSettings",
  NewsModal = "newsSettings",
  ConfirmModal = "confirmModal",
}

export {
  TableWidgetSettingsModal,
  WidgetSettingsModal,
  ConfirmModal,
  NewsModal,
};
