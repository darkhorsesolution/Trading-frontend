import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { IMessage } from "@/interfaces/IMessage";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  const { account } = req.query;

  const user = [session.user, ...(session.user.subUsers || [])].find(
    (user) => user.account === account
  );
  if (!user) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  const freshUserData = await prisma.user.findUnique({
    where: { account },
  });

  const results = (await prisma.message.findMany({
    where: {
      OR: [
        {
          userId: null,
        },
        {
          userId: user.id,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as IMessage[];

  if (results.length) {
    try {
      await prisma.user.update({
        where: {
          account,
        },
        data: {
          lastMessageSeen: results[0].createdAt,
        },
      });
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }

  results.forEach((m) => {
    if (m.createdAt > freshUserData.lastMessageSeen) {
      m.unseen = true;
    }
  });

  res.setHeader("Cache-Control", "s-maxage=60, must-revalidate");
  res.status(200).json(results);
};
