import React from "react";
import { Button, createStyles, Divider, Menu } from "@mantine/core";
import WidgetRegistry from "@/lib/WidgetRegister/lib/WidgetRegistry";
import { AddNewPanel } from "@/store/workspace";
import { BlocksIcon, ChevronDown } from "lucide-react";

const useStyles = createStyles((theme) => ({
  svg: {
    path: {
      stroke:
        theme.colorScheme === "dark"
          ? theme.colors.dark[0]
          : theme.colors.dark[9],
    },
  },
}));

const WidgetMenu = (props: { admin: boolean }) => {
  const { classes } = useStyles();
  return (
    <Menu shadow="md" width={200} position="bottom-start">
      <Menu.Target>
        <Button
          compact={true}
          title="Widgets"
          variant={"subtle"}
          leftIcon={<BlocksIcon size={14} />}
          rightIcon={<ChevronDown />}
        >
          Add panels
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {Object.entries(WidgetRegistry.getInstance().getWidgets())
          .filter((p) => !p[1].getPanelProps(false).admin)
          .map((widget) => {
            const panel = widget[1].getPanelProps(false);
            if (!props.admin && panel.admin) {
              return null;
            }
            return (
              <Menu.Item
                icon={panel.icon}
                key={panel.title}
                onClick={() =>
                  AddNewPanel({
                    component: widget[0],
                    tabComponent: panel.tabComponent ? widget[0] : "default",
                    title: panel.title,
                  })
                }
              >
                {panel.title}
              </Menu.Item>
            );
          })}
        {props.admin && (
          <>
            <Divider my={"sm"} />
            {Object.entries(WidgetRegistry.getInstance().getWidgets())
              .filter((p) => p[1].getPanelProps(false).admin)
              .map((widget) => {
                const panel = widget[1].getPanelProps(false);
                return (
                  <Menu.Item
                    icon={panel.icon}
                    key={panel.title}
                    onClick={() =>
                      AddNewPanel({
                        component: widget[0],
                        tabComponent: panel.tabComponent
                          ? widget[0]
                          : "default",
                        title: panel.title,
                      })
                    }
                  >
                    {panel.title}
                  </Menu.Item>
                );
              })}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default React.memo(WidgetMenu, (prevProps, nextProps) => {
  if (prevProps.admin !== nextProps.admin) {
    return false;
  }

  return true;
});
