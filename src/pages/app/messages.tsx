import React from "react";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import Messages from "@/components/Sidebar/Messages";

interface MessagesPageProps {
  assets: IAsset[];
  session: Session;
}

const MessagesPage = ({ assets, session }: MessagesPageProps) => {
  return <Messages />;
};

MessagesPage.auth = true;

MessagesPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <MessagesPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default MessagesPage;
