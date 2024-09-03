import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useAppStore, { InterviewType } from "@/models/store";
import { useState, useEffect } from "react";
import { isEqual } from "lodash-es";

export default function TeamInput({
  interviewType,
}: {
  interviewType: InterviewType;
}) {
  const { interviewConfigs, updateInterviewConfig } = useAppStore();
  const storeTeams = interviewConfigs[interviewType].teams;
  const [localTeams, setLocalTeams] = useState(storeTeams.join("\n"));

  useEffect(() => {
    setLocalTeams(storeTeams.join("\n"));
  }, [storeTeams]);

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    setLocalTeams(newValue);

    const newTeams = newValue.split("\n").filter((team) => team.trim() !== "");
    if (!isEqual(newTeams, storeTeams)) {
      updateInterviewConfig(interviewType, { teams: newTeams });
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
