import Constants from "@/utils/Constants";
import { createStyles, TextProps } from "@mantine/core";
import FormattedValue from "./FormattedValue";

export type ProfitLossProps = {
  useColor?: boolean;
  profitLoss: number | any;
  currency?: string;
} & TextProps;

const useStyles = createStyles((theme) => ({
  positive: {
    color: theme.colors.green[5],
  },
  negative: {
    color: theme.colors.red[5],
  },
}));

const ProfitLoss = ({
  profitLoss,
  currency,
  useColor,
  ...rest
}: ProfitLossProps) => {
  const { classes } = useStyles();
  const formatter =
    currency &&
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency,
    });
  let className = undefined;
  if (useColor) {
    if (isNaN(profitLoss)) {
      profitLoss = 0;
    }
    if (profitLoss < 0) {
      className = classes.negative;
    } else if (profitLoss > 0) {
      className = classes.positive;
    }
  }
  return (
    <FormattedValue
      value={profitLoss}
      digits={Constants.ProfitLossValuePrecision as any}
      className={className}
      formatter={formatter}
      {...rest}
    />
  );
};

export default ProfitLoss;
