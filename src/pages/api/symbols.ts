import { NextApiRequest, NextApiResponse } from "next";
import { GetSymbols } from "@/services/TradeService";

export const config = {
  runtime: `edge`,
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const [code, symbols] = await GetSymbols();

  return new Response(JSON.stringify(symbols), {
    status: code,
    headers: {
      "content-type": "application/json",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=3600",
    },
  });
};
