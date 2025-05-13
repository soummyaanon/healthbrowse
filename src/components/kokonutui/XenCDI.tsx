"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  ClipboardCheck, 
  Bot, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Edit,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentationIssue {
  id: number;
  type: "missing" | "unclear" | "incomplete" | "suggestion";
  category: "diagnosis" | "assessment" | "plan" | "hcc" | "medical_necessity";
  description: string;
  location: string;
  severity: "high" | "medium" | "low";
  suggestion: string;
}

const MOCK_CLINICAL_NOTE = `
SUBJECTIVE:
Patient is a 67-year-old male with history of type 2 diabetes, hypertension, and CAD s/p CABG in 2018. Presents for routine follow-up. Reports occasional chest discomfort with exertion that resolves with rest. Has been compliant with medications. No shortness of breath, orthopnea, or PND. Blood sugars reportedly running 130-160 range.

OBJECTIVE:
Vitals: BP 142/86, HR 76, RR 16, T 98.2, SpO2 97%
Weight: 192 lbs
Cardiac: RRR, no murmurs
Lungs: Clear to auscultation bilaterally
Ext: No edema
Labs: HbA1c 7.2%, LDL 110, eGFR 58

ASSESSMENT:
1. Type 2 Diabetes - Controlled. Continue current regimen.
2. Hypertension - Suboptimal control. Consider medication adjustment.
3. CAD - Stable. Will continue current medications.

PLAN:
1. Continue Metformin 1000mg BID
2. Increase Lisinopril from 10mg to 20mg daily
3. Continue Atorvastatin 40mg daily
4. Continue ASA 81mg daily
5. Follow up in 3 months
`;

const MOCK_ISSUES: DocumentationIssue[] = [
  {
    id: 1,
    type: "missing",
    category: "diagnosis",
    description: "Missing specificity for Type 2 Diabetes",
    location: "Assessment - Line 1",
    severity: "high",
    suggestion: "Specify 'Type 2 Diabetes with/without complications' and add appropriate ICD-10 code (E11.x)"
  },
  {
    id: 2,
    type: "missing",
    category: "hcc",
    description: "Missing CKD documentation",
    location: "Assessment",
    severity: "high",
    suggestion: "Add 'CKD Stage 3a (eGFR 58)' to assessment with ICD-10 code N18.3"
  },
  {
    id: 3,
    type: "unclear",
    category: "assessment",
    description: "Unclear characterization of hypertension",
    location: "Assessment - Line 2",
    severity: "medium",
    suggestion: "Specify 'Essential Hypertension' or 'Hypertension, Uncontrolled' with ICD-10 code I10"
  },
  {
    id: 4,
    type: "incomplete",
    category: "plan",
    description: "Incomplete follow-up plan for suboptimal BP control",
    location: "Plan",
    severity: "medium",
    suggestion: "Add plan for BP recheck in 2-4 weeks after medication adjustment"
  },
  {
    id: 5,
    type: "suggestion",
    category: "medical_necessity",
    description: "Strengthen medical necessity documentation",
    location: "Subjective/Assessment",
    severity: "low",
    suggestion: "Document correlation between reported symptoms and CAD diagnosis to support ongoing management"
  }
];

