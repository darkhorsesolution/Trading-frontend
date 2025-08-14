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
import Table from "@/components/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useSelector } from "react-redux";
import { accountSelector } from "@/store/account";

enum Categories {
  Trading = "trading",
  System = "system",
}

const categories = [
  { label: "Trading", value: Categories.Trading },
  { label: "System", value: Categories.System },
];

const requestAdminLogs = async (req: LogsQuery, system: boolean) => {
  const query = Object.keys(req)
    .map((key) => `${key}=${req[key]}`)
    .join("&");
  try {
    return await ApiFetch<IPagesResponse<ILog>>(
      `/api/admin/logs/list?${query}&system=${system ? "true" : ""}`
    );
  } catch (error) {
    if (!error || !error.response) {
      throw error;
    }
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
  columnHelper.accessor("ip", {
    header: "Ip",
    cell: (data) => <Text>{data.getValue() || "system"}</Text>,
    enableSorting: true,
    size: 40,
    minSize: 40,
  }),
  columnHelper.accessor("account", {
    header: "Account",
    cell: (data) => <Text>{data.getValue() || "-"}</Text>,
    enableSorting: true,
    size: 50,
    minSize: 50,
  }),
  columnHelper.accessor("group", {
    header: "Group",
    cell: (data) => <Text size={"sm"}>{data.getValue() || "-"}</Text>,
    enableSorting: true,
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

const AdminLogs = () => {
  const { classes } = useStyles();
  const [logs, setLogs] = useState<ILog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const viewport = useRef<HTMLDivElement>(null);
  const { subUsers, loginAccount } = useSelector(accountSelector);
  const loginUser = subUsers[loginAccount];
  const logsStore = useSelector(logsSelector);
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
    if (logsStore.systemLogs.length) {
      setRefreshKey(logsStore.systemLogs[0].id);
    }
  }, [logsStore]);

  const getData = async (req: LogsQuery, category: string) => {
    if (!req.from || !req.to) {
      delete req.from;
      delete req.to;
    }
    setLoading(true);
    const data = await requestAdminLogs(req, category === Categories.System);
    setLogs(data.data);
    setLoading(false);
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  };

  const search = (
    dateFrom: Date,
    dateTo: Date,
    searchInput?: string,
    category?: string
  ) => {
    const from = getESTDate(truncateDateToESTMidnight(dateFrom));
    const to = getESTDate(truncateDateToESTMidnight(dateTo));
    to.setDate(to.getDate() + 1);

    let query: LogsQuery = {
      from: from.toISOString(),
      to: to.toISOString(),
      search: searchInput || "",
    };

    getData(query, category);
  };

  if (!loginUser.admin) {
    return (
      <Box className={classes.wrapper} p={"sm"}>
        You need to be logged in as admin
      </Box>
    );
  }

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
        key={`${refreshKey}`}
        onSearch={search}
        useTextSearch={true}
        categories={categories}
      />
    </Box>
  );
};

Widgets.register(AdminLogs, "admin_logs", {
  admin: true,
  closable: true,
  title: "Admin Logs",
  description:
    "Displays a list of last logs emitted from the server. Each entry contains small text describing the preceding event and timestamp.",
});

export default AdminLogs;
