import React from "react";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import Market from "@/widgets/Market/Market";
import { IAsset } from "@/interfaces/IAsset";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";

interface MarketPageProps {
  assets: IAsset[];
  session: Session;
}

const MarketPage = ({ session, assets }: MarketPageProps) => {
  return (
    <DndProvider backend={TouchBackend} options={{ delayTouchStart: 100 }}>
      <Market dndEnabled={true} />
    </DndProvider>
  );
};

MarketPage.auth = true;

MarketPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <MarketPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default MarketPage;
