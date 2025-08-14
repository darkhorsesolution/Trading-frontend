import React, { useEffect } from "react";
import { useAppDispatch } from "@/pages/_app";
import { setAssets } from "@/store/assets";
import "@/widgets";
import Layout from "@/components/Layout";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import { GetSymbols } from "@/services/TradeService";

import { Device, useDevice } from "@/services/UseDevice";
import { useRouter } from "next/router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CustomDragLayer } from "@/components/Layout/DragLayer";

interface ITerminalPageProps {
  assets: IAsset[];
  session: Session;
}

const TerminalPage = ({ session, assets }: ITerminalPageProps) => {
  const dispatch = useAppDispatch();
  const device = useDevice();
  const router = useRouter();

  useEffect(() => {
    if (device === Device.Mobile) {
      router.push("/app");
    }
  }, [device]);

  useEffect(() => {
    if (!assets) {
      return;
    }
    setAssets(assets);
  }, [assets]);

  if (device === Device.Mobile) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout session={session} />
    </DndProvider>
  );
};

TerminalPage.auth = true;

export async function getServerSideProps(context) {
  let assets: IAsset[];
  try {
    let code: number;
    [code, assets] = await GetSymbols();
  } catch (e) {
    console.error("[TerminalPage.getServerSideProps]", e);
    return {
      redirect: {
        destination: "/auth/signin?error=maintenance",
        permanent: false,
      },
    };
  }

  return {
    props: {
      assets,
    },
  };
}

export default TerminalPage;
