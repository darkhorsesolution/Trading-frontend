import React from "react";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import OrderPanel from "@/components/Order/Order";
import { useLocalStorage } from "@mantine/hooks";
import { Stack } from "@mantine/core";

interface ChartPageProps {
  assets: IAsset[];
  session: Session;
}

export const OrderPage = ({ assets, session }: ChartPageProps) => {
  const [symbol, setSymbol] = useLocalStorage<string>({
    key: "last-order-symbol",
    defaultValue: "EURUSD",
    getInitialValueInEffect: true,
  });

  return (
    <Stack h={"100%"} p={"md"}>
      <OrderPanel
        defaultSymbol={symbol}
        symbolChangeAction={setSymbol}
        mobile={true}
      />
    </Stack>
  );
};

OrderPage.auth = true;

OrderPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <OrderPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default OrderPage;
