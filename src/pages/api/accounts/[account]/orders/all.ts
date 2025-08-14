import { NextApiRequest, NextApiResponse } from "next";
import { GetUserAccounts } from "@/interfaces/account";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";

const perPage = 99999;

export const cofig = {
  runtime: "edge",
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  const page = parseInt(req.query["page"] ? req.query["page"][0] : "1");
  const { account } = req.query;

  if (!GetUserAccounts(session.user).filter((acc) => acc === account)) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  const where = { account: account as string };

  const total = await prisma.order.count({
    where,
  });

  const results = await prisma.order.findMany({
    skip: perPage * (page - 1),
    take: perPage,
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    page: page,
    per_page: perPage,
    total: total,
    total_pages: Math.round(total / perPage),
    data: results || [],
  });
};
