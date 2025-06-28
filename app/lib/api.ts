import type {
  EventList,
  Schedule,
  ScheduleResponse,
  TeamList,
} from '~/lib/apiTypes';

const BASE_URL = 'https://frc-api.firstinspires.org/v3.0';

async function get<T>(url: string): Promise<T> {
  return fetch(`${BASE_URL}/${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(import.meta.env.VITE_FRC_API_KEY as string)}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json() as Promise<T>;
  });
}

export function getEventTeams(eventCode: string): Promise<TeamList> {
  return get<TeamList>(
    `${eventCode.slice(0, 4)}/teams?eventCode=${eventCode.slice(4)}`,
  );
}

export function getEvent(eventCode: string): Promise<EventList> {
  return get<EventList>(
    `${eventCode.slice(0, 4)}/events?eventCode=${eventCode.slice(4)}`,
  );
}

export async function getEventSchedule(eventCode: string): Promise<Schedule> {
  const [practice, quals, playoffs] = await Promise.all([
    get<ScheduleResponse>(
      `${eventCode.slice(0, 4)}/schedule/${eventCode.slice(4)}?tournamentLevel=Practice`,
    ),
    get<ScheduleResponse>(
      `${eventCode.slice(0, 4)}/schedule/${eventCode.slice(4)}?tournamentLevel=Qualification`,
    ),
    get<ScheduleResponse>(
      `${eventCode.slice(0, 4)}/schedule/${eventCode.slice(4)}?tournamentLevel=Playoff`,
    ),
  ]);

  return [...practice.Schedule, ...quals.Schedule, ...playoffs.Schedule];
}
