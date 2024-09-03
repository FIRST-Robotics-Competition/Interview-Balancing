import useAppStore, { InterviewType } from "@/models/store";
import { useCallback, useMemo, useState } from "react";
import {
  Responsive as ResponsiveReactGridLayout,
  Layout,
  Layouts,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { sumBy } from "lodash-es";

interface RGLLayout extends Layout {
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
      timeSlots.map((t, idx) => ({
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
        i: `${t}-clock`,
      })),
    [timeSlots]
  );

  const [compactType, setCompactType] = useState<
    "vertical" | "horizontal" | null
  >("vertical");

  const generateLayouts = useCallback((): Layouts => {
    const clockLayouts: RGLLayout[] = timeSlots.map((t, idx) => ({
      i: `clock_${idx}`,
      x: 0,
      y: idx,
      w: 1,
      h: 1,
      static: true,
      children: (
        <div>
          {t.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </div>
      ),
    }));

    const teamLayouts: RGLLayout[] = [
      ...store.interviewConfigs[InterviewType.IMPACT].teams.map((t, idx) => ({
        i: `impact_${idx}`,
        x: 1,
        y: idx,
        w: 1,
        h: 1,
        children: <div>{t}</div>,
      })),
      ...store.interviewConfigs[InterviewType.DEANS_LIST].teams.map(
        (t, idx) => ({
          i: `deans_${idx}`,
          x: 3,
          y: idx,
          w: 1,
          h: 1,
          children: <div>{t}</div>,
        })
      ),
    ];

    const allLayouts = [...clockLayouts, ...teamLayouts];
    return {
      lg: allLayouts,
      md: allLayouts,
      sm: allLayouts,
      xs: allLayouts,
      xxs: allLayouts,
    };
  }, [store.interviewConfigs, timeSlots]);

  const [layouts, setLayouts] = useState<Layouts>(generateLayouts());

  const onDragStop = (
    layout: Layout[],
    oldItem: Layout,
    newItem: Layout,
    placeholder: Layout,
    e: MouseEvent,
    element: HTMLElement
  ) => {
    const correctedLayout = layout.map((item) => ({
      ...item,
      x: item.x < 2 ? 2 : item.x > 3 ? 3 : item.x,
    }));
  };

  const isDroppable = (
    layout: Layout[],
    oldItem: Layout,
    newItem: Layout,
    placeholder: Layout,
    e: MouseEvent,
    element: HTMLElement
  ): boolean => {
    return newItem.x === 2 || newItem.x === 3;
  };

  const onLayoutChange = (layout: Layout[], layouts: Layouts) => {
    setLayouts(layouts);
  };

  const onNewLayout = () => {
    setLayouts(generateLayouts());
  };

  const totalCols = useMemo(() => {
    return sumBy(Object.values(store.interviewConfigs), (c) => c.numPanels) + 1;
  }, [store.interviewConfigs]);

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

        <ResponsiveReactGridLayout
          className="layout [&>.react-grid-item]:bg-white bg-slate-500"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{
            lg: totalCols,
            md: totalCols,
            sm: totalCols,
            xs: totalCols,
            xxs: totalCols,
          }}
          rowHeight={25}
          width={1000}
          containerPadding={[8, 8]}
          onLayoutChange={onLayoutChange}
          compactType={compactType}
          preventCollision={!compactType}
          useCSSTransforms={true}
        >
          {Object.values(layouts.lg).map((l) => (
            <div key={l.i} data-grid={l}>
              {/* {l.children} */}
            </div>
          ))}
        </ResponsiveReactGridLayout>

        {/* <ReactGridLayout
          className="layout [&>.react-grid-item]:bg-white bg-slate-500"
          cols={
            sumBy(Object.values(store.interviewConfigs), (c) => c.numPanels) + 1
          }
          rowHeight={25}
          width={1000}
          style={{ background: "#f0f0f0" }}
          containerPadding={[8, 8]}
          isDroppable
        >
          {clockLayouts.concat(teamLayouts).map((l, i) => (
            <div key={i} data-grid={l}>
              {l.children}
            </div>
          ))}
        </ReactGridLayout> */}
      </div>
    </div>
  );
}
