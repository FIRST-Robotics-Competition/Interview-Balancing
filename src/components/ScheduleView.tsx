import { useMemo } from "react";
import { DateLocalizer, Navigate, Calendar, Views } from "react-big-calendar";

// @ts-expect-error ugh
import TimeGrid from "react-big-calendar/lib/TimeGrid";

interface MyWeekProps {
  date: Date;
  localizer: DateLocalizer;
  max?: Date;
  min?: Date;
  scrollToTime?: Date;
}

function MyWeek({
  date,
  localizer,
  max = localizer.endOf(new Date(), "day"),
  min = localizer.startOf(new Date(), "day"),
  scrollToTime = localizer.startOf(new Date(), "day"),
  ...props
}: MyWeekProps) {
  const currRange = useMemo(
    () => MyWeek.range(date, { localizer }),
    [date, localizer]
  );

  return (
    <TimeGrid
      date={date}
      eventOffset={15}
      localizer={localizer}
      max={max}
      min={min}
      range={currRange}
      scrollToTime={scrollToTime}
      {...props}
    />
  );
}

MyWeek.range = (date: Date, { localizer }: { localizer: DateLocalizer }) => {
  const start = date;
  const end = localizer.add(start, 1, "day");

  let current = start;
  const range: Date[] = [];

  while (localizer.lte(current, end, "day")) {
    range.push(current);
    current = localizer.add(current, 1, "day");
  }

  return range;
};

MyWeek.navigate = (
  date: Date,
  action: string,
  { localizer }: { localizer: DateLocalizer }
) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return localizer.add(date, -3, "day");

    case Navigate.NEXT:
      return localizer.add(date, 3, "day");

    default:
      return date;
  }
};

MyWeek.title = (date: Date) => {
  return `My awesome week: ${date.toLocaleDateString()}`;
};

export default function ScheduleView({
  localizer,
}: {
  localizer: DateLocalizer;
}) {
  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate: new Date(2015, 3, 1),
      views: {
        week: MyWeek,
      },
    }),
    []
  );

  return (
    <>
      <Calendar
        defaultDate={defaultDate}
        defaultView={Views.WEEK}
        events={[]}
        localizer={localizer}
        views={views}
      />
    </>
  );
}
