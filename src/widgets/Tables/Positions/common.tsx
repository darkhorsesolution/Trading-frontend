import { OrderSide } from "@/interfaces/IOrder";
import { Group, Text } from "@mantine/core";

export const SideIcons = {
  [OrderSide.BUY]: (
    <Group>
      <Text color={"green"}>Buy</Text>
    </Group>
  ),
  [OrderSide.SELL]: (
    <Group>
      <Text color={"red"}>Sell</Text>
    </Group>
  ),
};
