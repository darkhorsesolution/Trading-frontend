import React from "react";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import OrderPanel from "@/components/Order/Order";
import { useRouter } from "next/router";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import { Stack } from "@mantine/core";

interface ChartPageProps {
  assets: IAsset[];
  session: Session;
}

export const OrderPageSymbol = ({ assets, session }: ChartPageProps) => {
  const router = useRouter();
  const { symbol } = router.query;

  return (
    <Stack h={"100%"} p={"md"}>
      <OrderPanel defaultSymbol={symbol as string} />
    </Stack>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

OrderPageSymbol.auth = true;

OrderPageSymbol.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <OrderPageSymbol {...props} />
    </MobileLayout>
  );
};

export default OrderPageSymbol;
