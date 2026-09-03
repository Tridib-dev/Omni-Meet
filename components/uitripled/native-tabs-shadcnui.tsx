"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ReactNode } from "react";

interface NativeTabsProps {
  items: {
    id: string;
    label: ReactNode;
    content: ReactNode;
  }[];
  defaultValue?: string;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  /**
   * Optional content (e.g. a section title) rendered to the left of the tab
   * pills, in the same row, on all screen sizes. When omitted, behavior and
   * markup are unchanged from before this prop existed.
   */
  header?: ReactNode;
}

export function NativeTabs({
  items,
  defaultValue,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
  header,
}: NativeTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || items[0].id);

  const tabList = (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <TabsList
        className={cn(
          "inline-flex h-auto min-w-max items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm",
          listClassName
        )}
      >
        {items.map((tab) => {
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-[13px] font-medium text-slate-500 transition-colors data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm data-[state=inactive]:hover:text-slate-900",
                triggerClassName
              )}
            >
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn("w-full", className)}
    >
      {header ? (
        <div className="flex flex-nowrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1 truncate">{header}</div>
          <div className="shrink-0">{tabList}</div>
        </div>
      ) : (
        tabList
      )}
      {items.map((item) => (
        <TabsContent
          key={item.id}
          value={item.id}
          className={cn("mt-4", contentClassName)}
        >
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}