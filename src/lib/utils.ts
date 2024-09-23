import { InterviewType } from "@/models/store";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InterviewSlot {
  interviewType: InterviewType;
  teamKey: string | null;
  time: Date;
  conflictsWithMatch: boolean;
}

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
