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
