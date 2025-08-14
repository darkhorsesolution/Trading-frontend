import { Badge, BadgeProps } from "@mantine/core";
import { OrderSide } from "@/interfaces/IOrder";

export interface SymbolProps extends BadgeProps {
  pnl?: number;
  side?: OrderSide;
}

const Symbol = ({ children, pnl, ...rest }: SymbolProps) => {
  const color = (p: number) => {
    if (p > 0) return "green";
    if (p < 0) return "red";

    return "gray";
  };

  return (
    <Badge size="xl" variant={"dot"} color={color(pnl)} {...rest}>
      {children}
    </Badge>
  );
};

export default Symbol;
