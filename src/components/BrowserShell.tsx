"use client"

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Settings, User, MessageSquare, X } from "lucide-react";
import Image from 'next/image';
import AIInput_04 from "@/components/kokonutui/ai-input-04";
import { Input } from "@/components/ui/input";
import { House, Stethoscope, ShieldCheck, CalendarDays } from "lucide-react";
import Sidebar from "@/components/Sidebar";

type Tab = "Home" | "Patient Records" | "Appointments" | "Prescriptions" | "AI Assistant";
const tabs: Tab[] = ["Home", "Patient Records", "Appointments", "Prescriptions", "AI Assistant"];

export default function BrowserShell() {
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const [showAIWidget, setShowAIWidget] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon"><ChevronLeft /></Button>
          <Button variant="ghost" size="icon"><ChevronRight /></Button>
          <Button variant="ghost" size="icon"><RefreshCw /></Button>
          <button
            className={cn(
              "px-3 py-1 rounded-md transition",
              activeTab === "Home"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted hover:bg-opacity-20"
            )}
            onClick={() => setActiveTab("Home")}
          >
            <House />
          </button>
        </div>
        <div className="flex flex-1 px-4">
          <Input
            type="text"
            className="flex-1 bg-muted text-foreground placeholder-muted-foreground px-3 py-1 rounded-md focus:outline-none"
            placeholder="Search or enter address"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="cursor-pointer" />
          <User className="cursor-pointer" />
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto p-4 relative">
          <div key={activeTab} className="h-full animate__animated animate__fadeIn">
            {activeTab === "Home" && <HomeContent setActiveTab={setActiveTab} />}
            {activeTab === "Patient Records" && <PatientRecordsContent />}
            {activeTab === "Appointments" && <AppointmentsContent />}
            {activeTab === "Prescriptions" && <PrescriptionsContent />}
            {activeTab === "AI Assistant" && <AIAssistantContent />}
          </div>
        </div>
        <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
      {showAIWidget ? (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-card rounded-lg shadow-lg flex flex-col">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <div className="font-semibold">AI Assistant</div>
            <Button variant="ghost" size="icon" onClick={() => setShowAIWidget(false)}>
              <X />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            <div className="flex justify-start">
              <div className="bg-muted px-3 py-1 rounded-lg">Hello, how can I help you?</div>
            </div>
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-lg">Show patient records</div>
            </div>
            <div className="flex justify-start">
              <div className="bg-muted px-3 py-1 rounded-lg">Sure, here are some records.</div>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
          onClick={() => setShowAIWidget(true)}
        >
          <MessageSquare />
        </button>
      )}
    </div>
  );
}

function HomeContent({ setActiveTab }: { setActiveTab: React.Dispatch<React.SetStateAction<Tab>> }) {
  const [loading, setLoading] = useState(true);
  const [simulationMessages, setSimulationMessages] = useState<{ sender: string; text: string }[]>([]);

  const handleSearch = (query: string) => {
    const msgs = [
      { sender: 'User', text: query },
      { sender: 'ErachI', text: `Searching for "${query}"...` },
      { sender: 'ErachI', text: `Here are the top providers for "${query}": Provider A, Provider B, Provider C` },
    ];
    setSimulationMessages(msgs);
    setTimeout(() => setActiveTab("Patient Records"), (msgs.length + 1) * 1000);
  };

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse bg-muted h-6 w-3/4 rounded"></div>
        <div className="animate-pulse bg-muted h-6 w-2/3 rounded"></div>
        <div className="animate-pulse bg-muted h-6 w-1/2 rounded"></div>
      </div>
    );
  }
  return (
    <div className="relative w-full h-full">
      <Image src="/helo.jpeg" alt="Background" fill className="object-cover object-center" />
      <div className="absolute inset-0  bg-opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-4 p-4">
        <AIInput_04 onSubmit={handleSearch} />
        <div className="flex flex-wrap justify-center gap-6">
          <button className="p-4 bg-primary text-primary-foreground rounded-full hover:bg-opacity-90 transition">
            <Stethoscope size={24} />
          </button>
          <button className="p-4 bg-primary text-primary-foreground rounded-full hover:bg-opacity-90 transition">
            <ShieldCheck size={24} />
          </button>
          <button className="p-4 bg-primary text-primary-foreground rounded-full hover:bg-opacity-90 transition">
            <CalendarDays size={24} />
          </button>
        </div>
        {simulationMessages.length > 0 && <AgenticSimulation messages={simulationMessages} />}
      </div>
    </div>
  );
}

