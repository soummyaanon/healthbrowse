"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Bot, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tab } from "@/components/types";
import { useTheme } from "next-themes";

interface SidebarProps {
  tabs: Tab[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  initialOpen?: boolean;
  agentWorking?: boolean;
  consultMode: boolean;
  setConsultMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ tabs, activeTab, setActiveTab, initialOpen = true, agentWorking = false, consultMode, setConsultMode }: SidebarProps) {
  const [open, setOpen] = useState(initialOpen);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mount effect to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render theme-dependent styles after mounting to prevent hydration mismatch
  const sidebarBgClass = mounted && theme === "dark" ? "bg-black" : "bg-card";
  
  return (
    <div className="relative flex-shrink-0 h-full">
      <aside className={cn(
        "border border-border shadow-lg rounded-md transition-all duration-300 overflow-hidden flex flex-col h-full",
        open ? "w-64" : "w-0",
        sidebarBgClass
      )}>
        {open && (
          <>
        <div className="flex items-center justify-between px-2 py-2 border-b border-border">
          <span className="font-semibold">Menu</span>
        </div>
            <nav className="flex-1 flex flex-col px-2 py-4 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={cn(
                    'text-left px-3 py-2 rounded-md transition flex items-center justify-between',
                    activeTab === tab
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted hover:bg-opacity-20'
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
                  {tab === 'Insurance' && agentWorking && (
                    <div className="flex items-center space-x-1">
                      <Bot size={16} className="text-blue-500 animate-pulse" />
                      <div className="relative w-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500 animate-[leftToRight_2s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
              {activeTab === 'Home' && (
                <div className="space-y-2 mt-4 border-t border-border pt-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">Consult Mode</span>
                    <input
                      type="checkbox"
                      checked={consultMode}
                      onChange={(e) => setConsultMode(e.target.checked)}
                      className="ml-2"
                    />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">Dark Mode</span>
                    {mounted && (
                      <button
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className="ml-2 p-1 rounded-md bg-muted hover:bg-muted/70"
                      >
                        {theme === "dark" ? (
                          <Sun size={16} className="text-foreground" />
                        ) : (
                          <Moon size={16} className="text-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </nav>
            
            {agentWorking && (
              <div className="border-t border-border p-3">
                <div className="bg-blue-50 text-blue-700 rounded p-2 text-xs flex items-center space-x-2 animate-pulse dark:bg-blue-900 dark:text-blue-200">
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
        className={cn(
          "absolute top-2 left-0 transform -translate-x-full border border-border rounded-full shadow-md",
          mounted ? (theme === "dark" ? "bg-black" : "bg-card") : "bg-card"
        )}
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      
      {!open && agentWorking && (
        <div className="absolute top-14 left-0 transform -translate-x-full bg-blue-500 text-white p-2 rounded-l-md shadow-md animate-pulse">
          <Bot size={16} />
        </div>
      )}
    </div>
  );
} 