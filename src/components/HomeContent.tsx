"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from "next-themes";
import AIInput_04 from "@/components/kokonutui/ai-input-04";
import { Stethoscope, Pill, Activity, ScrollText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from '@/lib/utils';
import { Tab } from '@/components/types';
import AgenticSimulation from '@/components/AgenticSimulation';
import { Card } from '@/components/ui/card';

// Drug side effects questions
const DRUG_SIDE_EFFECT_QUESTIONS = [
  "What are the most common side effects of metformin?",
  "Are there any serious or life-threatening side effects associated with long-term use of lisinopril?",
  "What are the known side effects of apixaban, particularly in elderly patients or those with kidney impairment?"
];

// Drug interactions questions
const DRUG_INTERACTION_QUESTIONS = [
  "What are the major drug interactions with warfarin?",
  "Are there any significant interactions between metoprolol and SSRIs?",
  "Can amiodarone be safely combined with simvastatin?"
];

// Guidelines questions
const GUIDELINE_QUESTIONS = [
  "What are the latest diabetes management guidelines?",
  "What are the current hypertension treatment guidelines?",
  "What are the guidelines for anticoagulation in atrial fibrillation?"
];

// General medical questions
const MEDICAL_QUESTIONS = [
  "What's the recommended workup for unexplained weight loss?",
  "How should I interpret elevated troponin levels?",
  "What's the standard vaccination schedule for adults?"
];

// All suggestion categories
const SUGGESTION_CATEGORIES = [
  {
    title: "Drug Side Effects",
    icon: <Pill className="w-5 h-5" />,
    questions: DRUG_SIDE_EFFECT_QUESTIONS,
    color: "blue"
  },
  {
    title: "Drug Interactions",
    icon: <Activity className="w-5 h-5" />,
    questions: DRUG_INTERACTION_QUESTIONS,
    color: "purple"
  },
  {
    title: "Clinical Guidelines",
    icon: <ScrollText className="w-5 h-5" />,
    questions: GUIDELINE_QUESTIONS,
    color: "green"
  },
  {
    title: "Medical Questions",
    icon: <Stethoscope className="w-5 h-5" />,
    questions: MEDICAL_QUESTIONS,
    color: "amber"
  }
];

interface HomeContentProps {
  handleSearch: (query: string) => void;
  simulationMessages: { sender: string; text: string }[];
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  setConsultMode: React.Dispatch<React.SetStateAction<boolean>>;
  setXenScribeReady: React.Dispatch<React.SetStateAction<boolean>>;
  setAuditLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setClinicalQuestion: React.Dispatch<React.SetStateAction<string>>;
}

export default function HomeContent({ 
  handleSearch, 
  simulationMessages, 
  setActiveTab, 
  setConsultMode,
  setXenScribeReady,
  setAuditLogs,
  setClinicalQuestion
}: HomeContentProps) {
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState("");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => { 
    const t = setTimeout(() => {
      setLoading(false);
      
      // Initialize XenScribe after a delay
      setTimeout(() => {
        setXenScribeReady(true);
        setAuditLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] System: XenScribe initialized and ready`
        ]);
      }, 1000);
    }, 500); 
    
    return () => clearTimeout(t); 
  }, [setXenScribeReady, setAuditLogs]);
  
  const handleClinicalQuestionSelect = (question: string) => {
    // Set the clinical question which will directly trigger ClinicalAgentChat in BrowserShell
    setClinicalQuestion(question);
    
    // Set active tab to Home and enable consult mode
    setActiveTab("Home");
    setConsultMode(true);
    
    // No need to explicitly set consult mode as the BrowserShell will now handle the display logic
    // based on whether clinicalQuestion is set
    setAuditLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] System: Clinical Question Selected`,
      `[${new Date().toLocaleTimeString()}] User: Asked "${question}"`
    ]);
    
    // Set local query for display (optional)
    setLocalQuery(question);
  };
  
  const toggleCategory = (index: number) => {
    setExpandedCategory(expandedCategory === index ? null : index);
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
                onSubmit={(value) => {
                  // Check if this is a clinical question
                  const allQuestions = SUGGESTION_CATEGORIES.flatMap(cat => cat.questions);
                  if (allQuestions.includes(value)) {
                    handleClinicalQuestionSelect(value);
                  } else {
                    handleSearch(value);
                    setLocalQuery("");
                  }
                }}
              />
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-center">Clinical Resources</h2>
                <div className="space-y-3">
                  {SUGGESTION_CATEGORIES.map((category, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className={cn(
                        "overflow-hidden transition-all",
                        `border-${category.color}-200 dark:border-${category.color}-900`
                      )}>
                        <div 
                          className={cn(
                            "p-3 flex items-center justify-between cursor-pointer",
                            `hover:bg-${category.color}-50 dark:hover:bg-${category.color}-900/20`,
                            expandedCategory === idx && `bg-${category.color}-50 dark:bg-${category.color}-900/20`
                          )}
                          onClick={() => toggleCategory(idx)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full bg-${category.color}-100 dark:bg-${category.color}-900/30`}>
                              {category.icon}
                            </div>
                            <h3 className="font-medium">{category.title}</h3>
                          </div>
                          {expandedCategory === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                        
                        <AnimatePresence>
                          {expandedCategory === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 border-t space-y-2">
                                {category.questions.map((question, qIdx) => (
                                  <motion.div 
                                    key={qIdx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: qIdx * 0.05 }}
                                    className={cn(
                                      "p-2 rounded-md cursor-pointer text-sm",
                                      `hover:bg-${category.color}-100 dark:hover:bg-${category.color}-900/40`
                                    )}
                                    onClick={() => handleClinicalQuestionSelect(question)}
                                  >
                                    {question}
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <AgenticSimulation messages={simulationMessages} />
        )}
      </div>
    </div>
  );
} 