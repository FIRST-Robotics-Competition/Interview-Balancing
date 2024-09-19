import { type ClassValue, clsx } from "clsx";
import {
  addDays,
  addMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  setHours,
  setMinutes,
} from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TimeSlot {
  id: string;
  timeSlot: Date;
  day: Date;
}

export const generateTimeSlots = (
  startDate: Date,
  endDate: Date,
  startTime: string,
  endTime: string,
  duration: number
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  // Parse start and end times
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentDate = startDate;

  while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
    let currentTime = setMinutes(setHours(currentDate, startHour), startMinute);
    const endOfDay = setMinutes(setHours(currentDate, endHour), endMinute);

    while (isBefore(currentTime, endOfDay) || isEqual(currentTime, endOfDay)) {
      if (!isAfter(currentTime, endDate)) {
        slots.push({
          id: `${format(currentDate, "yyyy-MM-dd")}-${format(
            currentTime,
            "HH:mm"
          )}`,
          timeSlot: new Date(currentTime),
          day: new Date(currentDate),
        });
      }

      currentTime = addMinutes(currentTime, duration);
    }

    currentDate = addDays(currentDate, 1);
  }

  return slots;
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
  return durations.map((d) => Math.floor(d / gcf) * 15);
}
