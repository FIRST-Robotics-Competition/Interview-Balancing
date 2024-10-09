import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useAppStore, { InterviewType, Team } from "@/models/store";
import { isEqual } from "lodash-es";
import { useEffect, useState } from "react";

function fmtTeam(team: Team) {
  return `${team.teamNumber}${team.interviewee ? `,${team.interviewee}` : ""}`;
}

export default function TeamInput({
  interviewType,
}: {
  interviewType: InterviewType;
}) {
  const { interviewingTeams, updateInterviewingTeams } = useAppStore();
  const storeTeams = interviewingTeams[interviewType];
  const [localTeams, setLocalTeams] = useState(
    storeTeams.map((t) => fmtTeam(t)).join("\n"),
  );

  useEffect(() => {
    setLocalTeams(
      storeTeams
        .map((t) => `${t.teamNumber},${t.interviewee ?? ""}`)
        .join("\n"),
    );
  }, [storeTeams]);

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newValue = event.target.value;
    setLocalTeams(newValue);

    const newTeams = newValue
      .split("\n")
      .map((line) => {
        const [teamNumber, interviewee] = line.split(",");
        return {
          teamNumber: teamNumber.trim(),
          interviewee: interviewee?.trim(),
        };
      })
      .filter((team) => team.teamNumber.trim() !== "");

    if (!isEqual(newTeams, storeTeams)) {
      updateInterviewingTeams(interviewType, newTeams);
    }
  };

  return (
    <div className="flex">
      <div className="w-1/2">
        <Label htmlFor="teams">{interviewType.toString()} Team List</Label>
        <Textarea onChange={handleTextareaChange} value={localTeams} />
      </div>
    </div>
  );
}
