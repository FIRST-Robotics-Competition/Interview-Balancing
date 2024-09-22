export interface EventList {
  Events: Event[];
  eventCount: number;
}

export interface Event {
  allianceCount: string;
  weekNumber: number;
  announcements: unknown[];
  code: string;
  divisionCode: null | string;
  name: string;
  type: string;
  districtCode: null | string;
  venue: string;
  city: string;
  stateprov: string;
  country: string;
  dateStart: Date;
  dateEnd: Date;
  address: string;
  website: null | string;
  webcasts: string[];
  timezone: string;
}

export interface TeamList {
  teams: Team[];
  teamCountTotal: number;
  teamCountPage: number;
  pageCurrent: number;
  pageTotal: number;
}

export interface Team {
  schoolName: string;
  website: string;
  homeCMP: string;
  teamNumber: number;
  nameFull: string;
  nameShort: string;
  city: string;
  stateProv: string;
  country: string;
  rookieYear: number;
  robotName: string;
  districtCode: null;
}

export enum TournamentLevel {
  Practice = "Practice",
  Qualification = "Qualification",
  Playoff = "Playoff",
}

export type Schedule = Match[];

export interface ScheduleResponse {
  Schedule: Schedule;
}

export interface Match {
  field: string;
  tournamentLevel: string;
  description: string;
  startTime: string | null;
  matchNumber: number;
  teams: TeamAppearance[];
}

export interface TeamAppearance {
  teamNumber: number;
  station: string;
  surrogate: boolean;
}
