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

// Enhanced chart component with gradients and improved visuals
const SimpleChart = ({ data }: { data: ChartData }) => {
  const maxValue = Math.max(...data.data.map(d => d.value));
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-5 bg-card rounded-lg border shadow-md relative overflow-hidden"
    >
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-foreground">{data.title}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-foreground/70"></div>
          <span>{data.type === 'bar' ? 'Comparison' : 'Trend'}</span>
        </div>
      </div>
      
      {data.type === 'bar' ? (
        <div className="space-y-3">
          {data.data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs w-24 text-muted-foreground font-medium">{item.label}</span>
              <div className="flex-1 h-9 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
                  className="h-full rounded-full flex items-center pl-2 relative bg-foreground dark:bg-foreground text-background dark:text-background"
                >
                  <span className="text-xs font-medium relative z-10">{item.value}</span>
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shine_2s_infinite]"></div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-48 flex items-end gap-2 pt-8 relative">
          {/* Y-axis line */}
          <div className="absolute left-0 top-8 bottom-6 w-px bg-border"></div>
          
          {/* X-axis line */}
          <div className="absolute left-0 right-4 bottom-6 h-px bg-border"></div>
          
          {/* Chart content */}
          <div className="flex items-end gap-2 ml-4 h-full w-full">
            {data.data.map((item, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / maxValue) * 80}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1, type: "spring" }}
                  className="w-10 rounded-t-lg relative group bg-foreground dark:bg-foreground"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-background border px-2 py-1 rounded text-xs whitespace-nowrap transition-opacity">
                    {item.value} tasks
                  </div>
                  
                  {/* Highlight effect */}
                  <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-transparent to-white/20"></div>
                </motion.div>
                <span className="text-xs mt-2 text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Enhanced stat card component with gradients and animations
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg border p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
      
      <div className="flex justify-between items-start mb-3">
        <div className="text-muted-foreground text-sm font-medium">{title}</div>
        <div className="p-2 rounded-full bg-muted/50">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {change && (
        <div className={cn(
          "text-xs mt-2 flex items-center font-medium",
          positive ? "text-green-500" : "text-red-500"
        )}>
          <span>{positive ? "↑" : "↓"} {change}</span>
          <span className="ml-1 text-muted-foreground">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

export default function AgentsDashboard() {
  const [activeAgent, setActiveAgent] = useState<AgentType>("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
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

  // Define time-based data for different periods
  const timePeriodsData = {
    today: {
      tasks: 310,
      users: 124,
      successRate: "98%",
      completionTime: "42s",
      chartData: [
        { label: '8am', value: 42 },
        { label: '10am', value: 78 },
        { label: '12pm', value: 95 },
        { label: '2pm', value: 82 },
        { label: '4pm', value: 63 },
        { label: '6pm', value: 35 }
      ],
      agentData: [
        { label: 'XenSearch', value: 48 },
        { label: 'XenScribe', value: 28 },
        { label: 'XenRCM', value: 15 },
        { label: 'XenCDI', value: 9 }
      ]
    },
    week: {
      tasks: 1860,
      users: 356,
      successRate: "97.5%",
      completionTime: "44s",
      chartData: [
        { label: 'Mon', value: 320 },
        { label: 'Tue', value: 380 },
        { label: 'Wed', value: 410 },
        { label: 'Thu', value: 350 },
        { label: 'Fri', value: 290 },
        { label: 'Sat', value: 110 }
      ],
      agentData: [
        { label: 'XenSearch', value: 45 },
        { label: 'XenScribe', value: 27 },
        { label: 'XenRCM', value: 16 },
        { label: 'XenCDI', value: 12 }
      ]
    },
    month: {
      tasks: 3990,
      users: 843,
      successRate: "97.2%",
      completionTime: "46s",
      chartData: [
        { label: 'Jan', value: 2030 },
        { label: 'Feb', value: 2340 },
        { label: 'Mar', value: 2735 },
        { label: 'Apr', value: 3030 },
        { label: 'May', value: 3410 },
        { label: 'Jun', value: 3990 }
      ],
      agentData: [
        { label: 'XenSearch', value: 42 },
        { label: 'XenScribe', value: 26 },
        { label: 'XenRCM', value: 18 },
        { label: 'XenCDI', value: 14 }
      ]
    },
    quarter: {
      tasks: 10430,
      users: 1245,
      successRate: "96.8%",
      completionTime: "48s",
      chartData: [
        { label: 'Q1 2023', value: 5250 },
        { label: 'Q2 2023', value: 6120 },
        { label: 'Q3 2023', value: 7540 },
        { label: 'Q4 2023', value: 8950 },
        { label: 'Q1 2024', value: 9780 },
        { label: 'Q2 2024', value: 10430 }
      ],
      agentData: [
        { label: 'XenSearch', value: 40 },
        { label: 'XenScribe', value: 28 },
        { label: 'XenRCM', value: 20 },
        { label: 'XenCDI', value: 12 }
      ]
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

  // // Total metrics across all agents (for dashboard)
  // const totalTasks = Object.values(agentInfo)
  //   .filter(agent => 'usage' in agent)
  //   .reduce((sum, agent) => sum + (agent.usage?.tasks || 0), 0);
  
  // const totalUsers = Object.values(agentInfo)
  //   .filter(agent => 'usage' in agent)
  //   .reduce((sum, agent) => sum + (agent.usage?.users || 0), 0);

  // Get current chart data based on selected time period
  const performanceChartData: ChartData = {
    type: 'line',
    title: `Agent Usage Trends (${
      timePeriod === 'today' ? 'Today' :
      timePeriod === 'week' ? 'This Week' :
      timePeriod === 'month' ? 'Last 6 Months' : 'Past 6 Quarters'
    })`,
    data: timePeriodsData[timePeriod].chartData,
    color: 'currentColor'
  };

  const agentPopularityData: ChartData = {
    type: 'bar',
    title: 'Agent Usage Distribution',
    data: timePeriodsData[timePeriod].agentData,
    color: 'currentColor'
  };

  // Render dashboard content
  const renderDashboard = () => {
    return (
      <div className="p-6 overflow-auto h-full">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Agent Dashboard</h2>
            <p className="text-muted-foreground">Performance analytics and insights for healthcare AI agents</p>
          </div>
          
          {/* Time period selector */}
          <div className="flex items-center space-x-2 bg-muted/50 p-1 rounded-lg border">
            <Button 
              variant={timePeriod === 'today' ? "default" : "ghost"} 
              size="sm" 
              className="text-xs h-7"
              onClick={() => setTimePeriod('today')}
            >
              Today
            </Button>
            <Button 
              variant={timePeriod === 'week' ? "default" : "ghost"} 
              size="sm" 
              className="text-xs h-7"
              onClick={() => setTimePeriod('week')}
            >
              Week
            </Button>
            <Button 
              variant={timePeriod === 'month' ? "default" : "ghost"} 
              size="sm" 
              className="text-xs h-7"
              onClick={() => setTimePeriod('month')}
            >
              Month
            </Button>
            <Button 
              variant={timePeriod === 'quarter' ? "default" : "ghost"} 
              size="sm" 
              className="text-xs h-7"
              onClick={() => setTimePeriod('quarter')}
            >
              Quarter
            </Button>
          </div>
        </div>

        {/* Quick metrics summary card */}
        <div className="mb-6 p-4 border rounded-xl bg-card/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Overall System Health</h3>
            <div className="text-xs text-muted-foreground">Updated 5 minutes ago</div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Overall Success</div>
                <div className="text-lg font-bold">{timePeriodsData[timePeriod].successRate}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Active Users</div>
                <div className="text-lg font-bold">{timePeriodsData[timePeriod].users}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Agent Tasks</div>
                <div className="text-lg font-bold">{timePeriodsData[timePeriod].tasks.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg. Latency</div>
                <div className="text-lg font-bold">{timePeriodsData[timePeriod].completionTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Tasks Completed" 
            value={timePeriodsData[timePeriod].tasks.toLocaleString()} 
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            change={
              timePeriod === 'today' ? "+14%" : 
              timePeriod === 'week' ? "+16%" : 
              timePeriod === 'month' ? "+18%" : "+22%"
            } 
          />
          <StatCard 
            title="Total Users" 
            value={timePeriodsData[timePeriod].users.toLocaleString()} 
            icon={<Users className="h-5 w-5 text-blue-500" />}
            change={
              timePeriod === 'today' ? "+8%" : 
              timePeriod === 'week' ? "+12%" : 
              timePeriod === 'month' ? "+14%" : "+18%"
            } 
          />
          <StatCard 
            title="Avg. Success Rate" 
            value={timePeriodsData[timePeriod].successRate} 
            icon={<PieChart className="h-5 w-5 text-purple-500" />}
            change={
              timePeriod === 'today' ? "+3%" : 
              timePeriod === 'week' ? "+2.5%" : 
              timePeriod === 'month' ? "+2%" : "+1.8%"
            } 
          />
          <StatCard 
            title="Avg. Completion Time" 
            value={timePeriodsData[timePeriod].completionTime} 
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            change={
              timePeriod === 'today' ? "-4s" : 
              timePeriod === 'week' ? "-3.5s" : 
              timePeriod === 'month' ? "-3s" : "-2.5s"
            } 
            positive={true}
          />
        </div>

        {/* Charts section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Performance Analytics</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SimpleChart data={performanceChartData} />
            <SimpleChart data={agentPopularityData} />
          </div>
        </div>

        {/* Agent performance section with enhanced table */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Agent Performance</h3>
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-muted/30 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Agent Metrics</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Export
                  </Button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Agent</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Users</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Tasks</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Accuracy</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Success</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Growth</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(agentInfo)
                    .filter(([key]) => key !== 'dashboard')
                    .map(([key, agent]) => {
                      const agentKey = key as Exclude<AgentType, 'dashboard'>;
                      return (
                        <tr key={key} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 flex items-center gap-2">
                            <div className="p-1.5 rounded bg-muted flex items-center justify-center">
                              {agent.icon}
                            </div>
                            <span className="font-medium">{agent.name}</span>
                          </td>
                          <td className="p-4">{agent.usage?.users.toLocaleString()}</td>
                          <td className="p-4">{agent.usage?.tasks.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden mr-2">
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{ width: agent.metrics.accuracy.replace('%', '') + '%' }}
                                ></div>
                              </div>
                              <span>{agent.metrics.accuracy}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden mr-2">
                                <div 
                                  className="h-full bg-blue-500" 
                                  style={{ width: agent.metrics.success.replace('%', '') + '%' }}
                                ></div>
                              </div>
                              <span>{agent.metrics.success}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-green-500 inline-flex items-center">
                              <span className="mr-1">↑</span>
                              {agent.usage?.growth}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button variant="outline" size="sm" onClick={() => setActiveAgent(agentKey)}>
                              <span>Use</span>
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity panels */}
        <div>
          <h3 className="text-lg font-medium mb-4">Activity & Insights</h3>
          <Tabs defaultValue="recent" className="rounded-lg border overflow-hidden shadow-sm">
            <div className="bg-muted/30 p-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                <TabsTrigger value="popular">Popular Uses</TabsTrigger>
                <TabsTrigger value="insights">Key Insights</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="recent" className="p-4 m-0">
              <ul className="space-y-3">
                <li className="text-sm border-b pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Search className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium"><strong>XenSearch</strong> queried hypertension guidelines</div>
                    <div className="text-xs text-muted-foreground">For Dr. Johnson</div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">2 mins ago</span>
                </li>
                <li className="text-sm border-b pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium"><strong>XenScribe</strong> generated SOAP note for patient encounter</div>
                    <div className="text-xs text-muted-foreground">Patient: Smith, John</div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">15 mins ago</span>
                </li>
                <li className="text-sm border-b pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium"><strong>XenRCM</strong> created appeal packet for denied cardiac MRI</div>
                    <div className="text-xs text-muted-foreground">Payer: Blue Cross Blue Shield</div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">28 mins ago</span>
                </li>
                <li className="text-sm border-b pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100">
                    <ClipboardCheck className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium"><strong>XenCDI</strong> analyzed documentation for HCC coding</div>
                    <div className="text-xs text-muted-foreground">Found 3 opportunities</div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">45 mins ago</span>
                </li>
                <li className="text-sm flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Search className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium"><strong>XenSearch</strong> provided medication interaction data</div>
                    <div className="text-xs text-muted-foreground">For metformin and atorvastatin</div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">1 hour ago</span>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="popular" className="p-4 m-0">
              <ul className="space-y-3">
                <li className="text-sm border-b pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Search className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Finding medication interactions and contraindications</div>
                    <div className="text-xs text-muted-foreground">Most common for cardiology and internal medicine</div>
                  </div>
                  <span className="text-xs font-medium bg-purple-100 text-purple-600 px-2 py-1 rounded-full">4,250 uses</span>
                </li>
                <li className="text-sm border-b pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Generating SOAP notes from patient encounters</div>
                    <div className="text-xs text-muted-foreground">Highest usage in primary care settings</div>
                  </div>
                  <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded-full">3,820 uses</span>
                </li>
                <li className="text-sm border-b pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Automating prior authorization requests</div>
                    <div className="text-xs text-muted-foreground">Most frequent for radiology procedures</div>
                  </div>
                  <span className="text-xs font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">2,430 uses</span>
                </li>
                <li className="text-sm border-b pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100">
                    <ClipboardCheck className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Analyzing HCC coding opportunities</div>
                    <div className="text-xs text-muted-foreground">Most valuable for Medicare Advantage patients</div>
                  </div>
                  <span className="text-xs font-medium bg-amber-100 text-amber-600 px-2 py-1 rounded-full">1,950 uses</span>
                </li>
                <li className="text-sm flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Search className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Retrieving clinical practice guidelines</div>
                    <div className="text-xs text-muted-foreground">Often used during patient consultations</div>
                  </div>
                  <span className="text-xs font-medium bg-purple-100 text-purple-600 px-2 py-1 rounded-full">1,840 uses</span>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="insights" className="p-4 m-0">
              <ul className="space-y-4">
                <li className="text-sm border-b pb-3">
                  <div className="font-medium mb-1 flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    Peak Usage Times
                  </div>
                  <div className="text-muted-foreground">
                    Highest agent activity occurs between 9-11am and 1-3pm on weekdays, 
                    correlating with typical patient encounter scheduling patterns.
                  </div>
                </li>
                <li className="text-sm border-b pb-3">
                  <div className="font-medium mb-1 flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    User Retention
                  </div>
                  <div className="text-muted-foreground">
                    92% of users who try an agent return to use it again within 7 days, 
                    indicating high satisfaction and perceived value.
                  </div>
                </li>
                <li className="text-sm border-b pb-3">
                  <div className="font-medium mb-1 flex items-center">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
                    Time Savings
                  </div>
                  <div className="text-muted-foreground">
                    Users report saving an average of 45 minutes per day using AI agents, 
                    with highest time savings reported by physicians in busy clinical settings.
                  </div>
                </li>
                <li className="text-sm border-b pb-3">
                  <div className="font-medium mb-1 flex items-center">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                    Growth Trend
                  </div>
                  <div className="text-muted-foreground">
                    Overall agent usage has increased 24% month over month, with the highest 
                    growth seen in the XenSearch agent (32% increase).
                  </div>
                </li>
                <li className="text-sm">
                  <div className="font-medium mb-1 flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                    Feature Requests
                  </div>
                  <div className="text-muted-foreground">
                    Most requested: integrated lab result analysis and medical image interpretation, 
                    followed by patient risk stratification capabilities.
                  </div>
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
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <div className={cn("flex items-center space-x-2", isCollapsed && "hidden")}>
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-primary">AI Agents</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-primary hover:bg-primary/10"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="p-3">
          {/* Context Analysis Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "mb-4 w-full justify-start bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 hover:border-primary/30 transition-all",
              isCollapsed && "justify-center p-2"
            )}
            onClick={analyzeCurrentContext}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                {!isCollapsed && <span className="ml-2 text-primary">Analyzing...</span>}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 text-primary" />
                {!isCollapsed && <span className="ml-2">Analyze Context</span>}
              </>
            )}
          </Button>

          {/* Context Information Panel */}
          {!isCollapsed && (
            <div className="mb-4 rounded-lg border border-border/60 bg-gradient-to-br from-card to-background p-3 text-xs shadow-sm">
              <div className="mb-2 font-medium text-sm flex items-center justify-between">
                <span>Current Context</span>
                {isAnalyzing && (
                  <div className="flex items-center text-blue-500 text-xs">
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    <span>Analyzing</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="text-muted-foreground w-24">Context:</div>
                  <div className="font-medium flex items-center">
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-2",
                      contextData.currentContext === "clinical" ? "bg-blue-500" :
                      contextData.currentContext === "billing" ? "bg-green-500" : "bg-amber-500"
                    )}></div>
                    {contextData.currentContext === "clinical" && "Clinical Documentation"}
                    {contextData.currentContext === "billing" && "Revenue Cycle / Billing"}
                    {contextData.currentContext === "documentation" && "Chart Review"}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-muted-foreground w-24">Patient:</div>
                  <div className="font-medium">{contextData.activePatient}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-muted-foreground w-24">Page:</div>
                  <div className="font-medium">{contextData.currentPage}</div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard button with enhanced styling */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeAgent === "dashboard" ? "default" : "outline"} 
                  size="sm" 
                  className={cn(
                    "w-full justify-start relative mb-4 shadow-sm",
                    isCollapsed && "justify-center p-2",
                    activeAgent === "dashboard" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card hover:bg-muted/50"
                  )}
                  onClick={() => setActiveAgent("dashboard")}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center",
                      activeAgent === "dashboard" ? "bg-primary-foreground/20" : "bg-primary/10"
                    )}>
                      <BarChart4 className={cn(
                        "h-4 w-4", 
                        activeAgent === "dashboard" ? "text-primary-foreground" : "text-primary"
                      )} />
                    </div>
                    {!isCollapsed && <span className="ml-2">Dashboard</span>}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border shadow-md">
                <div className="space-y-2 p-1">
                  <p className="font-medium">Agent Dashboard</p>
                  <p className="text-xs text-muted-foreground">View performance metrics and analytics for all agents</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Agent List Heading */}
          {!isCollapsed && (
            <div className="mb-3 px-1 font-medium text-sm text-primary flex items-center">
              <span className="h-px flex-1 bg-border mr-2"></span>
              Agents
              <span className="h-px flex-1 bg-border ml-2"></span>
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
                          "w-full justify-start relative transition-all shadow-sm",
                          isCollapsed && "justify-center p-2",
                          activeAgent === agentKey 
                            ? "bg-primary text-primary-foreground" 
                            : isRecommended 
                              ? "bg-gradient-to-r from-primary/5 to-transparent border-primary/30" 
                              : "bg-card hover:bg-muted/50"
                        )}
                        onClick={() => setActiveAgent(agentKey)}
                      >
                        <div className="flex items-center">
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center",
                            activeAgent === agentKey 
                              ? "bg-primary-foreground/20" 
                              : key === "scribe" 
                                ? "bg-blue-100" 
                                : key === "rcm" 
                                  ? "bg-green-100" 
                                  : key === "search" 
                                    ? "bg-purple-100" 
                                    : "bg-amber-100"
                          )}>
                            {agent.icon}
                          </div>
                          {!isCollapsed && <span className="ml-2">{agent.name}</span>}
                        </div>
                        {isRecommended && activeAgent !== agentKey && (
                          <motion.span 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500" 
                          />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-card border shadow-md p-3 max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center",
                            key === "scribe" ? "bg-blue-100" : 
                            key === "rcm" ? "bg-green-100" : 
                            key === "search" ? "bg-purple-100" : "bg-amber-100"
                          )}>
                            {agent.icon}
                          </div>
                          <p className="font-semibold">{agent.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{agent.description}</p>
                        <div className="border-t border-border pt-2 mt-2">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="text-muted-foreground">Accuracy</div>
                              <div className="font-medium">{agent.metrics.accuracy}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">Time</div>
                              <div className="font-medium">{agent.metrics.completionTime}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">Success</div>
                              <div className="font-medium">{agent.metrics.success}</div>
                            </div>
                          </div>
                        </div>
                        {isRecommended && (
                          <div className="text-xs flex items-center text-green-600 mt-1">
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
            <div className="mt-8 p-3 rounded-lg bg-gradient-to-br from-muted to-muted/30 text-xs border shadow-sm">
              <h3 className="font-medium mb-3 flex items-center">
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center mr-2",
                  activeAgent === "scribe" ? "bg-blue-100" : 
                  activeAgent === "rcm" ? "bg-green-100" : 
                  activeAgent === "search" ? "bg-purple-100" : "bg-amber-100"
                )}>
                  {agentInfo[activeAgent].icon}
                </div>
                {agentInfo[activeAgent].name} Metrics
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-background rounded-md shadow-sm border">
                  <div className="text-muted-foreground">Accuracy</div>
                  <div className="font-semibold text-blue-500">{agentInfo[activeAgent].metrics.accuracy}</div>
                </div>
                <div className="text-center p-2 bg-background rounded-md shadow-sm border">
                  <div className="text-muted-foreground">Time</div>
                  <div className="font-semibold text-amber-500">{agentInfo[activeAgent].metrics.completionTime}</div>
                </div>
                <div className="text-center p-2 bg-background rounded-md shadow-sm border">
                  <div className="text-muted-foreground">Success</div>
                  <div className="font-semibold text-green-500">{agentInfo[activeAgent].metrics.success}</div>
                </div>
              </div>
              
              {/* Check if the current agent has performance data */}
              {agentInfo[activeAgent].performance && agentInfo[activeAgent].performance.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-muted-foreground mb-2">Task Trend</div>
                  <div className="h-16 flex items-end gap-1">
                    {agentInfo[activeAgent].performance?.map((data, i) => {
                      const height = data.tasks / Math.max(...(agentInfo[activeAgent].performance?.map(d => d.tasks) || [1])) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div 
                            className={cn(
                              "w-full rounded-t",
                              activeAgent === "scribe" ? "bg-blue-500" : 
                              activeAgent === "rcm" ? "bg-green-500" : 
                              activeAgent === "search" ? "bg-purple-500" : "bg-amber-500"
                            )}
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-[8px] text-muted-foreground mt-1">{data.month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
                <div className="flex items-center justify-center h-full bg-gradient-to-b from-background to-muted/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-14 w-14">
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-2 border-primary/50 border-b-transparent animate-spin animate-reverse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xl font-semibold text-primary">Loading XenScribe</div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-75"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              }>
                <AIAssistant />
              </Suspense>
            )}
            
            {activeAgent === "rcm" && (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full bg-gradient-to-b from-background to-muted/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-14 w-14">
                      <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-2 border-green-500/50 border-b-transparent animate-spin animate-reverse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xl font-semibold text-green-600">Loading XenRCM</div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse delay-75"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              }>
                <XenRCM />
              </Suspense>
            )}
            
            {activeAgent === "search" && (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full bg-gradient-to-b from-background to-muted/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-14 w-14">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-2 border-purple-500/50 border-b-transparent animate-spin animate-reverse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="h-6 w-6 text-purple-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xl font-semibold text-purple-600">Loading XenSearch</div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse delay-75"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              }>
                <XenSearch />
              </Suspense>
            )}
            
            {activeAgent === "cdi" && (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full bg-gradient-to-b from-background to-muted/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-14 w-14">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-2 border-amber-500/50 border-b-transparent animate-spin animate-reverse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ClipboardCheck className="h-6 w-6 text-amber-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xl font-semibold text-amber-600">Loading XenCDI</div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse delay-75"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse delay-150"></div>
                    </div>
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