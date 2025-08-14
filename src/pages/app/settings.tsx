import React from "react";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import Settings from "@/components/Settings/Settings";
import { defaultGetServerSideProps } from "@/utils/serverSide";

interface SettingsPageProps {
  assets: IAsset[];
  session: Session;
}

const SettingsPage = ({ assets, session }: SettingsPageProps) => {
  return <Settings session={session} />;
};

SettingsPage.auth = true;

SettingsPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <SettingsPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default SettingsPage;
