import type { CSSProperties, FC } from "react";
import type { XYCoord } from "react-dnd";
import { useDragLayer } from "react-dnd";
import OrderCreate from "../Order/OrderCreatePanel";
import { Badge, Box } from "@mantine/core";
import { FloatBoxName } from "./FloatingComponent";

const layerStyles: CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }

  let { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const CustomDragLayer: FC = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => {
      return {
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getClientOffset(),
      currentOffset: monitor.getClientOffset(),
      isDragging: monitor.isDragging(),
      }
    });
    
  function renderItem() {
    switch (itemType) {
      case FloatBoxName:
        return <Badge>Move</Badge>
      default:
        return ""
    }
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={{...getItemStyles(initialOffset, currentOffset)}}>
        {renderItem()}
      </div>
    </div>
  );
};
