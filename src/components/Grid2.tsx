import React, { useMemo, useCallback } from "react";
import { sumBy } from "lodash-es";
import RGL, { WidthProvider, Layout } from "react-grid-layout";
import useAppStore, { InterviewConfig, InterviewType } from "@/models/store";

const ReactGridLayout = WidthProvider(RGL);

const isBrowser = typeof window !== "undefined";

function generateTimeSlots(): Date[] {
  const today = new Date();
  const timeSlots: Date[] = [];

  const startTime = new Date(today);
  startTime.setHours(7, 0, 0, 0); // Set start time to 7:00 AM

  const endTime = new Date(today);
  endTime.setHours(18, 0, 0, 0); // Set end time to 6:00 PM

  while (startTime <= endTime) {
    timeSlots.push(new Date(startTime));

    // Increment by 5 minutes
    startTime.setMinutes(startTime.getMinutes() + 5);
  }

  return timeSlots;
}

const InterviewGrid: React.FC = () => {
  const store = useAppStore();
  const teams = store.interviewConfigs[InterviewType.IMPACT].teams;
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const totalCols = useMemo(
    () =>
      sumBy(
        Object.values(store.interviewConfigs),
        (c: InterviewConfig) => c.numPanels
      ) + 1,
    [store.interviewConfigs]
  );

  const generateLayout = useCallback((): Layout[] => {
    const timeLayout = timeSlots.map((time, index) => ({
      i: `time-${index}`,
      x: 0,
      y: index,
      w: 1,
      h: 1,
      static: true,
    }));

    const teamLayout = teams.map((team, index) => ({
      i: `team-${index}`,
      x: 1,
      y: index,
      w: 1,
      h: 1,
      isDraggable: true,
      isResizable: false,
    }));

    return [...timeLayout, ...teamLayout];
  }, [timeSlots, teams]);

  const generateDOM = useCallback(() => {
    const layout = generateLayout();
    return layout.map((l) => {
      if (l.i.startsWith("time-")) {
        const timeIndex = parseInt(l.i.split("-")[1]);
        return (
          <div
            key={l.i}
            data-grid={l}
            className="bg-white p-2 shadow-md rounded"
          >
            <span className="text-black">
              {timeSlots[timeIndex].toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
          </div>
        );
      } else if (l.i.startsWith("team-")) {
        const teamIndex = parseInt(l.i.split("-")[1]);
        return (
          <div
            key={l.i}
            data-grid={l}
            className="bg-blue-200 p-2 shadow-md rounded"
          >
            <span className="text-black">{teams[teamIndex]}</span>
          </div>
        );
      }
      return null;
    });
  }, [generateLayout, timeSlots, teams]);

  const onDragStart = useCallback(() => {
    if (isBrowser) {
      document.querySelector("body")?.classList.add("select-none");
    }
  }, []);

  const onDragStop = useCallback(() => {
    if (isBrowser) {
      document.querySelector("body")?.classList.remove("select-none");
    }
  }, []);

  return (
    <div className="bg-gray-200 p-4 rounded">
      <ReactGridLayout
        className="layout"
        layout={generateLayout()}
        cols={totalCols}
        rowHeight={30}
        width={1200}
        compactType={null}
        preventCollision={true}
        onDragStart={onDragStart}
        onDragStop={onDragStop}
        isDraggable={false}
        isResizable={false}
      >
        {generateDOM()}
      </ReactGridLayout>
    </div>
  );
};

export default InterviewGrid;
