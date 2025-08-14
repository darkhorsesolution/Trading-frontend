import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { makeOTP } from "@/lib/2fa";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  const token = req.query.token as string;

  const totp = makeOTP(
    session.user.account,
    session.user.settings.twoFactorBase32
  );
  const delta = totp.validate({ token });

  res.status(200).json({ success: delta === 0 });
};
