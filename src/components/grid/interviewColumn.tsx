import CellWrapper from "@/components/grid/cell";
import { cn, InterviewSlot } from "@/lib/utils";
import { Draggable, Droppable } from "@hello-pangea/dnd";

export default function InterviewColumn({
  interviewSlots,
  rowHeight,
  columnId,
}: {
  interviewSlots: InterviewSlot[];
  rowHeight: number;
  columnId: string;
}) {
  return (
    <Droppable droppableId={columnId}>
      {(droppableProvided) => (
        <div
          className="w-1/4"
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
        >
          <h2 className="text-lg font-semibold mb-2">Team</h2>

          {interviewSlots.map((slot, index) => (
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
                  rowHeight={rowHeight}
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
  );
}
