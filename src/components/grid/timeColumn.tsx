import CellWrapper from "@/components/grid/cell";

export default function TimeColumn({
  timeSlots,
  rowHeight,
}: {
  timeSlots: string[];
  rowHeight: number;
}) {
  return (
    <div>
      {timeSlots.map((time, index) => (
        <CellWrapper
          rowHeight={rowHeight}
          key={`time-${index}`}
          className="bg-gray-100 rounded"
        >
          {time}
        </CellWrapper>
      ))}
    </div>
  );
}
