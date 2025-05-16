"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Bot, 
  RefreshCw, 
  DollarSign, 
  CheckCircle, 
  FileSearch,
  MailPlus,
  Download,
  Copy,
  Layers,
  ArrowRight,
  PlusCircle, 
  X,
  AlertCircle,
  Sparkles,
  Brain,
  BarChart,
  FileCheck,
  Upload,
  Check,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const MOCK_DENIAL = `
Claim #: 1234567890
Date of Service: 03/15/2024
Provider: Dr. Sarah Johnson
Patient: Michael Thompson
Procedure: Office Visit, Level 3 (99213)
Denial Reason: Medical necessity not established
Payer: Blue Cross Blue Shield
Denial Date: 04/05/2024
Amount: $175.00
`;

const MOCK_DENIAL_CARDIAC = `
Claim #: 2345678901
Date of Service: 03/22/2024
Provider: Dr. Robert Williams
Patient: Jennifer Davis
Procedure: Cardiac MRI (75559)
Denial Reason: Prior authorization missing
Payer: Aetna
Denial Date: 04/10/2024
Amount: $1,250.00
`;

const MOCK_CLINICAL_NOTE = `
PATIENT: Michael Thompson
DOB: 05/12/1972
DATE OF SERVICE: 03/15/2024

SUBJECTIVE:
Patient presents with ongoing hypertension, reporting occasional headaches and dizziness. Has been compliant with Lisinopril 10mg daily.

OBJECTIVE:
BP: 145/92, P: 78, R: 16, T: 98.6°F
Physical examination reveals clear lungs, regular heart rate and rhythm, no edema.

ASSESSMENT:
1. Essential hypertension (I10), poorly controlled
2. Type 2 diabetes mellitus without complications (E11.9), stable

PLAN:
1. Increase Lisinopril to 20mg daily
2. Continue current diabetes medications
3. Follow up in 3 weeks
4. Labs ordered: Comprehensive metabolic panel, lipid panel
`;

const MOCK_APPEAL_TEMPLATE = `
[DATE]

[PAYER]
Appeals Department
123 Insurance Way
Anytown, USA 12345

RE: Appeal for Claim #[CLAIM]
Patient: [PATIENT]
Date of Service: [DOS]
Provider: [PROVIDER]

To Whom It May Concern:

I am writing to appeal the denial of the above-referenced claim for services provided to [PATIENT] on [DOS]. The claim was denied for "[DENIAL_REASON]."

CLINICAL SUMMARY:
[CLINICAL_SUMMARY]

SUPPORTING DOCUMENTATION:
- Complete medical record for date of service attached
- Current clinical guidelines supporting medical necessity (attached)
[AUTHORIZATION_TEXT]

[APPEAL_STRATEGY]

Please reconsider this claim based on the attached documentation which demonstrates that all services provided were medically necessary and appropriate.

Sincerely,

[PROVIDER]
NPI: 1234567890
`;

// Define interfaces for the denial data
interface DenialData {
  claimNumber: string;
  dateOfService: string;
  provider: string;
  patient: string;
  procedure: string;
  denialReason: string;
  payer: string;
  denialDate: string;
  amount: string;
}

interface DenialAnalysis extends DenialData {
  denialType: string;
  appealStrategy: string;
}

interface TabContextData {
  index: number;
  denialText: string;
  clinicalText: string;
  appealTemplate: string;
  analyzedDenial: DenialAnalysis | null;
  auditLogs: string[];
}

interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'complete' | 'error';
}

// Custom hook for managing analysis steps
const useAnalysisSteps = () => {
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: 'parse',
      name: 'Document Parsing',
      description: 'Analyzing document structure and layout',
      icon: <FileText className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: 'extract',
      name: 'Data Extraction',
      description: 'Extracting key information fields',
      icon: <FileSearch className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: 'classify',
      name: 'Denial Classification',
      description: 'Determining denial type and root cause',
      icon: <Brain className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: 'finalize',
      name: 'Recommendation',
      description: 'Preparing appeal strategy',
      icon: <BarChart className="h-4 w-4" />,
      status: 'pending'
    }
  ]);
  const [showAnalysisSteps, setShowAnalysisSteps] = useState(false);

  // Update analysis step status
  const updateStep = useCallback((stepId: string, status: AnalysisStep['status']) => {
    setAnalysisSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  }, []);

  // Reset all steps to pending status
  const resetSteps = useCallback(() => {
    setAnalysisSteps(prev => 
      prev.map(step => ({ ...step, status: 'pending' }))
    );
    setShowAnalysisSteps(false);
  }, []);

  return {
    analysisSteps,
    showAnalysisSteps,
    setShowAnalysisSteps,
    updateStep,
    resetSteps
  };
};

