import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { getCalendarEvents } from "@/lib/economic_calendar";
import { ICalendarEvent } from "@/interfaces/ICalendarEvent";
import { HttpStatusCode } from "axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, buildAuthOptions(req, res));
  if (!session) {
    res.status(500).json({ error: "not signed in" });
    return;
  }

  let events: ICalendarEvent[];
  let code: HttpStatusCode;

  try {
    events = await getCalendarEvents(100);
    code = 200;
  } catch (e) {
    console.error(e);
    code = 400;
  }

  res.status(code).json(events);
};
