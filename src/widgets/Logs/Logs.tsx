import { useSelector } from "react-redux";
import { Box, LoadingOverlay, Text } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { LogsQuery, logsSelector } from "@/store/logs";
import { Time } from "@/components/Time";
import { Widgets } from "@/lib/WidgetRegister";
import { getESTDate, truncateDateToESTMidnight } from "@/lib/time";
import Filter from "@/components/Filter";
import useStyles from "./styles";
import { ApiFetch, IPagesResponse } from "@/utils/network";
import { ILog } from "@/interfaces/ILog";
import { currentSubAccountSelector } from "@/store/account";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import Table from "@/components/Table";
import { IDockviewPanelProps } from "dockview";

const requestLogs = async (req: LogsQuery, account: string) => {
  const query = Object.keys(req)
    .map((key) => `${key}=${req[key]}`)
    .join("&");
  try {
    return await ApiFetch<IPagesResponse<ILog>>(
      `/api/accounts/${account}/logs?${query}`
    );
  } catch (error) {
    if (!error || !error.response) {
      throw error;
    }
    return { data: [], page: 0, totalPages: 0 };
  }
};

const columnHelper = createColumnHelper<ILog>();

const columns: ColumnDef<ILog>[] = [
  columnHelper.accessor("createdAt", {
    header: "Time",
    cell: (data) => <Time date={data.getValue()} absolute={true} />,
    enableSorting: true,
    minSize: 160,
  }),
  columnHelper.accessor("group", {
    header: "Group",
    cell: (data) => <Text>{data.getValue()}</Text>,
    minSize: 70,
    size: 70,
  }),
  columnHelper.accessor("message", {
    header: () => <Text style={{ paddingLeft: "10px" }}>Message</Text>,
    cell: (data) => (
      <Text
        style={{ paddingLeft: data.getValue().indexOf("*") === 0 ? 0 : "10px" }}
      >
        {data.getValue()}
      </Text>
    ),
    enableSorting: true,
    enableResizing: false,
  }),
];

export type LogsProps = IDockviewPanelProps;

const Logs = ({ api }: LogsProps) => {
  const { classes } = useStyles();
  const [logs, setLogs] = useState<ILog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const account = useSelector(currentSubAccountSelector);
  const logsStore = useSelector(logsSelector);
  const viewport = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState("");

  const scrollToBottom = () => {
    if (viewport && viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (logsStore.logs.length) {
      setRefreshKey(logsStore.logs[0].id);
    }
  }, [logsStore]);

  useEffect(() => {
    api.onDidActiveChange((e) => {
      if (e.isActive) {
        console.log("active changed", e.isActive);
      }
    });
  }, []);

  const search = async (dateFrom: Date, dateTo: Date, searchInput?: string) => {
    const from = getESTDate(truncateDateToESTMidnight(dateFrom));
    const to = getESTDate(truncateDateToESTMidnight(dateTo));
    to.setDate(to.getDate() + 1);

    const req: LogsQuery = {
      from: from.toISOString(),
      to: to.toISOString(),
      search: searchInput || "",
    };

    if (!req.from || !req.to) {
      delete req.from;
      delete req.to;
    }
    setLoading(true);
    const data = await requestLogs(req, account);
    setLogs(data.data);
    setLoading(false);
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  };

  return (
    <Box className={classes.wrapper}>
      <LoadingOverlay visible={loading} />
      <Table
        scrollRef={viewport}
        data={logs}
        columns={columns}
        defaultSort={{
          id: "createdAt",
          desc: false,
        }}
      />
      <Filter
        key={`${account}_${refreshKey}`}
        onSearch={search}
        useTextSearch={true}
      />
    </Box>
  );
};

Widgets.register(Logs, "logs", {
  closable: true,
  title: "Logs",
  description:
    "Displays a list of last logs emitted from the server. Each entry contains small text describing the preceding event and timestamp.",
});

export default Logs;
