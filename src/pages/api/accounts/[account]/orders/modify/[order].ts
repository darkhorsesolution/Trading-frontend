import { NextApiRequest, NextApiResponse } from "next";
import { GetUserAccounts } from "@/interfaces/account";
import { ModifyOrder } from "@/services/TradeService";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import requestIp from "request-ip";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  const detectedIp = requestIp.getClientIp(req);
  const { account, order } = req.query;
  const { timestamp } = req.headers;
  const orderData = req.body;

  if (!GetUserAccounts(session.user).filter((acc) => acc === account)) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  let code: number = 500,
    data: any;
  try {
    [code, data] = await ModifyOrder(
      account as string,
      order as string,
      orderData,
      {
        timestamp: timestamp as string,
        ip: detectedIp,
        userID: session.user.id,
      }
    );
  } catch (e) {
    console.error(e);
    code = 500;
    data = {
      message: "Internal Server Error",
    };
  }
  res.status(code).json(data);
};
