import { GetServerSideProps } from "next";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";

import prisma from "@/lib/prisma";

import { IArticle } from "@/interfaces/article";
import { IconChevronLeft, IconClock } from "@tabler/icons";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import NewsLayout from "@/components/Layout/NewsLayout";

const inter = Inter({ subsets: ["latin"] });

const ArticlePage = ({ article }: { article: IArticle }) => {
  const date = new Date(article.createdAt);

  const [articleData, setArticleData] = useState("");

  useEffect(() => {
    setArticleData(article.description);
  }, []);

  return (
    <Stack spacing={"lg"} align={"start"}>
      <Button
        leftIcon={<IconChevronLeft />}
        component={Link}
        href={`/learn/news`}
        title="Back"
        variant={"light"}
      >
        Back
      </Button>

      <Paper px={"xl"} py={"xl"} shadow={"lg"}>
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
              {article.title}
            </Title>
            <Text c={"dimmed"}>{article.summary}</Text>
          </Stack>

          <Group spacing={"xs"}>
            <IconClock size={20} aria-hidden="true" />{" "}
            <Text size={"sm"}>{date.toLocaleString()}</Text>
          </Group>

          <Group className="flex flex-row">
            {article.pair &&
              article.pair
                .split(",")
                .map((pair) => <Badge key={pair}>{pair}</Badge>)}
          </Group>
        </Stack>
        <span
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: articleData,
          }}
        />
      </Paper>
    </Stack>
  );
};

ArticlePage.getLayout = function getLayout(page) {
  return <NewsLayout>{page}</NewsLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.slug;

  if (!slug || typeof slug !== "string") {
    return { notFound: true };
  }

  const article = await prisma.article.findFirst({
    where: {
      slug,
    },
  });

  if (!article) {
    return { notFound: true };
  }

  return { props: { article: JSON.parse(JSON.stringify(article)) } };
};

export default ArticlePage;
