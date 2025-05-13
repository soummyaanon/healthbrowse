"use client"

import React, { useState, lazy, Suspense, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Search, ClipboardCheck,  RefreshCw, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load the AI components
const AIAssistant = lazy(() => import("@/components/kokonutui/AIAssistant"));
const XenRCM = lazy(() => import("@/components/kokonutui/XenRCM"));
const XenSearch = lazy(() => import("@/components/kokonutui/XenSearch"));
const XenCDI = lazy(() => import("@/components/kokonutui/XenCDI"));

// Define agent types
export type AgentType = "scribe" | "rcm" | "search" | "cdi";

export default function AgentsDashboard() {
  const [activeAgent, setActiveAgent] = useState<AgentType>("scribe");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contextData, setContextData] = useState({
    currentContext: "clinical",
    activePatient: "Smith, John",
    currentPage: "EHR Dashboard",
    recentActivity: "Viewed clinical notes"
  });

  // Define agent information and capabilities
  const agentInfo = {
    scribe: {
      name: "XenScribe",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      description: "Automatically generates SOAP notes from audio or transcripts and suggests appropriate ICD-10/CPT codes.",
      context: "clinical",
      status: "available",
      metrics: {
        accuracy: "94%",
        completionTime: "45 sec",
        success: "98%"
      }
    },
    rcm: {
      name: "XenRCM",
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      description: "Analyzes insurance denials and auto-generates appeal packets. Helps with eligibility checks and prior authorizations.",
      context: "billing",
      status: "available",
      metrics: {
        accuracy: "91%",
        completionTime: "60 sec",
        success: "95%"
      }
    },
    search: {
      name: "XenSearch",
      icon: <Search className="h-5 w-5 text-purple-500" />,
      description: "Provides contextual clinical information based on patient problems. Pulls relevant content from medical databases.",
      context: "any",
      status: "available",
      metrics: {
        accuracy: "96%",
        completionTime: "25 sec",
        success: "99%"
      }
    },
    cdi: {
      name: "XenCDI",
      icon: <ClipboardCheck className="h-5 w-5 text-amber-500" />,
      description: "Reviews documentation and suggests improvements for coding accuracy and compliance.",
      context: "documentation",
      status: "available",
      metrics: {
        accuracy: "93%",
        completionTime: "55 sec",
        success: "97%"
      }
    }
  };

  // Simulate analyzing content and context detection
  const analyzeCurrentContext = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // In a real implementation, this would detect the actual context from the page content
      const contexts = ["clinical", "billing", "documentation"];
      const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
      setContextData(prev => ({...prev, currentContext: randomContext}));
    }, 1500);
  };

  useEffect(() => {
    // On first load, simulate loading context from current page
    analyzeCurrentContext();
  }, []);

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Left Sidebar with Agents */}
      <motion.div 
        className={cn(
          "h-full border-r border-border bg-card/50 transition-all",
          isCollapsed ? "w-16" : "w-72"
        )}
        initial={{ width: isCollapsed ? 64 : 288 }}
        animate={{ width: isCollapsed ? 64 : 288 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className={cn("flex items-center space-x-2", isCollapsed && "hidden")}>
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">AI Agents</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="p-2">
          {/* Context Analysis Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "mb-4 w-full justify-start",
              isCollapsed && "justify-center p-2"
            )}
            onClick={analyzeCurrentContext}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {!isCollapsed && <span className="ml-2">Analyzing...</span>}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">Analyze Context</span>}
              </>
            )}
          </Button>

          {/* Context Information Panel */}
          {!isCollapsed && (
            <div className="mb-4 rounded-md border border-border bg-background p-3 text-xs">
              <div className="mb-2 font-medium text-sm flex items-center justify-between">
                <span>Current Context</span>
                {isAnalyzing && (
                  <div className="flex items-center text-blue-500 text-xs">
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-muted-foreground">Context:</div>
                  <div className="font-medium">
                    {contextData.currentContext === "clinical" && "Clinical Documentation"}
                    {contextData.currentContext === "billing" && "Revenue Cycle / Billing"}
                    {contextData.currentContext === "documentation" && "Chart Review"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Patient:</div>
                  <div className="font-medium">{contextData.activePatient}</div>
                </div>
              </div>
            </div>
          )}

          {/* Agent List */}
          <div className="space-y-2">
            <TooltipProvider>
              {Object.entries(agentInfo).map(([key, agent]) => {
                const agentKey = key as AgentType;
                const isRecommended = agent.context === "any" || agent.context === contextData.currentContext;
                
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={activeAgent === agentKey ? "default" : "outline"} 
                        size="sm" 
                        className={cn(
                          "w-full justify-start relative",
                          isCollapsed && "justify-center p-2",
                          isRecommended && activeAgent !== agentKey && "border-primary/30"
                        )}
                        onClick={() => setActiveAgent(agentKey)}
                      >
                        <div className="flex items-center">
                          {agent.icon}
                          {!isCollapsed && <span className="ml-2">{agent.name}</span>}
                        </div>
                        {isRecommended && (
                          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="space-y-2">
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs">{agent.description}</p>
                        {isRecommended && (
                          <div className="text-xs flex items-center text-green-600">
                            <span className="h-1.5 w-1.5 rounded-full mr-1 bg-green-500" />
                            Recommended for current context
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>

          {/* Agent Metrics (when not collapsed) */}
          {!isCollapsed && activeAgent && (
            <div className="mt-8 p-3 bg-muted/50 rounded-md text-xs">
              <h3 className="font-medium mb-2">{agentInfo[activeAgent].name} Metrics</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-1 bg-background rounded">
                  <div className="text-muted-foreground">Accuracy</div>
                  <div className="font-semibold text-primary">{agentInfo[activeAgent].metrics.accuracy}</div>
                </div>
                <div className="text-center p-1 bg-background rounded">
                  <div className="text-muted-foreground">Time</div>
                  <div className="font-semibold text-amber-500">{agentInfo[activeAgent].metrics.completionTime}</div>
                </div>
                <div className="text-center p-1 bg-background rounded">
                  <div className="text-muted-foreground">Success</div>
                  <div className="font-semibold text-green-500">{agentInfo[activeAgent].metrics.success}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAgent}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeAgent === "scribe" && (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-lg font-medium">Loading XenScribe...</div>
                  </div>
                </div>
              }>
                <AIAssistant />
              </Suspense>
            )}
            
            {activeAgent === "rcm" && (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-lg font-medium">Loading XenRCM...</div>
                  </div>
                </div>
              }>
                <XenRCM />
              </Suspense>
            )}
            
            {activeAgent === "search" && (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-lg font-medium">Loading XenSearch...</div>
                  </div>
                </div>
              }>
                <XenSearch />
              </Suspense>
            )}
            
            {activeAgent === "cdi" && (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-lg font-medium">Loading XenCDI...</div>
                  </div>
                </div>
              }>
                <XenCDI />
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 