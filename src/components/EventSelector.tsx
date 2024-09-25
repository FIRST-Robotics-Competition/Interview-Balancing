import LabeledInput from "@/components/LabeledInput";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventSortByDateComparator, getEvents } from "@/lib/api";
import { Event } from "@/models/api";
import useAppStore from "@/models/store";
import { groupBy } from "lodash-es";
import React, { useEffect, useState } from "react";

export default function EventSelector() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const store = useAppStore();

  useEffect(() => {
    getEvents(year).then((events) => {
      setAvailableEvents(
        events.Events.filter(
          (e) => !["OffSeason", "OffSeasonWithAzureSync"].includes(e.type),
        ).sort(eventSortByDateComparator),
      );
    });
  }, [year]);

  // todo remove?
  useEffect(() => {
    if (availableEvents.length > 0 && store.event === undefined) {
      store.setEvent(availableEvents[0]);
    }
  }, [availableEvents, store.event]);

  return (
    <div className="flex gap-4 justify-center">
      <div className="w-[7rem]">
        <LabeledInput labelText="Year">
          <Input
            type="number"
            defaultValue={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </LabeledInput>
      </div>

      <div className="w-1/2">
        <LabeledInput labelText="Event">
          <Select
            onValueChange={(e) =>
              store.setEvent(availableEvents.find((event) => e === event.code)!)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                groupBy(availableEvents, (e) => e.districtCode ?? "Regionals"),
              )
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([districtCode, events]) => (
                  <SelectGroup key={districtCode}>
                    <SelectLabel>{districtCode}</SelectLabel>
                    {events.sort(eventSortByDateComparator).map((event) => (
                      <SelectItem key={event.code} value={event.code}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
            </SelectContent>
          </Select>
        </LabeledInput>
      </div>
    </div>
  );
}
