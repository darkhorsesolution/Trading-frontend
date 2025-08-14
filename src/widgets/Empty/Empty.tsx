import { Box } from "@mantine/core";
import React from "react";
import { Widgets } from "@/lib/WidgetRegister";
import { IDockviewPanelHeaderProps } from "dockview";
import Tab from "../Tab";

const Empty = () => {
  return <Box p={"md"}>This widget has been removed and is no longer available.</Box>;
};

Widgets.register(Empty, "empty", {
  closable: true,
  admin: true,
  title: "Empty",
  description: "Placeholder widget for replacing removed/unavailable widgets",
  tabComponent: (props: IDockviewPanelHeaderProps) => (
    <Tab
      {...props}
      withSetting={false}
      text={
        <>
          {props.api.title}
        </>
      }
    />
  ),
});

export default Empty;
