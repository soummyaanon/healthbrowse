"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  ClipboardCheck, 
  Bot, 
  RefreshCw, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  ShieldAlert,
  FileSearch,
  MailPlus,
  Download
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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

const MOCK_APPEAL_TEMPLATE = `
[DATE]

Blue Cross Blue Shield
Appeals Department
123 Insurance Way
Anytown, USA 12345

RE: Appeal for Claim #1234567890
Patient: Michael Thompson
Date of Service: 03/15/2024
Provider: Dr. Sarah Johnson

To Whom It May Concern:

I am writing to appeal the denial of the above-referenced claim for services provided to Michael Thompson on 03/15/2024. The claim was denied for "Medical necessity not established."

CLINICAL SUMMARY:
Patient Michael Thompson presented with ongoing symptoms of [symptoms]. The Level 3 office visit (CPT 99213) was medically necessary because:

1. The patient required detailed assessment due to worsening symptoms
2. Medication management needed adjustment based on patient response
3. Documentation supports the complexity level billed

SUPPORTING DOCUMENTATION:
- Complete medical record for date of service attached
- Current clinical guidelines supporting medical necessity (attached)
- Prior authorization confirmation number: PA123456

According to CPT guidelines, a Level 3 office visit involves an expanded problem-focused history and examination and medical decision making of low complexity, which was clearly documented in the patient's record.

Please reconsider this claim based on the attached documentation which demonstrates that all services provided were medically necessary and appropriate.

Sincerely,

Dr. Sarah Johnson
NPI: 1234567890
`;

