import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { IGenericResponse } from "@/utils/network";
import { FindSubUserByAccount, ISettings } from "@/interfaces/account";
import { makeOTP } from "@/lib/2fa";

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

  const data = req.body as Partial<ISettings>;

  // not part of the db model
  delete data["silent"];

  if (data.twoFactorUrl === "true") {
    const totp = makeOTP(accountNumber);
    const otpauth_url = totp.toString();
    data.twoFactorUrl = otpauth_url;
    data.twoFactorBase32 = totp.secret.base32;
  } else if (data.twoFactorUrl !== undefined && !data.twoFactorUrl) {
    data.twoFactorUrl = "";
    data.twoFactorBase32 = "";
  }

  data.updatedAt = new Date();
  delete (data as any).id;
  delete (data as any).userId;

  try {
    const newData = await prisma.settings.update({
      where: {
        userId: user.id,
      },
      data,
    });
    res.json({ data: newData } as IGenericResponse);
  } catch (e) {
    res.status(500).json({ error: e });
  }
};
