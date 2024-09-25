import EventSelector from "@/components/EventSelector";
import ImpactExportUploader from "@/components/ImpactExportUploader";
import TeamInput from "@/components/TeamInput";
import DNDGrid from "@/components/grid/grid";
import { InterviewType } from "@/models/store";

function App() {
  return (
    <>
      <div className="text-5xl mt-6 mb-5">Interview Planner</div>
      <EventSelector />
      <div className="flex gap-8 mt-4 [&>*]:w-1/2">
        <div>
          <div>deans list uploader</div>

          <TeamInput interviewType={InterviewType.DEANS_LIST} />
        </div>

        <div>
          <ImpactExportUploader />

          <TeamInput interviewType={InterviewType.IMPACT} />
        </div>
      </div>

      <DNDGrid />
    </>
  );
}

export default App;
