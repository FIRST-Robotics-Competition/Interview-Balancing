import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import useAppStore, { InterviewType } from "@/models/store";
import { calculateColumnRowHeights, cn } from "@/lib/utils";

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

interface InterviewSlot {
  interviewType: InterviewType;
  teamKey: string | null;
}

const CellWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { rowHeight: number }
>(({ className, rowHeight, children, ...props }, ref) => (
  <div>
    <div className={cn("flex h-full border-b", className)} ref={ref} {...props}>
      <div className="" style={{ height: `${rowHeight}px` }} />
      {children}
    </div>
  </div>
));
CellWrapper.displayName = "CellWrapper";

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
        index < teams.length ? { ...slot, teamKey: teams[index] } : slot
      )
    );
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    setDlInterviewSlots((prevSlots) => {
      const newSlots = Array.from(prevSlots);
      const [reorderedItem] = newSlots.splice(source.index, 1);
      newSlots.splice(destination.index, 0, reorderedItem);
      return newSlots;
    });
  };

  useEffect(() => {
    console.log(dlInterviewSlots);
  }, [dlInterviewSlots]);

  const rowHeights = calculateColumnRowHeights(20, 30);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-row space-x-4 p-4">
        <div className="w-1/4">
          <h2 className="text-lg font-semibold mb-2">Times</h2>
          <div className="">
            {dlTimeSlots.map((time, index) => (
              <CellWrapper
                rowHeight={rowHeights[0]}
                key={`time-${index}`}
                className="bg-gray-100 rounded border-b"
              >
                {time}
              </CellWrapper>
            ))}
          </div>
        </div>

        <Droppable droppableId="column-2">
          {(droppableProvided) => (
            <div
              className="w-1/4"
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
            >
              <h2 className="text-lg font-semibold mb-2">Team</h2>

              {dlInterviewSlots.map((slot, index) => (
                <Draggable
                  key={`${slot.interviewType}-${index}`}
                  draggableId={`${slot.interviewType}-${index}`}
                  index={index}
                >
                  {(draggableProvided) => (
                    <CellWrapper
                      key={`time-${index}`}
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      rowHeight={rowHeights[0]}
                      className={cn({
                        "bg-blue-100": slot.teamKey !== null,
                        "bg-gray-100": slot.teamKey === null,
                      })}
                    >
                      {slot.teamKey !== null ? slot.teamKey : ""}
                    </CellWrapper>
                  )}
                </Draggable>
              ))}

              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}

export default DNDGrid;
