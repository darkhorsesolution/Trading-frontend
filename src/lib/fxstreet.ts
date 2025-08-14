import slugify from "slugify";
import xml2js from "xml2js";

import prisma from "@/lib/prisma";
import { IOriginalArticle, IArticle } from "@/interfaces/article";
import dayjs from "dayjs";

function transformToArticleModel(inputObj: IOriginalArticle): IArticle {
  return {
    id: inputObj.guid._,
    pubDate: inputObj.pubDate,
    createdAt: dayjs(inputObj.pubDate).toDate(),
    title: inputObj.title,
    slug: slugify(inputObj.title, {
      lower: true,
      strict: true,
    }),
    description: inputObj.description.replace(/<a[^>]*>(.*?)<\/a>/g, ""),
    link: inputObj.link,
    pair: inputObj["fxstnewsns:pair"],
    provider: inputObj["fxstnewsns:provider"],
    market: inputObj["fxstnewsns:market"] || "",
    headline: inputObj["fxstnewsns:headline"] === "true",
    summary: inputObj["fxstnewsns:summary"],
  };
}

async function fetchXMLAndConvertToJson(url: string) {
  // Fetch XML data from the URL
  const response = await fetch(url);
  const xmlData = await response.text();

  // Parse XML to JSON
  const parser = new xml2js.Parser({ explicitArray: false });
  const jsonData = await parser.parseStringPromise(xmlData);

  // Extract items from the parsed JSON
  return jsonData.rss.channel.item;
}

async function getFeed() {
  try {
    const url = process.env.NEWS_FEED || "";
    return await fetchXMLAndConvertToJson(url);
  } catch (error) {
    throw new Error("something went wrong");
  }
}

export async function getArticles(
  limit = 20,
  start = 0,
  pair = ""
): Promise<IArticle[]> {
  let filterCondition = {};

  if (pair) {
    filterCondition = {
      pair: pair,
    };
  }

  return prisma.article.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: filterCondition,
    take: limit,
    skip: start,
  });
}

async function downloadAndCacheFeed() {
  const items = await getFeed();
  const itemsToSave = items.map((item: IOriginalArticle) =>
    transformToArticleModel(item)
  );

  await Promise.all(
    itemsToSave.map((item: IArticle) =>
      prisma.article.upsert({
        where: { id: item.id }, // assuming 'id' is the unique identifier
        update: item, // update if the article with this ID exists
        create: item, // create a new article if it doesn't
      })
    )
  );

  return itemsToSave.map((item: IArticle) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));
}

export { downloadAndCacheFeed, fetchXMLAndConvertToJson, getFeed };
