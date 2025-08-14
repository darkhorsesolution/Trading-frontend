import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/fxstreet";
import { IconChevronLeft, IconClock } from "@tabler/icons";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { getLink, IArticle } from "@/interfaces/article";
import NewsLayout from "@/components/Layout/NewsLayout";

const articlesPerPage = 3 * 7;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = Number(context.query.page) || 1;
  const skip = (page - 1) * articlesPerPage;
  const articles = (await getArticles(articlesPerPage, skip)).map(
    (article) => ({
      ...article,
      createdAt: article.createdAt.toISOString(),
    })
  );

  return { props: { articles, page } };
};

export default function News({
  articles,
  page,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Stack py={"xl"} spacing={"xl"}>
        <Stack align={"start"}>
          <Title
            weight={"bolder"}
            order={1}
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.sm,
            })}
          >
            Market News
          </Title>
          <Text>
            View the daily news commentary to obtain insight on the financial
            markets.
          </Text>
        </Stack>

        <SimpleGrid
          cols={3}
          spacing={"md"}
          breakpoints={[
            { maxWidth: "xl", cols: 3, spacing: "md" },
            { maxWidth: "lg", cols: 3, spacing: "md" },
            { maxWidth: "md", cols: 3, spacing: "md" },
            { maxWidth: "sm", cols: 2, spacing: "sm" },
            { maxWidth: "xs", cols: 1, spacing: "sm" },
          ]}
        >
          {articles.map((article: Omit<IArticle, "createdAt">) => {
            const date = new Date(article.pubDate);
            const _article: IArticle = {
              ...article,
              createdAt: new Date(article.pubDate),
            };
            return (
              <Paper
                component={"a"}
                withBorder={true}
                key={article.id}
                href={getLink(_article)}
                p={"md"}
                radius={"sm"}
                display={"flex"}
              >
                <Stack>
                  <Title order={3}>{article.title}</Title>
                  <Group className="flex flex-row">
                    {article.pair &&
                      article.pair
                        .split(",")
                        .map((pair) => <Badge key={pair}>{pair}</Badge>)}
                  </Group>
                  <Text c={"dimmed"} h={"100%"}>
                    {article.summary}
                  </Text>

                  <Group spacing={"xs"}>
                    <IconClock size={20} aria-hidden="true" />{" "}
                    <Text size={"sm"}>{date.toLocaleString()}</Text>
                  </Group>
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>

        <Group>
          {page > 1 && (
            <Button
              component={Link}
              href={`?page=${page - 1}`}
              aria-disabled={page <= 1}
              variant={"light"}
            >
              Newer
            </Button>
          )}
          {articles.length >= articlesPerPage && (
            <Button
              component={Link}
              href={`?page=${page + 1}`}
              variant={"light"}
            >
              Older
            </Button>
          )}
        </Group>
      </Stack>
    </>
  );
}

News.getLayout = function getLayout(page) {
  return <NewsLayout>{page}</NewsLayout>;
};
