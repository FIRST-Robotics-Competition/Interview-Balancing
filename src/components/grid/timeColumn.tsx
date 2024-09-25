import CellWrapper from "@/components/grid/cell";

export default function TimeColumn({
  timeSlots,
  rowHeight,
}: {
  timeSlots: Date[];
  rowHeight: number;
}) {
  return (
    <div>
      {timeSlots.map((time, index) => (
        <CellWrapper
          rowHeight={rowHeight}
          key={`time-${index}`}
          className="bg-gray-100 rounded "
        >
          {time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </CellWrapper>
      ))}
    </div>
  );
}
