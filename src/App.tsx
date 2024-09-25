import EventSelector from "@/components/EventSelector";
import ImpactExportUploader from "@/components/ImpactExportUploader";
import TeamInput from "@/components/TeamInput";
import DNDGrid from "@/components/grid/grid";
import { InterviewType } from "@/models/store";

function App() {
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
      <DNDGrid />
    </>
  );
}

export default App;
