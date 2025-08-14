import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { GetUserAccounts } from "@/interfaces/account";

const PER_PAGE = 999;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  const { account, page, system, search, from, to, paginate } = req.query;
  const currentPage = parseInt((page as string) || "1");

  if (!GetUserAccounts(session.user).filter((acc) => acc === account)) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  const where = {
    admin: true,
  };

  if (!system) {
    where["account"] = {
      not: null,
    };
  } else {
    where["account"] = null;
  }

  if (search) {
    where["OR"] = [
      {
        message: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        group: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        account: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (from && to) {
    where["createdAt"] = {
      lte: to,
      gte: from,
    };
  }

  res.setHeader("Cache-Control", "s-maxage=60, must-revalidate");

  if (paginate) {
    const total = await prisma.log.count({
      where,
    });

    const results = await prisma.log.findMany({
      skip: PER_PAGE * (currentPage - 1),
      take: PER_PAGE,
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      page: currentPage,
      perPage: PER_PAGE,
      total: total,
      totalPages: Math.round(total / PER_PAGE),
      data: results || [],
    });
  } else {
    const results = await prisma.log.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      data: results || [],
    });
  }
};
