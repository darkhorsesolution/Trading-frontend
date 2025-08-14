import { NextApiRequest, NextApiResponse } from "next";
import { GetCandles } from "@/services/TradeService";
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const resolution = searchParams.get("resolution");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const [code, data] = await GetCandles(
    symbol,
    resolution,
    parseInt(from),
    parseInt(to)
  );
  return NextResponse.json(data);
};
