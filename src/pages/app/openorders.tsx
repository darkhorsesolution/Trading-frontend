import React from "react";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import OpenOrders from "@/widgets/Tables/Positions/OpenOrders";

interface OpenOrdersPageProps {
  assets: IAsset[];
  session: Session;
}

const OpenOrdersPage = ({ assets, session }: OpenOrdersPageProps) => {
  return (
    <OpenOrders
      api={null}
      containerApi={null}
      params={{ settingsOpen: false }}
    />
  );
};

OpenOrdersPage.auth = true;

OpenOrdersPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <OpenOrdersPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default OpenOrdersPage;
