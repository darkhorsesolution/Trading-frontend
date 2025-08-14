import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { assetsState, majors, minors } from "@/store/assets";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  clsx,
  createStyles,
  Flex,
  Group,
  ScrollArea,
  Select,
  Stack,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconGridDots,
  IconX,
} from "@tabler/icons";
import { Widgets } from "@/lib/WidgetRegister";
import { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";
import { settingsSelector } from "@/store/account";
import { ISettings } from "@/interfaces/account";
import Tab from "@/widgets/Tab";
import { IAsset } from "@/interfaces/IAsset";
import { useDrag, useDrop } from "react-dnd";
import type { Identifier } from "dnd-core";
import { emptyTick, quoteSelector } from "@/store/quotes";
import {
  IPriceTick,
  TimeInForce,
  TimeInForceString,
} from "@/interfaces/IOrder";
import TradingPanel from "./TradingPanel";
import { FloatBoxName } from "@/components/Layout/FloatingComponent";

const useStyles = createStyles((theme) => ({
  header: {
    width: "calc(100% - 10px)",
    background:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
  },
  panels: {
    minHeight: "200px",
    overflow: "auto",
    "&.hovered": {
      background:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.dark[1],
    },
  },
  advancedPanel: {
    gap: theme.spacing.sm,
  },
  cardTitle: {
    position: "relative",
    borderBottom: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.dark[1]
      }`,
    display: "flex",
    align: "center",
  },
  card: {
    alignItems: "center",
    width: "280px",
    "&.hovered": {
      background:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[3],
    },
    background:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[1],
  },
  priceGroup: {
    gap: 0,
  },
  draggable: {
    marginLeft: "auto",
    cursor: "grab",
  },
}));

interface PanelProps {
  index: number;
  symbol: string;
  expanded: boolean;
  timeInForce: TimeInForce;
}

interface PanelCbs {
  classes: Record<string, string>;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  hoverItem: (dragIndex: number, hoverIndex: number) => void;
  deleteItem: () => void;
  addNew: (symbol: string) => void;
  update: (props: PanelProps) => void;

  isHovered: boolean;
  assets: IAsset[];
  quote: IPriceTick;
  settings: ISettings;
}

type TradingPanelProps = IDockviewPanelProps<{
  panels: PanelProps[];
  customPanels: PanelProps[];
  group?: string;
}>;

const groups: { label: string; value: string; symbols: string[] }[] = [
  {
    label: "Majors",
    value: "majors",
    symbols: majors,
  },
  {
    label: "Minors",
    value: "minors",
    symbols: minors,
  },
  {
    label: "Exotics",
    value: "exotics",
    symbols: [], // filled in following useEffect
  },
  {
    label: "Custom",
    value: "custom",
    symbols: [],
  },
];

const TradingPanels = ({ api, params }: TradingPanelProps) => {
  const { classes } = useStyles();
  const [hoverIndex, setHoverIndex] = useState(-1);
  const { assets } = assetsState;
  const { quotes } = useSelector(quoteSelector);
  const symbols = assets.map((a) => a.symbol);
  const [selectSymbol, setSelectSymbol] = useState("");
  const settings = useSelector(settingsSelector);
  const [isOutsideHover, setOutsideHover] = useState(false);

  useEffect(() => {
    const all = assets.map(a => a.symbol)
    const majors = groups.find(g => g.value === "majors")!.symbols;
    const minors = groups.find(g => g.value === "minors")!.symbols;

    const excludeSet = new Set([...majors, ...minors]);
    console.log(all.filter(item => !excludeSet.has(item)))
    groups[2].symbols = all.filter(item => !excludeSet.has(item));
  }, [assets])

  const hoverItem = (dragIndex: number, hoverIndex: number) => {
    if (hoverIndex === dragIndex) {
      setHoverIndex(-1);
    } else {
      setHoverIndex(hoverIndex);
    }
  };

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    if (hoverIndex === dragIndex) {
      return;
    }

    let newPanels = [...params.panels];
    let removedElement = newPanels.splice(dragIndex, 1)[0];
    newPanels.splice(hoverIndex, 0, removedElement);
    newPanels = newPanels.map((p, index) => ({
      ...p,
      index,
    }));

    api.updateParameters({
      panels: newPanels,
      ...(params.group === "custom" ? { customPanels: newPanels } : {})
    });
    setHoverIndex(-1);
  };

  const addNew = (symbol: string) => {
    const newPanels = (params.panels || []).concat({
      index: (params.panels || []).reduce((acc, cur) => {
        return Math.max(acc, cur.index);
      }, 0) + 1,
      symbol,
      expanded: false,
      timeInForce: TimeInForce.GTC,
    })
    api.updateParameters({
      group: "custom",
      panels: newPanels,
      customPanels: newPanels
    });
    setSelectSymbol("");
  };

  const [{ handlerId }, drop] = useDrop<
    PanelProps,
    void,
    { handlerId: Identifier | null }
  >({
    accept: FloatBoxName,
    collect(monitor) {
      setOutsideHover(monitor.isOver());
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover: (item: PanelProps, monitor) => { },
    drop(item: PanelProps, monitor) {
      //addNew(item.symbol);
    },
  });

  return (
    <ScrollArea h={"100%"}>
      <Group
        style={{ position: "sticky", top: 0, zIndex: 100 }}
        p={"sm"}
        className={classes.header}
      >
        <Select
          size="xs"
          key={(params.panels || []).length}
          placeholder="Symbol"
          onChange={(e) => setSelectSymbol(e)}
          searchable
          data={symbols}
          rightSectionWidth={"auto"}
          rightSection={
            <Box>
              <Button
                size="xs"
                disabled={!selectSymbol}
                onClick={() => {
                  addNew(selectSymbol);
                }}
                style={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
              >
                Add
              </Button>
            </Box>
          }
        />
        {groups.map((g) => (
          <Button
            key={g.value}
            compact={true}
            variant={params.group === g.value ? "filled" : "default"}
            onClick={() => {
              const newPanels = g.value === "custom" ? (params.customPanels || []) : g.symbols
                .filter((symbol) => assets.find((a) => a.symbol === symbol))
                .map((symbol, index) => ({
                  index,
                  symbol,
                  expanded: false,
                  timeInForce: TimeInForce.GTC,
                }))
              api.updateParameters({
                group: g.value,
                panels: newPanels
              });
            }}
          >
            {g.label}
          </Button>
        ))}
      </Group>
      <Stack
        p={"sm"}
        ref={drop}
        className={clsx(classes.panels, isOutsideHover ? "hovered" : "")}
      >
        <Flex wrap={"wrap"} gap={"sm"}>
          {(params.panels || []).map((o, i) => (
            <Panel
              key={i}
              {...o}
              classes={classes}
              addNew={addNew}
              moveItem={moveItem}
              hoverItem={hoverItem}
              isHovered={hoverIndex === o.index}
              deleteItem={() => {
                const newPanels = [...params.panels];
                newPanels.splice(i, 1);
                api.updateParameters({
                  group: "custom",
                  panels: newPanels,
                  customPanels: newPanels,
                });
              }}
              update={(props: PanelProps) => {
                const newPanels = [...params.panels];
                let index = newPanels.findIndex((p) => p.index === props.index);
                newPanels[index] = {
                  ...newPanels[index],
                  ...props,
                };
                api.updateParameters({
                  panels: newPanels,
                  group: o.symbol !== props.symbol ? "custom" : params.group,
                });
              }}
              settings={settings}
              assets={assets}
              quote={quotes[o.symbol] || emptyTick}
            />
          ))}
        </Flex>
      </Stack>
    </ScrollArea>
  );
};

export const PanelDrag = "panel";

const Panel = ({
  index,
  symbol,
  expanded,
  timeInForce = TimeInForce.GTC,
  classes,
  moveItem,
  hoverItem,
  deleteItem,
  isHovered,
  update,
  assets,
  quote,
  settings,
  addNew,
}: PanelCbs & PanelProps) => {
  const [{ handlerId }, drop] = useDrop<
    PanelProps,
    void,
    { handlerId: Identifier | null }
  >({
    accept: PanelDrag,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover: (item: PanelProps, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;
      hoverItem(dragIndex, hoverIndex);
    },
    drop(item: PanelProps, monitor) {
      const dragIndex = item.index;
      const hoverIndex = index;
      if (item.symbol) {
        //addNew(item.symbol);
      }
      if (dragIndex === hoverIndex) {
        //  return;
      }

      hoverItem(-1, -1);
      moveItem(dragIndex, hoverIndex);
    },
  });

  const [{ isDragging, opacity }, drag, preview] = useDrag({
    type: PanelDrag,
    item: () => {
      return { index, symbol };
    },
    end() {
      hoverItem(-1, -1);
    },
    collect: (monitor: any) => {
      return { isDragging: monitor.isDragging(), opacity: 0.5 };
    },
  });

  return (
    <Card
      key={index}
      shadow="sm"
      padding="xs"
      radius="md"
      withBorder
      className={clsx(classes.card, isHovered ? "hovered" : "")}
      ref={(r) => {
        preview(r);
        drop(r);
      }}
    >
      <Card.Section
        p="xs"
        className={classes.cardTitle}
        data-handler-id={handlerId}
        style={{ gap: 5 }}
      >
        <Select
          placeholder="Symbol"
          value={symbol}
          searchable
          size="xs"
          w={100}
          data={assets.map((a) => a.symbol)}
          onChange={(symbol) => {
            update({
              index,
              symbol,
              expanded,
              timeInForce,
            });
          }}
        />
        <Select
          size="xs"
          value={timeInForce}
          onChange={(timeInForce: TimeInForce) => {
            update({
              index,
              symbol,
              expanded,
              timeInForce,
            });
          }}
          data={[
            { label: TimeInForceString[1], value: TimeInForce.GTC },
            { label: TimeInForceString[0], value: TimeInForce.DAY },
            { label: TimeInForceString[3], value: TimeInForce.IOC },
            { label: TimeInForceString[4], value: TimeInForce.FOK },
          ]}
          w={70}
        />
        <ActionIcon title={"Drag"} className={classes.draggable} ref={drag}>
          <IconGridDots size={16} />
        </ActionIcon>
        <ActionIcon
          title={"Toggle type"}
          onClick={() => {
            update({
              index,
              symbol,
              expanded: !expanded,
              timeInForce,
            });
          }}
        >
          {expanded ? (
            <IconChevronUp size={"16"} />
          ) : (
            <IconChevronDown size={"16"} />
          )}
        </ActionIcon>
        <ActionIcon onClick={deleteItem}>
          <IconX size="16" />
        </ActionIcon>
      </Card.Section>
      <TradingPanel
        asset={assets.find((a) => a.symbol === symbol)}
        quote={quote}
        settings={settings}
        defaults={{
          timeInForce,
        }}
        expanded={expanded}
      />
    </Card>
  );
};

Widgets.register(TradingPanels, "tradingpanels", {
  title: "Trading Panel",
  description: "DnD trading panels in one widget",
  tabComponent: (props: IDockviewPanelHeaderProps) => (
    <Tab {...props} withSetting={false} />
  ),
});

export default TradingPanels;