// Custom hook for agent messages and thinking simulation
const useAgentSimulation = () => {
  const [agentMessages, setAgentMessages] = useState<{text: string, type: 'thinking' | 'processing' | 'complete'}[]>([]);
  const [generationStep, setGenerationStep] = useState<'thinking' | 'generating' | 'complete'>('thinking');

  // Reset agent generation state
  const resetAgent = useCallback(() => {
    setAgentMessages([]);
    setGenerationStep('thinking');
  }, []);

  // Simulate agent thinking with dots animation
  const simulateThinking = useCallback((message: string, durationMs: number = 1500): Promise<void> => {
    return new Promise((resolve) => {
      setAgentMessages(prev => [...prev, {text: message, type: 'thinking'}]);
      const timer = setTimeout(() => {
        setAgentMessages(prev => [
          ...prev.slice(0, prev.length - 1),
          {text: message, type: 'processing'}
        ]);
        resolve();
      }, durationMs);
    });
  }, []);

  // Add agent message
  const addMessage = useCallback((message: string, type: 'processing' | 'complete' = 'complete') => {
    setAgentMessages(prev => [...prev, {text: message, type}]);
  }, []);

  return {
    agentMessages,
    generationStep,
    setGenerationStep,
    resetAgent,
    simulateThinking,
    addMessage
  };
};

// Custom hook for typewriter effect
const useTypewriterEffect = () => {
  const [currentTypewriterText, setCurrentTypewriterText] = useState("");
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  // Clear existing timer on unmount
  useEffect(() => {
    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, []);

  // Start typewriter effect
  const startTypewriterEffect = useCallback((fullText: string, onComplete?: () => void) => {
    // Clear any existing interval
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }
    
    setTypewriterComplete(false);
    setCurrentTypewriterText("");
    let index = 0;
    
    typewriterRef.current = setInterval(() => {
      if (index < fullText.length) {
        setCurrentTypewriterText(prev => prev + fullText.charAt(index));
        index++;
      } else {
        if (typewriterRef.current) {
          clearInterval(typewriterRef.current);
          typewriterRef.current = null;
        }
        setTypewriterComplete(true);
        onComplete?.();
      }
    }, 10); // Speed of typing
  }, []);

  return {
    currentTypewriterText,
    typewriterComplete,
    startTypewriterEffect,
    setTypewriterComplete
  };
};

