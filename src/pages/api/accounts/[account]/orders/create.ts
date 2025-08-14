import { NextApiRequest, NextApiResponse } from "next";
import { GetUserAccounts } from "@/interfaces/account";
import { CreateOrder } from "@/services/TradeService";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { IGenericResponse } from "@/utils/network";
import requestIp from "request-ip";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  const detectedIp = requestIp.getClientIp(req);
  const { account } = req.query;
  const { timestamp } = req.headers;

  if (!GetUserAccounts(session.user).filter((acc) => acc === account)) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  let code: number = 500,
    data: IGenericResponse,
    resp: Response;
  try {
    [code, data, resp] = await CreateOrder(req.body, account as string, {
      timestamp: timestamp as string,
      ip: detectedIp,
      userID: session.user.id,
    });
  } catch (e) {
    console.error(e);
    data = {
      code,
      message: "Internal Server Error",
    };
  }
  res.status(code).json(data);
};
