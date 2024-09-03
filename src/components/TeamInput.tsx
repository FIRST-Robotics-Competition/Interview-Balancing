import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useAppStore from "@/models/store";

export default function TeamInput() {
  const store = useAppStore();

  return (
    <div className="flex">
      <div className="w-1/2">
        <Label htmlFor="teams">Team List</Label>
        <Textarea
          onChange={(e) => {
            store.setTeams(e.target.value.split("\n"));
          }}
        />
      </div>

      <Input type="file" accept=".csv,.txt" />
    </div>
  );
}
