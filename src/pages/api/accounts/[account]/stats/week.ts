import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { GetUserAccounts } from "@/interfaces/account";
import { HttpStatusCode } from "axios";
import dayjs from "dayjs";

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

  if (!GetUserAccounts(session.user).filter((acc) => acc === accountNumber)) {
    res.status(500).json({ error: "access denied" });
    return;
  }

  let code: HttpStatusCode = 500,
    data: any[];

  const currentDate = dayjs();
  const lastWeekDate = currentDate.subtract(7, "day");
  const midnight = lastWeekDate.startOf("day");

  try {
    data = await prisma.$queryRaw`
    SELECT DISTINCT ON (account, date_trunc('day', "time" AT TIME ZONE 'UTC' AT TIME ZONE 'EST'))
      account,
      "time" AT TIME ZONE 'UTC' AT TIME ZONE 'EST' AS "date",
      "time" as "utcTime",
      balance,
      "netEquity",
      "profitLoss",
      "openProfitLoss" 
    FROM account_snapshots
    WHERE account = ${accountNumber} AND "time" >= ${midnight.toDate()}
    ORDER BY
      account,
      date_trunc('day', "time" AT TIME ZONE 'UTC' AT TIME ZONE 'EST') DESC,
      "time" DESC;`;
    code = 200;
  } catch (e) {
    console.warn(e);
  }

  data.forEach((d) => (d["estTime"] = d["date"].toISOString().split("T")[0]));

  res.status(code).json(data);
};
