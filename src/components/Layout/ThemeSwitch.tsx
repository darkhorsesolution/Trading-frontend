import {
  ActionIcon,
  ActionIconProps,
  BoxProps,
  Switch,
  createStyles,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  toggle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
}));

export type ThemeSwitchProps = ActionIconProps & {
  switch?: boolean;
};

export function ThemeSwitch(props: ThemeSwitchProps) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  if (props.switch) {
    return (
      <Switch
        checked={colorScheme === "dark"}
        onChange={(evt) => {
          toggleColorScheme(evt.currentTarget.checked ? "dark" : "light");
        }}
      />
    );
  }
  return (
    <ActionIcon
      onClick={() => toggleColorScheme()}
      sx={(theme) => ({
        background:
          theme.colorScheme === "dark" ? theme.colors.dark[5] : undefined,
        color:
          theme.colorScheme === "dark"
            ? theme.colors.yellow[4]
            : theme.colors.blue[6],
      })}
      {...props}
    >
      {colorScheme === "dark" ? (
        <IconSun size={18} />
      ) : (
        <IconMoonStars size={18} />
      )}
    </ActionIcon>
  );
}

export default ThemeSwitch;
