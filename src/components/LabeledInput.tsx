import { Label } from "@/components/ui/label";
import React from "react";

export interface LabeledInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText: string;
}

export default function LabeledInput({
  labelText,
  children,
}: LabeledInputProps) {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Label>{labelText}</Label>
        {children}
      </div>
    </div>
  );
}
