import { getEventSchedule, getEventTeams } from "@/lib/api";
import { Event, Schedule, TeamList } from "@/models/api";
import { ImpactExportCSV } from "@/models/schemas";
import { create } from "zustand";

export enum InterviewType {
  IMPACT = "Impact",
  DEANS_LIST = "Dean's List",
}

export interface InterviewConfig {
  numPanels: number;
  teams: string[];
  windowSizeMinutes: number;
}

export interface AppState {
  event?: Event;
  setEvent: (event: Event) => void;

  eventTeams?: TeamList;
  setEventTeams: (teams: TeamList) => void;

  schedule?: Schedule;
  setSchedule: (schedule: Schedule) => void;

  validImpactExportCSVData: ImpactExportCSV | null;
  setValidImpactExportCSVData: (data: ImpactExportCSV | null) => void;

  impactExportCSVValidationErrors: string[];
  setImpactExportCSVValidationErrors: (errors: string[]) => void;

  interviewConfigs: Record<InterviewType, InterviewConfig>;
  updateInterviewConfig: (
    type: InterviewType,
    updates: Partial<InterviewConfig>
  ) => void;
}

const useAppStore = create<AppState>((set) => ({
  event: undefined,
  setEvent: async (event) => {
    const teams = await getEventTeams(event.code);
    const schedule = await getEventSchedule(event.code);

    set((state) => {
      const configs = {
        ...state.interviewConfigs,
        [InterviewType.IMPACT]: {
          ...state.interviewConfigs[InterviewType.IMPACT],
          teams: teams.teams.map((t) => t.teamNumber.toString()),
        },
        [InterviewType.DEANS_LIST]: {
          ...state.interviewConfigs[InterviewType.DEANS_LIST],
          teams: teams.teams.map((t) => t.teamNumber.toString()),
        },
      };

      return { event, eventTeams: teams, schedule, interviewConfigs: configs };
    });
  },

  eventTeams: undefined,
  setEventTeams: (teams) => set({ eventTeams: teams }),

  schedule: undefined,
  setSchedule: (schedule) => set({ schedule }),

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

  interviewConfigs: {
    [InterviewType.IMPACT]: {
      numPanels: 2,
      teams: [],
      windowSizeMinutes: 12,
    },
    [InterviewType.DEANS_LIST]: {
      numPanels: 1,
      teams: [],
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
}));

useAppStore.subscribe((state) => {
  console.log(state);
});

export default useAppStore;
