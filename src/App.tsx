import EventSelector from "@/components/EventSelector";
import GridLayout from "@/components/GridLayout";
import LabeledInput from "@/components/LabeledInput";
import TeamInput from "@/components/TeamInput";
import { Input } from "@/components/ui/input";
import useAppStore from "@/models/store";

function App() {
  const store = useAppStore();

  return (
    <>
      <EventSelector />
      <LabeledInput labelText="Number of panels">
        <Input
          type="number"
          defaultValue={store.numPanels}
          onChange={(e) => store.setNumPanels(Number(e.target.value))}
        />
      </LabeledInput>

      <TeamInput />

      <GridLayout />
    </>
  );
}

export default App;
