import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from "@hello-pangea/dnd";
import { useCallback } from "react";

export default function Grid() {
  const onDragEnd = useCallback(
    (result: DropResult, provided: ResponderProvided) => {},
    []
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex user-select-none">uh</div>
    </DragDropContext>
  );
}
