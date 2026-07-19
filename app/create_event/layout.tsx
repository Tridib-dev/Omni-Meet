// app/create-event/layout.tsx

import type { ReactNode } from "react";
import DoodleField from "@/components/create-event/DoodleField";
import "@/components/create-event/styles/create-event-wizard.css";

export default function CreateEventLayout({ children }: { children: ReactNode }) {
  return (
    <div className="cew-scope">
      <div className="cew-backdrop">
        <DoodleField />
        {children}
      </div>
    </div>
  );
}