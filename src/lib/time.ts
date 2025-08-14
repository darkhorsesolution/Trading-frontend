import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getESTDate = (date: Date, addDay?: number): Date => {
  if (!date) {
    return new Date();
  }

  const cloned = new Date(date.getTime());
  let localized = dayjs(cloned).tz("America/New_York");

  localized = localized
    .set("hour", 17)
    .set("minute", 0)
    .set("second", 0)
    .set("millisecond", 0);

  if (addDay) {
    localized = localized.add(addDay, "day");
  }
  return localized.toDate();
};

export const getESTDateString = (date: Date): dayjs.Dayjs => {
  if (!date) {
    return null;
  }

  const cloned = new Date(date.getTime());
  let localized = dayjs(cloned).tz("America/New_York");
  return localized;
};

export const truncateDateToESTMidnight = (date: Date): Date => {
  const out = dayjs(date.toDateString() + " 00:00:00 EDT").toDate();
  return out;
};
