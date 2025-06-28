import type { Duration } from 'date-fns';
import { create } from 'zustand';
import { createComputed } from 'zustand-computed';

import type { Event, Match } from '~/lib/apiTypes';
import { addDurations, interviewSlotOverlapsWithMatch } from '~/lib/utils';

export interface JudgeTrack {
  judgeNames: string[];
  awardName: string;
  interviewDuration: Duration;
  breakDuration: Duration;
  startTime: Date;
  endTime: Date;
  date: Date;
  interviewSlotTimes: Date[];
  interviewSlotTeamKeys: string[];
}

export interface Conflict {
  judgeTrackIndex: number;
  interviewSlotIndex: number;
  match: Match;
}

interface AppStore {
  teamKeys: string[];
  addTeamKey: (key: string) => void;
  removeTeamKey: (key: string) => void;
  setTeamKeys: (keys: string[]) => void;

  judgeTracks: JudgeTrack[];
  addJudgeTrack: (track: JudgeTrack) => void;
  removeJudgeTrack: (track: JudgeTrack) => void;
  setJudgeTracks: (tracks: JudgeTrack[]) => void;
  createJudgeTrack: (event: Event) => void;
  setTeamKeyForInterviewSlot: (
    judgeTrackIndex: number,
    interviewSlotIndex: number,
    teamKey: string,
  ) => void;

  matches: Match[];
  setMatches: (matches: Match[]) => void;
}

const DEFAULT_INTERVIEW_DURATION: Duration = {
  hours: 0,
  minutes: 10,
  seconds: 0,
};
const DEFAULT_BREAK_DURATION: Duration = { hours: 0, minutes: 5, seconds: 0 };
const DEFAULT_START_TIME: Duration = { hours: 8, minutes: 0, seconds: 0 };
const DEFAULT_END_TIME: Duration = { hours: 16, minutes: 0, seconds: 0 };

function isDurationLessThan(duration: Duration, durationToCompare: Duration) {
  return (
    (duration.hours ?? 0) < (durationToCompare.hours ?? 0) ||
    (duration.minutes ?? 0) < (durationToCompare.minutes ?? 0) ||
    (duration.seconds ?? 0) < (durationToCompare.seconds ?? 0)
  );
}

function createInterviewSlotsBetweenTimes(
  startTime: Duration,
  endTime: Duration,
  interviewDuration: Duration,
  breakDuration: Duration,
) {
  const times: Duration[] = [];
  let currentTime = startTime;

  while (isDurationLessThan(currentTime, endTime)) {
    times.push(currentTime);
    currentTime = addDurations(currentTime, interviewDuration);
    currentTime = addDurations(currentTime, breakDuration);
  }

  return times;
}

type ComputedStore = {
  conflicts: Conflict[];
};

const computed = createComputed((state: AppStore): ComputedStore => {
  const conflicts: Conflict[] = [];

  state.judgeTracks.forEach((judgeTrack, judgeTrackIndex) => {
    judgeTrack.interviewSlotTimes.forEach(
      (interviewSlot, interviewSlotIndex) => {
        for (const match of state.matches.filter((m) =>
          m.teams
            .map((t) => t.teamNumber.toString())
            .includes(judgeTrack.interviewSlotTeamKeys[interviewSlotIndex]),
        )) {
          if (
            interviewSlotOverlapsWithMatch(
              interviewSlot,
              judgeTrack.interviewDuration,
              new Date(match.startTime ?? ''),
              { minutes: 5 },
            )
          ) {
            console.log(interviewSlot.toISOString());
            console.log(new Date(match.startTime ?? '').toISOString());
            conflicts.push({
              judgeTrackIndex,
              interviewSlotIndex,
              match,
            });
          }
        }
      },
    );
  });

  return { conflicts };
});

export const useAppStore = create<AppStore>()(
  computed((set) => ({
    // team keys
    teamKeys: [],
    addTeamKey: (key: string) =>
      set((state) => ({
        teamKeys: state.teamKeys.includes(key)
          ? state.teamKeys
          : [...state.teamKeys, key],
      })),
    removeTeamKey: (key: string) =>
      set((state) => ({
        teamKeys: state.teamKeys.filter((teamKey) => teamKey !== key),
      })),
    setTeamKeys: (keys: string[]) => set({ teamKeys: keys }),

    // judge tracks
    judgeTracks: [],
    addJudgeTrack: (track: JudgeTrack) =>
      set((state) => ({
        judgeTracks: [...state.judgeTracks, track],
      })),
    removeJudgeTrack: (track: JudgeTrack) =>
      set((state) => ({
        judgeTracks: state.judgeTracks.filter((t) => t !== track),
      })),
    setJudgeTracks: (tracks: JudgeTrack[]) => set({ judgeTracks: tracks }),
    createJudgeTrack: (event: Event) => {
      const interviewSlotTimes = createInterviewSlotsBetweenTimes(
        DEFAULT_START_TIME,
        DEFAULT_END_TIME,
        DEFAULT_INTERVIEW_DURATION,
        DEFAULT_BREAK_DURATION,
      );
      set((state) => ({
        judgeTracks: [
          ...state.judgeTracks,
          {
            judgeNames: [],
            awardName: '',
            interviewDuration: DEFAULT_INTERVIEW_DURATION,
            breakDuration: DEFAULT_BREAK_DURATION,
            startTime: new Date(
              new Date(event.dateStart).getFullYear(),
              new Date(event.dateStart).getMonth(),
              new Date(event.dateStart).getDate(),
              DEFAULT_START_TIME.hours ?? 0,
              DEFAULT_START_TIME.minutes ?? 0,
              DEFAULT_START_TIME.seconds ?? 0,
            ),
            endTime: new Date(
              new Date(event.dateStart).getFullYear(),
              new Date(event.dateStart).getMonth(),
              new Date(event.dateStart).getDate(),
              DEFAULT_END_TIME.hours ?? 0,
              DEFAULT_END_TIME.minutes ?? 0,
              DEFAULT_END_TIME.seconds ?? 0,
            ),
            date: new Date(event.dateStart),
            interviewSlotTimes: interviewSlotTimes.map(
              (t) =>
                new Date(
                  new Date(event.dateStart).getFullYear(),
                  new Date(event.dateStart).getMonth(),
                  new Date(event.dateStart).getDate(),
                  t.hours ?? 0,
                  t.minutes ?? 0,
                  t.seconds ?? 0,
                ),
            ),
            interviewSlotTeamKeys: interviewSlotTimes.map(() => ''),
          },
        ],
      }));
    },
    setTeamKeyForInterviewSlot: (
      judgeTrackIndex: number,
      interviewSlotIndex: number,
      teamKey: string,
    ) => {
      set((state) => ({
        judgeTracks: state.judgeTracks.map((track, index) =>
          index === judgeTrackIndex
            ? {
                ...track,
                interviewSlotTeamKeys: track.interviewSlotTeamKeys.map(
                  (tk, i) => (i === interviewSlotIndex ? teamKey : tk),
                ),
              }
            : track,
        ),
      }));
    },

    // matches
    matches: [],
    setMatches: (matches: Match[]) => set({ matches }),
  })),
);
