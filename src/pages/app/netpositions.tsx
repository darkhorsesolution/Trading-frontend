import React from "react";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import NetPositions from "@/widgets/Tables/Positions/NetPositions";

interface NetPositionsPageProps {
  assets: IAsset[];
  session: Session;
}

const NetPositionsPage = ({ assets, session }: NetPositionsPageProps) => {
  return (
    <NetPositions
      api={null}
      containerApi={null}
      params={{ settingsOpen: false }}
    />
  );
};

NetPositionsPage.auth = true;

NetPositionsPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <NetPositionsPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default NetPositionsPage;
