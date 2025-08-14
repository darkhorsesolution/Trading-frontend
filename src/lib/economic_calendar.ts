import { ICalendarEvent } from "@/interfaces/ICalendarEvent";
import { IArticle } from "@/interfaces/article";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

const baseURL = "https://calendar-api.fxstreet.com/en/api/v1/eventDates/";

// Headers
const headers = {
  authority: "calendar-api.fxstreet.com",
  accept: "application/json",
  "accept-language": "en-US,en;q=0.9",
  origin: "https://www.fxstreet.com",
  referer: "https://www.fxstreet.com/",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "sec-gpc": "1",
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
};

export async function fetchEconomicCalendar(
  startDate = "2023-10-26T04:15:24Z",
  endDate = "2023-10-28T06:15:24Z",
  volatilities = ["NONE", "LOW", "MEDIUM", "HIGH"],
  countries = [
    "US",
    "UK",
    "EMU",
    "DE",
    "CN",
    "JP",
    "CA",
    "AU",
    "NZ",
    "CH",
    "FR",
    "IT",
    "ES",
    "UA",
  ],
  categories = [
    "8896AA26-A50C-4F8B-AA11-8B3FCCDA1DFD",
    "FA6570F6-E494-4563-A363-00D0F2ABEC37",
    "C94405B5-5F85-4397-AB11-002A481C4B92",
    "E229C890-80FC-40F3-B6F4-B658F3A02635",
    "24127F3B-EDCE-4DC4-AFDF-0B3BD8A964BE",
    "DD332FD3-6996-41BE-8C41-33F277074FA7",
    "7DFAEF86-C3FE-4E76-9421-8958CC2F9A0D",
    "1E06A304-FAC6-440C-9CED-9225A6277A55",
    "33303F5E-1E3C-4016-AB2D-AC87E98F57CA",
    "9C4A731A-D993-4D55-89F3-DC707CC1D596",
    "91DA97BD-D94A-4CE8-A02B-B96EE2944E4C",
    "E9E957EC-2927-4A77-AE0C-F5E4B5807C16",
  ]
) {
  // URL and Parameters

  let url = `${baseURL}${startDate}/${endDate}?`;

  volatilities.forEach((v) => {
    url += `&volatilities=${v}`;
  });

  countries.forEach((c) => {
    url += `&countries=${c}`;
  });

  categories.forEach((cat) => {
    url += `&categories=${cat}`;
  });

  // Fetch Request
  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to fetch data");
  }
}

export async function downloadAndCacheCalendar() {
  const from = dayjs().startOf("hour").subtract(1, "hour");
  const to = from.clone().add(1, "day");
  const items = await fetchEconomicCalendar(
    from.toISOString(),
    to.toISOString()
  );

  /*await Promise.all(
    items.map((item: ICalendarEvent) => ({
      ...item,
      details: getEventDetails(item.id),
    })),
  );*/

  for (const item of items) {
    const event: ICalendarEvent = {
      id: item.id,
      eventId: item.eventId,
      createdAt: item.createdAt,
      dateUtc: item.dateUtc,
      periodDateUtc: item.periodDateUtc,
      periodType: item.periodType,
      actual: item.actual,
      revised: item.revised,
      consensus: item.consensus,
      ratioDeviation: item.ratioDeviation,
      previous: item.previous,
      isBetterThanExpected: item.isBetterThanExpected,
      name: item.name,
      countryCode: item.countryCode,
      currencyCode: item.currencyCode,
      unit: item.unit,
      potency: item.potency,
      volatility: item.volatility,
      isAllDay: item.isAllDay,
      isTentative: item.isTentative,
      isPreliminary: item.isPreliminary,
      isReport: item.isReport,
      isSpeech: item.isSpeech,
      lastUpdated: item.lastUpdated,
      previousIsPreliminary: item.previousIsPreliminary,
      details: item.details,
    };
    await prisma.calendarEvent.upsert({
      where: { id: item.id }, // assuming 'id' is the unique identifier
      update: event, // update if the article with this ID exists
      create: event, // create a new article if it doesn't
    });
  }

  return items;
}

export async function getEventDetails(id: string) {
  let url = `${baseURL}${id}?`;

  // Fetch Request
  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to fetch data");
  }
}

export async function getCalendarEvents(
  limit = 20,
  start = new Date()
): Promise<ICalendarEvent[]> {
  const filterCondition = {
    /*dateUtc: {
      gt: start.toISOString(), // gt means greater than
    },*/
  };

  return prisma.calendarEvent.findMany({
    orderBy: {
      dateUtc: "desc",
    },
    where: filterCondition,
    take: limit,
  });
}
