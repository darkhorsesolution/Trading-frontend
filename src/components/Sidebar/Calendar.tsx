import { Box, LoadingOverlay } from "@mantine/core";
import { useEffect, useState } from "react";
import { ApiFetch } from "@/utils/network";
import { showNotification } from "@mantine/notifications";
import { ICalendarEvent } from "@/interfaces/ICalendarEvent";
import { CalendarView } from "@/pages/learn/calendar";

interface CalendarProps {}

export function Calendar({}: CalendarProps) {
  const [loadingActive, setLoadingActive] = useState(null);
  const [calendarItems, setCalendarItems] = useState<ICalendarEvent[]>([]);

  const fetchCalendarItems = async (): Promise<ICalendarEvent[]> => {
    let data: ICalendarEvent[];
    try {
      data = await ApiFetch<ICalendarEvent[]>(`/api/news/calendar`);
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
    fetchCalendarItems().then((data) => {
      setCalendarItems(data);
      setLoadingActive(false);
    });
  }, []);

  return (
    <Box p={0}>
      {calendarItems.length > 0 && (
        <CalendarView
          p={0}
          m={0}
          shorten={true}
          events={calendarItems}
          horizontalSpacing={"xs"}
          verticalSpacing={"xs"}
          highlightOnHover
        />
      )}
      <LoadingOverlay visible={loadingActive} />
    </Box>
  );
}

export default Calendar;
