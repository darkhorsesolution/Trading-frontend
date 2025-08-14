import { NextApiRequest, NextApiResponse } from "next";
import { GetUserAccounts } from "@/interfaces/account";
import { ModifyPosition } from "@/services/TradeService";
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

  const detectedIp = requestIp.getClientIp(req);
  const { account, position } = req.query;
  const { stopLoss, takeProfit } = req.body;
  const { timestamp } = req.headers;

  if (!GetUserAccounts(session.user).filter((acc) => acc === account)) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  let response: any;
  try {
    response = await ModifyPosition(
      position as string,
      account as string,
      takeProfit as string,
      stopLoss as string,
      {
        timestamp: timestamp as string,
        ip: detectedIp,
        userID: session.user.id,
      }
    );
  } catch (e) {
    console.error(e);
    response = {
      message: "Internal Server Error",
    };
  }
  res.json(response);
};
