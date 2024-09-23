import { InterviewSlot } from "@/lib/utils";
import { Schedule } from "@/models/api";
import { addMinutes } from "date-fns";

export function updateTeamTimeSlots(
  teams: string[],
  timeslots: Date[],
  schedule: Schedule,
  existingSlots: InterviewSlot[],
  interviewTurnaroundTime: number
): InterviewSlot[] {
  const removedTeams = existingSlots
    .map((slot) => slot.teamKey)
    .filter((t) => t !== null)
    .filter((team) => !teams.includes(team));

  const unassignedTeams = teams.filter(
    (team) => !existingSlots.some((slot) => slot.teamKey === team)
  );

  const newSlots = existingSlots.map((slot) => {
    if (slot.teamKey !== null && !removedTeams.includes(slot.teamKey)) {
      return { ...slot };
    }

    const team = unassignedTeams.shift();
    if (team === undefined) {
      return { ...slot, teamKey: null, conflictsWithMatch: false };
    }

    return { ...slot, teamKey: team };
  });

  return scanForConflicts(newSlots, schedule, interviewTurnaroundTime);
}

export function scanForSingleTeamsConflicts(
  slot: InterviewSlot,
  schedule: Schedule,
  interviewTurnaroundTime: number
): InterviewSlot {
  if (slot.teamKey === null) {
    return { ...slot, conflictsWithMatch: false };
  }

  console.log(slot.teamKey);
  console.log(slot);
  console.log(
    schedule
      .filter((match) =>
        match.teams.map((t) => t.teamNumber.toString()).includes(slot.teamKey!)
      )
      .filter((match) => match.startTime !== null)
  );

  const matches = schedule
    .filter((match) =>
      match.teams.map((t) => t.teamNumber.toString()).includes(slot.teamKey!)
    )
    .filter((match) => match.startTime !== null)
    .filter((match) => {
      const matchStartTime = new Date(match.startTime!);
      // todo: extract +8 to constant match turnaround time
      const matchEndTime = addMinutes(matchStartTime, 8);

      const slotStartTime = slot.time;
      const slotEndTime = addMinutes(slotStartTime, interviewTurnaroundTime);

      return matchStartTime < slotEndTime && matchEndTime > slotStartTime;
    });

  return { ...slot, conflictsWithMatch: matches.length > 0 };
}

export function scanForConflicts(
  slots: InterviewSlot[],
  schedule: Schedule,
  interviewTurnaroundTime: number
): InterviewSlot[] {
  return slots.map((slot) =>
    scanForSingleTeamsConflicts(slot, schedule, interviewTurnaroundTime)
  );
}
