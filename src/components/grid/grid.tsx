import { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import useAppStore, { InterviewType } from "@/models/store";
import { calculateColumnRowHeights, InterviewSlot } from "@/lib/utils";
import TimeColumn from "@/components/grid/timeColumn";
import InterviewColumn from "@/components/grid/interviewColumn";

const startDate = new Date(2024, 8, 19);
const endDate = new Date(2024, 8, 20);

const generateTimeSlots = (
  startDate: Date,
  endDate: Date,
  duration: number
) => {
  const times = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const time = new Date(current);
        time.setHours(hour, minute);
        times.push(
          time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return times;
};

const dlTimeSlots = generateTimeSlots(startDate, endDate, 20);
const impactTimeSlots = generateTimeSlots(startDate, endDate, 30);

function DNDGrid() {
  const store = useAppStore();

  const [dlInterviewSlots, setDlInterviewSlots] = useState<InterviewSlot[]>(
    dlTimeSlots.map((_) => ({
      interviewType: InterviewType.DEANS_LIST,
      teamKey: null,
    }))
  );

  useEffect(() => {
    const teams = store.interviewConfigs[InterviewType.DEANS_LIST].teams;

    setDlInterviewSlots((prevSlots) =>
      prevSlots.map((slot, index) =>
        index < teams.length
          ? { ...slot, teamKey: teams[index] }
          : { ...slot, teamKey: null }
      )
    );
  }, [store.interviewConfigs]);

  const [impactInterviewSlots, setImpactInterviewSlots] = useState<
    InterviewSlot[]
  >(
    impactTimeSlots.map((_) => ({
      interviewType: InterviewType.IMPACT,
      teamKey: null,
    }))
  );

  useEffect(() => {
    const teams = store.interviewConfigs[InterviewType.IMPACT].teams;

    setImpactInterviewSlots((prevSlots) =>
      prevSlots.map((slot, index) =>
        index < teams.length
          ? { ...slot, teamKey: teams[index] }
          : { ...slot, teamKey: null }
      )
    );
  }, [store.interviewConfigs]);

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
        return newSlots;
      });
    } else {
      setImpactInterviewSlots((prevSlots) => {
        const newSlots = Array.from(prevSlots);
        const [reorderedItem] = newSlots.splice(source.index, 1);
        newSlots.splice(destination.index, 0, reorderedItem);
        return newSlots;
      });
    }
  };

  const rowHeights = calculateColumnRowHeights(20, 30);

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
