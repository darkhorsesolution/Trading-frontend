import { NextApiRequest, NextApiResponse } from "next";

import { downloadAndCacheCalendar } from "@/lib/economic_calendar";
import { downloadAndCacheFeed } from "@/lib/fxstreet";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await downloadAndCacheFeed();
    await downloadAndCacheCalendar();
    res.status(200).json({ status: "success", error: false });
  } catch (e) {
    let status = "";
    if (typeof e === "string") {
      status = e.toUpperCase(); // works, `e` narrowed to string
    } else if (e instanceof Error) {
      status = e.message; // works, `e` narrowed to Error
    }
    res.status(500).json({ status, error: true });
  }
}
