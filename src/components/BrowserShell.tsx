"use client"

import React, { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Settings, User, MessageSquare, X, Bot, ShieldCheck, FileText, Plus, Stethoscope } from "lucide-react";

import { Input } from "@/components/ui/input";
import Image from "next/image";

import Sidebar from "@/components/Sidebar";
import { Tab } from "@/components/types";
// import AIInput_04 from "@/components/kokonutui/ai-input-04";
// import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import HomeContent from "@/components/HomeContent";
// import AgenticSimulation from "@/components/AgenticSimulation";
const ClinicalAgentChat = lazy(() => import("@/components/ClinicalAgentChat"));
const AgentsDashboard = lazy(() => import("@/components/AgentsDashboard"));

const tabs: Tab[] = ["Home", "Agents", "Insurance"];

// Browser tab interface
interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

export default function BrowserShell() {
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const [showAIWidget, setShowAIWidget] = useState(false);
  const [agentWorking, setAgentWorking] = useState(false);
  const [consultMode, setConsultMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [simulationMessages, setSimulationMessages] = useState<{ sender: string; text: string }[]>([]);
  const [xenScribeReady, setXenScribeReady] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System: WujiHealth Browser initialized`,
    `[${new Date().toLocaleTimeString()}] System: AI agents loaded successfully`
  ]);
  
  // Browser history state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Browser tabs state
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>([
    { id: '1', title: 'WujiHealth', url: 'https://wujihealth.com/dashboard', favicon: '/favicon.ico' },
    { id: '2', title: 'Patient Records', url: 'https://ehr.wujihealth.com/records', favicon: '/favicon.ico' },
    { id: '3', title: 'XenScribe', url: 'https://wujihealth.com/xenscribe', favicon: '/favicon.ico' },
  ]);
  const [activeBrowserTab, setActiveBrowserTab] = useState<string>('1');
  const [activeContent, setActiveContent] = useState<string>('home');

  // Handle browser back navigation
  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      
      // Find tab with matching URL or create a new one
      const tabWithUrl = browserTabs.find(tab => tab.url === url);
      if (tabWithUrl) {
        setActiveBrowserTab(tabWithUrl.id);
        updateAddressBar(url);
        updateContentBasedOnUrl(url);
      }
      
      setAuditLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Navigation: Moved back to ${url}`
      ]);
    }
  };

  // Handle browser forward navigation
  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      
      // Find tab with matching URL or create a new one
      const tabWithUrl = browserTabs.find(tab => tab.url === url);
      if (tabWithUrl) {
        setActiveBrowserTab(tabWithUrl.id);
        updateAddressBar(url);
        updateContentBasedOnUrl(url);
      }
      
      setAuditLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Navigation: Moved forward to ${url}`
      ]);
    }
  };

  // Handle browser refresh
  const handleRefresh = () => {
    const activeTab = browserTabs.find(tab => tab.id === activeBrowserTab);
    if (activeTab) {
      // Simulate page reload by resetting content based on current URL
      updateContentBasedOnUrl(activeTab.url);
      
      setAuditLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Navigation: Refreshed ${activeTab.url}`
      ]);
    }
  };

  const handleSearch = (query: string) => {
    const msgs = [
      { sender: 'User', text: query },
      { sender: 'ErachI', text: `Searching for "${query}"...` },
      { sender: 'ErachI', text: `I found some insurance options related to "${query}". Would you like to apply?` },
      { sender: 'ErachI', text: `Let me help you fill out an application form.` },
    ];
    setSimulationMessages(msgs);
    setAgentWorking(true);
    setConsultMode(false);
    setActiveTab("Home");
    setTimeout(() => setActiveTab("Insurance"), (msgs.length + 1) * 1000);
    
    // Add a new browser tab with the search query
    const newTabId = (browserTabs.length + 1).toString();
    setBrowserTabs([...browserTabs, {
      id: newTabId,
      title: `Search: ${query}`,
      url: `https://wujihealth.com/search?q=${encodeURIComponent(query)}`,
      favicon: '/favicon.ico'
    }]);
    setActiveBrowserTab(newTabId);
    updateAddressBar(`https://wujihealth.com/search?q=${encodeURIComponent(query)}`);
    setActiveContent('insurance');
    
    // Add the new URL to history
    const newUrl = `https://wujihealth.com/search?q=${encodeURIComponent(query)}`;
    if (historyIndex < history.length - 1) {
      // If we're in the middle of history, truncate forward history
      setHistory([...history.slice(0, historyIndex + 1), newUrl]);
    } else {
      setHistory([...history, newUrl]);
    }
    setHistoryIndex(history.length);
  };
  
  const activateXenScribe = () => {
    // XenScribe tool activation
    setXenScribeReady(true);
    setAuditLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] System: XenScribe activated`,
      `[${new Date().toLocaleTimeString()}] XenScribe: Ready to assist with documentation`
    ]);
    
    // Set XenScribe browser tab as active
    let xenScribeTab = browserTabs.find(tab => tab.title === 'XenScribe');
    if (xenScribeTab) {
      setActiveBrowserTab(xenScribeTab.id);
    } else {
      // Create a new XenScribe tab if it doesn't exist
      const newTabId = (browserTabs.length + 1).toString();
      const newXenScribeTab: BrowserTab = {
        id: newTabId,
        title: 'XenScribe',
        url: 'https://wujihealth.com/xenscribe',
        favicon: '/favicon.ico'
      };
      xenScribeTab = newXenScribeTab;
      setBrowserTabs([...browserTabs, newXenScribeTab]);
      setActiveBrowserTab(newTabId);
    }
    
    // Update address bar
    updateAddressBar(xenScribeTab.url);
    
    // Separately handle consult mode activation
    if (!consultMode) {
      setConsultMode(true);
      setActiveContent('consult');
      setAuditLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] System: Clinical Consult Mode activated`
      ]);
    }
  };
  
  // Function to add a new browser tab
  const addNewBrowserTab = () => {
    const newTabId = (browserTabs.length + 1).toString();
    const newTab = {
      id: newTabId,
      title: 'New Tab',
      url: 'https://wujihealth.com/newtab',
      favicon: '/favicon.ico'
    };
    setBrowserTabs([...browserTabs, newTab]);
    setActiveBrowserTab(newTabId);
    updateAddressBar(newTab.url);
    setActiveContent('home');
    
    // Add the new URL to history
    const newUrl = 'https://wujihealth.com/newtab';
    if (historyIndex < history.length - 1) {
      // If we're in the middle of history, truncate forward history
      setHistory([...history.slice(0, historyIndex + 1), newUrl]);
    } else {
      setHistory([...history, newUrl]);
    }
    setHistoryIndex(history.length);
  };
  
  // Function to close a browser tab
  const closeBrowserTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (browserTabs.length <= 1) return; // Don't close last tab
    
    const newTabs = browserTabs.filter(tab => tab.id !== id);
    setBrowserTabs(newTabs);
    
    // If the active tab was closed, set the last tab as active
    if (activeBrowserTab === id) {
      const lastTab = newTabs[newTabs.length - 1];
      setActiveBrowserTab(lastTab.id);
      updateAddressBar(lastTab.url);
      // Update content based on the tab URL
      updateContentBasedOnUrl(lastTab.url);
    }
  };
  
  // Update the address bar when changing tabs
  const updateAddressBar = (url: string) => {
    setSearchQuery(url);
  };
  
  // Update content based on URL
  const updateContentBasedOnUrl = useCallback((url: string) => {
    if (url.includes('xenscribe')) {
      // XenScribe tab loaded - this doesn't necessarily mean consult mode
      if (!xenScribeReady) {
        setXenScribeReady(true);
        setAuditLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] System: XenScribe loaded and ready`
        ]);
      }
      
      // Only change to consult mode if explicitly requested
      if (consultMode) {
        setActiveContent('consult');
        setAuditLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Navigation: Clinical consult mode active`
        ]);
      } else {
        // Otherwise just show XenScribe home content
        setActiveContent('home');
        setAuditLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Navigation: XenScribe tab loaded`
        ]);
      }
    } else if (url.includes('records')) {
      setActiveContent('patientRecords');
      // Keep consult mode state unchanged - switching tabs doesn't affect consult mode
    } else if (url.includes('search')) {
      setActiveContent('insurance');
      // Keep consult mode state unchanged
    } else if (url.includes('agents')) {
      setActiveContent('agents');
      setActiveTab("Agents");
      // Keep consult mode state unchanged
    } else {
      setActiveContent('home');
      // Keep consult mode state unchanged
    }
  }, [xenScribeReady, consultMode, setActiveTab]);
  
  // When clicking on a browser tab, update the history
  useEffect(() => {
    const activeTab = browserTabs.find(tab => tab.id === activeBrowserTab);
    if (activeTab && activeTab.url) {
      // Update content based on the URL when tab changes
      updateContentBasedOnUrl(activeTab.url);
      
      // Add the URL to history if it's not already the current one
      if (historyIndex === -1 || (historyIndex >= 0 && history[historyIndex] !== activeTab.url)) {
        if (historyIndex < history.length - 1) {
          // If we're in the middle of history, truncate forward history
          setHistory([...history.slice(0, historyIndex + 1), activeTab.url]);
        } else {
          setHistory([...history, activeTab.url]);
        }
        setHistoryIndex(historyIndex + 1);
      }
    }
  }, [activeBrowserTab, browserTabs, history, historyIndex, updateContentBasedOnUrl]);

  // Handle tab selection in the sidebar
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    
    // Handle active tab selection
    if (tab === "Home") {
      // First check if we need to show consult content
      if (consultMode) {
        setActiveContent('consult');
      }
      
      // Find the appropriate tab to show
      const homeTab = browserTabs.find(tab => tab.url.includes('dashboard'));
      if (homeTab) {
        setActiveBrowserTab(homeTab.id);
        updateAddressBar(homeTab.url);
        // Don't set activeContent here, as we want to respect consult mode
      }
    } else if (tab === "Agents") {
      // Check if we have an agents tab already
      let agentsTab = browserTabs.find(tab => tab.url.includes('agents'));
      if (!agentsTab) {
        // Create a new agents tab
        const newTabId = (browserTabs.length + 1).toString();
        agentsTab = {
          id: newTabId,
          title: 'AI Agents',
          url: 'https://wujihealth.com/agents',
          favicon: '/favicon.ico'
        };
        setBrowserTabs([...browserTabs, agentsTab]);
        setActiveBrowserTab(newTabId);
      } else {
        setActiveBrowserTab(agentsTab.id);
      }
      updateAddressBar(agentsTab.url);
      setActiveContent('agents');
    } else if (tab === "Insurance") {
      // Check if we have an insurance tab already
      let insuranceTab = browserTabs.find(tab => tab.url.includes('insurance'));
      if (!insuranceTab) {
        // Create a new insurance tab
        const newTabId = (browserTabs.length + 1).toString();
        insuranceTab = {
          id: newTabId,
          title: 'Insurance',
          url: 'https://wujihealth.com/insurance',
          favicon: '/favicon.ico'
        };
        setBrowserTabs([...browserTabs, insuranceTab]);
        setActiveBrowserTab(newTabId);
      } else {
        setActiveBrowserTab(insuranceTab.id);
      }
      updateAddressBar(insuranceTab.url);
      setActiveContent('insurance');
    }
  };

  // Create a wrapper function with the correct type
  const handleSetActiveTab: React.Dispatch<React.SetStateAction<Tab>> = (value) => {
    // If it's a function, call it with the current activeTab
    const newTab = typeof value === 'function' ? value(activeTab) : value;
    // Then call our handler with the new value
    handleTabChange(newTab);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex flex-col border-b border-border bg-card shadow-sm">
        {/* Browser tabs row */}
        <div className="flex items-center px-2 py-1 border-b border-border">
          <div className="flex-1 flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {browserTabs.map((tab) => (
              <div 
                key={tab.id}
                onClick={() => {
                  setActiveBrowserTab(tab.id);
                  updateAddressBar(tab.url);
                  updateContentBasedOnUrl(tab.url);
                }}
                className={cn(
                  "flex items-center space-x-1 py-1.5 px-3 rounded-t-md cursor-pointer min-w-[120px] max-w-[200px] transition-colors group",
                  activeBrowserTab === tab.id 
                    ? "bg-background" 
                    : "bg-card hover:bg-background/50"
                )}
              >
                {tab.favicon && (
                  <div className="w-4 h-4 flex-shrink-0">
                    <Image src={tab.favicon} alt="" width={16} height={16} />
                  </div>
                )}
                <span className="truncate text-sm">{tab.title}</span>
                {browserTabs.length > 1 && (
                  <button 
                    onClick={(e) => closeBrowserTab(tab.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addNewBrowserTab}
              className="p-1 rounded-full hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Navigation and address bar row */}
        <div className="flex items-center px-4 py-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack} 
              disabled={historyIndex <= 0}
            >
              <ChevronLeft />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleForward} 
              disabled={historyIndex >= history.length - 1}
            >
              <ChevronRight />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
            >
              <RefreshCw />
            </Button>
          </div>
          <div className="flex items-center mr-4 ml-2">
            <div className="flex items-center">

            </div>
          </div>
          <div className="flex flex-1 px-2">
            <Input
              type="text"
              className="flex-1 bg-background text-foreground placeholder:text-muted-foreground border border-input px-3 py-1 rounded-md focus:outline-none"
              placeholder="Search or enter address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleSearch(searchQuery.trim());
                  setSearchQuery('');
                }
              }}
            />
          </div>
          <div className="flex items-center space-x-3 ml-2">
            <div className="flex items-center text-xs bg-green-500 text-white px-2 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3 mr-1" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              {xenScribeReady && (
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={activateXenScribe}
                  className="text-blue-500 border-blue-200 hover:bg-blue-50"
                >
                  <FileText className="h-4 w-4 mr-1.5" />
                  XenScribe
                </Button>
              )}
              
              {/* Separate button for consult mode */}
              {consultMode && (
                <Button 
                  variant="default"
                  size="sm" 
                  onClick={() => {
                    setActiveContent(consultMode ? 'consult' : 'home');
                    setAuditLogs(prev => [
                      ...prev,
                      `[${new Date().toLocaleTimeString()}] System: Clinical Consult interface activated`
                    ]);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Stethoscope className="h-4 w-4 mr-1.5" />
                  Consult Mode
                </Button>
              )}
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto p-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeContent}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {/* Home content */}
              {activeContent === 'home' && !consultMode && (
                <HomeContent
                  handleSearch={handleSearch}
                  simulationMessages={simulationMessages}
                  setActiveTab={handleSetActiveTab}
                  setConsultMode={setConsultMode}
                  setXenScribeReady={setXenScribeReady}
                  setAuditLogs={setAuditLogs}
                />
              )}
              
              {/* Clinical consult content */}
              {activeContent === 'consult' && (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <div className="w-full max-w-5xl mx-auto flex-1">
                    <Suspense fallback={
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="animate-pulse flex flex-col items-center gap-3">
                          <Bot size={40} className="text-primary" />
                          <div className="text-lg font-medium">Loading Clinical Consult...</div>
                          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    }>
                      <ClinicalAgentChat />
                    </Suspense>
                  </div>
                </div>
              )}
              
              {/* Agents dashboard content */}
              {activeContent === 'agents' && (
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-pulse flex flex-col items-center gap-3">
                      <Bot size={40} className="text-primary" />
                      <div className="text-lg font-medium">Loading AI Agents Dashboard...</div>
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                }>
                  <AgentsDashboard />
                </Suspense>
              )}
              
              {/* Insurance content */}
              {activeContent === 'insurance' && <InsuranceContent agentWorking={agentWorking} setAgentWorking={setAgentWorking} />}

              {/* Patient Records content */}
              {activeContent === 'patientRecords' && (
                <div className="max-w-5xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Patient Records</h2>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1.5" />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Audit logs display (collapsed by default) */}
                  <div className="mb-4 bg-muted/30 rounded-md p-2">
                    <details>
                      <summary className="text-sm font-medium cursor-pointer">System Logs ({auditLogs.length})</summary>
                      <div className="mt-2 text-xs text-muted-foreground max-h-32 overflow-y-auto">
                        {auditLogs.map((log, index) => (
                          <div key={index} className="py-0.5">{log}</div>
                        ))}
                      </div>
                    </details>
                  </div>

                  <div className="bg-card rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground">
                          <tr>
                            <th className="py-3 px-4 text-left font-medium">Patient ID</th>
                            <th className="py-3 px-4 text-left font-medium">Name</th>
                            <th className="py-3 px-4 text-left font-medium">Age</th>
                            <th className="py-3 px-4 text-left font-medium">Gender</th>
                            <th className="py-3 px-4 text-left font-medium">Last Visit</th>
                            <th className="py-3 px-4 text-left font-medium">Primary Diagnosis</th>
                            <th className="py-3 px-4 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[
                            { id: "PT-3892", name: "John Smith", age: 45, gender: "Male", lastVisit: "2023-03-12", diagnosis: "Hypertension" },
                            { id: "PT-4102", name: "Maria Garcia", age: 38, gender: "Female", lastVisit: "2023-03-15", diagnosis: "Type 2 Diabetes" },
                            { id: "PT-3756", name: "Robert Johnson", age: 57, gender: "Male", lastVisit: "2023-03-05", diagnosis: "Osteoarthritis" },
                            { id: "PT-4238", name: "Jennifer Lee", age: 29, gender: "Female", lastVisit: "2023-03-18", diagnosis: "Asthma" },
                            { id: "PT-3921", name: "David Williams", age: 62, gender: "Male", lastVisit: "2023-03-09", diagnosis: "COPD" }
                          ].map((patient, i) => (
                            <tr key={i} className="hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-4">{patient.id}</td>
                              <td className="py-3 px-4 font-medium">{patient.name}</td>
                              <td className="py-3 px-4">{patient.age}</td>
                              <td className="py-3 px-4">{patient.gender}</td>
                              <td className="py-3 px-4">{patient.lastVisit}</td>
                              <td className="py-3 px-4">{patient.diagnosis}</td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button className="text-blue-500 hover:text-blue-700">View</button>
                                  <button className="text-blue-500 hover:text-blue-700">Edit</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <Sidebar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          agentWorking={agentWorking}
          consultMode={consultMode}
          setConsultMode={setConsultMode}
        />
      </main>
      {/* Only show the AI widget when we're not on the Agents tab */}
      {activeTab !== "Agents" && (
        showAIWidget ? (
          <div className="fixed bottom-4 right-4 w-80 h-96 bg-card rounded-lg shadow-xl border border-border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border bg-primary/5">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-2">
                  <Bot size={14} className="text-primary-foreground" />
                </div>
                <div className="font-semibold">WujiHealth Assistant</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAIWidget(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-3 bg-background/30">
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-lg max-w-[80%]">
                  <p className="text-sm">Hello, how can I help you with your healthcare needs today?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[80%]">
                  <p className="text-sm">Can you show me my patient records?</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-lg max-w-[80%]">
                  <p className="text-sm">Of course! I&apos;ve pulled up your recent records. Would you like to see your latest lab results or your appointment history?</p>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-border">
              <div className="relative">
                <Input
                  className="pr-10 py-2"
                  placeholder="Type your question here..."
                />
                <Button className="absolute right-1 top-1 h-7 w-7 p-0" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            onClick={() => setShowAIWidget(true)}
          >
            <div className="relative">
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px] font-bold animate-pulse">
                +
              </span>
            </div>
            <span className="absolute right-full mr-2 bg-background text-foreground px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              AI Assistant
            </span>
          </button>
        )
      )}
    </div>
  );
}



function InsuranceContent({ agentWorking, setAgentWorking }: { 
  agentWorking: boolean, 
  setAgentWorking: React.Dispatch<React.SetStateAction<boolean>> 
}) {
  const [loading, setLoading] = useState(true);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    ssn: "",
    employer: "",
    income: "",
    coverageType: "",
    coverageLevel: "",
    dependents: "",
    preExistingConditions: "",
    currentMedications: "",
    primaryPhysician: "",
    smoker: "",
    exerciseFrequency: "",
    paymentMethod: "",
  });
  const [fillingStatus, setFillingStatus] = useState<"idle" | "filling" | "completed">("idle");
  const [currentField, setCurrentField] = useState("");
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      if (agentWorking) {
        setPermissionRequested(true);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [agentWorking]);

  useEffect(() => {
    if (!loading && permissionGranted) {
      setFillingStatus("filling");
      
      // Slower delays for more visible filling
      const fields = [
        // Personal Information
        { field: "firstName", value: "John", delay: 2000 },
        { field: "lastName", value: "Doe", delay: 3000 },
        { field: "dob", value: "1985-06-15", delay: 4000 },
        { field: "address", value: "123 Health St", delay: 5000 },
        { field: "city", value: "Medical City", delay: 6000 },
        { field: "state", value: "CA", delay: 7000 },
        { field: "zip", value: "90210", delay: 8000 },
        { field: "phone", value: "(555) 123-4567", delay: 9000 },
        { field: "email", value: "john.doe@example.com", delay: 10000 },
        { field: "ssn", value: "***-**-4321", delay: 11000 },
        
        // Employment & Financial
        { field: "employer", value: "TechHealth Inc.", delay: 12500 },
        { field: "income", value: "$75,000", delay: 13500 },
        
        // Coverage Details
        { field: "coverageType", value: "Comprehensive", delay: 15000 },
        { field: "coverageLevel", value: "Gold", delay: 16500 },
        { field: "dependents", value: "2 (Spouse, Child)", delay: 18000 },
        
        // Health Information
        { field: "preExistingConditions", value: "None", delay: 20000 },
        { field: "currentMedications", value: "Multivitamin", delay: 21500 },
        { field: "primaryPhysician", value: "Dr. Sarah Johnson", delay: 23000 },
        { field: "smoker", value: "No", delay: 24500 },
        { field: "exerciseFrequency", value: "3-4 times weekly", delay: 26000 },
        
        // Payment Information
        { field: "paymentMethod", value: "Monthly Direct Debit", delay: 28000 },
      ];

      fields.forEach(({ field, value, delay }) => {
        setTimeout(() => {
          setCurrentField(field);
          setFormState(prev => ({ ...prev, [field]: value }));
          
          // Auto-advance steps with longer delays
          if (field === "email") {
            setTimeout(() => setStep(2), 1500);
          } else if (field === "dependents") {
            setTimeout(() => setStep(3), 1500);
          }
          
          if (field === "paymentMethod") {
            setTimeout(() => {
              setFillingStatus("completed");
              setAgentWorking(false);
            }, 2000);
          }
        }, delay);
      });
    }
  }, [loading, permissionGranted, setAgentWorking]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="bg-muted h-6 w-1/4 rounded"></div>
            <div className="bg-muted h-6 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const handleGrantPermission = () => {
    setPermissionGranted(true);
    setPermissionRequested(false);
  };

  const handleDenyPermission = () => {
    setPermissionRequested(false);
    setAgentWorking(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">HealthShield Insurance Application</h2>
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            Application #HD-78291
          </div>
        </div>
      </div>
      
      {permissionRequested && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full shadow-xl border border-border">
            <div className="flex items-center mb-4">
              <Bot size={24} className="text-blue-500 mr-2" />
              <h3 className="text-lg font-bold">AI Assistant Permission</h3>
            </div>
            <p className="mb-4">I&apos;d like to help you complete this form automatically. Would you like me to fill out the application for you?</p>
            <div className="flex space-x-3">
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={handleGrantPermission}
              >
                Yes, fill it automatically
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDenyPermission}
              >
                No, I&apos;ll do it myself
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div key={idx} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-medium",
                step > idx ? "bg-green-500 text-white" : 
                step === idx + 1 ? "bg-blue-500 text-white" : 
                "bg-gray-200 text-gray-500"
              )}>
                {idx + 1}
              </div>
              {idx < totalSteps - 1 && (
                <div className={cn(
                  "h-1 w-16 sm:w-24 md:w-32",
                  step > idx + 1 ? "bg-green-500" : "bg-gray-200"
                )}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Personal Info</span>
          <span>Coverage Details</span>
          <span>Health & Payment</span>
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
          <div className="font-medium">Step {step} of {totalSteps}: {step === 1 ? "Personal Information" : step === 2 ? "Coverage Details" : "Health & Payment"}</div>
          {fillingStatus === "filling" && (
            <div className="text-sm flex items-center">
              <span className="inline-block h-3 w-3 mr-2 bg-white rounded-full animate-ping"></span>
              AI Agent is filling your form...
            </div>
          )}
          {fillingStatus === "completed" && (
                          <div className="text-sm flex items-center">
                <span className="inline-block h-2 w-2 mr-2 bg-green-300 rounded-full"></span>
                Form filled successfully
              </div>
          )}
        </div>
        
        {fillingStatus === "filling" && (
          <div className="w-full bg-gray-100">
            <div className="bg-green-500 h-1 transition-all duration-700" style={{ width: `${(Object.values(formState).filter(Boolean).length / 21) * 100}%` }}></div>
          </div>
        )}
        
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">
                    <span>First Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formState.firstName} 
                    className={cn(
                      currentField === "firstName" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "firstName" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">
                    <span>Last Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formState.lastName} 
                    className={cn(
                      currentField === "lastName" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "lastName" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Date of Birth</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={formState.dob} 
                  className={cn(
                    currentField === "dob" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "dob" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Street Address</label>
                <Input 
                  value={formState.address} 
                  className={cn(
                    currentField === "address" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "address" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={formState.city} 
                    className={cn(
                      currentField === "city" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "city" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input 
                    value={formState.state} 
                    className={cn(
                      currentField === "state" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "state" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ZIP</label>
                  <Input 
                    value={formState.zip} 
                    className={cn(
                      currentField === "zip" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "zip" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">
                    <span>Phone Number</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formState.phone} 
                    className={cn(
                      currentField === "phone" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "phone" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">
                    <span>Email</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formState.email} 
                    className={cn(
                      currentField === "email" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "email" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Social Security Number</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={formState.ssn} 
                  className={cn(
                    currentField === "ssn" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "ssn" && "animate-pulse"
                  )}
                  readOnly 
                />
                <p className="text-xs text-gray-500">Your SSN is encrypted and stored securely</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Employer</label>
                  <Input 
                    value={formState.employer} 
                    className={cn(
                      currentField === "employer" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "employer" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Annual Income</label>
                  <Input 
                    value={formState.income} 
                    className={cn(
                      currentField === "income" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "income" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Coverage Type</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={formState.coverageType} 
                  className={cn(
                    currentField === "coverageType" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "coverageType" && "animate-pulse"
                  )}
                  readOnly 
                />
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  <p className="font-medium text-blue-700">Comprehensive Coverage includes:</p>
                  <ul className="list-disc pl-5 mt-1 text-blue-600 space-y-1">
                    <li>Preventive care covered 100%</li>
                    <li>Hospitalization</li>
                    <li>Emergency services</li>
                    <li>Prescription drugs</li>
                    <li>Mental health services</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Coverage Level</label>
                <Input 
                  value={formState.coverageLevel} 
                  className={cn(
                    currentField === "coverageLevel" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "coverageLevel" && "animate-pulse"
                  )}
                  readOnly 
                />
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                  <p className="font-medium text-yellow-700">Gold Plan Details:</p>
                  <ul className="list-disc pl-5 mt-1 text-yellow-600 space-y-1">
                    <li>$1,000 annual deductible</li>
                    <li>$20 primary care visit copay</li>
                    <li>$40 specialist visit copay</li>
                    <li>$5,000 out-of-pocket maximum</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Dependents to Cover</label>
                <Input 
                  value={formState.dependents} 
                  className={cn(
                    currentField === "dependents" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "dependents" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pre-existing Conditions</label>
                <Input 
                  value={formState.preExistingConditions} 
                  className={cn(
                    currentField === "preExistingConditions" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "preExistingConditions" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Medications</label>
                <Input 
                  value={formState.currentMedications} 
                  className={cn(
                    currentField === "currentMedications" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "currentMedications" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Physician</label>
                <Input 
                  value={formState.primaryPhysician} 
                  className={cn(
                    currentField === "primaryPhysician" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "primaryPhysician" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Smoker</label>
                  <Input 
                    value={formState.smoker} 
                    className={cn(
                      currentField === "smoker" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "smoker" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Exercise Frequency</label>
                  <Input 
                    value={formState.exerciseFrequency} 
                    className={cn(
                      currentField === "exerciseFrequency" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "exerciseFrequency" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Payment Method</label>
                <Input 
                  value={formState.paymentMethod} 
                  className={cn(
                    currentField === "paymentMethod" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "paymentMethod" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              {fillingStatus === "completed" && (
                <div className="mt-6 space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Application Complete!</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Your information has been filled automatically. Please review and submit.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center mb-4">
                      <input id="terms" type="checkbox" checked className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" readOnly />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-700">I confirm all information is accurate and agree to the <a className="text-blue-600 underline">Terms of Service</a> and <a className="text-blue-600 underline">Privacy Policy</a></label>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">Submit Application</Button>
                      <Button variant="outline" className="flex-1">Save & Continue Later</Button>
                    </div>
                    
                    <p className="text-center text-xs text-gray-500 mt-4">
                      Need help? Contact our support at <span className="text-blue-600">support@healthshield.com</span> or call <span className="text-blue-600">(800) 555-1234</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 