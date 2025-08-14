import { ActionIcon, Paper, Stack, createStyles } from "@mantine/core";
import { FC, memo } from "react";
import { ComponentProps } from "@/components";
import { IconDotsVertical, IconX } from "@tabler/icons";
import { useDrag } from "react-dnd";

export interface FloatComponentProps extends ComponentProps {
  id: any;
  left: number;
  top: number;
  position?: { x: number; y: number };
  onClose: () => void;
  onActivate?: () => void;
  zIndexInc?: number; // increates default zindex
  dragProps?: Record<string, unknown>;
}

const useStyles = createStyles((theme) => ({
  draggable: {
    position: "absolute",
    zIndex: 400,
  },
  handle: {
    position: "absolute",
    left: 0,
    bottom: 0,
    top: 0,
    paddingRight: 0,
    display: "flex",
    flexDirection: "column",
  },
  dragger: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "move",
  },
}));

export interface FloatingType {
  type: string;
  id: string;
  top: number;
  left: number;
}

export const FloatBoxName = "floater"

const FloatingComponent = ({
  id,
  left,
  top,
  position,
  children,
  zIndexInc,
  onClose,
  onActivate,
  dragProps,
}: FloatComponentProps) => {
  const { classes } = useStyles();
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: FloatBoxName,
      item: { id, left, top, ...dragProps },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top],
  )

 /* useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])
*/
  if (isDragging) {
    return <div ref={drag} />
  }
  

  return (
      <Paper
        className={classes.draggable}
        withBorder
        p={"md"}
        pl={children ? 30 : "md"}
        radius={"0"}
        style={{
          opacity: isDragging ? 0.5 : undefined,
          left,
          top,
          zIndex: zIndexInc ? 1000 + zIndexInc : undefined,
        }}
        data-testid="box"
        onMouseDownCapture={onActivate || undefined}
        ref={drag}
      >
        <div className={classes.handle} >
          <ActionIcon onClick={onClose} title="Close">
            <IconX size={16} />
          </ActionIcon>
          <ActionIcon className={classes.dragger}>
            <IconDotsVertical size={16} />
          </ActionIcon>
        </div>
        <Stack>{children}</Stack>
      </Paper>
  );
};

export default FloatingComponent;

export interface BoxDragPreviewProps {
  title: string
}

export interface BoxDragPreviewState {
  tickTock: any
}

export const BoxDragPreview: FC<BoxDragPreviewProps> = memo(
  function BoxDragPreview({ title }) {
    return (
      <div >
        hello
      </div>
    )
  },
)
