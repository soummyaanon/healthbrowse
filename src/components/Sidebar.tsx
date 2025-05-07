"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "Home" | "Patient Records" | "Appointments" | "Prescriptions" | "AI Assistant";

interface SidebarProps {
  tabs: Tab[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  initialOpen?: boolean;
}

export default function Sidebar({ tabs, activeTab, setActiveTab, initialOpen = true }: SidebarProps) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div className="relative flex-shrink-0 h-full">
      <aside className={cn(
        "border-l border-border bg-card transition-all duration-300 overflow-hidden flex flex-col h-full",
        open ? "w-64" : "w-0"
      )}>
        {open && (
          <>
            <div className="flex items-center justify-between px-2 py-2 border-b border-border">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <ChevronRight />
              </Button>
            </div>
            <nav className="flex-1 flex flex-col px-2 py-4 space-y-2">
              {tabs.filter(tab => tab !== 'Home').map(tab => (
                <button
                  key={tab}
                  className={cn(
                    'text-left px-3 py-2 rounded-md transition',
                    activeTab === tab
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted hover:bg-opacity-20'
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </>
        )}
      </aside>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-0 transform -translate-x-full bg-card"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronRight /> : <ChevronLeft />}
      </Button>
    </div>
  );
} 