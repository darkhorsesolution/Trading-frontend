import { NextApiRequest, NextApiResponse } from "next";
import { getEventDetails } from "@/lib/economic_calendar";
import { ICalendarEvent } from "@/interfaces/ICalendarEvent";
import { HttpStatusCode } from "axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let events: ICalendarEvent[];
  let code: HttpStatusCode;

  try {
    const body = JSON.parse(JSON.stringify(req.body));
    events = await getEventDetails(body.id);
    code = 200;
  } catch (e) {
    console.error(e);
    code = 400;
  }

  res.status(code).json(events);
};