export default function XenCDI() {
  const [clinicalNote, setClinicalNote] = useState(MOCK_CLINICAL_NOTE);
  const [issues, setIssues] = useState<DocumentationIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState<number[]>([]);
  const [editedNote, setEditedNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);

  const handleAnalyzeNote = () => {
    setIsAnalyzing(true);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenCDI: Analyzing clinical documentation...`]);
    
    // Simulate processing delay
    setTimeout(() => {
      setIssues(MOCK_ISSUES);
      setIsAnalyzing(false);
      setAuditLogs(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] XenCDI: Analysis complete - found ${MOCK_ISSUES.length} documentation issues`,
        `[${new Date().toLocaleTimeString()}] XenCDI: Identified ${MOCK_ISSUES.filter(i => i.severity === 'high').length} high-priority issues`
      ]);
    }, 2000);
  };
  
  const toggleIssueExpansion = (issueId: number) => {
    setExpandedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };
  
  const startEdit = () => {
    setEditedNote(clinicalNote);
    setIsEditing(true);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenCDI: Started note editing`]);
  };
  
  const saveEdit = () => {
    setClinicalNote(editedNote);
    setIsEditing(false);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenCDI: Saved edited note`]);
    
    // Re-analyze after editing
    handleAnalyzeNote();
  };
  
  const applySuggestion = (suggestion: string) => {
    if (isEditing) {
      // In a real implementation, we would intelligently apply the suggestion
      // For demo, we'll just append it to the note
      setEditedNote(prev => prev + "\n\n/* ADDED PER CDI: " + suggestion + " */");
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenCDI: Applied suggestion to note`]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-muted/20">
        <h1 className="text-2xl font-bold flex items-center">
          <ClipboardCheck className="mr-2 h-6 w-6 text-purple-500" />
          XenCDI
          <span className="ml-2 text-sm font-normal text-muted-foreground">Clinical Documentation Improvement</span>
        </h1>
        <p className="text-muted-foreground">Review and enhance documentation quality for optimal coding accuracy</p>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-4 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Clinical Note</h3>
            <div className="flex space-x-2">
              {!isEditing && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={startEdit}
                    disabled={isAnalyzing}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Note
                  </Button>
                  <Button 
                    onClick={handleAnalyzeNote}
                    disabled={isAnalyzing || !clinicalNote.trim()}
                    size="sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-4 w-4" />
                        Analyze Documentation
                      </>
                    )}
                  </Button>
                </>
              )}
              
              {isEditing && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={saveEdit}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto border rounded-md">
            {isEditing ? (
              <Textarea
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                className="h-full w-full border-0 rounded-none font-mono text-sm resize-none p-4"
              />
            ) : (
              <div className="p-4 font-mono text-sm whitespace-pre-wrap">
                {clinicalNote}
              </div>
            )}
          </div>
          
          {issues.length > 0 && !isEditing && (
            <div className="mt-4">
              <h3 className="font-medium mb-2 flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                Documentation Issues ({issues.length})
              </h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {issues.map(issue => (
                  <div 
                    key={issue.id} 
                    className={cn(
                      "border rounded-md overflow-hidden transition-all",
                      issue.severity === "high" ? "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800" : 
                      issue.severity === "medium" ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800" : 
                      "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                  >
                    <div 
                      className="p-3 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleIssueExpansion(issue.id)}
                    >
                      <div className="flex items-center">
                        {issue.severity === "high" ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        ) : issue.severity === "medium" ? (
                          <Info className="h-4 w-4 text-amber-500 mr-2" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500 mr-2" />
                        )}
                        <span className="font-medium">{issue.description}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-2">{issue.location}</span>
                        {expandedIssues.includes(issue.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    {expandedIssues.includes(issue.id) && (
                      <div className="px-3 pb-3 pt-0">
                        <div className="text-sm mb-2">
                          <span className="font-medium">Suggestion: </span>
                          {issue.suggestion}
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applySuggestion(issue.suggestion)}
                            disabled={!isEditing}
                          >
                            Apply Suggestion
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-1/3 p-4 bg-muted/10 border-l">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Documentation Quality</h3>
            {issues.length > 0 ? (
              <div className="border rounded-md p-4 bg-background">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Overall Score:</span>
                  <div className="text-sm font-medium">
                    {issues.length <= 1 ? (
                      <span className="text-green-500">Excellent</span>
                    ) : issues.length <= 3 ? (
                      <span className="text-amber-500">Good</span>
                    ) : (
                      <span className="text-red-500">Needs Improvement</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Diagnosis Specificity</span>
                      <span>{issues.filter(i => i.category === "diagnosis").length > 0 ? "Issues Found" : "Complete"}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full",
                          issues.filter(i => i.category === "diagnosis").length > 0 
                            ? "bg-amber-500 w-2/3" 
                            : "bg-green-500 w-full"
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>HCC Risk Capture</span>
                      <span>{issues.filter(i => i.category === "hcc").length > 0 ? "Issues Found" : "Complete"}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full",
                          issues.filter(i => i.category === "hcc").length > 0 
                            ? "bg-red-500 w-1/3" 
                            : "bg-green-500 w-full"
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Medical Necessity</span>
                      <span>{issues.filter(i => i.category === "medical_necessity").length > 0 ? "Issues Found" : "Complete"}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full",
                          issues.filter(i => i.category === "medical_necessity").length > 0 
                            ? "bg-amber-500 w-3/4" 
                            : "bg-green-500 w-full"
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Treatment Plan</span>
                      <span>{issues.filter(i => i.category === "plan").length > 0 ? "Issues Found" : "Complete"}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full",
                          issues.filter(i => i.category === "plan").length > 0 
                            ? "bg-amber-500 w-3/4" 
                            : "bg-green-500 w-full"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-md flex items-center justify-center p-6 bg-background text-muted-foreground">
                Analyze documentation to see quality metrics
              </div>
            )}
          </div>
          
          <h3 className="font-semibold mb-2">Activity Log</h3>
          <div className="h-[calc(100%-13rem)] border rounded-md bg-background p-2 overflow-y-auto">
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