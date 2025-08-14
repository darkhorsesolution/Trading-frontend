import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { FindSubUserByAccount } from "@/interfaces/account";
import { getSettingsByUserId } from "@/services/UserService";

export const cofig = {
  runtime: "edge",
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  const accountNumber = req.query.account as string;
  const user = FindSubUserByAccount(session.user, accountNumber);
  if (!user) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  try {
    const settings = await getSettingsByUserId(user.id);
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e });
  }
};
