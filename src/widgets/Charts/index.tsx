import { Widgets } from "@/lib/WidgetRegister";
import dynamic from "next/dynamic";
import { IChartWidgetProps } from "@/widgets/Charts/Charts";
import { IDockviewPanelHeaderProps } from "dockview";
import { useEffect, useState } from "react";
import Tab from "../Tab";
import { useSession } from "next-auth/react";

const TradingCharts = dynamic(
  () => import("./Charts").then((mod) => mod.default),
  { ssr: false }
);

// TODO - all this logic is to handle refresh (mount+unmount) of the dynamically loaded Chart component.
// Its logic does not allow to reload chart when moving around in workspace (it loads, just in some unknown closure...)
const DynamicChart = (props?: IChartWidgetProps) => {
  const [visible, setVisible] = useState(props.api?.isVisible);
  const [visibleCtr, setVisibleCtr] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (!props.api) {
      return;
    }
    props.api.onDidVisibilityChange((newStatus) => {
      setVisible(newStatus && newStatus.isVisible);
      if (newStatus) {
        if (visible !== newStatus.isVisible) {
          setVisibleCtr(Math.random());
        }
      }
    });
  }, []);
  if (props.api && !visible) {
    return null;
  }
  return <TradingCharts {...props} key={`${visible}-${visibleCtr}`} userId={session.user.id}/>;
};

Widgets.register(DynamicChart, "trading_charts", {
  closable: true,
  title: "Charts",
  description:
    "The charts module in a trading platform provides graphical representation of market data, allowing traders to analyze price trends and make informed trading decisions.",
  tabComponent: (props: IDockviewPanelHeaderProps) => (
    <Tab {...props} withSetting={false} text={props.params.title} />
  ),
});

export default DynamicChart;
