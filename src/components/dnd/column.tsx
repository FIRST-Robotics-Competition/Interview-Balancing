import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import type {
  DroppableProvided,
  DroppableStateSnapshot,
} from "@hello-pangea/dnd";
import Task from "./task";
import type { Column as ColumnType, Task as TaskType, Id } from "./types";

interface Props {
  column: ColumnType;
  tasks: TaskType[];
  selectedTaskIds: Id[];
  draggingTaskId: Id | undefined | null;
  toggleSelection: (taskId: Id) => void;
  toggleSelectionInGroup: (taskId: Id) => void;
  multiSelectTo: (taskId: Id) => void;
}

const Column: React.FC<Props> = ({
  column,
  tasks,
  selectedTaskIds,
  draggingTaskId,
  toggleSelection,
  toggleSelectionInGroup,
  multiSelectTo,
}) => {
  const getSelectedMap = React.useMemo(
    () =>
      selectedTaskIds.reduce((acc: Record<Id, boolean>, id: Id) => {
        acc[id] = true;
        return acc;
      }, {}),
    [selectedTaskIds]
  );

  return (
    <div className="w-[300px] m-2 rounded border border-gray-300 bg-gray-100 flex flex-col">
      <h3 className="font-bold p-2">{column.title}</h3>
      <Droppable droppableId={column.id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            className={`p-2 min-h-[200px] flex-grow transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-gray-200" : ""
            }`}
            {...provided.droppableProps}
          >
            {tasks.map((task: TaskType, index: number) => {
              const isSelected = Boolean(getSelectedMap[task.id]);
              const isGhosting =
                isSelected &&
                Boolean(draggingTaskId) &&
                draggingTaskId !== task.id;
              return (
                <Task
                  key={task.id}
                  task={task}
                  index={index}
                  isSelected={isSelected}
                  isGhosting={isGhosting}
                  selectionCount={selectedTaskIds.length}
                  toggleSelection={toggleSelection}
                  toggleSelectionInGroup={toggleSelectionInGroup}
                  multiSelectTo={multiSelectTo}
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