export default function XenRCM() {
  const [activeTab, setActiveTab] = useState("denial");
  const [denialText, setDenialText] = useState(MOCK_DENIAL);
  const [appealTemplate, setAppealTemplate] = useState(MOCK_APPEAL_TEMPLATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [analyzedDenial, setAnalyzedDenial] = useState<null | {
    claimNumber: string;
    dateOfService: string;
    provider: string;
    patient: string;
    procedure: string;
    denialReason: string;
    payer: string;
    denialDate: string;
    amount: string;
  }>(null);

  const handleAnalyzeDenial = () => {
    setIsGenerating(true);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Analyzing denial data...`]);
    
    // Simulate processing
    setTimeout(() => {
      // Step 1: Document parsing
      const stepOne = () => {
        setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Step 1 - Parsing denial document structure`]);
        return new Promise(resolve => setTimeout(resolve, 800));
      };
      
      // Step 2: Data extraction
      const stepTwo = () => {
        setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Step 2 - Extracting key information fields`]);
        // Parse the denial text to extract information
        const claimMatch = denialText.match(/Claim #: (.+)/);
        const dosMatch = denialText.match(/Date of Service: (.+)/);
        const providerMatch = denialText.match(/Provider: (.+)/);
        const patientMatch = denialText.match(/Patient: (.+)/);
        const procedureMatch = denialText.match(/Procedure: (.+)/);
        const reasonMatch = denialText.match(/Denial Reason: (.+)/);
        const payerMatch = denialText.match(/Payer: (.+)/);
        const denialDateMatch = denialText.match(/Denial Date: (.+)/);
        const amountMatch = denialText.match(/Amount: (.+)/);
        
        const extractedData = {
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
        
        setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Extracted ${Object.keys(extractedData).filter(k => extractedData[k as keyof typeof extractedData]).length} data fields`]);
        return new Promise(resolve => setTimeout(() => resolve(extractedData), 800));
      };
      
      // Step 3: Denial classification
      const stepThree = (data: any) => {
        setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Step 3 - Classifying denial type and root cause`]);
        
        // Simulate reasoning about the denial type
        const denialReason = data.denialReason.toLowerCase();
        let denialType = "";
        let appealStrategy = "";
        
        if (denialReason.includes("medical necessity")) {
          denialType = "Medical Necessity";
          appealStrategy = "Provide clinical documentation that supports the medical necessity of the service";
          setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Identified as Medical Necessity denial - requires clinical documentation support`]);
        } else if (denialReason.includes("authorization") || denialReason.includes("prior auth")) {
          denialType = "Prior Authorization";
          appealStrategy = "Submit proof of authorization or explanation for emergency circumstances";
          setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Identified as Prior Authorization denial - requires authorization evidence`]);
        } else if (denialReason.includes("coding")) {
          denialType = "Coding Error";
          appealStrategy = "Correct coding and resubmit with proper documentation";
          setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Identified as Coding Error denial - requires coding correction`]);
        } else {
          denialType = "Other";
          appealStrategy = "Provide comprehensive documentation and explanation for the claim";
          setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Identified as Other denial type - requires detailed review`]);
        }
        
        return new Promise(resolve => setTimeout(() => resolve({...data, denialType, appealStrategy}), 800));
      };
      
      // Step 4: Set final state
      const stepFour = (data: any) => {
        setAuditLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] XenRCM: Step 4 - Finalizing analysis and preparing recommendation`,
          `[${new Date().toLocaleTimeString()}] XenRCM: Denial analyzed successfully`,
          `[${new Date().toLocaleTimeString()}] XenRCM: Detected denial reason: ${data.denialReason}`,
          `[${new Date().toLocaleTimeString()}] XenRCM: Recommended strategy: ${data.appealStrategy}`
        ]);
        
        setAnalyzedDenial(data);
        setIsGenerating(false);
        setActiveTab("appeal");
      };
      
      // Execute the analysis pipeline
      stepOne()
        .then(stepTwo)
        .then(stepThree)
        .then(stepFour)
        .catch(error => {
          console.error("Error analyzing denial:", error);
          setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Error analyzing denial data`]);
          setIsGenerating(false);
        });
    }, 500);
  };
  
  const handleGenerateAppeal = () => {
    if (!analyzedDenial) return;
    
    setIsGenerating(true);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Generating appeal letter...`]);
    
    // Simulate appeal generation
    setTimeout(() => {
      const today = new Date().toLocaleDateString();
      const newAppeal = appealTemplate
        .replace("[DATE]", today);
        
      setAppealTemplate(newAppeal);
      
      setAuditLogs(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] XenRCM: Appeal letter generated`,
        `[${new Date().toLocaleTimeString()}] XenRCM: Added medical necessity documentation`
      ]);
      
      setIsGenerating(false);
    }, 2000);
  };
  
  const handleDownloadAppeal = () => {
    const element = document.createElement("a");
    const file = new Blob([appealTemplate], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Appeal_Claim_${analyzedDenial?.claimNumber || "Unknown"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenRCM: Appeal letter downloaded`]);
  };

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
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-4 border-r overflow-auto">
          <Tabs defaultValue="denial" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="denial" className="flex items-center">
                  <FileSearch className="mr-2 h-4 w-4" />
                  Denial Analysis
                </TabsTrigger>
                <TabsTrigger value="appeal" className="flex items-center">
                  <MailPlus className="mr-2 h-4 w-4" />
                  Appeal Generation
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="denial" className="flex-1 mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Paste Denial Information:</h3>
                  <Textarea 
                    value={denialText}
                    onChange={(e) => setDenialText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Paste denial information here..."
                  />
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <Button variant="outline" size="sm" onClick={() => setDenialText("")}>
                      Clear
                    </Button>
                  </div>
                  <div>
                    <Button 
                      onClick={handleAnalyzeDenial}
                      disabled={isGenerating || !denialText.trim()}
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
                
                {analyzedDenial && (
                  <div className="mt-4 border rounded-md p-4 bg-muted/20">
                    <h3 className="font-medium mb-2">Analysis Results:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="font-medium">Claim Number:</div>
                        <div>{analyzedDenial.claimNumber}</div>
                      </div>
                      <div>
                        <div className="font-medium">Date of Service:</div>
                        <div>{analyzedDenial.dateOfService}</div>
                      </div>
                      <div>
                        <div className="font-medium">Patient:</div>
                        <div>{analyzedDenial.patient}</div>
                      </div>
                      <div>
                        <div className="font-medium">Provider:</div>
                        <div>{analyzedDenial.provider}</div>
                      </div>
                      <div>
                        <div className="font-medium">Procedure:</div>
                        <div>{analyzedDenial.procedure}</div>
                      </div>
                      <div>
                        <div className="font-medium">Amount:</div>
                        <div>{analyzedDenial.amount}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="font-medium">Denial Reason:</div>
                        <div className="text-red-500">{analyzedDenial.denialReason}</div>
                      </div>
                      <div>
                        <div className="font-medium">Payer:</div>
                        <div>{analyzedDenial.payer}</div>
                      </div>
                      <div>
                        <div className="font-medium">Denial Date:</div>
                        <div>{analyzedDenial.denialDate}</div>
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
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="appeal" className="flex-1 mt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Appeal Letter:</h3>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleGenerateAppeal}
                      disabled={isGenerating || !analyzedDenial}
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
                      onClick={handleDownloadAppeal}
                      disabled={!appealTemplate.trim()}
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <Textarea 
                  value={appealTemplate}
                  onChange={(e) => setAppealTemplate(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Appeal letter will appear here..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="w-1/3 p-4 bg-muted/10">
          <h3 className="font-semibold mb-2">Activity Log</h3>
          <div className="h-[calc(100%-2rem)] border rounded-md bg-background p-2 overflow-y-auto">
            {auditLogs.map((log, i) => (
              <div key={i} className="text-xs py-1 border-b last:border-0">
                {log}
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="text-xs text-muted-foreground p-2">No activity recorded yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 