import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons";
import { useState } from "react";

interface DrawerSwitchProps {
  opened: boolean;
  highlighted: boolean;
  setOpen: (boolean) => void;
}
export function DrawerSwitch({ opened, setOpen, highlighted }: DrawerSwitchProps) {
  return (
    <Group position="center" my="xl">
      <Tooltip label={"Open side drawer"}>
        <ActionIcon
          onClick={() => setOpen(!opened)}
          size="lg"
          variant={"light"}
        >
          {!opened ? <IconArrowLeft size={18} /> : <IconArrowRight size={18} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

export default DrawerSwitch;
