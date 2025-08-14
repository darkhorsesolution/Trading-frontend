import { NextApiRequest, NextApiResponse } from "next";
import { GetUserAccounts } from "@/interfaces/account";
import { GetAccountClosedPairedPositions } from "@/services/TradeService";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";

export const cofig = {
  runtime: "edge",
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  const { account } = req.query;

  if (!GetUserAccounts(session.user).filter((acc) => acc === account)) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  let code: number = 500,
    positions: any;
  try {
    [code, positions] = await GetAccountClosedPairedPositions(
      account as string
    );
  } catch (e) {
    console.error(e);
    positions = {
      message: "Internal Server Error",
    };
  }
  res.status(code).json(positions);
};
