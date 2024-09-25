import { getEventSchedule, getEventTeams } from "@/lib/api";
import { updateTeamTimeSlots } from "@/lib/slotAssignments";
import { InterviewSlot, generateTimeSlots } from "@/lib/utils";
import { Event, Schedule, TeamList } from "@/models/api";
import { ImpactExportCSV } from "@/models/schemas";
import { addDays, setHours } from "date-fns";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";

export enum InterviewType {
  IMPACT = "Impact",
  DEANS_LIST = "Dean's List",
}

export interface InterviewConfig {
  numPanels: number;
  windowSizeMinutes: number;
}

export interface AppState {
  event?: Event;
  setEvent: (event: Event) => void;

  eventTeams?: TeamList;
  setEventTeams: (teams: TeamList) => void;

  schedule?: Schedule;
  setSchedule: (schedule: Schedule) => void;

  startDate: Date;
  setStartDate: (date: Date) => void;

  endDate: Date;
  setEndDate: (date: Date) => void;

  timeSlots: Record<InterviewType, Date[]>;
  updateTimeSlots: (type: InterviewType, timeSlots: Date[]) => void;

  interviewingTeams: Record<InterviewType, string[]>;
  updateInterviewingTeams: (type: InterviewType, teams: string[]) => void;

  interviewSlots: Record<InterviewType, InterviewSlot[]>;
  updateInterviewSlots: (
    type: InterviewType,
    interviewSlots: InterviewSlot[],
  ) => void;

  validImpactExportCSVData: ImpactExportCSV | null;
  setValidImpactExportCSVData: (data: ImpactExportCSV | null) => void;

  impactExportCSVValidationErrors: string[];
  setImpactExportCSVValidationErrors: (errors: string[]) => void;

  interviewConfigs: Record<InterviewType, InterviewConfig>;
  updateInterviewConfig: (
    type: InterviewType,
    updates: Partial<InterviewConfig>,
  ) => void;
}

const useAppStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    event: undefined,
    setEvent: async (event) => {
      const teams = await getEventTeams(event.code);
      const schedule = await getEventSchedule(event.code);

      set(() => ({
        event,
        eventTeams: teams,
        schedule,
        interviewingTeams: {
          [InterviewType.IMPACT]: teams.teams.map((t) =>
            t.teamNumber.toString(),
          ),
          [InterviewType.DEANS_LIST]: teams.teams.map((t) =>
            t.teamNumber.toString(),
          ),
        },
      }));
    },

    eventTeams: undefined,
    setEventTeams: (teams) => set({ eventTeams: teams }),

    schedule: undefined,
    setSchedule: (schedule) => set({ schedule }),

    startDate: setHours(new Date(2024, 0, 1), 11),
    setStartDate: (date) => set({ startDate: date }),

    endDate: setHours(new Date(2024, 0, 1), 18),
    setEndDate: (date) => set({ endDate: date }),

    timeSlots: {
      [InterviewType.IMPACT]: [],
      [InterviewType.DEANS_LIST]: [],
    },
    updateTimeSlots: (type, updatedSlots) =>
      set((state) => ({
        timeSlots: { ...state.timeSlots, [type]: updatedSlots },
      })),

    interviewSlots: {
      [InterviewType.IMPACT]: [],
      [InterviewType.DEANS_LIST]: [],
    },
    updateInterviewSlots: (type, updatedSlots) =>
      set((state) => ({
        interviewSlots: { ...state.interviewSlots, [type]: updatedSlots },
      })),

    validImpactExportCSVData: null,
    setValidImpactExportCSVData: (data) =>
      set((state) => {
        if (data === null) {
          return { validImpactExportCSVData: data };
        }

        return {
          validImpactExportCSVData: data,
          interviewConfigs: {
            ...state.interviewConfigs,
            [InterviewType.IMPACT]: {
              ...state.interviewConfigs[InterviewType.IMPACT],
              teams: data.map((r) => r["Team Number"]),
            },
          },
        };
      }),

    impactExportCSVValidationErrors: [],
    setImpactExportCSVValidationErrors: (errors) =>
      set({ impactExportCSVValidationErrors: errors }),

    interviewingTeams: {
      [InterviewType.IMPACT]: [],
      [InterviewType.DEANS_LIST]: [],
    },
    updateInterviewingTeams: (type, teams) =>
      set((state) => ({
        interviewingTeams: { ...state.interviewingTeams, [type]: teams },
      })),

    interviewConfigs: {
      [InterviewType.IMPACT]: {
        numPanels: 2,
        windowSizeMinutes: 12,
      },
      [InterviewType.DEANS_LIST]: {
        numPanels: 1,
        windowSizeMinutes: 7,
      },
    },

    updateInterviewConfig: (type, updates) =>
      set((state) => ({
        interviewConfigs: {
          ...state.interviewConfigs,
          [type]: {
            ...state.interviewConfigs[type],
            ...updates,
          },
        },
      })),
  })),
);

useAppStore.subscribe((state) => {
  console.log(state);
});

// When event is set, change the start and end dates to the second day of the event
// (usually the day after load-in)
useAppStore.subscribe(
  (state) => state.event,
  (event) => {
    if (event === undefined) {
      return;
    }

    useAppStore.getState().setStartDate(addDays(new Date(event.dateStart), 1));
    useAppStore.getState().setEndDate(addDays(new Date(event.dateStart), 1));
  },
);

// When the start or end date changes, update the time slots
useAppStore.subscribe(
  (state) => [state.startDate, state.endDate],
  ([startDate, endDate]) => {
    if (startDate === undefined || endDate === undefined) {
      return;
    }

    for (const type of Object.values(InterviewType)) {
      useAppStore
        .getState()
        .updateTimeSlots(
          type,
          generateTimeSlots(
            startDate,
            endDate,
            useAppStore.getState().interviewConfigs[type].windowSizeMinutes,
          ),
        );
    }
  },
  {
    equalityFn: shallow,
  },
);

// When the time slots or the team list changes, update the interview slots
useAppStore.subscribe(
  (state) => state.timeSlots,
  (timeSlots) => {
    for (const type of Object.values(InterviewType)) {
      useAppStore.getState().updateInterviewSlots(
        type,
        updateTeamTimeSlots(
          useAppStore.getState().interviewingTeams[type],
          timeSlots[type],
          useAppStore.getState().schedule ?? [],
          timeSlots[type].map((time, idx) => ({
            interviewType: type,
            time,
            teamInfo: {
              teamKey: useAppStore.getState().interviewingTeams[type][idx],
              scannedInfo: null,
            },
          })),
          useAppStore.getState().interviewConfigs[type].windowSizeMinutes,
        ),
      );
    }
  },
);

useAppStore.subscribe(
  (state) => state.interviewingTeams,
  (teams) => {
    for (const type of Object.values(InterviewType)) {
      useAppStore
        .getState()
        .updateInterviewSlots(
          type,
          updateTeamTimeSlots(
            teams[type],
            useAppStore.getState().timeSlots[type],
            useAppStore.getState().schedule ?? [],
            useAppStore.getState().interviewSlots[type],
            useAppStore.getState().interviewConfigs[type].windowSizeMinutes,
          ),
        );
    }
  },
);

export default useAppStore;