// Custom hook for tab contexts
const useTabContexts = (initialState: TabContextData[] = []) => {
  const [activeContextTab, setActiveContextTab] = useState(0);
  const [tabContexts, setTabContexts] = useState<TabContextData[]>(
    initialState.length > 0 ? initialState : [
      {
        index: 0,
        denialText: "", // Start empty
        clinicalText: "", // Start empty
        appealTemplate: "", // Start empty
        analyzedDenial: null,
        auditLogs: []
      }
    ]
  );

  // Current tab context
  const currentContext = useMemo(() => 
    tabContexts[activeContextTab], 
    [tabContexts, activeContextTab]
  );
  
  // Update current context field
  const updateCurrentContext = useCallback(<K extends keyof TabContextData>(field: K, value: TabContextData[K]) => {
    setTabContexts(prev => {
      const updated = [...prev];
      updated[activeContextTab] = {
        ...updated[activeContextTab],
        [field]: value
      };
      return updated;
    });
  }, [activeContextTab]);

  // Add log to current context
  const addLog = useCallback((message: string) => {
    setTabContexts(prev => {
      const updated = [...prev];
      updated[activeContextTab] = {
        ...updated[activeContextTab],
        auditLogs: [...updated[activeContextTab].auditLogs, `[${new Date().toLocaleTimeString()}] XenRCM: ${message}`]
      };
      return updated;
    });
  }, [activeContextTab]);

  // Add a new tab
  const addNewTab = useCallback((template: "empty" | "cardiac") => {
    const newIndex = tabContexts.length;
    setTabContexts(prev => [
      ...prev,
      {
        index: newIndex,
        denialText: template === "cardiac" ? MOCK_DENIAL_CARDIAC : "",
        clinicalText: "",
        appealTemplate: MOCK_APPEAL_TEMPLATE,
        analyzedDenial: null,
        auditLogs: []
      }
    ]);
    setActiveContextTab(newIndex);
  }, [tabContexts.length]);

  // Remove a tab
  const removeTab = useCallback((index: number) => {
    if (tabContexts.length <= 1) return; // Don't remove the last tab
    
    setTabContexts(prev => prev.filter((_, i) => i !== index));
    
    // If we removed the active tab, set active to the previous tab
    if (activeContextTab === index) {
      setActiveContextTab(Math.max(0, index - 1));
    } 
    // If we removed a tab before the active tab, adjust the active index
    else if (activeContextTab > index) {
      setActiveContextTab(activeContextTab - 1);
    }
  }, [tabContexts.length, activeContextTab]);

  // Clear current tab
  const clearCurrentTab = useCallback(() => {
    const confirmed = window.confirm("Are you sure you want to clear all data in this tab?");
    if (confirmed) {
      updateCurrentContext("denialText", "");
      updateCurrentContext("clinicalText", "");
      updateCurrentContext("appealTemplate", "");
      updateCurrentContext("analyzedDenial", null);
      updateCurrentContext("auditLogs", []);
    }
  }, [updateCurrentContext]);

  // Load demo data
  const loadDemoData = useCallback(() => {
    updateCurrentContext("denialText", MOCK_DENIAL);
    addLog("Loaded demo denial data");
  }, [updateCurrentContext, addLog]);

  // Load demo clinical data
  const loadDemoClinicalData = useCallback(() => {
    updateCurrentContext("clinicalText", MOCK_CLINICAL_NOTE);
    addLog("Loaded demo clinical data");
  }, [updateCurrentContext, addLog]);

  return {
    activeContextTab,
    setActiveContextTab,
    tabContexts,
    currentContext,
    updateCurrentContext,
    addLog,
    addNewTab,
    removeTab,
    clearCurrentTab,
    loadDemoData,
    loadDemoClinicalData
  };
};

