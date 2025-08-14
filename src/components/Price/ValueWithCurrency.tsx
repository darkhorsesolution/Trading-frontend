import { ComponentProps } from "@/components";
import Constants from "@/utils/Constants";
import { createStyles } from "@mantine/core";

export type ValueWithCurrencyProps = {
  value: number | string;
  currency: string;
  precision?: number;
  useColor?: boolean;
  defaultValue?: string;
} & ComponentProps;

const useStyles = createStyles((theme) => ({
  positive: {
    color: theme.colors.green[5],
  },
  negative: {
    color: theme.colors.red[5],
  },
}));

const ValueWithCurrency = (props: ValueWithCurrencyProps) => {
  const {
    value,
    currency,
    precision = Constants.DefaultNumberPrecision,
    useColor = false,
    defaultValue = "-",
    ...rest
  } = props;

  const { classes } = useStyles();

  let sanitized: number | "" =
    typeof value === "number" ? value : parseFloat(value);
  if (!sanitized || isNaN(sanitized)) {
    sanitized = "";
  }

  function getColor(value: number | ""): string {
    if (!value) {
      return "";
    }
    if (value > 0) return classes.positive;
    if (value < 0) return classes.negative;

    return "";
  }

  return (
    <span className={`${useColor && getColor(sanitized)} ${rest.className}`}>
      {currency && (Constants.CurrencySymbols[currency] ?? currency)}{" "}
      {sanitized === "" ? defaultValue : sanitized.toFixed(precision)}
    </span>
  );
};

export default ValueWithCurrency;
