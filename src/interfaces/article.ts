export type IArticle = {
  id: string;
  createdAt: Date;
  pubDate: string;
  title: string;
  slug: string;
  description: string;
  link: string;
  pair: string;
  provider: string;
  market: string;
  headline: boolean;
  summary: string;
};

export type IOriginalArticle = {
  title: string;
  description: string;
  link: string;
  guid: {
    _: string;
    $: {
      isPermaLink: string;
    };
  };
  pubDate: string;
  "fxstnewsns:pair": string;
  "fxstnewsns:provider": string;
  "fxstnewsns:market": string;
  "fxstnewsns:headline": string;
  "fxstnewsns:summary": string;
};

export const getLink = (article: IArticle): string =>
  `/learn/news/${article.slug}`;
