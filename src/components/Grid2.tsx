import React, { useMemo, useCallback, useState } from "react";
import { sumBy } from "lodash-es";
import RGL, { WidthProvider, Layout, DragOverEvent } from "react-grid-layout";
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
  const [layout, setLayout] = useState<Layout[]>([]);

  const totalCols = useMemo(
    () =>
      sumBy(
        Object.values(store.interviewConfigs),
        (c: InterviewConfig) => c.numPanels
      ) + 1,
    [store.interviewConfigs]
  );

  const columnRanges = useMemo(() => {
    let currentX = 1; // Start after the time column
    return Object.entries(store.interviewConfigs).reduce(
      (acc, [type, config]) => {
        acc[type] = { start: currentX, end: currentX + config.numPanels - 1 };
        currentX += config.numPanels;
        return acc;
      },
      {} as Record<string, { start: number; end: number }>
    );
  }, [store.interviewConfigs]);

  const generateLayout = useCallback((): Layout[] => {
    const timeLayout = timeSlots.map((time, index) => ({
      i: `time-${index}`,
      x: 0,
      y: index,
      w: 1,
      h: 1,
      static: true,
    }));

    const interviewLayouts = Object.entries(store.interviewConfigs).flatMap(
      ([type, config]) => {
        const { start } = columnRanges[type];
        return config.teams.map((team, index) => ({
          i: `${type}-team-${index}`,
          x: start + (index % config.numPanels),
          y: Math.floor(index / config.numPanels),
          w: 1,
          h: 1,
        }));
      }
    );

    return [...timeLayout, ...interviewLayouts];
  }, [timeSlots, store.interviewConfigs, columnRanges]);

  const generateDOM = useCallback(() => {
    const layout = generateLayout();
    return layout.map((l) => {
      if (l.i.startsWith("time-")) {
        const timeIndex = parseInt(l.i.split("-")[1]);
        return (
          <div
            key={l.i}
            data-grid={l}
            className="bg-white p-2 shadow-md border border-gray-200"
          >
            <span className="text-black text-sm">
              {timeSlots[timeIndex].toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
          </div>
        );
      } else {
        const [type, _, teamIndex] = l.i.split("-");
        return (
          <div
            key={l.i}
            data-grid={l}
            className="bg-blue-200 p-2 shadow-md border border-gray-200"
          >
            <span className="text-black text-sm">
              {
                store.interviewConfigs[type as InterviewType].teams[
                  parseInt(teamIndex)
                ]
              }
            </span>
          </div>
        );
      }
    });
  }, [generateLayout, timeSlots, store.interviewConfigs]);

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

  // const onDrag = useCallback(
  //   (layout: Layout[], oldItem: Layout, newItem: Layout) => {
  //     const [type] = newItem.i.split("-");
  //     const { start, end } = columnRanges[type];

  //     if (newItem.x < start) {
  //       newItem.x = start;
  //     } else if (newItem.x > end) {
  //       newItem.x = end;
  //     }
  //   },
  //   [columnRanges]
  // );

  const onDropDragOver = useCallback(
    (e: DragOverEvent): { w?: number; h?: number } | false | undefined => {
      console.log(e);

      return undefined;
    },
    [columnRanges]
  );

  return (
    <div className="bg-gray-200 p-4 rounded">
      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={totalCols}
        rowHeight={50}
        width={1200}
        compactType={"vertical"}
        preventCollision={false}
        margin={[1, 1]}
        onDragStart={onDragStart}
        onDragStop={onDragStop}
        // // onDrag={onDrag}
        isDraggable={true}
        isResizable={true}
      >
        {generateDOM()}
      </ReactGridLayout>
    </div>
  );
};

export default InterviewGrid;
