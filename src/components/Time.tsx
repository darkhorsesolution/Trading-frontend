import * as timeago from "timeago.js";
import { ComponentProps } from "./index";

export interface TimeProps extends ComponentProps {
  date: Date | string | number | undefined;
  absolute?: boolean;
  format?: any;
}

export const Time = ({ date, absolute = false, ...rest }: TimeProps) => {
  const d = TimeConvert(date);

  return d ? (
    <time dateTime={d.toISOString()} title={d.toISOString()} {...rest}>
      {TimePure({ date, absolute, ...rest })}
    </time>
  ) : null;
};

export const TimeConvert = (date: number | string | Date) => {
  switch (typeof date) {
    case "number":
      return new Date(date);
    case "string":
      return new Date(Date.parse(date));
    default:
      return date instanceof Date ? date : null;
  }
};

const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
  fractionalSecondDigits: 3,
};

export const TimePure = ({ date, absolute = false, format }: TimeProps) => {
  let d: Date = TimeConvert(date);
  return absolute
    ? `${d.toLocaleString(
        format ? format : "default",
        format ? format : options,
      )}`
    : timeago.format(d);
};