export default function XenRCM() {
  const [activeTab, setActiveTab] = useState("denial");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClinicalDataVisible, setIsClinicalDataVisible] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [appealApplied, setAppealApplied] = useState(false);

  // Use custom hooks
  const {
    analysisSteps,
    showAnalysisSteps,
    setShowAnalysisSteps,
    updateStep: updateAnalysisStep,
    resetSteps: resetAnalysisSteps
  } = useAnalysisSteps();

  const {
    agentMessages,
    generationStep,
    setGenerationStep,
    resetAgent: resetAgentGeneration,
    simulateThinking,
    addMessage: addAgentMessage
  } = useAgentSimulation();

  const {
    currentTypewriterText,
    typewriterComplete,
    startTypewriterEffect
  } = useTypewriterEffect();

  const {
    activeContextTab,
    setActiveContextTab,
    tabContexts,
    currentContext,
    updateCurrentContext,
    addLog,
    addNewTab,
    removeTab,
    clearCurrentTab,
    loadDemoData,
    loadDemoClinicalData
  } = useTabContexts();

  // Handle analyzing denial - now using React hooks and callbacks
  const handleAnalyzeDenial = useCallback(() => {
    if (!currentContext.denialText.trim()) return;
    
    setIsGenerating(true);
    addLog("Analyzing denial data...");
    resetAnalysisSteps();
    setShowAnalysisSteps(true);
    
    // Process steps with sequential promises
    const processSteps = async () => {
      try {
        // Step 1: Document parsing
        updateAnalysisStep('parse', 'active');
        addLog("Step 1 - Parsing denial document structure");
        await new Promise(resolve => setTimeout(resolve, 800));
        updateAnalysisStep('parse', 'complete');
        
        // Step 2: Data extraction
        updateAnalysisStep('extract', 'active');
        addLog("Step 2 - Extracting key information fields");
        
        // Parse the denial text to extract information
        const denialText = currentContext.denialText;
        const claimMatch = denialText.match(/Claim #: (.+)/);
        const dosMatch = denialText.match(/Date of Service: (.+)/);
        const providerMatch = denialText.match(/Provider: (.+)/);
        const patientMatch = denialText.match(/Patient: (.+)/);
        const procedureMatch = denialText.match(/Procedure: (.+)/);
        const reasonMatch = denialText.match(/Denial Reason: (.+)/);
        const payerMatch = denialText.match(/Payer: (.+)/);
        const denialDateMatch = denialText.match(/Denial Date: (.+)/);
        const amountMatch = denialText.match(/Amount: (.+)/);
        
        const extractedData: DenialData = {
          claimNumber: claimMatch?.[1] || "",
          dateOfService: dosMatch?.[1] || "",
          provider: providerMatch?.[1] || "",
          patient: patientMatch?.[1] || "",
          procedure: procedureMatch?.[1] || "",
          denialReason: reasonMatch?.[1] || "",
          payer: payerMatch?.[1] || "",
          denialDate: denialDateMatch?.[1] || "",
          amount: amountMatch?.[1] || ""
        };
        
        addLog(`Extracted ${Object.keys(extractedData).filter(k => extractedData[k as keyof typeof extractedData]).length} data fields`);
        await new Promise(resolve => setTimeout(resolve, 800));
        updateAnalysisStep('extract', 'complete');
        
        // Step 3: Denial classification
        updateAnalysisStep('classify', 'active');
        addLog("Step 3 - Classifying denial type and root cause");
        
        // Simulate reasoning about the denial type
        const denialReason = extractedData.denialReason.toLowerCase();
        let denialType = "";
        let appealStrategy = "";
        
        if (denialReason.includes("medical necessity")) {
          denialType = "Medical Necessity";
          appealStrategy = "According to clinical guidelines, the services provided were medically necessary based on the patient's presentation and medical history. The documentation supports the medical decision-making required for this level of service.";
          addLog("Identified as Medical Necessity denial - requires clinical documentation support");
        } else if (denialReason.includes("authorization") || denialReason.includes("prior auth")) {
          denialType = "Prior Authorization";
          appealStrategy = "While it appears that prior authorization was not obtained, this service meets the criteria for retrospective review due to the urgent nature of the care required. Clinical documentation supports the medical necessity of this service.";
          addLog("Identified as Prior Authorization denial - requires authorization evidence");
        } else if (denialReason.includes("coding")) {
          denialType = "Coding Error";
          appealStrategy = "After reviewing the documentation, the CPT code assigned accurately reflects the services provided. The documentation supports the level of service billed based on CPT guidelines.";
          addLog("Identified as Coding Error denial - requires coding correction");
        } else {
          denialType = "Other";
          appealStrategy = "After detailed review of the claim and supporting documentation, we believe this service meets all requirements for coverage under the patient's plan and should be reconsidered for payment.";
          addLog("Identified as Other denial type - requires detailed review");
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
        updateAnalysisStep('classify', 'complete');
        
        // Step 4: Set final state
        updateAnalysisStep('finalize', 'active');
        addLog("Step 4 - Finalizing analysis and preparing recommendation");
        addLog("Denial analyzed successfully");
        addLog(`Detected denial reason: ${extractedData.denialReason}`);
        addLog(`Recommended strategy: ${appealStrategy}`);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        updateAnalysisStep('finalize', 'complete');
        
        const analysisResult: DenialAnalysis = {
          ...extractedData, 
          denialType, 
          appealStrategy
        };
        
        updateCurrentContext("analyzedDenial", analysisResult);
        
        // Auto-switch to clinical tab if we're a medical necessity denial
        if (denialType === "Medical Necessity") {
          setIsClinicalDataVisible(true);
        }
        
        setIsGenerating(false);
        
        // Hide analysis steps after 1 second
        setTimeout(() => {
          setShowAnalysisSteps(false);
        }, 1000);
        
      } catch (error) {
        console.error("Error analyzing denial:", error);
        addLog("Error analyzing denial data");
        analysisSteps.forEach(step => {
          if (step.status === 'active') {
            updateAnalysisStep(step.id, 'error');
          }
        });
        setIsGenerating(false);
      }
    };
    
    // Start processing
    processSteps();
    
  }, [
    currentContext, 
    addLog, 
    resetAnalysisSteps, 
    updateAnalysisStep, 
    setShowAnalysisSteps, 
    updateCurrentContext, 
    analysisSteps
  ]);

  // Handle generating appeal with React hooks
  const handleGenerateAppeal = useCallback(async () => {
    const { analyzedDenial, clinicalText } = currentContext;
    if (!analyzedDenial) return;
    
    setIsGenerating(true);
    resetAgentGeneration();
    addLog("Generating appeal letter...");
    setActiveTab("appeal");
    
    try {
      // Simulate thinking process with React state
      await simulateThinking("Analyzing denial reason and determining appeal strategy...");
      
      addAgentMessage("I've analyzed the denial reason. Now extracting clinical context from patient notes...");
      
      await simulateThinking("Extracting relevant clinical details from documentation...", 2000);
      
      const today = new Date().toLocaleDateString();
      
      // Extract clinical summary from the clinical note
      let clinicalSummary = "Patient presented with symptoms requiring medical evaluation and treatment.";
      
      if (clinicalText) {
        // Try to extract symptoms from subjective section
        const subjectiveMatch = clinicalText.match(/SUBJECTIVE:([\s\S]*?)(?=OBJECTIVE:|$)/);
        if (subjectiveMatch && subjectiveMatch[1]) {
          clinicalSummary = subjectiveMatch[1].trim();
        }
        
        // Also include assessment if available
        const assessmentMatch = clinicalText.match(/ASSESSMENT:([\s\S]*?)(?=PLAN:|$)/);
        if (assessmentMatch && assessmentMatch[1]) {
          clinicalSummary += "\n\nDiagnoses: " + assessmentMatch[1].trim();
        }
      }
      
      addAgentMessage("Clinical context extracted. Formulating appeal letter based on " + 
        analyzedDenial.denialType + " denial type.");
      
      // Create authorization text if relevant
      const authorizationText = analyzedDenial.denialType === "Prior Authorization" 
        ? "- Documentation showing medical urgency that precluded prior authorization\n- Evidence of attempt to notify insurance"
        : "";
      
      await simulateThinking("Crafting appeal letter with appropriate citations and evidence...", 2000);
      
      // Create new appeal from template with all fields filled in
      const newAppeal = MOCK_APPEAL_TEMPLATE
        .replace("[DATE]", today)
        .replace("[PAYER]", analyzedDenial.payer)
        .replace("[CLAIM]", analyzedDenial.claimNumber)
        .replace("[PATIENT]", analyzedDenial.patient)
        .replace("[DOS]", analyzedDenial.dateOfService)
        .replace("[PROVIDER]", analyzedDenial.provider)
        .replace("[DENIAL_REASON]", analyzedDenial.denialReason)
        .replace("[CLINICAL_SUMMARY]", clinicalSummary)
        .replace("[AUTHORIZATION_TEXT]", authorizationText)
        .replace("[APPEAL_STRATEGY]", analyzedDenial.appealStrategy);
      
      addAgentMessage("Appeal letter generated successfully. Here it is:", 'complete');
      
      // Start typewriter effect
      setGenerationStep('generating');
      startTypewriterEffect(newAppeal, () => {
        updateCurrentContext("appealTemplate", newAppeal);
        setIsGenerating(false);
        setGenerationStep('complete');
      });
      
      addLog("Appeal letter generated");
      addLog("Added supporting clinical documentation");
    } catch (error) {
      console.error("Error generating appeal:", error);
      addLog("Error generating appeal letter");
      setIsGenerating(false);
    }
  }, [
    currentContext, 
    resetAgentGeneration, 
    addLog, 
    setActiveTab, 
    simulateThinking, 
    addAgentMessage, 
    setGenerationStep, 
    startTypewriterEffect, 
    updateCurrentContext
  ]);

  // Other handlers as React callbacks
  const handleDownloadAppeal = useCallback(() => {
    const { appealTemplate, analyzedDenial } = currentContext;
    
    const element = document.createElement("a");
    const file = new Blob([appealTemplate], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Appeal_Claim_${analyzedDenial?.claimNumber || "Unknown"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    addLog("Appeal letter downloaded");
  }, [currentContext, addLog]);

  const handleCopyAppeal = useCallback(() => {
    navigator.clipboard.writeText(currentContext.appealTemplate);
    setHasCopied(true);
    addLog("Appeal letter copied to clipboard");
    
    // Reset the copy button after 2 seconds
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [currentContext.appealTemplate, addLog]);

  const { toast } = useToast();
  
  const handleApplyAppeal = useCallback(() => {
    setIsGenerating(true);
    addLog("Applying appeal letter...");
    
    setTimeout(() => {
      setIsGenerating(false);
      setAppealApplied(true);
      addLog("Appeal letter successfully sent to insurance company");
      
      // Show success message
      toast({
        title: "Appeal Submitted Successfully",
        description: "Your appeal for " + currentContext.analyzedDenial?.patient + " has been sent to " + currentContext.analyzedDenial?.payer,
        action: <ToastAction altText="View">View Status</ToastAction>,
      });
      
      // Show success message in UI temporarily
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }, 2000);
  }, [currentContext.analyzedDenial, addLog, toast]);

  // Update document title effect
  useEffect(() => {
    if (tabContexts.some(ctx => ctx.analyzedDenial !== null)) {
      document.title = "Pending Appeals - XenRCM";
    } else {
      document.title = "Healthcare Browser";
    }
    
    return () => {
      document.title = "Healthcare Browser";
    };
  }, [tabContexts]);

  // The JSX UI stays the same, but now uses the memoized values and callbacks
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-muted/20">
        <h1 className="text-2xl font-bold flex items-center">
          <DollarSign className="mr-2 h-6 w-6 text-green-500" />
          XenRCM
          <span className="ml-2 text-sm font-normal text-muted-foreground">Revenue Cycle Management Assistant</span>
        </h1>
        <p className="text-muted-foreground">Automate denial management and generate appeal letters</p>
      </div>
      
      {/* Context tabs for multiple denials */}
      <div className="border-b px-4 pt-1 flex items-center gap-1 bg-muted/10">
        {tabContexts.map((ctx, i) => (
          <div 
            key={i}
            className={cn(
              "relative px-3 py-2 text-sm rounded-t-lg border-b-2 cursor-pointer flex items-center gap-2 max-w-xs truncate",
              activeContextTab === i 
                ? "bg-card border-b-primary text-primary font-medium" 
                : "hover:bg-card/60 border-b-transparent"
            )}
            onClick={() => setActiveContextTab(i)}
          >
            <FileText className="h-4 w-4" />
            <span className="truncate">
              {ctx.analyzedDenial 
                ? `${ctx.analyzedDenial.patient} - ${ctx.analyzedDenial.procedure}` 
                : `Appeal ${i + 1}`}
            </span>
            {tabContexts.length > 1 && (
              <button 
                className="h-4 w-4 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(i);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {ctx.analyzedDenial && (
              <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500" />
            )}
          </div>
        ))}
        <button 
          className="p-1 text-muted-foreground hover:text-foreground"
          onClick={() => addNewTab("empty")}
        >
          <PlusCircle className="h-4 w-4" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs gap-1 h-7"
            onClick={clearCurrentTab}
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs gap-1 h-7"
            onClick={() => loadDemoData()}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Load Demo Data</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs gap-1 h-7"
            onClick={() => addNewTab("cardiac")}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>New Cardiac MRI</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-4 border-r overflow-auto">
          <Tabs defaultValue="denial" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="denial" className="flex items-center">
                  <FileSearch className="mr-2 h-4 w-4" />
                  Denial Analysis
                </TabsTrigger>
                {isClinicalDataVisible && (
                  <TabsTrigger value="clinical" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Clinical Data
                  </TabsTrigger>
                )}
                <TabsTrigger value="appeal" className="flex items-center">
                  <MailPlus className="mr-2 h-4 w-4" />
                  Appeal Generation
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="denial" className="flex-1 mt-0">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="text-sm font-medium">Paste Denial Information:</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadDemoData}
                      className="h-7 text-xs"
                    >
                      <Database className="mr-1 h-3 w-3" />
                      Load Demo Data
                    </Button>
                  </div>
                  <Textarea 
                    value={currentContext.denialText}
                    onChange={(e) => updateCurrentContext("denialText", e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Paste denial information here or load demo data..."
                  />
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateCurrentContext("denialText", "")}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsClinicalDataVisible(!isClinicalDataVisible)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {isClinicalDataVisible ? "Hide Clinical Data" : "Show Clinical Data"}
                    </Button>
                    <Button 
                      onClick={handleAnalyzeDenial}
                      disabled={isGenerating || !currentContext.denialText.trim()}
                      size="sm"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" />
                          Analyze Denial
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Analysis Steps Visualization */}
                <AnimatePresence>
                  {showAnalysisSteps && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border rounded-md p-4 bg-muted/10"
                    >
                      <h3 className="text-sm font-medium mb-3 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-primary" />
                        Analysis Process
                      </h3>
                      <div className="space-y-3">
                        {analysisSteps.map((step, index) => (
                          <div key={step.id} className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center",
                                step.status === 'pending' ? "bg-muted" :
                                step.status === 'active' ? "bg-blue-100 text-blue-600 animate-pulse" :
                                step.status === 'complete' ? "bg-green-100 text-green-600" :
                                "bg-red-100 text-red-600"
                              )}>
                                {step.status === 'active' ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : step.status === 'complete' ? (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                ) : step.status === 'error' ? (
                                  <AlertCircle className="h-3.5 w-3.5" />
                                ) : (
                                  step.icon
                                )}
                              </div>
                            </div>
                            <div className="ml-2 flex-1">
                              <div className={cn(
                                "text-sm font-medium",
                                step.status === 'active' ? "text-blue-600" :
                                step.status === 'complete' ? "text-green-600" :
                                step.status === 'error' ? "text-red-600" : ""
                              )}>
                                {step.name}
                              </div>
                              <div className="text-xs text-muted-foreground">{step.description}</div>
                            </div>
                            {step.status === 'complete' && (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {currentContext.analyzedDenial && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 border rounded-md p-4 bg-muted/20"
                  >
                    <h3 className="font-medium mb-2 flex items-center">
                      <span>Analysis Results:</span>
                      {currentContext.analyzedDenial.denialType === "Medical Necessity" && (
                        <div className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Requires clinical documentation
                        </div>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="font-medium">Claim Number:</div>
                        <div>{currentContext.analyzedDenial.claimNumber}</div>
                      </div>
                      <div>
                        <div className="font-medium">Date of Service:</div>
                        <div>{currentContext.analyzedDenial.dateOfService}</div>
                      </div>
                      <div>
                        <div className="font-medium">Patient:</div>
                        <div>{currentContext.analyzedDenial.patient}</div>
                      </div>
                      <div>
                        <div className="font-medium">Provider:</div>
                        <div>{currentContext.analyzedDenial.provider}</div>
                      </div>
                      <div>
                        <div className="font-medium">Procedure:</div>
                        <div>{currentContext.analyzedDenial.procedure}</div>
                      </div>
                      <div>
                        <div className="font-medium">Amount:</div>
                        <div>{currentContext.analyzedDenial.amount}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="font-medium">Denial Reason:</div>
                        <div className="text-red-500">{currentContext.analyzedDenial.denialReason}</div>
                      </div>
                      <div>
                        <div className="font-medium">Payer:</div>
                        <div>{currentContext.analyzedDenial.payer}</div>
                      </div>
                      <div>
                        <div className="font-medium">Denial Date:</div>
                        <div>{currentContext.analyzedDenial.denialDate}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="font-medium">Denial Type:</div>
                        <div>{currentContext.analyzedDenial.denialType}</div>
                      </div>
                      <div className="col-span-2 mt-1 border-t pt-2">
                        <div className="font-medium mb-1">Recommended Appeal Strategy:</div>
                        <div className="text-sm text-muted-foreground">
                          {currentContext.analyzedDenial.appealStrategy}
                        </div>
                      </div>
                      <div className="col-span-2 mt-2">
                        <div className="flex space-x-2">
                          <div className="text-green-500 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Appealable</span>
                          </div>
                          <div className="text-blue-500 flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>Documentation Available</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 mt-3">
                        <Button size="sm" onClick={() => setActiveTab("appeal")}>
                          Generate Appeal Letter
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="clinical" className="flex-1 mt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Patient Clinical Data:</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex text-xs text-muted-foreground items-center">
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      <span>Data from {currentContext.analyzedDenial?.dateOfService || "patient record"}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadDemoClinicalData}
                      className="h-7 text-xs"
                    >
                      <Database className="mr-1 h-3 w-3" />
                      Load Demo Data
                    </Button>
                  </div>
                </div>
                
                <Textarea 
                  value={currentContext.clinicalText}
                  onChange={(e) => updateCurrentContext("clinicalText", e.target.value)}
                  className="min-h-[350px] font-mono text-sm"
                  placeholder="Paste clinical notes here or load demo data..."
                />
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCurrentContext("clinicalText", "")}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setActiveTab("appeal")}
                  >
                    Continue to Appeal
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appeal" className="flex-1 mt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Appeal Letter:</h3>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleGenerateAppeal}
                      disabled={isGenerating || !currentContext.analyzedDenial}
                      size="sm"
                      variant="outline"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" />
                          Generate Appeal
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleCopyAppeal}
                      disabled={!currentContext.appealTemplate.trim()}
                      size="sm"
                      variant="outline"
                    >
                      {hasCopied ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleDownloadAppeal}
                      disabled={!currentContext.appealTemplate.trim()}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      onClick={handleApplyAppeal}
                      disabled={!currentContext.appealTemplate.trim() || isGenerating || appealApplied}
                      size="sm"
                    >
                      {appealApplied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Applied
                        </>
                      ) : isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Apply Appeal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Agent thinking and generation process */}
                {isGenerating && (
                  <div className="mb-4 border rounded-md bg-muted/10 p-3">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <Bot className="h-4 w-4 text-green-700" />
                      </div>
                      <div className="text-sm font-medium">Echo - RCM Assistant</div>
                    </div>
                    <div className="space-y-3 ml-10">
                      {agentMessages.map((msg, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "rounded-md p-2 text-sm",
                            msg.type === 'thinking' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                            msg.type === 'processing' ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                            "bg-muted/50"
                          )}
                        >
                          {msg.type === 'thinking' ? (
                            <div className="flex items-center">
                              <span>{msg.text}</span>
                              <span className="ml-1 inline-flex items-center">
                                <span className="animate-pulse delay-0">.</span>
                                <span className="animate-pulse delay-150">.</span>
                                <span className="animate-pulse delay-300">.</span>
                              </span>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Success message */}
                <AnimatePresence>
                  {showSuccessMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 p-3 border border-green-200 bg-green-50 rounded-md text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        <div>
                          <div className="font-medium">Appeal successfully submitted</div>
                          <div className="text-sm text-green-700 dark:text-green-400">
                            Appeal for {currentContext.analyzedDenial?.patient} has been sent to {currentContext.analyzedDenial?.payer}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="relative">
                  {isGenerating && (
                    <div className="absolute right-3 top-3 flex items-center gap-2 z-10 bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                      <span>{generationStep === 'thinking' ? 'Analyzing context' : 'AI Writing'}</span>
                    </div>
                  )}
                  <Textarea 
                    value={isGenerating ? currentTypewriterText : currentContext.appealTemplate}
                    onChange={(e) => !isGenerating && updateCurrentContext("appealTemplate", e.target.value)}
                    className={cn(
                      "min-h-[400px] font-mono text-sm transition-all duration-200",
                      isGenerating && generationStep === 'thinking' ? "opacity-50" : "opacity-100",
                      appealApplied ? "bg-green-50/30 dark:bg-green-900/10" : ""
                    )}
                    placeholder="Appeal letter will appear here after generation..."
                    readOnly={isGenerating || appealApplied}
                  />
                </div>
                
                {/* Status badge for appeal letter */}
                {typewriterComplete && currentContext.analyzedDenial && !appealApplied && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Appeal ready for submission</span>
                    </div>
                  </motion.div>
                )}
                
                {/* Status badge for applied appeal */}
                {appealApplied && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="inline-flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Appeal submitted - Tracking ID: AP-{Math.floor(Math.random()*1000000)}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="w-1/3 p-4 bg-muted/10">
          <h3 className="font-semibold mb-2">Activity Log</h3>
          <div className="h-[calc(100%-2rem)] border rounded-md bg-background p-2 overflow-y-auto">
            {currentContext.auditLogs.length > 0 ? (
              currentContext.auditLogs.map((log, i) => (
                <div key={i} className="text-xs py-1 border-b last:border-0">
                  {log}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2 opacity-30" />
                <div className="text-sm">No activity recorded yet</div>
                <div className="text-xs mt-1">Load demo data or begin analyzing denials to see activity here</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 