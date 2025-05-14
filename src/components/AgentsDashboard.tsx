"use client"

import React, { useState, lazy, Suspense, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Search, ClipboardCheck, RefreshCw, ChevronLeft, ChevronRight, Bot, BarChart4, Users, CheckCircle, Clock, PieChart, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy load the AI components
const AIAssistant = lazy(() => import("@/components/kokonutui/AIAssistant"));
const XenRCM = lazy(() => import("@/components/kokonutui/XenRCM"));
const XenSearch = lazy(() => import("@/components/kokonutui/XenSearch"));
const XenCDI = lazy(() => import("@/components/kokonutui/XenCDI"));

// Chart data type
type ChartData = {
  type: 'bar' | 'line';
  title: string;
  data: { label: string; value: number }[];
  color: string;
}

// Agent usage stats type
type AgentUsage = {
  users: number;
  tasks: number;
  growth: string;
}

// Agent performance type
type AgentPerformance = {
  month: string;
  tasks: number;
}

// Define agent types
export type AgentType = "scribe" | "rcm" | "search" | "cdi" | "dashboard";

// Define agent info type
type AgentInfo = {
  name: string;
  icon: React.ReactNode;
  description: string;
  context: string;
  status: string;
  metrics: {
    accuracy: string;
    completionTime: string;
    success: string;
  };
  usage?: AgentUsage;
  performance?: AgentPerformance[];
}

// Simple chart component
const SimpleChart = ({ data }: { data: ChartData }) => {
  const maxValue = Math.max(...data.data.map(d => d.value));
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-4 bg-card rounded-lg border shadow-sm"
    >
      <h4 className="text-sm font-medium mb-3 text-foreground">{data.title}</h4>
      
      {data.type === 'bar' ? (
        <div className="space-y-2">
          {data.data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs w-24 text-muted-foreground">{item.label}</span>
              <div className="flex-1 h-7 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
                  className="h-full rounded-full flex items-center pl-2"
                  style={{ backgroundColor: data.color }}
                >
                  <span className="text-xs font-medium text-white">{item.value}</span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-40 flex items-end gap-1">
          {data.data.map((item, i) => (
            <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / maxValue) * 80}%` }}
                transition={{ duration: 0.5, delay: i * 0.1, type: "spring" }}
                className="w-4 rounded-t"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-xs mt-1 text-muted-foreground">{item.label}</span>
              <span className="text-xs font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Stat card component
const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  positive = true 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  change?: string; 
  positive?: boolean 
}) => {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="text-muted-foreground text-sm">{title}</div>
        {icon}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {change && (
        <div className={cn(
          "text-xs mt-1 flex items-center",
          positive ? "text-green-500" : "text-red-500"
        )}>
          <span>{change}</span>
          <span className="ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default function AgentsDashboard() {
  const [activeAgent, setActiveAgent] = useState<AgentType>("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contextData, setContextData] = useState({
    currentContext: "clinical",
    activePatient: "Smith, John",
    currentPage: "EHR Dashboard",
    recentActivity: "Viewed clinical notes"
  });

  // Define agent information and capabilities
  const agentInfo: { [key: string]: AgentInfo } = {
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
      },
      usage: {
        users: 1254,
        tasks: 7823,
        growth: "+12%"
      },
      performance: [
        { month: "Jan", tasks: 480 },
        { month: "Feb", tasks: 520 },
        { month: "Mar", tasks: 610 },
        { month: "Apr", tasks: 590 },
        { month: "May", tasks: 650 },
        { month: "Jun", tasks: 710 }
      ]
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
      },
      usage: {
        users: 842,
        tasks: 5246,
        growth: "+8%"
      },
      performance: [
        { month: "Jan", tasks: 320 },
        { month: "Feb", tasks: 380 },
        { month: "Mar", tasks: 410 },
        { month: "Apr", tasks: 450 },
        { month: "May", tasks: 490 },
        { month: "Jun", tasks: 520 }
      ]
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
      },
      usage: {
        users: 1876,
        tasks: 12450,
        growth: "+24%"
      },
      performance: [
        { month: "Jan", tasks: 950 },
        { month: "Feb", tasks: 1120 },
        { month: "Mar", tasks: 1340 },
        { month: "Apr", tasks: 1580 },
        { month: "May", tasks: 1820 },
        { month: "Jun", tasks: 2240 }
      ]
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
      },
      usage: {
        users: 765,
        tasks: 4120,
        growth: "+15%"
      },
      performance: [
        { month: "Jan", tasks: 280 },
        { month: "Feb", tasks: 320 },
        { month: "Mar", tasks: 375 },
        { month: "Apr", tasks: 410 },
        { month: "May", tasks: 450 },
        { month: "Jun", tasks: 520 }
      ]
    },
    dashboard: {
      name: "Dashboard",
      icon: <BarChart4 className="h-5 w-5 text-slate-500" />,
      description: "Overall performance metrics and analytics for all AI agents.",
      context: "any",
      status: "available",
      metrics: {
        accuracy: "94%",
        completionTime: "46 sec",
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

  // Total metrics across all agents (for dashboard)
  const totalTasks = Object.values(agentInfo)
    .filter(agent => 'usage' in agent)
    .reduce((sum, agent) => sum + (agent.usage?.tasks || 0), 0);
  
  const totalUsers = Object.values(agentInfo)
    .filter(agent => 'usage' in agent)
    .reduce((sum, agent) => sum + (agent.usage?.users || 0), 0);

  // Chart data for all agents' performance
  const performanceChartData: ChartData = {
    type: 'line',
    title: 'Agent Usage Trends (Last 6 Months)',
    data: [
      { label: 'Jan', value: 2030 },
      { label: 'Feb', value: 2340 },
      { label: 'Mar', value: 2735 },
      { label: 'Apr', value: 3030 },
      { label: 'May', value: 3410 },
      { label: 'Jun', value: 3990 }
    ],
    color: 'rgb(59, 130, 246)'
  };

  const agentPopularityData: ChartData = {
    type: 'bar',
    title: 'Agent Usage Distribution',
    data: [
      { label: 'XenSearch', value: 42 },
      { label: 'XenScribe', value: 26 },
      { label: 'XenRCM', value: 18 },
      { label: 'XenCDI', value: 14 }
    ],
    color: 'rgb(139, 92, 246)'
  };

  // Render dashboard content
  const renderDashboard = () => {
    return (
      <div className="p-6 overflow-auto h-full">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Agent Overview</h2>
          <p className="text-muted-foreground">Performance overview and analytics for all our  healthcare AI agents</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Tasks Completed" 
            value={totalTasks.toLocaleString()} 
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            change="+18%" 
          />
          <StatCard 
            title="Total Users" 
            value={totalUsers.toLocaleString()} 
            icon={<Users className="h-5 w-5 text-blue-500" />}
            change="+14%" 
          />
          <StatCard 
            title="Avg. Success Rate" 
            value="97%" 
            icon={<PieChart className="h-5 w-5 text-purple-500" />}
            change="+2%" 
          />
          <StatCard 
            title="Avg. Completion Time" 
            value="46s" 
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            change="-3s" 
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SimpleChart data={performanceChartData} />
          <SimpleChart data={agentPopularityData} />
        </div>

        {/* Agent performance table */}
        <div className="border rounded-lg overflow-hidden mb-6">
          <h3 className="text-md font-medium p-4 bg-muted">Agent Performance</h3>
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Agent</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Users</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Tasks</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Accuracy</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Success</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(agentInfo)
                .filter(([key]) => key !== 'dashboard')
                .map(([key, agent]) => {
                  const agentKey = key as Exclude<AgentType, 'dashboard'>;
                  return (
                    <tr key={key} className="border-b hover:bg-muted/30">
                      <td className="p-3 flex items-center gap-2">
                        <div className="p-1.5 rounded bg-muted flex items-center justify-center">
                          {agent.icon}
                        </div>
                        <span>{agent.name}</span>
                      </td>
                      <td className="p-3">{agent.usage?.users.toLocaleString()}</td>
                      <td className="p-3">{agent.usage?.tasks.toLocaleString()}</td>
                      <td className="p-3">{agent.metrics.accuracy}</td>
                      <td className="p-3">{agent.metrics.success}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" onClick={() => setActiveAgent(agentKey)}>
                          Use <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>

        {/* Activity panels */}
        <div>
          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="popular">Popular Uses</TabsTrigger>
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="p-4 border rounded-lg mt-2">
              <ul className="space-y-3">
                <li className="text-sm border-b pb-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-purple-500" />
                  <span><strong>XenSearch</strong> queried hypertension guidelines for Dr. Johnson</span>
                  <span className="text-xs text-muted-foreground ml-auto">2 mins ago</span>
                </li>
                <li className="text-sm border-b pb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span><strong>XenScribe</strong> generated SOAP note for patient encounter</span>
                  <span className="text-xs text-muted-foreground ml-auto">15 mins ago</span>
                </li>
                <li className="text-sm border-b pb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span><strong>XenRCM</strong> created appeal packet for denied cardiac MRI</span>
                  <span className="text-xs text-muted-foreground ml-auto">28 mins ago</span>
                </li>
                <li className="text-sm border-b pb-2 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-amber-500" />
                  <span><strong>XenCDI</strong> analyzed documentation for HCC coding opportunities</span>
                  <span className="text-xs text-muted-foreground ml-auto">45 mins ago</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <Search className="h-4 w-4 text-purple-500" />
                  <span><strong>XenSearch</strong> provided medication interaction data</span>
                  <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="popular" className="p-4 border rounded-lg mt-2">
              <ul className="space-y-3">
                <li className="text-sm border-b pb-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-purple-500" />
                  <span>Finding medication interactions and contraindications</span>
                  <span className="text-xs text-muted-foreground ml-auto">4,250 uses</span>
                </li>
                <li className="text-sm border-b pb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Generating SOAP notes from patient encounters</span>
                  <span className="text-xs text-muted-foreground ml-auto">3,820 uses</span>
                </li>
                <li className="text-sm border-b pb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>Automating prior authorization requests</span>
                  <span className="text-xs text-muted-foreground ml-auto">2,430 uses</span>
                </li>
                <li className="text-sm border-b pb-2 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-amber-500" />
                  <span>Analyzing HCC coding opportunities</span>
                  <span className="text-xs text-muted-foreground ml-auto">1,950 uses</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <Search className="h-4 w-4 text-purple-500" />
                  <span>Retrieving clinical practice guidelines</span>
                  <span className="text-xs text-muted-foreground ml-auto">1,840 uses</span>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="insights" className="p-4 border rounded-lg mt-2">
              <ul className="space-y-3">
                <li className="text-sm border-b pb-2">
                  <div className="font-medium mb-1">Peak Usage Times</div>
                  <div className="text-muted-foreground">Highest agent activity occurs between 9-11am and 1-3pm on weekdays</div>
                </li>
                <li className="text-sm border-b pb-2">
                  <div className="font-medium mb-1">User Retention</div>
                  <div className="text-muted-foreground">92% of users who try an agent return to use it again within 7 days</div>
                </li>
                <li className="text-sm border-b pb-2">
                  <div className="font-medium mb-1">Time Savings</div>
                  <div className="text-muted-foreground">Users report saving an average of 45 minutes per day using AI agents</div>
                </li>
                <li className="text-sm border-b pb-2">
                  <div className="font-medium mb-1">Growth Trend</div>
                  <div className="text-muted-foreground">Overall agent usage has increased 24% month over month</div>
                </li>
                <li className="text-sm">
                  <div className="font-medium mb-1">Feature Requests</div>
                  <div className="text-muted-foreground">Most requested: integrated lab result analysis and medical image interpretation</div>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

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

          {/* Dashboard button at top level */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeAgent === "dashboard" ? "default" : "outline"} 
                  size="sm" 
                  className={cn(
                    "w-full justify-start relative mb-4",
                    isCollapsed && "justify-center p-2"
                  )}
                  onClick={() => setActiveAgent("dashboard")}
                >
                  <div className="flex items-center">
                    <BarChart4 className="h-5 w-5 text-slate-500" />
                    {!isCollapsed && <span className="ml-2">Dashboard</span>}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="space-y-2">
                  <p className="font-medium">Agent Dashboard</p>
                  <p className="text-xs">View performance metrics and analytics for all agents</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Agent List Heading */}
          {!isCollapsed && (
            <div className="mb-2 px-1 font-medium text-sm text-muted-foreground">
              Agents
            </div>
          )}

          {/* Agent List */}
          <div className="space-y-2">
            <TooltipProvider>
              {/* Individual agents */}
              {Object.entries(agentInfo)
                .filter(([key]) => key !== 'dashboard')
                .map(([key, agent]) => {
                const agentKey = key as Exclude<AgentType, 'dashboard'>;
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
          {!isCollapsed && activeAgent && activeAgent !== "dashboard" && (
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
            {activeAgent === "dashboard" && renderDashboard()}
            
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