import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { assetsState } from "@/store/assets";
import {
  Accordion,
  ActionIcon,
  createStyles,
  Group,
  Kbd,
  Menu,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconArrowsDoubleNeSw,
  IconChartLine,
  IconDots,
  IconFileInfo,
  IconStar,
  IconUserMinus,
} from "@tabler/icons";
import { useAppDispatch } from "@/pages/_app";
import { FloatingTypes, newChart, upsertPanel } from "@/store/workspace";
import { Widgets } from "@/lib/WidgetRegister";
import { IDockviewPanelHeaderProps } from "dockview";
import { useHotkeys } from "@mantine/hooks";
import { settingsSelector, updateSettings } from "@/store/account";
import { classNames } from "@/utils/css";
import { Device, useDevice } from "@/services/UseDevice";
import { useRouter } from "next/router";
import { IWatchedAsset } from "@/interfaces/account";
import { AssetGroups } from "@/widgets/Market/AssetGroups";
import Tab from "@/widgets/Tab";
import { setCreateOrder } from "@/store/orders";
import MarketRow, { HoverType } from "@/widgets/Market/MarketRow";
import { IAsset } from "@/interfaces/IAsset";

const useStyles = createStyles((theme) => ({
  search: {
    "input:focus, input:focus-within": {
      outline: "none",
    },
  },
  scrollArea: {
    flex: 1,
    ".mantine-ScrollArea-viewport": {
      height: "100%",
      "&>div": {
        height: "100%",
      },
    },
  },
  accordion: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    svg: {
      filter: "url(filter.svg#grayscale)",
      WebkitFilter: "grayscale(1)",
    },
    "&.shrink": {
      ".mantine-Accordion-panel": {
        display: "none"
      },
      ".mantine-Accordion-chevron, .mantine-Accordion-label": {
        display: "none",
      },
      ".mantine-Accordion-icon": {
        margin: 0,
      },
      ".mantine-Accordion-control": {
        padding: 0
      },
      ".mantine-Accordion-item": {
        border: 0
      }
    }
  },
  item: {
    position: "relative",
    transition: "transform 50ms ease",

    "&[data-active]": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      boxShadow: theme.shadows.md,
    },
  },
  control: {
    minHeight: 30,
  },
}));

const accordionStyles = createStyles((theme) => ({
  content: {
    padding: 0,
  },
}));

export type MarketProps = {
  dndEnabled?: boolean;
  onClick?: (string) => void;
};

type IndexedAsset = IAsset & {
  index: number;
};

const prepareAssets = (
  watchedAssets: IWatchedAsset[],
  allAssets: IAsset[]
): IndexedAsset[] => {
  let newWatched = (watchedAssets || []).map((wa) => ({
    ...allAssets.find((a) => a.symbol === wa.symbol),
    index: wa.index,
  }));

  if (newWatched.length > 1) {
    newWatched = newWatched.sort((a, b) => (a.index > b.index ? 1 : -1));
  }

  return newWatched;
};

