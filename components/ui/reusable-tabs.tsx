"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ReusableTabItem = {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

type ReusableTabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: ReusableTabItem[];
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function ReusableTabs({
  value,
  onValueChange,
  items,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
}: ReusableTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList
        className={cn("w-full justify-start overflow-x-auto", listClassName)}
      >
        {items.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={triggerClassName}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={contentClassName}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
