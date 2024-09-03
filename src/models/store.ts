import { Event } from "@/models/api";
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
  setEvent: (event) => set({ event }),

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
      teams: [
        "1",
        "3",
        "5",
        "7",
        "9",
        "11",
        "13",
        "15",
        "17",
        "19",
        "21",
        "23",
        "25",
      ],
      windowSizeMinutes: 12,
    },
    [InterviewType.DEANS_LIST]: {
      numPanels: 1,
      teams: [
        "2",
        "4",
        "6",
        "8",
        "10",
        "12",
        "14",
        "16",
        "18",
        "20",
        "22",
        "24",
        "26",
      ],
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

export default useAppStore;
