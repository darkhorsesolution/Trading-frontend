import {
  Box,
  Button,
  Group,
  Input,
  Overlay,
  SegmentedControl,
  Select,
  TextInput,
  createStyles,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { IconCalendarMinus, IconCalendarPlus, IconSearch } from "@tabler/icons";
import { getESTDateString } from "@/lib/time";

const useStyles = createStyles((theme) => ({
  todayDay: {
    width: "100%",
    height: "100%",
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],
    borderRadius: theme.radius.sm,
  },
  chosenDay: {
    color: "green",
  },
  search: {
    "input:focus, input:focus-within": {
      outline: "none",
    },
  },
  segmentedControl: {
    flex: "1",
    minWidth: "200px",
  },
  inputWrapper: {
    position: "relative",
    input: {
      cursor: "pointer",
      outlineWidth: "0px !important",
    },
  },
  dateBox: {
    position: "absolute",
    top: "-286px",
    left: 0,
    zIndex: 999,
    background: theme.colors.gray,
    boxShadow: `0px 0px 12px -4px ${
      theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[7]
    }`,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[7]
    }`,
    height: "286px",
  },
  bottomGroup: {
    alignItems: "center",
    gap: 0,
  },
}));

interface FilterProps {
  presets?: IFilterPreset[];
  categories?: { label: string; value: string }[];
  useTextSearch?: boolean;
  onSearch: (
    from: Date,
    to: Date,
    searchInput?: string,
    category?: string
  ) => void;
}

interface IFilterPreset {
  value: string;
  default: boolean;
  cb: () => [Date, Date];
}

export const defaultPresets: IFilterPreset[] = [
  {
    value: "Today",
    default: true,
    cb: () => {
      return [new Date(), new Date()];
    },
  },
  {
    value: "Last 3 days",
    default: true,
    cb: () => {
      const currentDate = dayjs();
      const startDate = currentDate.subtract(3, "days");
      const endDate = currentDate;

      return [startDate.toDate(), endDate.toDate()];
    },
  },
  {
    value: "Last week",
    default: true,
    cb: () => {
      const currentDate = dayjs();
      const startDate = currentDate.subtract(1, "week");
      const endDate = currentDate;

      return [startDate.toDate(), endDate.toDate()];
    },
  },
  {
    value: "Last month",
    default: true,
    cb: () => {
      const currentDate = dayjs();
      const startDate = currentDate.subtract(1, "month");
      const endDate = currentDate;

      return [startDate.toDate(), endDate.toDate()];
    },
  },
  {
    value: "Last 3 months",
    default: true,
    cb: () => {
      const currentDate = dayjs();
      const startDate = currentDate.subtract(3, "month");
      const endDate = currentDate;

      return [startDate.toDate(), endDate.toDate()];
    },
  },
  {
    value: "Last 6 months",
    default: true,
    cb: () => {
      const currentDate = dayjs();
      const startDate = currentDate.subtract(6, "month");
      const endDate = currentDate;

      return [startDate.toDate(), endDate.toDate()];
    },
  },
];

const Filter = React.memo(
  ({ onSearch, presets, useTextSearch, categories }: FilterProps) => {
    const now = new Date();
    const to = new Date();
    now.setDate(now.getDate() -1 )

    const currentEstDate = new Date()
    const currentEST = getESTDateString(currentEstDate);
    let initialDayShift = false;

    if (currentEST.get("hours") >= 17) {
      now.setDate(now.getDate() + 1);
      initialDayShift = true;
    }

    const { classes, cx } = useStyles();
    const [dateFromActive, setDateFromActive] = useState<boolean>(false);
    const [dateToActive, setDateToActive] = useState<boolean>(false);
    const [dateFrom, setDateFrom] = useState<Date | null>(now);
    const [dateTo, setDateTo] = useState<Date | null>(to);
    const [filterPreset, setFilterPreset] = useState<IFilterPreset>(
      presets ? presets.find((p) => p.default) : undefined
    );
    const [searchInput, setSearchInput] = useState<string>("");
    const [filter, setFilter] = useState<string>("trading");
    const [isDirty, setDirty] = useState<boolean>(initialDayShift);
    const [dateRefresh, setDateRefresh] = useState<NodeJS.Timer>();

    useEffect(() => {
      onSearch(dateFrom, dateTo, undefined, filter);

      if (!isDirty) {
        const timeout = setInterval(() => {
          const currentEST = getESTDateString(new Date());
          if (currentEST.get("hours") >= 17) {
            const newDate = new Date();
            newDate.setDate(dateFrom.getDate() + 1);
            setDateFrom(newDate);
            setDateTo(newDate);
            setDirty(true);
            onSearch(newDate, newDate, undefined, filter);
          }
        }, 1000);
        setDateRefresh(timeout);
      }
    }, []);

    useEffect(() => {
      if (isDirty) {
        clearInterval(dateRefresh);
        setDateRefresh(undefined);
      }
    }, [isDirty]);

    return (
      <Group
        position="left"
        py={"xs"}
        align="end"
        noWrap={false}
        className={classes.bottomGroup}
      >
        <Box style={{ display: "flex", alignItems: "end" }}>
          {useTextSearch && (
            <TextInput
              size="xs"
              placeholder="Search"
              icon={<IconSearch size={16} />}
              rightSectionWidth={90}
              mx={"xs"}
              className={classes.search}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch(dateFrom, dateTo, searchInput, filter);
                }
              }}
            />
          )}
          {presets && (
            <Select
              mx={"xs"}
              placeholder="Preset"
              size="xs"
              value={filterPreset.value}
              data={presets.map((p) => p.value)}
              onChange={(val) => {
                const preset = presets.find((p) => p.value === val);
                const [from, to] = preset.cb();
                setFilterPreset(preset);
                setDateFrom(from);
                setDateTo(to);
                setDateFromActive(false);
                setDateToActive(false);
                setDirty(true);
              }}
            />
          )}
          <Input.Wrapper className={classes.inputWrapper} mx={"xs"}>
            <Input
              size="xs"
              value={dateFrom?.toDateString()}
              readOnly={true}
              onClick={(e) => {
                setDateFromActive(!dateFromActive);
              }}
              icon={<IconCalendarPlus size={16} />}
            />
            {dateFromActive && (
              <>
                <Overlay
                  pos={"fixed"}
                  onClick={() => setDateFromActive(false)}
                  opacity={0}
                />
                <Box className={classes.dateBox}>
                  <DatePicker
                    onChange={(val) => {
                      setDateFrom(val);
                      setDateFromActive(false);
                      setDirty(true);
                    }}
                    renderDay={(date) => {
                      const day = date.getDate();
                      const isChosen = dayjs(date).isSame(dateFrom, "day");
                      const isToday = dayjs(date).isSame(now, "day");
                      return (
                        <div
                          className={cx(
                            isChosen ? classes.chosenDay : null,
                            isToday ? classes.todayDay : null
                          )}
                        >
                          {day}
                        </div>
                      );
                    }}
                  />
                </Box>
              </>
            )}
          </Input.Wrapper>

          <Input.Wrapper className={classes.inputWrapper} mx={"xs"}>
            <Input
              size="xs"
              value={dateTo?.toDateString()}
              readOnly={true}
              onClick={(e) => {
                setDateToActive(!dateToActive);
              }}
              icon={<IconCalendarMinus size={16} />}
            />
            {dateToActive && (
              <>
                <Overlay
                  pos={"fixed"}
                  onClick={() => setDateToActive(false)}
                  opacity={0}
                />
                <Box className={classes.dateBox}>
                  <DatePicker
                    onChange={(val) => {
                      setDateTo(val);
                      setDateToActive(false);
                      setDirty(true);
                    }}
                    renderDay={(date) => {
                      const day = date.getDate();
                      const isChosen = dayjs(date).isSame(dateTo, "day");
                      const isToday = dayjs(date).isSame(now, "day");
                      return (
                        <div
                          className={
                            isChosen
                              ? classes.chosenDay
                              : isToday
                              ? classes.todayDay
                              : ""
                          }
                        >
                          {day}
                        </div>
                      );
                    }}
                  />
                </Box>
              </>
            )}
          </Input.Wrapper>
          <Button
            mx={"xs"}
            size="xs"
            onClick={() => {
              onSearch(dateFrom, dateTo, searchInput, filter);
            }}
          >
            Request
          </Button>
        </Box>
        {categories ? (
          <Box>
            <SegmentedControl
              className={classes.segmentedControl}
              size={"sm"}
              data={categories}
              onChange={(val) => {
                setFilter(val);
                onSearch(dateFrom, dateTo, searchInput, val);
              }}
            />
          </Box>
        ) : null}
      </Group>
    );
  },
  (prevProps, nextProps) => {
    return true;
  }
);

export default Filter;
