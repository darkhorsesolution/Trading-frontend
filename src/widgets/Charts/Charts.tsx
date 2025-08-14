import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  ThemeName,
  widget,
} from "public/static/charting_library";
import { createRef, RefObject, useEffect, useState } from "react";
import Datafeed from "@/widgets/Charts/Datafeed";
import { useSelector } from "react-redux";
import { assetsState } from "@/store/assets";
import {
  useMantineColorScheme,
  createStyles,
  LoadingOverlay,
} from "@mantine/core";
import { IWidget } from "@/interfaces/IWidget";
import { quoteSelector } from "@/store/quotes";

export interface IChartWidgetProps extends IWidget {
  mobile?: boolean;
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
  interval?: ChartingLibraryWidgetOptions["interval"];
  datafeedUrl?: string;
  libraryPath?: ChartingLibraryWidgetOptions["library_path"];
  chartsStorageUrl?: ChartingLibraryWidgetOptions["charts_storage_url"];
  chartsStorageApiVersion?: ChartingLibraryWidgetOptions["charts_storage_api_version"];
  clientId?: ChartingLibraryWidgetOptions["client_id"];
  userId?: ChartingLibraryWidgetOptions["user_id"];
  fullscreen?: ChartingLibraryWidgetOptions["fullscreen"];
  autosize?: ChartingLibraryWidgetOptions["autosize"];
  studiesOverrides?: ChartingLibraryWidgetOptions["studies_overrides"];
  container?: ChartingLibraryWidgetOptions["container"];
}

const useStyles = createStyles((theme) => ({
  TVChartContainer: {
    visibility: "hidden",
    flex: 1,
    height: "100%",
    "&.active": {
      visibility: "visible",
    },
  },
}));

const mobileDefaultSettings = {
  disabled_features: [
    "use_localstorage_for_settings",
    "study_templates",
    "header_undo_redo",
    "left_toolbar",
    "control_bar",
  ],
  enabled_features: ["header_settings", "header_symbol_search"],
};

const defaultSettings = {
  disabled_features: ["use_localstorage_for_settings", "header_undo_redo"],
  enabled_features: ["header_settings", "header_symbol_search"],
};

function intervalToNice(res: ResolutionString) {
  switch (res) {
    case "1":
      return "1M";
    case "5":
      return "5M";
    case "15":
      return "15M";
    case "60":
      return "1H";
    case "240":
      return "4H";
    case "1D":
      return "1D";
    case "1W":
      return "1W";
    case "1M":
      return "1MN";
    default:
      return res;
  }
}

const Charts = (props: IChartWidgetProps) => {
  const { api, mobile, onSymbolChange, params } = props;
  const {
    symbol = "EURUSD",
    interval = "60",
    libraryPath = "/static/charting_library/",
    chartsStorageUrl = "/api/charts",
    chartsStorageApiVersion = "1.1",
    clientId = "spotex",
    userId = props.userId || "public_user_id",
    fullscreen = false,
    autosize = true,
    studiesOverrides = {},
  } = params;

  const [active, setActive] = useState(false);
  const { classes } = useStyles();
  const ref: RefObject<HTMLDivElement> = createRef();
  const { colorScheme } = useMantineColorScheme();
  const { assets } = assetsState;
  const { quotes } = useSelector(quoteSelector);
  const [datafeed] = useState<Datafeed>(new Datafeed(assets));

  for (const symbol in quotes) {
    const quote = quotes[symbol];
    datafeed.onNewTick(quote);
  }

  let tvWidget: IChartingLibraryWidget;

  function updateTitle() {
    // break event loop, changes might not be available yet
    setTimeout(() => {
      const config = tvWidget.symbolInterval();

      const symbol = config.symbol.replace("SPOTEX:", "");

      if (onSymbolChange) {
        onSymbolChange(symbol);
      }

      if (api) {
        api.updateParameters({
          title: `${symbol} - ${intervalToNice(config.interval)}`,
          symbol: symbol,
          interval: config.interval,
        });
      }
    });
  }

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") {
      return;
    }

    const widgetSettings = {
      ...(mobile ? mobileDefaultSettings : defaultSettings),
      symbol: symbol as string,
      datafeed: datafeed,
      interval: interval as ChartingLibraryWidgetOptions["interval"],
      container: ref.current,
      library_path: libraryPath as string,
      theme: colorScheme as ThemeName,
      locale: "en",
      charts_storage_url: chartsStorageUrl,
      charts_storage_api_version: chartsStorageApiVersion,
      client_id: clientId,
      user_id: userId,
      fullscreen: fullscreen,
      debug: false,
      autosize: autosize,
      studies_overrides: studiesOverrides,
      custom_css_url: "/static/custom-chart-style.css",
    } as ChartingLibraryWidgetOptions;

    tvWidget = new widget(widgetSettings);

    tvWidget.onChartReady(() => {
      setActive(true);
      updateTitle();
    });

    tvWidget.subscribe("series_properties_changed", updateTitle);
  }, [window, colorScheme]);

  useEffect(() => {
    return () => {
      tvWidget.remove();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        height: "100%",
      }}
    >
      <LoadingOverlay visible={!active} overlayBlur={2} zIndex={100} />
      <div
        ref={ref}
        className={classes.TVChartContainer + (active ? " active" : "")}
      ></div>
    </div>
  );
};

export default Charts;
