import { NextApiRequest, NextApiResponse } from "next";
import { CreateMessage, UpdateMessage } from "@/services/TradeService";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { IGenericResponse } from "@/utils/network";
import { IMessage } from "@/interfaces/IMessage";

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

  let code: number = 500,
    data: IGenericResponse,
    resp: Response;

  const reqData = req.body as IMessage;

  if (reqData.id) {
    try {
      [code, data, resp] = await UpdateMessage(reqData);
    } catch (e) {
      console.error(e);
      data = {
        code,
        message: "Internal Server Error",
      };
    }
  } else {
    try {
      [code, data, resp] = await CreateMessage(reqData);
    } catch (e) {
      console.error(e);
      data = {
        code,
        message: "Internal Server Error",
      };
    }
  }

  res.status(code).json(data);
};