function PatientRecordsContent() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="bg-muted h-6 w-1/4 rounded"></div>
            <div className="bg-muted h-6 w-1/4 rounded"></div>
            <div className="bg-muted h-6 w-1/4 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-border">
          <th className="pb-2">Name</th>
          <th className="pb-2">Age</th>
          <th className="pb-2">Condition</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Alice Smith</td>
          <td>29</td>
          <td>Hypertension</td>
        </tr>
        <tr className="bg-card">
          <td>Bob Johnson</td>
          <td>45</td>
          <td>Diabetes</td>
        </tr>
        <tr>
          <td>Carol Williams</td>
          <td>37</td>
          <td>Asthma</td>
        </tr>
      </tbody>
    </table>
  );
}

function AppointmentsContent() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted h-8 rounded"></div>
        ))}
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      <li className="p-4 bg-card rounded-lg shadow">
        <div className="font-semibold">Dr. Adams</div>
        <div className="text-sm">2025-05-10 10:00 AM</div>
        <div className="text-xs text-muted-foreground">Confirmed</div>
      </li>
      <li className="p-4 bg-card rounded-lg shadow">
        <div className="font-semibold">Dr. Baker</div>
        <div className="text-sm">2025-05-12 02:00 PM</div>
        <div className="text-xs text-muted-foreground">Pending</div>
      </li>
    </ul>
  );
}

function PrescriptionsContent() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted h-6 rounded"></div>
        ))}
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      <li className="p-4 bg-card rounded-lg shadow">
        <div className="font-semibold">Lisinopril</div>
        <div>10mg, once daily</div>
      </li>
      <li className="p-4 bg-card rounded-lg shadow">
        <div className="font-semibold">Metformin</div>
        <div>500mg, twice daily</div>
      </li>
    </ul>
  );
}

function AIAssistantContent() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted h-8 rounded"></div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-start">
        <div className="bg-muted px-3 py-1 rounded-lg">How do I add a new patient?</div>
      </div>
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-lg">
          Click on the &apos;Patient Records&apos; tab and then &apos;Add Record&apos;.
        </div>
      </div>
    </div>
  );
}

function AgenticSimulation({ messages }: { messages: { sender: string; text: string }[] }) {
  const [displayed, setDisplayed] = useState<{ sender: string; text: string }[]>([]);
  useEffect(() => {
    setDisplayed([]);
    const timers: NodeJS.Timeout[] = [];
    messages.forEach((msg, idx) => {
      const timer = setTimeout(() => setDisplayed(prev => [...prev, msg]), (idx + 1) * 1000);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, [messages]);
  return (
    <div className="mt-6 p-4 bg-card rounded-lg shadow-md max-w-md mx-auto">
      {displayed.map((msg, idx) => (
        <div key={idx} className={msg.sender === 'User' ? 'flex justify-end' : 'flex justify-start'}>
          <div className={cn(
            "px-3 py-1 rounded-lg max-w-xs",
            msg.sender === 'User' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          )}>
            {msg.text}
          </div>
        </div>
      ))}
      {displayed.length < messages.length && (
        <div className="mt-2 italic text-sm text-muted-foreground">
          {messages[displayed.length].sender} is typing...
        </div>
      )}
    </div>
  );
} 