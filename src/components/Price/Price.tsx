import { ComponentProps } from "../index";
import { PriceChange } from "@/interfaces/IOrder";
import { IconArrowDown, IconArrowUp } from "@tabler/icons";
import {
  Box,
  clsx,
  createStyles,
  Group,
  MantineSize,
  Text,
} from "@mantine/core";
import { fontFamilyMonospace } from "@/lib/styles";

export type PriceProps = {
  price: number | string;
  priceChange?: PriceChange;
  size?: MantineSize;
  align?: "left" | "right";
  title?: string;
  smallerLastLetters?: number;
  decimalPlaces?: number;
  biggerLetters?: boolean;
} & ComponentProps;

const useStyles = createStyles((theme) => ({
  red: {
    //color: theme.colors.red[7],
    //fontWeight: 'bolder',
    fontFamily: fontFamilyMonospace,
    //color: theme.fn.rgba(theme.colorScheme === 'dark' ? theme.colors.red[5] : theme.colors.red[9], 0.3),
    color:
      theme.colorScheme === "dark" ? theme.colors.red[5] : theme.colors.red[9],
  },
  green: {
    //color: theme.white,
    //fontWeight: 'bolder',
    fontFamily: fontFamilyMonospace,
    //color: theme.fn.rgba(theme.colorScheme === 'dark' ? theme.colors.green[7] : theme.colors.green[9], 0.3),
    color:
      theme.colorScheme === "dark"
        ? theme.colors.green[7]
        : theme.colors.green[9],
  },
  left: {
    justifyContent: "start",
    whiteSpace: "nowrap",
  },
  right: {
    justifyContent: "end",
    whiteSpace: "nowrap",
  },
  price: {
    ".last-letter": {
      fontSize: theme.fontSizes.xs,
    },
    ".bigger-letter": {
      fontSize: theme.fontSizes.xl,
    },
  },
}));

const Price = ({
  price,
  priceChange,
  align = "right",
  size = "sm",
  title,
  className,
  smallerLastLetters,
  biggerLetters,
  style,
}: PriceProps) => {
  const { classes } = useStyles();

  if (!price) {
    return null;
  }

  let lastLetter: string;
  if (smallerLastLetters && price && price.toString().length > 0) {
    lastLetter = price.toString().slice(-smallerLastLetters);
    price = price.toString().slice(0, -smallerLastLetters);
  }
  const priceParts = price.toString().split(".");

  return (
    <Group
      title={title}
      spacing={0}
      px={"xs"}
      py={0}
      className={
        !!className || className === ""
          ? className
          : clsx(
              priceChange === PriceChange.Down ? classes.red : undefined,
              priceChange === PriceChange.Up ? classes.green : undefined,
              align === "left" ? classes.left : classes.right
            )
      }
      style={style}
    >
      {priceParts.length > 1 && (
        <Text size={size} p={0} className={classes.price} variant={"price"}>
          {priceParts[0]}.{priceParts[1].slice(0, -2)}
          {priceParts[1].length > 0 && (
            <span className={biggerLetters ? "bigger-letter" : ""}>
              {priceParts[1].slice(-2)}
            </span>
          )}
          {smallerLastLetters && (
            <span className="last-letter">{lastLetter}</span>
          )}
        </Text>
      )}
    </Group>
  );
};

export default Price;
