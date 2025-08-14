import { NextApiRequest, NextApiResponse } from "next";
import { DeleteMessage } from "@/services/TradeService";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { IGenericResponse } from "@/utils/network";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  if (!session.user.admin) {
    res.status(400).json({ error: "access denied" });
    return;
  }

  const { message } = req.query;

  let code: number = 500,
    data: IGenericResponse,
    resp: Response;

  try {
    [code, data, resp] = await DeleteMessage(message as string);
  } catch (e) {
    console.error(e);
    data = {
      code,
      message: "Internal Server Error",
    };
  }

  res.status(code).json(data);
};
