import useAppStore from "@/models/store";
import { useMemo } from "react";
import ReactGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";

interface RGLLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  children?: React.ReactNode;
}

function generateTimeSlots(): Date[] {
  const today = new Date();
  const timeSlots: Date[] = [];

  const startTime = new Date(today);
  startTime.setHours(7, 0, 0, 0); // Set start time to 7:00 AM

  const endTime = new Date(today);
  endTime.setHours(18, 0, 0, 0); // Set end time to 6:00 PM

  while (startTime <= endTime) {
    timeSlots.push(new Date(startTime));

    // Increment by 5 minutes
    startTime.setMinutes(startTime.getMinutes() + 5);
  }

  return timeSlots;
}

export default function GridLayout(): JSX.Element {
  const store = useAppStore();
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const clockLayouts: RGLLayout[] = useMemo(
    () =>
      timeSlots.map(
        (t, idx) =>
          ({
            x: 0,
            y: idx,
            w: 1,
            h: 1,
            children: (
              <div>
                {t.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </div>
            ),
            static: true,
          } as RGLLayout)
      ),
    [timeSlots]
  );
  const teamLayouts: RGLLayout[] = useMemo(
    () =>
      store.teams.map(
        (t, idx) =>
          ({
            x: 1,
            y: idx,
            w: 1,
            h: 1,
            children: <div>{t}</div>,
          } as RGLLayout)
      ),
    [store.teams]
  );

  return (
    <div>
      <div className="mb-4">
        {/* <ResponsiveReactGridLayout
          //   {...props}
          style={{ background: "#f0f0f0" }}
          layouts={layouts}
          //   measureBeforeMount={false}
          //   useCSSTransforms={mounted}
          //   compactType={compactType}
          //   preventCollision={!compactType}
          //   onLayoutChange={onLayoutChange}
          //   onBreakpointChange={onBreakpointChange}
          //   onDrop={onDrop}
          rowHeight={30}
          className="layout"
          cols={{
            lg: store.numPanels,
            md: store.numPanels,
            sm: store.numPanels,
            xs: store.numPanels,
            xxs: store.numPanels,
          }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          containerPadding={[8, 8]}
          isDroppable
        >
          {generateDOM()}
        </ResponsiveReactGridLayout> */}

        <ReactGridLayout
          className="layout [&>.react-grid-item]:bg-white"
          cols={store.numPanels + 1}
          rowHeight={25}
          width={1000}
          style={{ background: "#f0f0f0" }}
          containerPadding={[8, 8]}
        >
          {clockLayouts.concat(teamLayouts).map((l, i) => (
            <div key={i} data-grid={l}>
              {l.children}
            </div>
          ))}
        </ReactGridLayout>
      </div>
    </div>
  );
}
