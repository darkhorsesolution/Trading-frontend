import { env } from "process";

export const getNews = async () => {
  const query = `query MarketInsightPlural {
        marketInsightPlural {
            nodes {
                translations {
                    title
                    slug
                    date
                    language {
                        code
                    }
                    excerpt
                }
            }
        }
    }`;

  const response = await fetch("https://cms.atcbrokers.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {},
    }),
  });
  const data = await (response.json() as any);
  return data.data.marketInsightPlural.nodes.reduce((acc, cur) => {
    const enVersion = cur.translations.find((t) => t.language.code === "EN");
    if (enVersion) {
      acc.push(enVersion);
    }
    return acc;
  }, []);
};
