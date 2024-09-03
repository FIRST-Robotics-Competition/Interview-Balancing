import { EventList, Event } from "@/models/api";

const BASE_URL = "/api/v3.0";
const YEAR = 2024;

async function get<T>(url: string): Promise<T> {
  return fetch(`${BASE_URL}/${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(import.meta.env.VITE_FRC_API_KEY)}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json() as Promise<T>;
  });
}

export function getSchedule(eventCode: string) {
  return get<unknown>(
    `${YEAR}/schedule/${eventCode}?tournamentLevel=Qualification`
  );
}

export function getEvents(year: number) {
  return get<EventList>(`${year}/events`);
}

export function eventSortByDateComparator(a: Event, b: Event) {
  return new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime();
}
