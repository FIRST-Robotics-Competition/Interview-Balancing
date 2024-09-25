import { useEffect, useRef } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import useAppStore, { InterviewType } from "@/models/store";
import { calculateColumnRowHeights } from "@/lib/utils";
import TimeColumn from "@/components/grid/timeColumn";
import InterviewColumn from "@/components/grid/interviewColumn";
import { setHours } from "date-fns";
import { scanForSingleTeamsConflicts } from "@/lib/slotAssignments";

function DNDGrid() {
  const store = useAppStore();
  const startDateRef = useRef(useAppStore.getState().startDate);
  const endDateRef = useRef(useAppStore.getState().startDate);

  useEffect(
    () =>
      useAppStore.subscribe((state) => {
        startDateRef.current = state.startDate;
        endDateRef.current = state.endDate;
      }),
    [],
  );

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (source.droppableId === "column-2") {
      // setDlInterviewSlots((prevSlots) => {
      //   const newSlots = Array.from(prevSlots);
      //   const [reorderedItem] = newSlots.splice(source.index, 1);
      //   newSlots.splice(destination.index, 0, reorderedItem);
      //   const zippedSlots = newSlots.map((slot, index) => ({
      //     ...slot,
      //     time: dlTimeSlots[index],
      //   }));
      //   console.log(zippedSlots);
      //   return scanForConflicts(
      //     zippedSlots,
      //     store.schedule ?? [],
      //     store.interviewConfigs[InterviewType.DEANS_LIST].windowSizeMinutes
      //   );
      // });

      const newSlots = Array.from(
        store.interviewSlots[InterviewType.DEANS_LIST],
      );
      const [reorderedItem] = newSlots.splice(source.index, 1);
      newSlots.splice(destination.index, 0, reorderedItem);
      const zippedSlots = newSlots
        .map((slot, index) => ({
          ...slot,
          time: store.timeSlots[InterviewType.DEANS_LIST][index],
        }))
        .map((slot) =>
          slot.teamInfo?.teamKey === null
            ? slot
            : scanForSingleTeamsConflicts(
                slot,
                store.schedule ?? [],
                store.interviewConfigs[InterviewType.DEANS_LIST]
                  .windowSizeMinutes,
              ),
        );

      store.updateInterviewSlots(InterviewType.DEANS_LIST, zippedSlots);
    } else {
      // setImpactInterviewSlots((prevSlots) => {
      //   const newSlots = Array.from(prevSlots);
      //   const [reorderedItem] = newSlots.splice(source.index, 1);
      //   newSlots.splice(destination.index, 0, reorderedItem);
      //   const zippedSlots = newSlots.map((slot, index) => ({
      //     ...slot,
      //     time: impactTimeSlots[index],
      //   }));
      //   return scanForConflicts(
      //     zippedSlots,
      //     store.schedule ?? [],
      //     store.interviewConfigs[InterviewType.IMPACT].windowSizeMinutes
      //   );
      // });
    }
  };

  const rowHeights = calculateColumnRowHeights(
    store.interviewConfigs[InterviewType.DEANS_LIST].windowSizeMinutes,
    store.interviewConfigs[InterviewType.IMPACT].windowSizeMinutes,
  );

  useEffect(() => {
    store.setStartDate(setHours(new Date(2024, 0, 1), 11));
    store.setEndDate(setHours(new Date(2024, 0, 1), 18));
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-row space-x-4 p-4">
        <div className="w-1/4">
          <h2 className="text-lg font-semibold mb-2">Times</h2>
          <TimeColumn
            timeSlots={store.timeSlots[InterviewType.DEANS_LIST]}
            rowHeight={rowHeights[0]}
          />
        </div>

        <InterviewColumn
          interviewSlots={store.interviewSlots[InterviewType.DEANS_LIST]}
          rowHeight={rowHeights[0]}
          columnId="column-2"
        />

        <div className="w-1/4">
          <h2 className="text-lg font-semibold mb-2">Times</h2>
          <TimeColumn
            timeSlots={store.timeSlots[InterviewType.IMPACT]}
            rowHeight={rowHeights[1]}
          />
        </div>

        <InterviewColumn
          interviewSlots={store.interviewSlots[InterviewType.IMPACT]}
          rowHeight={rowHeights[1]}
          columnId="column-3"
        />
      </div>
    </DragDropContext>
  );
}

export default DNDGrid;
