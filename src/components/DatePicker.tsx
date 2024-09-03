import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import useAppStore from "@/models/store";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React from "react";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const dates = useAppStore((state) => state.dates);
  const setDates = useAppStore((state) => state.setDates);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dates.length && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dates.length > 0 ? (
              dates.length === 1 ? (
                format(dates[0], "PPP")
              ) : (
                `${dates.length} dates`
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="multiple"
            defaultMonth={new Date()}
            selected={dates}
            onSelect={(e) => setDates(e ?? dates)}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
