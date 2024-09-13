import React, { useCallback } from "react";
import { Draggable } from "@hello-pangea/dnd";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import type { Id, Task as TaskType } from "./types";

interface Props {
  task: TaskType;
  index: number;
  isSelected: boolean;
  isGhosting: boolean;
  selectionCount: number;
  toggleSelection: (taskId: Id) => void;
  toggleSelectionInGroup: (taskId: Id) => void;
  multiSelectTo: (taskId: Id) => void;
}

const primaryButton = 0;

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9,
};

const Task: React.FC<Props> = ({
  task,
  index,
  isSelected,
  isGhosting,
  selectionCount,
  toggleSelection,
  toggleSelectionInGroup,
  multiSelectTo,
}) => {
  const wasToggleInSelectionGroupKeyUsed = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      const isUsingWindows = navigator.platform.indexOf("Win") >= 0;
      return isUsingWindows ? event.ctrlKey : event.metaKey;
    },
    []
  );

  const wasMultiSelectKeyUsed = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => event.shiftKey,
    []
  );

  const performAction = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      if (wasToggleInSelectionGroupKeyUsed(event)) {
        toggleSelectionInGroup(task.id);
      } else if (wasMultiSelectKeyUsed(event)) {
        multiSelectTo(task.id);
      } else {
        toggleSelection(task.id);
      }
    },
    [
      task.id,
      toggleSelection,
      toggleSelectionInGroup,
      multiSelectTo,
      wasToggleInSelectionGroupKeyUsed,
      wasMultiSelectKeyUsed,
    ]
  );

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || event.button !== primaryButton) return;
      event.preventDefault();
      performAction(event);
    },
    [performAction]
  );

  const onTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      toggleSelectionInGroup(task.id);
    },
    [toggleSelectionInGroup, task.id]
  );

  const onKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLDivElement>,
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot
    ) => {
      if (
        event.defaultPrevented ||
        snapshot.isDragging ||
        event.keyCode !== keyCodes.enter
      )
        return;
      event.preventDefault();
      performAction(event);
    },
    [performAction]
  );

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
        const shouldShowSelection = snapshot.isDragging && selectionCount > 1;

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={onClick}
            onTouchEnd={onTouchEnd}
            onKeyDown={(event) => onKeyDown(event, provided, snapshot)}
            className={`
              p-2 mb-2 rounded text-lg border-3 relative
              ${snapshot.isDragging ? "shadow-md" : ""}
              ${isGhosting ? "opacity-80" : ""}
              ${
                isSelected
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-gray-100 text-gray-900 border-gray-300"
              }
              focus:outline-none focus:border-green-500
            `}
          >
            <div>{task.content}</div>
            {shouldShowSelection && (
              <div className="absolute -right-2 -top-2 bg-gray-700 text-white rounded-full h-7 w-7 flex items-center justify-center text-xs">
                {selectionCount}
              </div>
            )}
          </div>
        );
      }}
    </Draggable>
  );
};

export default Task;
