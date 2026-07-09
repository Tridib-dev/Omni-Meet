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
}

export function NativeTabs({
  items,
  defaultValue,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
}: NativeTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || items[0].id);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn("w-full", className)}
    >
      <TabsList
        className={cn(
          "inline-flex h-auto w-fit items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1",
          listClassName
        )}
      >
        {items.map((tab) => {
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "rounded-xl px-3 py-2 text-[13px] font-medium text-white/40 transition-colors data-[state=active]:bg-white/8 data-[state=active]:text-white/90 data-[state=inactive]:hover:text-white/65",
                triggerClassName
              )}
            >
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
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
