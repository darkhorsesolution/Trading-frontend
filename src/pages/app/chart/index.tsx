import React, { useEffect, useState } from "react";
import DynamicChart from "@/widgets/Charts";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import MarketRow from "@/widgets/Market/MarketRow";
import { Accordion } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import LocalStorageService, {
  StorageKeys,
} from "@/services/LocalStorageService";

interface ChartPageProps {
  assets: IAsset[];
  session: Session;
  symbol?: string;
}

const ChartPage = ({ assets, session, symbol }: ChartPageProps) => {
  let activeSymbol: string;
  let setActiveSymbol: (symbol: string) => void;

  if (symbol) {
    [activeSymbol, setActiveSymbol] = useState(symbol);
    useEffect(() => {
      LocalStorageService.saveAppChartSymbol(activeSymbol);
    }, [activeSymbol]);
  } else {
    [activeSymbol, setActiveSymbol] = useLocalStorage<string>({
      key: StorageKeys.AppChartSymbol,
      getInitialValueInEffect: false,
      defaultValue: "EURUSD",
    });
  }

  return (
    <>
      <DynamicChart
        params={{
          symbol: activeSymbol || undefined,
        }}
        mobile={true}
        onSymbolChange={setActiveSymbol}
      />
      {activeSymbol && (
        <Accordion>
          <MarketRow
            key={activeSymbol}
            asset={assets.find((a) => a.symbol === activeSymbol)}
            index={0}
            priceSection={true}
            expanded={true}
          />
        </Accordion>
      )}
    </>
  );
};

ChartPage.auth = true;

ChartPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <ChartPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default ChartPage;
