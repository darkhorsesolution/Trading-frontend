import {
  DockviewApi,
  DockviewReadyEvent,
  IDockviewPanelHeaderProps,
  IDockviewPanelProps,
  PanelCollection,
  SerializedDockview,
} from "dockview";
import React, { useCallback, useEffect, useRef, useState } from "react";
import WidgetRegistry from "@/lib/WidgetRegister/lib/WidgetRegistry";
import {
  AppShell,
  ColorScheme,
  Flex,
  Group,
  Loader,
  MantineSize,
  Text,
  useMantineTheme,
} from "@mantine/core";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import {
  closePanel,
  currentWorkspaceSelector,
  FloatingComponentProps,
  FloatingTypes,
  IWorkspace,
  setFloatingTradePanel,
  updateWorkspaces,
  workspaceSelector,
} from "@/store/workspace";
import { useAppDispatch } from "@/pages/_app";
import Header from "@/components/Layout/Header";
import OrderCreate, {
  OrderCreateProps,
} from "@/components/Order/OrderCreatePanel";
import { setLayout } from "@/lib/layout";
import FloatingComponent, {
  FloatBoxName,
  FloatingType,
} from "./FloatingComponent";
import { useSelector } from "react-redux";
import Sidebar from "@/components/Sidebar/Sidebar";
import OrderPanel, { OrderPanelProps } from "../Order/Order";
import { Session } from "next-auth";
import DataServiceAgent from "../DataService/DataServiceAgent";
import AssetInfo, { AssetInfoProps } from "./AssetInfo";
import { XYCoord, useDrop } from "react-dnd";
import { useRouter } from "next/router";
import { Device, useDevice } from "@/services/UseDevice";
import { useLocalStorage } from "@mantine/hooks";
import Market from "@/widgets/Market/Market";
import TradePanel from "../Trade/TradePanel";
import Dockview from "./Dockview";
import Tab from "@/widgets/Tab";
import { PanelDrag } from "@/widgets";

type LayoutProps = {
  spacing?: string | number;
  session: Session;
};

export const headers: PanelCollection<IDockviewPanelHeaderProps> =
  Object.entries(WidgetRegistry.getInstance().getWidgets()).reduce(
    (acc, w) => {
      acc[w[0]] = w[1].getPanelProps(false).tabComponent;
      return acc;
    },
    {
      default: (props: IDockviewPanelHeaderProps) => {
        return (
          <Tab {...props} withSetting={false} text={<>{props.api.title}</>} />
        );
      },
    }
  );

const components: PanelCollection<IDockviewPanelProps> = Object.entries(
  WidgetRegistry.getInstance().getWidgets()
).reduce((acc, w) => {
  acc[w[0]] = w[1].get(false);
  return acc;
}, {});

const fixMissingComponents = (panels: Record<string, Record<string, any>>) => {
  for (const key of Object.keys(panels)) {
    if (!components[panels[key].contentComponent]) {
      console.log(`Replacing missing widget ${key} -> empty`);
      components[key] = components["empty"];
      panels[key].tabComponent = "default";
      panels[key].contentComponent = "empty";
    } else if (components[key] === components["empty"]) {
      panels[key].tabComponent = "default";
    }
  }
};

export interface ContainerState {
  boxes: { [key: string]: { top: number; left: number; title: string } };
}

