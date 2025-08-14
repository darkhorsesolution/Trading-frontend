import React from "react";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import NewsFeed from "@/components/Sidebar/NewsFeed";

interface NewsPageProps {
  assets: IAsset[];
  session: Session;
}

const NewsPage = ({ assets, session }: NewsPageProps) => {
  return <NewsFeed />;
};

NewsPage.auth = true;

NewsPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <NewsPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default NewsPage;
