import { Match } from "@/models/api";
import { InterviewType } from "@/models/store";
import { type ClassValue, clsx } from "clsx";
import { addMinutes } from "date-fns";
import { twMerge } from "tailwind-merge";

import { set } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InterviewSlot {
  interviewType: InterviewType;
  time: Date;

  teamInfo: {
    teamKey: string;

    scannedInfo: {
      conflictingMatch: Match | null;
      closestMatches: Match[];
    } | null;
  } | null;
}

export const generateTimeSlots = (
  startDate: Date,
  endDate: Date,
  duration: number,
) => {
  startDate.setHours(8);
  endDate.setHours(18);

  const times = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const time = new Date(current);
    const newTime = addMinutes(time, duration);
    times.push(time);
    current = newTime;
  }

  return times;
};

function findGCF(a: number, b: number): number {
  a = Math.abs(Math.floor(a));
  b = Math.abs(Math.floor(b));

  if (b === 0) {
    return a;
  }

  return findGCF(b, a % b);
}

function findGCFMultiple(...numbers: number[]): number {
  return numbers.reduce((a, b) => findGCF(a, b));
}

export function calculateColumnRowHeights(...durations: number[]): number[] {
  const gcf = findGCFMultiple(...durations);

  // 15 is just an arbitrary number since we can't fit text inside a 2px tall div.
  // Adjust as needed.
  return durations.map((d) => Math.floor(d / gcf) * 6);
}

export function copyTime({ from, to }: { from: Date; to: Date }) {
  return set(to, {
    hours: from.getHours(),
    minutes: from.getMinutes(),
    seconds: from.getSeconds(),
    milliseconds: from.getMilliseconds(),
  });
}
