import { cn } from "@/lib/utils";
import React from "react";

const CellWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { rowHeight: number }
>(({ className, rowHeight, children, ...props }, ref) => (
  <div>
    <div
      className={cn(
        "flex h-full shadow-[inset_0px_-1px_0px_0px_#cbd5e0]",
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="" style={{ height: `${rowHeight}px` }} />
      {children}
    </div>
  </div>
));
CellWrapper.displayName = "CellWrapper";

export default CellWrapper;