const Market = ({ dndEnabled }: MarketProps) => {
  const dispatch = useAppDispatch();
  useHotkeys([
    [
      "mod+A",
      () => {
        if (inputRef && inputRef.current) inputRef.current.focus();
      },
    ],
  ]);

  const { classes } = useStyles();
  const { classes: accStyles } = accordionStyles();
  const settings = useSelector(settingsSelector);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [dragIndex, setDragIndex] = useState(-1);
  const [expanded, _setExpanded] = useState<any>(
    AssetGroups.reduce(
      (result, item) => {
        result[item.label] = [];
        return result;
      },
      {
        watchlist: [],
      }
    )
  );

  const { assets } = assetsState;
  const [searchFilter, setSearchFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>();
  const device = useDevice();
  const router = useRouter();
  const [debounceUpdate, setDebounceUpdate] = useState(null);
  const [watchedAssets, setWatchedAssets] = useState<IndexedAsset[]>(
    prepareAssets(settings ? settings.watchedAssets : [], assets)
  );
  const [updatesEnabled, setUpdatesEnabled] = useState(false);

  // debounced api call to store watched assets
  useEffect(() => {
    if (!watchedAssets || !updatesEnabled) {
      return;
    }

    const update = watchedAssets.map((a) => ({
      symbol: a.symbol,
      index: a.index,
    }));

    if (JSON.stringify(update) === JSON.stringify(settings.watchedAssets)) {
      return;
    }

    clearTimeout(debounceUpdate);
    setDebounceUpdate(
      setTimeout(() => {
        dispatch(
          updateSettings({
            ...settings,
            watchedAssets: update,
            silent: true,
          })
        );
      }, 1000)
    );

    return () => {
      clearTimeout(debounceUpdate);
    };
  }, [watchedAssets]);

  useEffect(() => {
    setWatchedAssets(
      prepareAssets(settings ? settings.watchedAssets : [], assets)
    );
  }, [settings]);

  const filteredWatchedAssets = searchFilter
    ? watchedAssets.filter((a) => a.symbol.includes(searchFilter.toUpperCase()))
    : watchedAssets;

  const onWatchlist = (symbol: string) => {
    let newSettings;
    if (!watchedAssets.find((a) => a.symbol === symbol)) {
      newSettings = { ...settings };
      newSettings.watchedAssets = [
        ...newSettings.watchedAssets,
        {
          symbol,
          index: settings.watchedAssets.length
            ? Math.max(...settings.watchedAssets.map((o) => o.index)) + 1
            : 0,
        },
      ];
    } else {
      newSettings = {
        ...settings,
        watchedAssets: settings.watchedAssets.filter(
          (wa) => wa.symbol !== symbol
        ),
      };
    }
    dispatch(updateSettings(newSettings));
  };

  const onHover = (dragIndex: number, hoverIndex: number) => {
    setHoverIndex(hoverIndex);
    setDragIndex(dragIndex);
  };

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const newWatchedAssets = JSON.parse(
      JSON.stringify(watchedAssets)
    ) as IndexedAsset[];
    const dragAssetIndex = newWatchedAssets.findIndex(
      (a) => a.index === dragIndex
    );
    const dragAsset = newWatchedAssets[dragAssetIndex];
    const hoverAssetIndex = newWatchedAssets.findIndex(
      (a) => a.index === hoverIndex
    );

    newWatchedAssets.splice(dragAssetIndex, 1);
    newWatchedAssets.splice(hoverAssetIndex, 0, dragAsset);

    for (const index in newWatchedAssets) {
      newWatchedAssets[index].index = parseInt(index);
    }

    setHoverIndex(-1);
    setDragIndex(-1);
    setUpdatesEnabled(true);
    setWatchedAssets(newWatchedAssets as IndexedAsset[]);
  };

  const onOpenChart = (symbol: string) => {
    if (device === Device.Mobile) {
      router.push(`/app/chart/${symbol}`);
    } else dispatch(newChart({ symbol }));
  };

  const onDetach = (symbol: string) => {
    if (device === Device.Mobile) {
      router.push(`/app/chart/${symbol}`);
    } else
      dispatch(
        upsertPanel({
          symbol,
          type: FloatingTypes.OrderCreate,
        })
      );
  };

  const onInfo = (symbol: string) => {
    dispatch(
      upsertPanel({
        symbol,
        type: FloatingTypes.AssetInfo,
      })
    );
  };

  const sideMenu = (asset: IAsset, isAdded: boolean, toggle: boolean) => (
    <>
      {toggle && (
        <ActionIcon mr={"xs"} onClick={() => onWatchlist(asset.symbol)}>
          <IconStar size={12} fill={isAdded ? "white" : undefined} />
        </ActionIcon>
      )}
      <Menu position="left">
        <Menu.Target>
          <ActionIcon variant={"subtle"}>
            <IconDots size={14} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            icon={<IconUserMinus size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onWatchlist(asset.symbol);
            }}
          >
            {isAdded ? "Remove" : "Add"}
          </Menu.Item>
          <Menu.Item
            icon={<IconChartLine size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onOpenChart(asset.symbol);
            }}
          >
            Chart
          </Menu.Item>
          {device !== Device.Mobile && (
            <Menu.Item
              icon={<IconArrowsDoubleNeSw size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onDetach(asset.symbol);
              }}
            >
              Order Panel
            </Menu.Item>
          )}
          <Menu.Item
            icon={<IconArrowsDoubleNeSw size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setCreateOrder(asset.symbol));
            }}
          >
            Order
          </Menu.Item>
          <Menu.Item
            icon={<IconFileInfo size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onInfo(asset.symbol);
            }}
          >
            Info
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );

  const isExpanded = (section: string) => expanded[section];
  const setExpanded = (section: string, values: string[]) =>
    _setExpanded({
      ...expanded,
      [section]: values,
    });
  const isItemExpanded = (section: string, key: string) =>
    isExpanded(section).indexOf(key) !== -1;

  const [rootAccordeon, setRootAccordeon] = useState(["watchlist"]);

  const filterDisabledGroups = ({ value }) => {
    return settings && settings[`${value}Assets`];
  };

  const accExpanded =
    device !== Device.Mobile ? rootAccordeon.length > 0 : true;

  return device === Device.NotSet ? null : (
    <Stack
      style={{
        height: "100%",
        width: accExpanded ? (device === Device.Mobile ? "100%" : 380) : undefined,
      }}
    >
      <ScrollArea className={classes.scrollArea}>
        <Accordion
          className={classNames(classes.accordion, accExpanded ? undefined : "shrink")}
          classNames={accStyles}
          multiple={true}
          onChange={setRootAccordeon}
          value={rootAccordeon}
          chevron={accExpanded ? undefined : null}
        >
          <Accordion.Item value={"watchlist"} style={{ marginBottom: "auto" }}>
            <Accordion.Control title={"Watchlist"} icon={accExpanded ? <IconStar /> : <ActionIcon size={50} component="span"><IconStar /></ActionIcon>}>
              <Group>
                {accExpanded && (
                  <>
                    <Text weight={"bold"}>Watchlist</Text>
                    <Text weight={"bold"}>
                      ({filteredWatchedAssets.length})
                    </Text>
                  </>
                )}
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Accordion
                px={"sm"}
                multiple={true}
                value={isExpanded("watchlist")}
                onChange={(vals) => setExpanded("watchlist", vals)}
                chevron={undefined}
                py={0}
              >
                {filteredWatchedAssets.map((asset, index) => {
                  return (
                    <MarketRow
                      moveCard={dndEnabled ? moveItem : undefined}
                      hoverCard={onHover}
                      key={asset.name}
                      asset={asset}
                      priceSection={true}
                      expanded={isItemExpanded("watchlist", asset.symbol)}
                      index={index} /* was asset.index */
                      hovered={
                        index !== hoverIndex
                          ? undefined
                          : dragIndex > hoverIndex
                          ? HoverType.Up
                          : HoverType.Down
                      }
                      last={filteredWatchedAssets.length === index + 1}
                      device={device}
                    >
                      {sideMenu(asset, true, false)}
                    </MarketRow>
                  );
                })}
              </Accordion>
            </Accordion.Panel>
          </Accordion.Item>
          {AssetGroups.filter(filterDisabledGroups).map((grp) => {
            const assetGroup = assets.filter((a) => a.category === grp.value);
            const filtered = assetGroup.filter(
              (a) =>
                a.symbol.toLowerCase().indexOf(searchFilter.toLowerCase()) !==
                -1
            );

            return (
              <Accordion.Item key={grp.value} value={grp.value}>
                <Accordion.Control title={grp.label} icon={accExpanded ? grp.icon : <ActionIcon size={50} component="span">{grp.icon}</ActionIcon>} chevron={null}>
                  <Group>
                    {accExpanded && <Text weight={"bold"}>{grp.label}</Text>}
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Accordion
                    multiple={true}
                    value={isExpanded(grp.label)}
                    onChange={(vals) => setExpanded(grp.label, vals)}
                    chevron={undefined}
                    classNames={classes}
                    px={"sm"}
                  >
                    {!assetGroup.length && <Text>&nbsp;</Text>}
                    {filtered.map((asset, index) => {
                      const isAdded = !!watchedAssets.find(
                        (a) => a.symbol === asset.symbol
                      );
                      return (
                        <MarketRow
                          key={asset.name}
                          asset={asset}
                          index={index}
                          expanded={isItemExpanded(grp.label, asset.symbol)}
                          device={device}
                        >
                          {sideMenu(asset, isAdded, true)}
                        </MarketRow>
                      );
                    })}
                  </Accordion>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </ScrollArea>
    </Stack>
  );
};

Widgets.register(Market, "market", {
  title: "Market",
  description:
    "List of all favorite  financial instruments with their most recent market prices",
  tabComponent: (props: IDockviewPanelHeaderProps) => (
    <Tab {...props} withSetting={false} />
  ),
});

export default Market;
