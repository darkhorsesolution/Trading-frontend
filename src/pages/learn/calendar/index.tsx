import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useEffect, useState } from "react";
import { getCalendarEvents } from "@/lib/economic_calendar";
import {
  Box,
  Container,
  createStyles,
  Group,
  Image,
  Loader,
  Progress,
  Stack,
  Table,
  Text,
  Title,
  TableProps,
  ActionIcon,
  Button,
  Paper,
} from "@mantine/core";
import Header from "@/components/Layout/Header";
import { Time } from "@/components/Time";
import { ICalendarEvent } from "@/interfaces/ICalendarEvent";
import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons";
import NewsLayout from "@/components/Layout/NewsLayout";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const events = (await getCalendarEvents(100)).map((event) => ({
    ...event,
    createdAt: event.createdAt.toISOString(),
    dateUtc: event.dateUtc.getTime(),
    periodDateUtc: null,
  }));

  return { props: { events } };
};

const useStyles = createStyles((theme) => ({
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
        : theme.colors.gray[2],
  },
  row: {
    cursor: "pointer",
  },
  description: {
    maxWidth: "100%",
  },
}));

const ProgressColor = {
  HIGH: "red",
  MEDIUM: "orange",
  LOW: "yellow",
};

const ProgressValue = {
  HIGH: 100,
  MEDIUM: 50,
  LOW: 20,
};

const ProgressBar = ({ value, row }) => (
  <Progress value={ProgressValue[value]} color={ProgressColor[value]} />
);

const TimeRenderer = ({ value, row }) => (
  <Time
    date={value}
    absolute={true}
    format={{ hour: "numeric", minute: "numeric" }}
  />
);

const FlagRenderer = ({ value, row }) => (
  <Group noWrap={true} spacing={"xs"} w={"auto"}>
    <Image
      src={`/flags/rectangle/${value.toLowerCase()}.png`}
      height={12}
      width={16}
    />
    <Text>{value}</Text>
  </Group>
);

const UnitRenderer = ({ value, row }) => (
  <Text>
    {value && row.unit !== "%" && row.unit}
    {value}
    {value && row.unit === "%" && row.unit}
  </Text>
);

const columns = [
  {
    label: "Time",
    key: "dateUtc",
    renderer: TimeRenderer,
    w: "60px",
    shortLabel: "",
  },
  {
    label: "",
    key: "currencyCode",
    renderer: FlagRenderer,
    w: "20px",
    shortLabel: "",
  },
  { label: "Event", key: "name", w: "100%", shortLabel: "Event" },
  {
    label: "Impact",
    key: "volatility",
    renderer: ProgressBar,
    shortLabel: "Imp.",
  },
  {
    label: "Actual",
    key: "actual",
    renderer: UnitRenderer,
    shortLabel: "Act",
  },
  {
    label: "Consensus",
    key: "consensus",
    renderer: UnitRenderer,
    shortLabel: "Con",
  },
  {
    label: "Previous",
    key: "previous",
    renderer: UnitRenderer,
    shortLabel: "Prev",
  },
];

const groupEventsByDate = (events: ICalendarEvent[]) => {
  const grouped = {};

  events.forEach((event: ICalendarEvent) => {
    const date = new Date(event.dateUtc);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }); // 'Tuesday, November 28, 2023'

    if (!grouped[formattedDate]) {
      grouped[formattedDate] = [];
    }

    grouped[formattedDate].push(event);
  });

  return grouped;
};

export function CalendarView({
  events,
  shorten = false,
  ...props
}: TableProps & { events: ICalendarEvent[]; shorten?: boolean }) {
  const [activeEvent, setActiveEvent] = useState("");
  const [eventDetails, setEventDetails] = useState({});
  const groupedEvents = groupEventsByDate(events);
  const { classes, cx } = useStyles();

  const ths = (
    <tr>
      {columns.map((element) => (
        <th key={element.key} style={{ width: element.w }}>
          <Text w={element.w}>
            {shorten ? element.shortLabel : element.label}
          </Text>
        </th>
      ))}
    </tr>
  );
  // @TODO fade out past events
  useEffect(() => {
    if (eventDetails[activeEvent] || activeEvent === "") return;

    const fetchData = async () => {
      const data = await fetch("/api/events/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: activeEvent }),
      });

      return await data.json();
    };

    fetchData()
      .then((event) =>
        setEventDetails({
          ...eventDetails,
          [activeEvent]: event,
        })
      )
      .catch(console.error);
  }, [activeEvent]);

  const rows = Object.entries(groupedEvents).map(([date, events]) => (
    <React.Fragment key={date}>
      <tr>
        <td
          colSpan={columns.length}
          style={{ textAlign: "center" }}
          className={classes.dateRow}
        >
          <strong>{date}</strong>
        </td>
      </tr>
      {/*// @ts-ignore*/}
      {events.map((event) => (
        <React.Fragment key={event.id}>
          <tr
            onClick={() =>
              setActiveEvent(event.id === activeEvent ? "" : event.id)
            }
            className={
              event.id === activeEvent ? classes.activeRow : classes.row
            }
          >
            {columns.map((column) => (
              <td key={column.key}>
                {column.renderer ? (
                  <column.renderer value={event[column.key]} row={event} />
                ) : (
                  event[column.key]
                )}
              </td>
            ))}
          </tr>
          {event.id === activeEvent && eventDetails[event.id] && (
            <tr className={classes.activeRow}>
              <td colSpan={3}>
                <Text size={"xl"} weight={"bolder"} px={"xl"} py={"lg"}>
                  {eventDetails[event.id]?.name}
                </Text>
                <Text size={"lg"} px={"xl"} py={"lg"}>
                  <span
                    className={classes.description}
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{
                      __html: eventDetails[event.id]?.description,
                    }}
                  />
                </Text>
              </td>
              <td colSpan={4}>
                <Table>
                  <tbody>
                    <tr>
                      <td>Source</td>
                      <td>{eventDetails[event.id].source}</td>
                    </tr>
                    <tr>
                      <td>Frequency</td>
                      <td>{eventDetails[event.id].periodType}</td>
                    </tr>
                    <tr>
                      <td>Next Release</td>
                      <td>
                        <Time date={eventDetails[event.id].nextReleaseDate} />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </td>
            </tr>
          )}
          {event.id === activeEvent && !eventDetails[event.id] && (
            <tr className={classes.activeRow}>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                <Box p={"xl"}>
                  <Loader w={"100%"} size={"sm"} />
                </Box>
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </React.Fragment>
  ));

  return (
    <Table {...props}>
      <thead>{ths}</thead>
      <tbody>{rows}</tbody>
      <tfoot>{ths}</tfoot>
    </Table>
  );
}

export default function Calendar({
  events,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Paper px={"xl"} py={"xl"} shadow={"lg"}>
      <Stack align={"start"} w={"100%"}>
        <Title
          weight={"bolder"}
          order={1}
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
          })}
        >
          Economic Calendar
        </Title>
        <Text>
          View the global economic calendar for any upcoming events that may
          impact the financial markets.
        </Text>
        <CalendarView
          events={events}
          highlightOnHover
          withBorder
          withColumnBorders
          horizontalSpacing="lg"
          verticalSpacing="sm"
        />
      </Stack>
    </Paper>
  );
}

Calendar.getLayout = function getLayout(page) {
  return <NewsLayout>{page}</NewsLayout>;
};