const Layout = ({ spacing = "sm", session }: LayoutProps) => {
  const theme = useMantineTheme();
  const workspaceSwitcher = useRef<HTMLDivElement>();
  const sidebarRef = useRef<HTMLDivElement>();
  const marketRef = useRef<HTMLDivElement>();
  const statusBarRef = useRef<HTMLDivElement>();
  const dockviewContainer = useRef<HTMLDivElement>();
  const headerRef = useRef<HTMLDivElement>();
  const dispatch = useAppDispatch();
  const {
    currentWorkspaceId,
    workspaces,
    workspacesLoadedAt,
    floatingTradePanel,
    workspacesSyncing,
    symbolDragged,
  } = useSelector(workspaceSelector);
  const currentWorkspace = useSelector(currentWorkspaceSelector);
  const [api, setApi] = useState<DockviewApi>();
  const time = useRef(null);

  const router = useRouter();

  const onReady = (event: DockviewReadyEvent) => {
    event.api.onDidLayoutChange((e) => {
      dispatch(
        updateWorkspaces({
          value: event.api.toJSON(),
          error: undefined,
        })
      );
    });

    setApi(event.api);
    setLayout(event.api);
  };

  // time at the bottom
  // TODO use dedicated component
  useEffect(() => {
    setInterval(() => {
      if (time && time.current) {
        time.current.innerHTML = new Date().toLocaleString();
      }
    }, 500);
  }, []);

  // reload if workspace/container has changed
  useEffect(() => {
    if (workspacesLoadedAt === 0 || !dockviewContainer.current) {
      return;
    }

    let workspace = workspaces.find(
      (workspace) => workspace.id === currentWorkspaceId
    );

    if (api && workspace) {
      workspace = JSON.parse(JSON.stringify(workspace)) as IWorkspace;
      fixMissingComponents((workspace.value as any).panels);

      try {
        if (!workspace.error) {
          api.fromJSON(workspace.value as SerializedDockview);
        }
      } catch (e) {
        dispatch(
          updateWorkspaces({
            ...workspace,
            error: true,
            value: { grid: {}, panels: {} },
          })
        ).then(() => {
          window.location.reload();
        });
        return;
      }

      api.layout(
        dockviewContainer.current.clientWidth,
        dockviewContainer.current.clientHeight,
        true
      );
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    }
  }, [currentWorkspaceId, workspacesLoadedAt, dockviewContainer, api]);

  const layoutSizes = (space: MantineSize) => ({
    width:
      sidebarRef.current?.clientWidth -
      marketRef.current?.clientWidth -
      2 * parseFloat(space),
    height:
      workspaceSwitcher.current?.clientHeight +
      headerRef.current?.clientHeight +
      2 * parseFloat(space),
  });

  const [zIndexes, setZIndexes] = useState<{ [key: string]: number }>({});

  function lowerNumericValues(obj: { [key: string]: number }): {
    [key: string]: number;
  } {
    // Get the entries and sort them by values
    const sortedEntries = Object.entries(obj).sort((a, b) => a[1] - b[1]);

    // Map each key to its corresponding lowered value
    const loweredValues: { [key: string]: number } = {};
    sortedEntries.forEach(([key], index) => {
      loweredValues[key] = index;
    });

    return loweredValues;
  }

  const frontFloater = (key: string) => {
    let maxZIndex = Object.values(zIndexes).reduce(
      (acc, cur) => Math.max(acc, cur),
      0
    );

    // no change
    if (maxZIndex === zIndexes[key]) {
      return;
    }

    setZIndexes(lowerNumericValues({ ...zIndexes, [key]: maxZIndex + 10 }));
  };

  const device = useDevice();

  const [colorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });

  const [boxes, setBoxes] = useState<{
    [key: string]: {
      top: number;
      left: number;
    };
  }>({});

  const moveBox = useCallback(
    (id: string, left: number, top: number) => {
      setBoxes({ ...boxes, [id]: { left, top } });
    },
    [currentWorkspace]
  );

  const [, drop] = useDrop(
    () => ({
      accept: FloatBoxName,
      drop(item: FloatingType & { disabled?: boolean }, monitor) {
        if (item.disabled) {
          return undefined;
        }
        item.disabled = true;

        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
        if (!delta) {
          return undefined;
        }

        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);
        moveBox(item.id, left, top);

        return undefined;
      },
    }),
    [moveBox]
  );

  const [, dropOut] = useDrop(
    () => ({
      accept: PanelDrag,
      drop(item: { disabled?: boolean; symbol: string }, monitor) {
        if (item.disabled) {
          return undefined;
        }
        item.disabled = true;

        /* dispatch(
           upsertPanel({
             symbol: item.symbol,
             type: FloatingTypes.OrderCreate,
             position: monitor.getClientOffset(),
           } as FloatingComponentProps)
         );*/
        return undefined;
      },
    }),
    []
  );

  return (
    <AppShell
      className={colorScheme}
      padding={0}
      style={{
        maxHeight: "100vh",
        borderRadius: device === Device.Desktop ? theme.spacing.xs : 0,
        overflow: router.pathname === "/terminal" ? "hidden" : "auto",
      }}
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark" ? theme.black : theme.colors.gray[2],
          overflow: "hidden",
        },
      })}
    >
      <Flex
        direction={"column"}
        h={"100vh"}
        ref={(ref) => {
          dropOut(drop(ref));
        }}
      >
        <Header ref={headerRef} />
        {currentWorkspace?.floating?.map(
          (fProps: FloatingComponentProps<unknown>) => {
            const dragProps = {} as Record<string, unknown>;
            let panelContent: React.ReactNode = null;
            if (fProps.type === FloatingTypes.OrderPanel) {
              const tProps = fProps as FloatingComponentProps<OrderPanelProps>;
              panelContent = (
                <OrderPanel defaultSymbol={tProps.defaultSymbol} />
              );
            } else if (fProps.type === FloatingTypes.OrderCreate) {
              const tProps = fProps as FloatingComponentProps<OrderCreateProps>;
              panelContent = <OrderCreate {...tProps} />;
              dragProps.symbol = tProps.symbol;
            } else if (fProps.type === FloatingTypes.AssetInfo) {
              const tProps = fProps as FloatingComponentProps<AssetInfoProps>;
              panelContent = <AssetInfo {...tProps} />;
            }

            const box = boxes[fProps.index.toString()] || {
              left: fProps.position ? fProps.position.x : 500,
              top: fProps.position ? fProps.position.y : 500,
            };
            return (
              <FloatingComponent
                {...box}
                id={fProps.index.toString()}
                key={fProps.index.toString()}
                onClose={() => dispatch(closePanel(fProps.index))}
                zIndexInc={zIndexes[fProps.index.toString()]}
                dragProps={dragProps}
              >
                {panelContent}
              </FloatingComponent>
            );
          }
        )}
        {floatingTradePanel && (
          <FloatingComponent
            {...(boxes[floatingTradePanel.trade.id] || {
              left: 500,
              top: 500,
            })}
            id={floatingTradePanel.trade.id}
            onClose={() => dispatch(setFloatingTradePanel(null))}
            key={floatingTradePanel.trade.id}
            zIndexInc={zIndexes[floatingTradePanel.trade.id]}
          >
            <TradePanel
              {...floatingTradePanel}
              mobile={false}
              key={floatingTradePanel.trade.id}
            />
          </FloatingComponent>
        )}
        <Group
          w={"100wv"}
          spacing={spacing}
          px={spacing}
          sx={(theme) => ({
            flexDirection: "row",
            flexWrap: "nowrap",
            flex: 1,
            justifyItems: "start",
            alignItems: "start",
            overflow: "hidden",
            marginTop:
              headerRef.current?.clientHeight +
              3 * parseFloat(theme.spacing.xs),
          })}
        >
          <Group
            ref={marketRef}
            h={"100%"}
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.white,
            })}
          >
            <Market dndEnabled={true} />
          </Group>

          <Dockview
            dockviewContainer={dockviewContainer}
            layoutSizes={layoutSizes}
            workspace={currentWorkspace}
            onReady={onReady}
            components={components}
            headers={headers}
            symbolDragged={symbolDragged}
          />

          {/* Sidebar */}
          <Sidebar ref={sidebarRef} className={""} h={"100%"} />
        </Group>

        <Flex>
          <Group ref={workspaceSwitcher}>
            {!!workspacesLoadedAt && (
              <WorkspaceSwitcher api={api} spacing={spacing} />
            )}
          </Group>

          <Group
            spacing={"md"}
            position={"right"}
            py={"xs"}
            ml={"auto"}
            mr={"sm"}
            ref={statusBarRef}
          >
            <Text size={"sm"} ref={time}></Text>
            <Loader
              size={16}
              style={{
                visibility: workspacesSyncing ? "initial" : "hidden",
              }}
            />
            <DataServiceAgent session={session} render={true} />
          </Group>
        </Flex>
      </Flex>
    </AppShell>
  );
};

export default Layout;
