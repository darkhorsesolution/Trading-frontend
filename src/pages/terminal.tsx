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

// Remove NextAuth requirement - we use WebSocket auth now
// TerminalPage.auth = true;

export async function getServerSideProps(context) {
  // Since we're using WebSocket for data, provide default assets
  const defaultAssets: IAsset[] = [
    { symbol: 'EUR/USD', description: 'Euro vs US Dollar', digits: 5 },
    { symbol: 'USD/JPY', description: 'US Dollar vs Japanese Yen', digits: 3 },
    { symbol: 'GBP/USD', description: 'British Pound vs US Dollar', digits: 5 },
    { symbol: 'USD/CHF', description: 'US Dollar vs Swiss Franc', digits: 5 },
    { symbol: 'AUD/USD', description: 'Australian Dollar vs US Dollar', digits: 5 },
    { symbol: 'USD/CAD', description: 'US Dollar vs Canadian Dollar', digits: 5 },
    { symbol: 'NZD/USD', description: 'New Zealand Dollar vs US Dollar', digits: 5 },
    { symbol: 'EUR/GBP', description: 'Euro vs British Pound', digits: 5 },
    { symbol: 'EUR/JPY', description: 'Euro vs Japanese Yen', digits: 3 },
    { symbol: 'GBP/JPY', description: 'British Pound vs Japanese Yen', digits: 3 },
  ];

  let assets: IAsset[] = defaultAssets;
  
  try {
    // Try to get symbols from REST API, but don't fail if it doesn't work
    let code: number;
    let fetchedAssets: any;
    [code, fetchedAssets] = await GetSymbols();
    if (fetchedAssets && Array.isArray(fetchedAssets) && fetchedAssets.length > 0) {
      assets = fetchedAssets;
    }
  } catch (e) {
    console.warn("[TerminalPage.getServerSideProps] Using default assets, REST API unavailable:", e.message);
    // Keep using default assets - don't redirect to maintenance error
  }

  return {
    props: {
      assets,
    },
  };
}

export default TerminalPage;