import {
  EventList,
  Event,
  TeamList,
  ScheduleResponse,
  Schedule,
  TournamentLevel,
} from "@/models/api";

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

export function getEvents(year: number) {
  return get<EventList>(`${year}/events`);
}

export function eventSortByDateComparator(a: Event, b: Event) {
  return new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime();
}

export function getEventTeams(eventCode: string): Promise<TeamList> {
  return get<TeamList>(`${YEAR}/teams?eventCode=${eventCode}`);
}

function mergeSchedules(...schedules: Schedule[]): Schedule {
  return schedules.flatMap((schedule) => schedule);
}

function getSchedule(
  eventCode: string,
  tournamentLevel: TournamentLevel,
): Promise<ScheduleResponse> {
  return get<ScheduleResponse>(
    `${YEAR}/schedule/${eventCode}?tournamentLevel=${tournamentLevel}`,
  );
}

export async function getEventSchedule(eventCode: string): Promise<Schedule> {
  const [practiceSchedule, qualSchedule, elimSchedule] = await Promise.all([
    getSchedule(eventCode, TournamentLevel.Practice),
    getSchedule(eventCode, TournamentLevel.Qualification),
    getSchedule(eventCode, TournamentLevel.Playoff),
  ]);

  return mergeSchedules(
    practiceSchedule.Schedule,
    qualSchedule.Schedule,
    elimSchedule.Schedule,
  );
}
