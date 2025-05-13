"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AgenticSimulationProps {
  messages: { sender: string; text: string }[];
}

export default function AgenticSimulation({ messages }: AgenticSimulationProps) {
  const [displayed, setDisplayed] = useState<{ sender: string; text: string; type?: "thinking" | "tool" | "message" }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [isCallingTool, setIsCallingTool] = useState(false);
  const [toolName, setToolName] = useState("");
  
  useEffect(() => {
    setDisplayed([]);
    
    const sequence = [
      // Initial message
      () => {
        setDisplayed([{
          sender: 'User',
          text: messages[0].text,
          type: "message"
        }]);
        setCurrentStep(1);
        setIsThinking(true);
        return 800;
      },
      
      // Agent thinking
      () => {
        setIsThinking(false);
        setDisplayed(prev => [...prev, {
          sender: 'ErachI',
          text: "Searching for insurance options...",
          type: "thinking"
        }]);
        setIsCallingTool(true);
        setToolName("search_database");
        return 1500;
      },
      
      // Tool calling
      () => {
        setIsCallingTool(false);
        setDisplayed(prev => [...prev, {
          sender: 'ErachI',
          text: `I found 3 insurance plans matching "${messages[0].text}".`,
          type: "message"
        }]);
        setCurrentStep(2);
        setIsThinking(true);
        return 1200;
      },
      
      // Agent thinking again
      () => {
        setIsThinking(false);
        setDisplayed(prev => [...prev, {
          sender: 'ErachI',
          text: "Analyzing plan benefits and eligibility requirements...",
          type: "thinking"
        }]);
        setIsCallingTool(true);
        setToolName("analyze_plans");
        return 1800;
      },
      
      // More advanced response
      () => {
        setIsCallingTool(false);
        setDisplayed(prev => [...prev, {
          sender: 'ErachI',
          text: "Based on your search, I recommend HealthShield Gold Plan with comprehensive coverage.",
          type: "message"
        }]);
        setCurrentStep(3);
        return 1000;
      },
      
      // User interaction simulation
      () => {
        setDisplayed(prev => [...prev, {
          sender: 'User',
          text: "How can I apply?",
          type: "message"
        }]);
        setCurrentStep(4);
        setIsThinking(true);
        return 800;
      },
      
      // Final agent response
      () => {
        setIsThinking(false);
        setDisplayed(prev => [...prev, {
          sender: 'ErachI',
          text: "I can help you fill out an application right now. Would you like me to auto-fill the form for you?",
          type: "message"
        }]);
        setIsCallingTool(true);
        setToolName("form_assistant");
        return 1000;
      },
      
      // End sequence
      () => {
        setIsCallingTool(false);
        return 0;
      }
    ];
    
    let timeoutId: NodeJS.Timeout;
    const runSequence = (index: number) => {
      if (index < sequence.length) {
        const delay = sequence[index]();
        if (delay > 0) {
          timeoutId = setTimeout(() => runSequence(index + 1), delay);
        }
      }
    };
    
    runSequence(0);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [messages]);

  return (
    <div className="mt-6 w-full max-w-md mx-auto bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="font-medium">ErachI Assistant</span>
        </div>
        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          {isCallingTool ? "Running tools" : "Active"}
        </div>
      </div>
      
      <div className="p-4 h-64 overflow-y-auto">
        {displayed.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.sender === 'User' ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2",
              msg.sender === 'User' 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : msg.type === "thinking"
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "bg-muted text-foreground rounded-tl-none"
            )}>
              {msg.type === "thinking" && (
                <div className="flex items-center space-x-2 text-xs">
                  <span className="animate-pulse">🔄</span>
                  <span>{msg.text}</span>
                </div>
              )}
              
              {msg.type === "message" && (
                <div>{msg.text}</div>
              )}
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start mb-3">
            <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2">
              <div className="flex space-x-1 items-center">
                <motion.div className="w-2 h-2 bg-gray-400 rounded-full" 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
                <motion.div className="w-2 h-2 bg-gray-400 rounded-full" 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                />
                <motion.div className="w-2 h-2 bg-gray-400 rounded-full" 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        )}
        
        {isCallingTool && (
          <div className="flex justify-start mb-3">
            <div className="bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-3 py-2 text-xs">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Calling tool: {toolName}</span>
              </div>
              <code className="bg-white p-1 rounded text-xs block">
                {toolName === "search_database" && (
                  <span className="opacity-70">search_insurance_database(query: &quot;{messages[0].text}&quot;, location: &quot;user_region&quot;, plan_type: &quot;health&quot;)</span>
                )}
                {toolName === "analyze_plans" && (
                  <span className="opacity-70">analyze_plan_options(user_profile: &quot;current&quot;, affordability_index: 0.7, coverage_priority: &quot;comprehensive&quot;)</span>
                )}
                {toolName === "form_assistant" && (
                  <span className="opacity-70">prepare_form_assistant(form_type: &quot;insurance_application&quot;, mode: &quot;auto_fill&quot;, data_source: &quot;user_profile&quot;)</span>
                )}
              </code>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-border p-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {currentStep < 7 && `Step ${currentStep}/7: ${isCallingTool ? `Running ${toolName}` : "Processing..."}`}
          {currentStep >= 7 && "Redirecting to application form..."}
        </div>
        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 