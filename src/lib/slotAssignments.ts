import { InterviewSlot } from "@/lib/utils";
import { Schedule } from "@/models/api";
import { addMinutes } from "date-fns";

export function updateTeamTimeSlots(
  teams: string[],
  timeslots: Date[],
  schedule: Schedule,
  existingSlots: InterviewSlot[],
  interviewTurnaroundTime: number,
): InterviewSlot[] {
  const removedTeams = existingSlots
    .map((slot) => slot.teamInfo)
    .filter((t) => t !== null)
    .map((t) => t.teamKey)
    .filter((teamKey) => !teams.includes(teamKey));

  const unassignedTeams = teams.filter(
    (team) => !existingSlots.some((slot) => slot.teamInfo?.teamKey === team),
  );

  const newSlots: InterviewSlot[] = existingSlots.map((slot) => {
    if (
      slot.teamInfo !== null &&
      !removedTeams.includes(slot.teamInfo.teamKey)
    ) {
      return { ...slot };
    }

    const team = unassignedTeams.shift();
    if (team === undefined) {
      return { ...slot, teamInfo: null };
    }

    return {
      ...slot,
      teamInfo: {
        teamKey: team,
        scannedInfo: null,
      },
    };
  });

  return scanForConflicts(newSlots, schedule, interviewTurnaroundTime);
}

export function scanForSingleTeamsConflicts(
  slot: InterviewSlot,
  schedule: Schedule,
  interviewTurnaroundTime: number,
): InterviewSlot {
  if (slot.teamInfo === null) {
    return { ...slot };
  }

  const slotStartTime = slot.time;
  const slotEndTime = addMinutes(slotStartTime, interviewTurnaroundTime);

  const matches = schedule
    .filter((match) =>
      match.teams
        .map((t) => t.teamNumber.toString())
        .includes(slot.teamInfo!.teamKey),
    )
    .filter((match) => match.startTime !== null)
    .filter((match) => {
      const matchStartTime = new Date(match.startTime!);
      // todo: extract +8 to constant match turnaround time
      const matchEndTime = addMinutes(matchStartTime, 8);

      return matchStartTime < slotEndTime && matchEndTime > slotStartTime;
    });

  return {
    ...slot,
    teamInfo: {
      teamKey: slot.teamInfo.teamKey,
      scannedInfo: {
        conflictingMatch: matches.length > 0 ? matches[0] : null,
        closestMatches: matches.slice(0, 3),
      },
    },
  };
}

export function scanForConflicts(
  slots: InterviewSlot[],
  schedule: Schedule,
  interviewTurnaroundTime: number,
): InterviewSlot[] {
  return slots.map((slot) =>
    scanForSingleTeamsConflicts(slot, schedule, interviewTurnaroundTime),
  );
}
