import {
  FloatingComponentProps,
  FloatingTypes,
  IWorkspace,
  upsertPanel,
} from "@/store/workspace";
import {
  Box,
  Center,
  MantineSize,
  Overlay,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  DockviewDndOverlayEvent,
  DockviewReact,
  DockviewReadyEvent,
  IDockviewPanelHeaderProps,
  IDockviewPanelProps,
  PanelCollection,
} from "dockview";
import { useDrop } from "react-dnd";
import type { Identifier } from "dnd-core";
import { useAppDispatch } from "@/pages/_app";
import { DragItem, MarketRowDrag } from "@/widgets/Market/MarketRow";

export interface DockviewProps {
  dockviewContainer: React.MutableRefObject<HTMLDivElement>;
  layoutSizes: (space: MantineSize) => { width: number; height: number };
  workspace?: IWorkspace;
  onReady: (evt: DockviewReadyEvent) => void;
  headers: PanelCollection<IDockviewPanelHeaderProps>;
  components: PanelCollection<IDockviewPanelProps>;
  symbolDragged: boolean;
}

const Dockview = ({
  dockviewContainer,
  layoutSizes,
  workspace,
  onReady,
  headers,
  components,
  symbolDragged,
}: DockviewProps) => {
  const theme = useMantineTheme();
  const dispatch = useAppDispatch();

  const [, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: MarketRowDrag,
    drop(item: DragItem, monitor) {
      dispatch(
        upsertPanel({
          symbol: item.id,
          type: FloatingTypes.OrderCreate,
          position: monitor.getClientOffset(),
        } as FloatingComponentProps)
      );
    },
  });

  drop(dockviewContainer);

  return (
    <div
      style={{
        position: "relative",
        flexGrow: 2,
        width: `calc(100vw - ${layoutSizes(theme.spacing.sm).width})`,
        overflow: "hidden",
      }}
      ref={dockviewContainer}
    >
      {symbolDragged && (
        <Overlay opacity={0.8}>
          <Center h={"100%"}>Drop here to detach order panel</Center>
        </Overlay>
      )}
      <Box
        p={0}
        m={0}
        style={{
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
        sx={(theme) => ({
          height: `calc(100vh - ${layoutSizes(theme.spacing.sm).height}px)`,
        })}
      >
        {workspace && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              width: "100%",
              textAlign: "center",
            }}
          >
            {workspace.error && (
              <Text>
                There has been some changes in the layout and your workspace is
                no longer valid
              </Text>
            )}
            {workspace.value &&
              Object.keys((workspace.value as any).panels).length === 0 && (
                <Text>Try adding widgets from widgets menu</Text>
              )}
          </div>
        )}

        <DockviewReact
          components={components}
          tabComponents={headers}
          onReady={onReady}
          showDndOverlay={(event: DockviewDndOverlayEvent) => {
            return false;
          }}
        />
      </Box>
    </div>
  );
};

export default Dockview;
