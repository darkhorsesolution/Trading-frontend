import React from "react";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import Calendar from "@/components/Sidebar/Calendar";

interface CalendarPageProps {
  assets: IAsset[];
  session: Session;
}

const CalendarPage = ({ assets, session }: CalendarPageProps) => {
  return <Calendar />;
};

CalendarPage.auth = true;

CalendarPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <CalendarPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default CalendarPage;
