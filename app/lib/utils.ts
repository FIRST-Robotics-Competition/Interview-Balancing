import { type ClassValue, clsx } from 'clsx';
import { type Duration, add, intervalToDuration } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function interviewSlotOverlapsWithMatch(
  interviewStartTime: Date,
  interviewDuration: Duration,
  matchStartTime: Date,
  matchDuration: Duration,
): boolean {
  // First check if they're on the same date
  const interviewDate = new Date(
    interviewStartTime.getFullYear(),
    interviewStartTime.getMonth(),
    interviewStartTime.getDate(),
  );
  const matchDate = new Date(
    matchStartTime.getFullYear(),
    matchStartTime.getMonth(),
    matchStartTime.getDate(),
  );

  // If they're on different dates, there's no conflict
  if (interviewDate.getTime() !== matchDate.getTime()) {
    return false;
  }

  // If they're on the same date, check for time overlap
  const interviewEnd = add(interviewStartTime, interviewDuration);
  const matchEnd = add(matchStartTime, matchDuration);

  return interviewStartTime < matchEnd && interviewEnd > matchStartTime;
}

export const addDurations = (duration1: Duration, duration2: Duration) => {
  const baseDate = new Date(0);
  return intervalToDuration({
    start: baseDate,
    end: add(add(baseDate, duration1), duration2),
  });
};
