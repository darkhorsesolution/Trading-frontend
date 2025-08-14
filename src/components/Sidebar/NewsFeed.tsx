import {
  Badge,
  Box,
  createStyles,
  LoadingOverlay,
  Table,
  Text,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { ApiFetch } from "@/utils/network";
import { showNotification } from "@mantine/notifications";
import { IArticle } from "@/interfaces/article";
import slugify from "slugify";
import { Time } from "@/components/Time";
import Link from "next/link";
import { modals } from "@mantine/modals";
import { Modals } from "../Modals";

interface NewsFeedProps {}

const useStyles = createStyles((theme) => ({
  modal: {
    "*": {
      maxWidth: "100%",
    },
  },
  activeRow: {
    cursor: "pointer",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.dark[1],
  },
  dateRow: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.dark[1],
  },
  row: {
    cursor: "pointer",
  },
  description: {
    maxWidth: "100%",
  },
}));

export function NewsFeed({}: NewsFeedProps) {
  const { classes, cx } = useStyles();
  const [loadingActive, setLoadingActive] = useState(null);
  const [rssItems, setRssItems] = useState<IArticle[]>([]);

  const fetchRssItems = async (): Promise<IArticle[]> => {
    let data: IArticle[];
    try {
      data = await ApiFetch<IArticle[]>(`/api/news/rss`);
    } catch (e) {
      showNotification({
        title: "Cannot retrieve items",
        message: e.toString(),
        color: "red",
      });
      return;
    }

    return data || [];
  };

  useEffect(() => {
    setLoadingActive(true);
    fetchRssItems().then((data) => {
      setRssItems(data);
      setLoadingActive(false);
    });
  }, []);

  const groupNewsByDate = (items: IArticle[]): Record<string, IArticle[]> => {
    const grouped = {};

    items.forEach((item: IArticle) => {
      const date = new Date(item.createdAt);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }); // 'Tuesday, November 28, 2023'

      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }

      grouped[formattedDate].push(item);
    });

    return grouped;
  };

  const groupedItems = groupNewsByDate(rssItems);

  return (
    <Box p={0}>
      <Table highlightOnHover horizontalSpacing={"xs"} verticalSpacing={"xs"}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedItems).map(([date, items]) => (
            <React.Fragment key={date}>
              <tr>
                <td
                  colSpan={3}
                  style={{ textAlign: "center" }}
                  className={classes.dateRow}
                >
                  <strong>{date}</strong>
                </td>
              </tr>
              {items.map((item, i) => (
                <tr key={i}>
                  <td width={70}>
                    <Time
                      date={item.pubDate}
                      absolute={true}
                      format={{ hour: "numeric", minute: "numeric" }}
                    />
                  </td>
                  <td>
                    <Link
                      href={`/learn/news/${slugify(item.title, {
                        lower: true,
                        strict: true,
                      })}`}
                      target="_blank"
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        modals.openContextModal({
                          size: "lg",
                          modal: Modals.NewsModal,
                          innerProps: {
                            title: item.title,
                            children: (
                              <div
                                className={classes.modal}
                                dangerouslySetInnerHTML={{
                                  __html: item.description,
                                }}
                              ></div>
                            ),
                          },
                        });
                      }}
                    >
                      <Text>{item.title}</Text>
                    </Link>
                  </td>
                  <td>
                    {item.pair && <Badge key={item.pair}>{item.pair}</Badge>}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
      <LoadingOverlay visible={loadingActive} />
    </Box>
  );
}

export default NewsFeed;
