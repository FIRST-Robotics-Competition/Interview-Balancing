import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useAppStore, { InterviewType, Team } from "@/models/store";
import { isEqual } from "lodash-es";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

function fmtTeam(team: Team) {
  return `${team.teamNumber}${team.interviewee ? `,${team.interviewee}` : ""}`;
}

interface FormValues {
  teams: string;
}

export default function TeamInput({
  interviewType,
}: {
  interviewType: InterviewType;
}) {
  const { interviewingTeams, updateInterviewingTeams } = useAppStore();
  const storeTeams = interviewingTeams[interviewType];

  const { register, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      teams: storeTeams.map((t) => fmtTeam(t)).join("\n"),
    },
  });

  const teamsValue = watch("teams");

  // Update textarea when store changes
  useEffect(() => {
    const formattedTeams = storeTeams.map((t) => fmtTeam(t)).join("\n");
    if (teamsValue !== formattedTeams) {
      setValue("teams", formattedTeams);
    }
  }, [storeTeams, setValue, teamsValue]);

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newTeams = event.target.value
      .split("\n")
      .map((line) => {
        const [teamNumber, interviewee] = line.split(",");
        return {
          teamNumber: teamNumber.trim(),
          interviewee: interviewee?.trim() || "",
        };
      })
      .filter((team) => team.teamNumber.trim() !== "");

    // Only update the store if the new teams differ from the current store teams
    if (!isEqual(newTeams, storeTeams)) {
      updateInterviewingTeams(interviewType, newTeams);
    }

    // Update the form value
    setValue("teams", event.target.value);
  };

  return (
    <div className="flex">
      <div className="w-1/2">
        <Label htmlFor="teams">{interviewType.toString()} Team List</Label>
        <Textarea
          {...register("teams")}
          onChange={handleTextareaChange}
          value={teamsValue}
        />
      </div>
    </div>
  );
}
