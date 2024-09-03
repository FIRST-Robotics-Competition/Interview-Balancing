import { Event } from "@/models/api";
import { create } from "zustand";

interface AppState {
  event?: Event;
  setEvent: (event: Event) => void;

  numPanels: number;
  setNumPanels: (numPanels: number) => void;

  teams: string[];
  setTeams: (teams: string[]) => void;

  windowSizeMinutes: number;
  setWindowSizeMinutes: (windowSizeMinutes: number) => void;
}

const useAppStore = create<AppState>((set) => ({
  event: undefined,
  setEvent: (event) => set({ event }),

  numPanels: 2,
  setNumPanels: (numPanels) => set({ numPanels }),

  teams: [
    "125",
    "3467",
    "78",
    "131",
    "2713",
    "1922",
    "509",
    "716",
    "2877",
    "246",
    "5735",
    "2067",
    "2084",
    "2876",
    "9729",
    "238",
  ],
  setTeams: (teams) => set({ teams }),

  windowSizeMinutes: 10,
  setWindowSizeMinutes: (windowSizeMinutes) => set({ windowSizeMinutes }),
}));

export default useAppStore;
