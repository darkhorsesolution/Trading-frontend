import {
  ActionIcon,
  CloseButton,
  Flex,
  Group,
  Text,
  createStyles,
} from "@mantine/core";
import { IconGripVertical, IconSettings } from "@tabler/icons";
import { IDockviewPanelHeaderProps } from "dockview";

const useStyles = createStyles((theme) => ({
  root: {
    color: "inherit",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
}));

const Tab = (
  props: IDockviewPanelHeaderProps & {
    withSetting?: boolean | React.ReactNode;
    text?: React.ReactNode;
  }
) => {
  const { classes: btnStyles } = useStyles();
  return (
    <Flex p={2} wrap={"nowrap"} gap={"xs"} direction={"row"} align={"center"}>
      <IconGripVertical size={14} />
      <Text px={"xs"} size={"sm"} style={{ whiteSpace: "nowrap" }}>
        {props.text || props.api.title}
      </Text>
      <Flex align={"center"}>
        {props.withSetting && props.withSetting !== true
          ? props.withSetting
          : null}
        {props.withSetting ? (
          <ActionIcon
            className={btnStyles.root}
            title="Settings"
            size={"sm"}
            onClick={() => props.api.updateParameters({ settingsOpen: true })}
          >
            <IconSettings size={14} />
          </ActionIcon>
        ) : null}
        <CloseButton
          aria-label="Close component"
          title="Close component"
          size={"sm"}
          onClick={() => props.api.close()}
          className={btnStyles.root}
        />
      </Flex>
    </Flex>
  );
};

export default Tab;
