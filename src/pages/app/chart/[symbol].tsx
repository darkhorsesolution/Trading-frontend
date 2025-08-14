import React, { useState } from "react";
import DynamicChart from "@/widgets/Charts";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import MarketRow from "@/widgets/Market/MarketRow";
import { useSearchParams } from "next/navigation";
import ChartPage from ".";

interface ChartPageProps {
  assets: IAsset[];
  session: Session;
}

const ChartSymbolPage = ({ assets, session }: ChartPageProps) => {
  const params = useSearchParams();
  return (
    <ChartPage
      assets={assets}
      session={session}
      symbol={params.get("symbol")}
    />
  );
};

ChartSymbolPage.auth = true;

ChartSymbolPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <ChartSymbolPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default ChartSymbolPage;
