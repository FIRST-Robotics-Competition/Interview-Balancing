import type {
  DraggableLocation,
  DragStart,
  DropResult,
} from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import React, { useCallback, useEffect, useState } from "react";
import Column from "./column";
import initial from "./data.ts";
import type { Entities, Id, Task } from "./types";
import type { Result as ReorderResult } from "./utils.ts";
import {
  multiSelectTo as multiSelect,
  mutliDragAwareReorder,
} from "./utils.ts";

const getTasks = (entities: Entities, columnId: Id): Task[] =>
  entities.columns[columnId].taskIds.map(
    (taskId: Id): Task => entities.tasks[taskId]
  );

const TaskApp: React.FC = () => {
  const [entities, setEntities] = useState<Entities>(initial);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Id[]>([]);
  const [draggingTaskId, setDraggingTaskId] = useState<Id | undefined | null>(
    null
  );

  useEffect(() => {
    const onWindowClick = (event: MouseEvent) => {
      if (!event.defaultPrevented) {
        unselectAll();
      }
    };

    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (!event.defaultPrevented && event.key === "Escape") {
        unselectAll();
      }
    };

    const onWindowTouchEnd = (event: TouchEvent) => {
      if (!event.defaultPrevented) {
        unselectAll();
      }
    };

    window.addEventListener("click", onWindowClick);
    window.addEventListener("keydown", onWindowKeyDown);
    window.addEventListener("touchend", onWindowTouchEnd);

    return () => {
      window.removeEventListener("click", onWindowClick);
      window.removeEventListener("keydown", onWindowKeyDown);
      window.removeEventListener("touchend", onWindowTouchEnd);
    };
  }, []);

  const onDragStart = useCallback(
    (start: DragStart) => {
      const id: string = start.draggableId;
      const selected: Id | undefined | null = selectedTaskIds.find(
        (taskId: Id): boolean => taskId === id
      );

      if (!selected) {
        unselectAll();
      }
      setDraggingTaskId(start.draggableId);
    },
    [selectedTaskIds]
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const destination: DraggableLocation | undefined | null =
        result.destination;
      const source: DraggableLocation = result.source;

      if (!destination || result.reason === "CANCEL") {
        setDraggingTaskId(null);
        return;
      }

      const processed: ReorderResult = mutliDragAwareReorder({
        entities,
        selectedTaskIds,
        source,
        destination,
      });

      setEntities(processed.entities);
      setSelectedTaskIds(processed.selectedTaskIds);
      setDraggingTaskId(null);
    },
    [entities, selectedTaskIds]
  );

  const toggleSelection = useCallback(
    (taskId: Id) => {
      const wasSelected: boolean = selectedTaskIds.includes(taskId);

      const newTaskIds: Id[] = (() => {
        if (!wasSelected) {
          return [taskId];
        }

        if (selectedTaskIds.length > 1) {
          return [taskId];
        }

        return [];
      })();

      setSelectedTaskIds(newTaskIds);
    },
    [selectedTaskIds]
  );

  const toggleSelectionInGroup = useCallback(
    (taskId: Id) => {
      const index: number = selectedTaskIds.indexOf(taskId);

      if (index === -1) {
        setSelectedTaskIds([...selectedTaskIds, taskId]);
        return;
      }

      const shallow: Id[] = [...selectedTaskIds];
      shallow.splice(index, 1);
      setSelectedTaskIds(shallow);
    },
    [selectedTaskIds]
  );

  const multiSelectTo = useCallback(
    (newTaskId: Id) => {
      const updated: Id[] | undefined | null = multiSelect(
        entities,
        selectedTaskIds,
        newTaskId
      );

      if (updated == null) {
        return;
      }

      setSelectedTaskIds(updated);
    },
    [entities, selectedTaskIds]
  );

  const unselectAll = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex user-select-none">
        {entities.columnOrder.map((columnId: Id) => (
          <Column
            column={entities.columns[columnId]}
            tasks={getTasks(entities, columnId)}
            selectedTaskIds={selectedTaskIds}
            key={columnId}
            draggingTaskId={draggingTaskId}
            toggleSelection={toggleSelection}
            toggleSelectionInGroup={toggleSelectionInGroup}
            multiSelectTo={multiSelectTo}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskApp;
