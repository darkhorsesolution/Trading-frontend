import { NextApiRequest, NextApiResponse } from "next";
import { GetUserAccounts } from "@/interfaces/account";
import { CloseNetPosition } from "@/services/TradeService";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import requestIp from "request-ip";

export const cofig = {
  runtime: "edge",
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  const { account, symbol } = req.query;
  const { timestamp } = req.headers;
  const detectedIp = requestIp.getClientIp(req);

  if (!GetUserAccounts(session.user).filter((acc) => acc === account)) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  let code: number = 500,
    data: any;
  try {
    [code, data] = await CloseNetPosition(symbol as string, account as string, {
      timestamp: timestamp as string,
      ip: detectedIp,
    });
  } catch (e) {
    console.error(e);
    data = {
      message: "Internal Server Error",
    };
  }
  res.status(code).json(data);
};
