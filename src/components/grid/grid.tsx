import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import useAppStore, { InterviewType } from "@/models/store";
import { calculateColumnRowHeights, InterviewSlot } from "@/lib/utils";
import TimeColumn from "@/components/grid/timeColumn";
import InterviewColumn from "@/components/grid/interviewColumn";
import { scanForConflicts, updateTeamTimeSlots } from "@/lib/slotAssignments";
import { addMinutes } from "date-fns";

// startDate.setHours(11);
// endDate.setHours(18);

const generateTimeSlots = (
  startDate: Date,
  endDate: Date,
  duration: number
) => {
  startDate.setHours(8);
  endDate.setHours(18);

  const times = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const time = new Date(current);
    const newTime = addMinutes(time, duration);
    times.push(time);
    current = newTime;
  }

  return times;
};

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
    []
  );

  const dlTimeSlots = useMemo(
    () =>
      generateTimeSlots(
        startDateRef.current,
        endDateRef.current,
        store.interviewConfigs[InterviewType.DEANS_LIST].windowSizeMinutes
      ),
    [store.interviewConfigs, startDateRef, endDateRef]
  );
  const impactTimeSlots = useMemo(
    () =>
      generateTimeSlots(
        startDateRef.current,
        endDateRef.current,
        store.interviewConfigs[InterviewType.IMPACT].windowSizeMinutes
      ),
    [store.interviewConfigs, startDateRef, endDateRef]
  );

  const [dlInterviewSlots, setDlInterviewSlots] = useState<InterviewSlot[]>([]);

  useEffect(() => {
    setDlInterviewSlots(
      dlTimeSlots.map((time) => ({
        interviewType: InterviewType.DEANS_LIST,
        teamKey: null,
        time,
        conflictsWithMatch: false,
      }))
    );
  }, [dlTimeSlots, store.schedule]);

  useEffect(() => {
    const teams = store.interviewConfigs[InterviewType.DEANS_LIST].teams;

    setDlInterviewSlots((prevSlots) =>
      updateTeamTimeSlots(
        teams,
        dlTimeSlots,
        store.schedule ?? [],
        prevSlots,
        store.interviewConfigs[InterviewType.DEANS_LIST].windowSizeMinutes
      )
    );
  }, [store.interviewConfigs, dlTimeSlots, store.schedule]);

  const [impactInterviewSlots, setImpactInterviewSlots] = useState<
    InterviewSlot[]
  >([]);

  useEffect(() => {
    setImpactInterviewSlots(
      impactTimeSlots.map((time) => ({
        interviewType: InterviewType.IMPACT,
        teamKey: null,
        time,
        conflictsWithMatch: false,
      }))
    );
  }, [impactTimeSlots, store.schedule]);

  useEffect(() => {
    const teams = store.interviewConfigs[InterviewType.IMPACT].teams;

    setImpactInterviewSlots((prevSlots) =>
      updateTeamTimeSlots(
        teams,
        impactTimeSlots,
        store.schedule ?? [],
        prevSlots,
        store.interviewConfigs[InterviewType.IMPACT].windowSizeMinutes
      )
    );
  }, [store.interviewConfigs, impactTimeSlots, store.schedule]);

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
      setDlInterviewSlots((prevSlots) => {
        const newSlots = Array.from(prevSlots);
        const [reorderedItem] = newSlots.splice(source.index, 1);
        newSlots.splice(destination.index, 0, reorderedItem);

        const zippedSlots = newSlots.map((slot, index) => ({
          ...slot,
          time: dlTimeSlots[index],
        }));

        console.log(zippedSlots);

        return scanForConflicts(
          zippedSlots,
          store.schedule ?? [],
          store.interviewConfigs[InterviewType.DEANS_LIST].windowSizeMinutes
        );
      });
    } else {
      setImpactInterviewSlots((prevSlots) => {
        const newSlots = Array.from(prevSlots);
        const [reorderedItem] = newSlots.splice(source.index, 1);
        newSlots.splice(destination.index, 0, reorderedItem);

        const zippedSlots = newSlots.map((slot, index) => ({
          ...slot,
          time: impactTimeSlots[index],
        }));

        return scanForConflicts(
          zippedSlots,
          store.schedule ?? [],
          store.interviewConfigs[InterviewType.IMPACT].windowSizeMinutes
        );
      });
    }
  };

  const rowHeights = calculateColumnRowHeights(
    store.interviewConfigs[InterviewType.DEANS_LIST].windowSizeMinutes,
    store.interviewConfigs[InterviewType.IMPACT].windowSizeMinutes
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-row space-x-4 p-4">
        <div className="w-1/4">
          <h2 className="text-lg font-semibold mb-2">Times</h2>
          <TimeColumn timeSlots={dlTimeSlots} rowHeight={rowHeights[0]} />
        </div>

        <InterviewColumn
          interviewSlots={dlInterviewSlots}
          rowHeight={rowHeights[0]}
          columnId="column-2"
        />

        <div className="w-1/4">
          <h2 className="text-lg font-semibold mb-2">Times</h2>
          <TimeColumn timeSlots={impactTimeSlots} rowHeight={rowHeights[1]} />
        </div>

        <InterviewColumn
          interviewSlots={impactInterviewSlots}
          rowHeight={rowHeights[1]}
          columnId="column-3"
        />
      </div>
    </DragDropContext>
  );
}

export default DNDGrid;
