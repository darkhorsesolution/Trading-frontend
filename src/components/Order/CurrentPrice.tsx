import { OrderSide } from "@/interfaces/IOrder";
import { Text, createStyles, Stack } from "@mantine/core";
import Price from "../Price/Price";

const useStyles = createStyles((theme) => ({
  pointer: {
    cursor: "pointer",
  },
  priceBid: {},
  priceAsk: {},
  priceSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    paddingLeft: "0 !important",
  },
}));

export interface CurrentPriceProps {
  label: string;
  value: number;
  side: OrderSide;
  sideSuffix?: boolean;
  smallerLastLetters: number;
  onClick?: (val: string) => void;
}

const CurrentPrice = ({
  value,
  label,
  side,
  sideSuffix,
  smallerLastLetters,
  onClick,
}: CurrentPriceProps) => {
  const { classes } = useStyles();

  return (
    <Stack
      onClick={onClick ? () => onClick(value.toString()) : undefined}
      spacing={0}
    >
      <Text size={"sm"}>
        {label}
        {sideSuffix && ` ${side === OrderSide.BUY ? "(ask)" : "(bid)"}`}
      </Text>
      <Price
        size={"md"}
        price={value}
        className={classes.priceSection}
        smallerLastLetters={smallerLastLetters}
      />
    </Stack>
  );
};

export default CurrentPrice;
