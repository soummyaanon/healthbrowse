"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from "next-themes";
import AIInput_04 from "@/components/kokonutui/ai-input-04";
import { Bot, FileText, Sparkles, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from '@/lib/utils';
import { Tab } from '@/components/types';
import AgenticSimulation from '@/components/AgenticSimulation';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

interface HomeContentProps {
  handleSearch: (query: string) => void;
  simulationMessages: { sender: string; text: string }[];
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  setAgentWorking: React.Dispatch<React.SetStateAction<boolean>>;
  setConsultMode: React.Dispatch<React.SetStateAction<boolean>>;
  setXenScribeReady: React.Dispatch<React.SetStateAction<boolean>>;
  auditLogs: string[];
  setAuditLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function HomeContent({ 
  handleSearch, 
  simulationMessages, 
  setActiveTab, 

  setConsultMode,
  setXenScribeReady,

  setAuditLogs
}: HomeContentProps) {
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState("");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showAgentCards, setShowAgentCards] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => { 
    const t = setTimeout(() => {
      setLoading(false);
      
      // After a delay, show the agent cards
      setTimeout(() => {
        setShowAgentCards(true);
        
        // Initialize XenScribe after a delay
        setTimeout(() => {
          setXenScribeReady(true);
          setAuditLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] System: XenScribe initialized and ready`
          ]);
        }, 1000);
      }, 500);
    }, 500); 
    
    return () => clearTimeout(t); 
  }, [setXenScribeReady, setAuditLogs]);
  
  const handleActivateXenScribe = () => {
    setConsultMode(true);
    setActiveTab("Home");
    setAuditLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] System: XenScribe activated`,
      `[${new Date().toLocaleTimeString()}] XenScribe: Ready to assist with documentation`
    ]);
  };
  
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
      <Image
        src={mounted ? (theme === 'dark' ? "/helo2.jpeg" : "/helo.jpeg") : "/helo.jpeg"}
        alt="Background"
        fill
        className="absolute inset-0 object-cover object-center opacity-90"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/80"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-4">
        {simulationMessages.length === 0 ? (
          <>
            <div className="w-full max-w-2xl mx-auto md:w-3/4 sm:w-full">
              <div className="flex flex-col items-center justify-center space-y-6 mb-8">
                <div className="text-center">
                  <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 mb-2">
                    WujiHealth
                  </h1>
                  <p className="text-2xl font-semibold text-primary mb-1">Your Intelligent Healthcare Browser</p>
                </div>
              </div>
              <AIInput_04
                value={localQuery}
                onChange={(value) => setLocalQuery(value)}
                onSubmit={(value) => { handleSearch(value); setLocalQuery(""); }}
              />
              
              {showAgentCards && (
                <div className="mt-12">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      whileHover={{ y: -5 }}
                      className="h-full"
                    >
                      <Card 
                        className={cn(
                          "h-full cursor-pointer transition-all duration-300 hover:shadow-md",
                          "border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700",
                          "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        )}
                        onClick={handleActivateXenScribe}
                      >
                        <CardContent className="p-4 flex items-start h-full">
                          <div className="mr-3">
                            <FileText className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="font-semibold text-lg mb-1 flex items-center">
                              XenScribe
                              <Sparkles className="ml-1.5 h-3.5 w-3.5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardTitle>
                            <CardDescription className="text-sm">
                              AI-powered clinical documentation assistant
                            </CardDescription>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      whileHover={{ y: -5 }}
                      className="h-full"
                    >
                      <Card 
                        className={cn(
                          "h-full cursor-pointer transition-all duration-300 hover:shadow-md",
                          "border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700",
                          "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        )}
                        onClick={() => setActiveTab("Agents")}
                      >
                        <CardContent className="p-4 flex items-start h-full">
                          <div className="mr-3">
                            <Bot className="h-6 w-6 text-purple-500" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="font-semibold text-lg mb-1 flex items-center">
                              XenCDI
                              <Sparkles className="ml-1.5 h-3.5 w-3.5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Clinical documentation improvement assistant
                            </CardDescription>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="h-full"
                    >
                      <Card 
                        className={cn(
                          "h-full cursor-pointer transition-all duration-300 hover:shadow-md",
                          "border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700",
                          "hover:bg-green-50 dark:hover:bg-green-900/20"
                        )}
                        onClick={() => {
                          setConsultMode(true);
                          setActiveTab("Home");
                        }}
                      >
                        <CardContent className="p-4 flex items-start h-full">
                          <div className="mr-3">
                            <Stethoscope className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="font-semibold text-lg mb-1 flex items-center">
                              Clinical Consult
                              <Sparkles className="ml-1.5 h-3.5 w-3.5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Evidence-based clinical guidance agent
                            </CardDescription>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </div>
          </>
        ) : (
          <AgenticSimulation messages={simulationMessages} />
        )}
      </div>
    </div>
  );
} 