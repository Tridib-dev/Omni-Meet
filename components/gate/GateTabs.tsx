"use client";

// components/gate/GateTabs.tsx
// Pure UI: Scanner / Attendees pill switcher with an animated underline.

import { motion } from "framer-motion";
import { ScanLine, Users } from "lucide-react";

export type GateTab = "scanner" | "attendees";

export interface GateTabsProps {
  active: GateTab;
  onTabChange: (tab: GateTab) => void;
}

const TABS: { id: GateTab; label: string; icon: typeof ScanLine }[] = [
  { id: "scanner", label: "Scanner", icon: ScanLine },
  { id: "attendees", label: "Attendees", icon: Users },
];

export default function GateTabs({ active, onTabChange }: GateTabsProps) {
  return (
    <div
      role="tablist"
      className="inline-flex gap-1 rounded-full border border-[var(--gv-line)] bg-[var(--gv-panel)] p-1"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gv-scan)] ${
              isActive ? "text-[#0A0C10]" : "text-[var(--gv-ink-dim)] hover:text-[var(--gv-ink)]"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="gate-tab-underline"
                className="absolute inset-0 rounded-full bg-[var(--gv-scan)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon size={15} />
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
