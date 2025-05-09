"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "Home" | "Patient Records" | "Appointments" | "Prescriptions" | "AI Assistant" | "Insurance";

interface SidebarProps {
  tabs: Tab[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  initialOpen?: boolean;
  agentWorking?: boolean;
}

export default function Sidebar({ tabs, activeTab, setActiveTab, initialOpen = true, agentWorking = false }: SidebarProps) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div className="relative flex-shrink-0 h-full">
      <aside className={cn(
        "border border-border bg-card shadow-lg rounded-md transition-all duration-300 overflow-hidden flex flex-col h-full",
        open ? "w-64" : "w-0"
      )}>
        {open && (
          <>
            <div className="flex items-center justify-between px-2 py-2 border-b border-border">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" className="border border-border rounded-full shadow-md bg-card" onClick={() => setOpen(false)}>
                <ChevronRight />
              </Button>
            </div>
            <nav className="flex-1 flex flex-col px-2 py-4 space-y-2">
              {tabs.filter(tab => tab !== 'Home').map(tab => (
                <button
                  key={tab}
                  className={cn(
                    'text-left px-3 py-2 rounded-md transition flex justify-between items-center',
                    activeTab === tab
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted hover:bg-opacity-20'
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
                  {tab === "Insurance" && agentWorking && (
                    <div className="flex items-center space-x-1">
                      <Bot size={16} className="text-blue-500 animate-pulse" />
                      <div className="relative w-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500 animate-[leftToRight_2s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </nav>
            
            {agentWorking && (
              <div className="border-t border-border p-3">
                <div className="bg-blue-50 text-blue-700 rounded p-2 text-xs flex items-center space-x-2 animate-pulse">
                  <Bot size={16} />
                  <span>AI Agent working...</span>
                </div>
              </div>
            )}
          </>
        )}
      </aside>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-0 transform -translate-x-full bg-card border border-border rounded-full shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      
      {!open && agentWorking && (
        <div className="absolute top-14 left-0 transform -translate-x-full bg-blue-500 text-white p-2 rounded-l-md shadow-md animate-pulse">
          <Bot size={16} />
        </div>
      )}
    </div>
  );
} 