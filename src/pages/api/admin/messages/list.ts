import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

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

  res.setHeader("Cache-Control", "s-maxage=60, must-revalidate");

  const results = await prisma.message.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json(results || []);
};
