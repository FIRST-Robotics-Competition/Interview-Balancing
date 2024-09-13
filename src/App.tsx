import TaskApp from "@/components/dnd/taskapp";
import EventSelector from "@/components/EventSelector";
import Grid2 from "@/components/Grid2";
import GridLayout from "@/components/GridLayout";
import ImpactExportUploader from "@/components/ImpactExportUploader";
import LabeledInput from "@/components/LabeledInput";
import RDND from "@/components/RDND";
import TeamInput from "@/components/TeamInput";
import { Input } from "@/components/ui/input";
import useAppStore, { InterviewType } from "@/models/store";

function App() {
  const store = useAppStore();

  return (
    <>
      <div className="my-20"></div>
      <ImpactExportUploader />
      <div className="my-20"></div>
      <EventSelector />
      {/* <LabeledInput labelText="Number of panels">
        <Input
          type="number"
          defaultValue={store.numPanels}
          onChange={(e) => store.setNumPanels(Number(e.target.value))}
        />
      </LabeledInput> */}

      <TeamInput interviewType={InterviewType.IMPACT} />

      {/* <GridLayout /> */}

      {/* <Grid2 /> */}

      {/* <RDND /> */}

      <TaskApp />
    </>
  );
}

export default App;
