import {
  NumberInputHandlers,
  NumberInputProps,
} from "@mantine/core/lib/NumberInput/NumberInput";
import {
  createStyles,
  Group,
  NumberInput,
  ActionIcon,
  clsx,
  Stack,
  Box,
  Select,
} from "@mantine/core";
import { Device, useDevice } from "@/services/UseDevice";
import { useRef, useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconChevronsDown,
  IconChevronsUp,
} from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  group: {
    position: "relative",
    outline: "none",
    flexWrap: "nowrap",
    maxWidth: "initial",
    width: "100%",
    input: {
      textAlign: "center",
      minWidth: "100px",
      outline: "none",
      padding: 0,
      borderRadius: 0,
    },
    label: {
      marginLeft: "-35px",
    },
  },
  inputWrapper: {
    flex: 1,
  },
  leftControl: {
    borderRight: "none",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    "&.disabled": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[1],
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[4],
    },
  },
  rightControl: {
    borderLeft: "none",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    "&.disabled": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[1],
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[4],
    },
  },
  steps: {
    gap: 0,
    left: "1px",
    top: "0px",
    zIndex: 10,
    position: "absolute",
    borderRadius: 0,
    alignItems: "start",
    flexDirection: "row"
  },
  stepsToggle: {
    top: "1px",
    borderRight: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[4]
    }`,
  },
  stepsSelect: {
    flex: 1,
    input: {
      marginLeft: "-1px",
    }
  }
}));

const ResponsiveNumberInput = ({
  classNames,
  steps,
  ...props
}: NumberInputProps & { steps?: string[] }) => {
  const device = useDevice();
  const handlers = useRef<NumberInputHandlers>();
  const { classes } = useStyles();
  const [stepsOpen, setStepsOpen] = useState<boolean>(false);

  const val = props.value || props.defaultValue || 0;
  let decrementDisabled = props.disabled || !val;
  let incrementDisabled = props.disabled;
  if (
    !decrementDisabled &&
    props.min &&
    props.step &&
    val - props.step < props.min
  ) {
    decrementDisabled = true;
  }
  if (
    !incrementDisabled &&
    props.max &&
    props.step &&
    val + props.step > props.max
  ) {
    incrementDisabled = true;
  }

  if (device === Device.Mobile) {
    return (
      <Group
        spacing={0}
        style={{ alignItems: "end" }}
        className={classes.group}
      >
        <ActionIcon
          className={clsx(
            classes.leftControl,
            decrementDisabled ? "disabled" : undefined
          )}
          disabled={decrementDisabled}
          h={42}
          size={35}
          variant="default"
          onClick={() => handlers.current.decrement()}
        >
          –
        </ActionIcon>
        <NumberInput
          hideControls
          handlersRef={handlers}
          stepHoldDelay={500}
          stepHoldInterval={100}
          {...props}
          w={undefined}
          noClampOnBlur={false}
          style={{ flex: 1 }}
          size={undefined}
        />
        <ActionIcon
          className={clsx(
            classes.rightControl,
            incrementDisabled ? "disabled" : undefined
          )}
          disabled={incrementDisabled}
          h={42}
          size={35}
          variant="default"
          onClick={() => handlers.current.increment()}
        >
          +
        </ActionIcon>
      </Group>
    );
  }

  if (steps && steps.length) {
    return (
      <Group
        spacing={0}
        style={{ alignItems: "end" }}
        className={classes.group}
      >
        <Stack className={classes.steps} w={stepsOpen ? "100%" : undefined} >
          <ActionIcon
            className={classes.stepsToggle} 
            px={"2px"}
            py={"1px"}
            radius={0}
            display={"flex"}
            style={{ flexDirection: "column" }}
            size={"12"}
            onClick={() => setStepsOpen(!stepsOpen)}
          >
            <IconChevronsUp size={"12"} />
            <IconChevronsDown size={"12"} />
          </ActionIcon>
          {stepsOpen && (
              <Select
              initiallyOpened
              placeholder="Pick a value"    
              className={classes.stepsSelect}               
              size="xs"
                data={steps.map(v => ({
                  value: v,
                  label: props.formatter(v),
                }))}
                onChange={(s) => {
                  props.onChange(parseFloat(s));
                  setStepsOpen(false);
                }}
              />
          )}
        </Stack>

        <NumberInput
          stepHoldDelay={500}
          stepHoldInterval={100}
          {...props}
          label={undefined}
          w={undefined}
          noClampOnBlur={false}
          style={{ flex: 1 }}
          size={undefined}
        />
      </Group>
    );
  }

  return (
    <NumberInput
      stepHoldDelay={500}
      stepHoldInterval={100}
      {...props}
      noClampOnBlur={false}
    />
  );
};

ResponsiveNumberInput.defaultFormatter = (value) => {
  const parsed = parseFloat(value);
  const out =
    Number.isNaN(parsed) || !parsed || value.indexOf(",") === 0
      ? value
      : `${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  return out;
};

ResponsiveNumberInput.defaultParser = (value) => {
  if (value.indexOf("0") === 0 || value.indexOf(",") === 0) {
    return value;
  }
  return value.replace(/(,*)/g, "");
};

export default ResponsiveNumberInput;
