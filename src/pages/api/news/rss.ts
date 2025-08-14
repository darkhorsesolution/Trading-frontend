import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { getArticles } from "@/lib/fxstreet";
import { IArticle } from "@/interfaces/article";
import { HttpStatusCode } from "axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  let articles: IArticle[];
  let code: HttpStatusCode;

  try {
    articles = await getArticles(100);
    code = 200;
  } catch (e) {
    console.error(e);
    code = 400;
  }

  res.status(code).json(articles);
};
