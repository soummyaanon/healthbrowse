"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Mic, PauseCircle, FileText, FileCheck, Code, ClipboardCheck, RefreshCw, ChevronDown, Check, Wand2, AlertCircle, SendHorizonal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

const MOCK_SOAP_NOTE = `## Subjective
Patient is a 45-year-old male presenting with recurring headaches for the past 2 weeks. Describes pain as "throbbing" and concentrated in the temples and behind the eyes. Pain ranges from 4-8/10 in severity. Reports that headaches typically occur in the afternoons and evenings, lasting 3-6 hours. No identified triggers, though patient suspects stress at work may be contributing. Has been self-treating with over-the-counter ibuprofen with minimal relief.

## Objective
- Vital signs:
  - BP: 138/85 mmHg
  - HR: 78 bpm
  - Temp: 98.6°F
  - SpO2: 99% on room air
- Physical examination:
  - Head/Neck: No visible abnormalities, mild tenderness to palpation of temporal regions bilaterally
  - Neurological: Cranial nerves II-XII intact, strength 5/5 in all extremities, sensory intact, normal reflexes
  - HEENT: Pupils equal, round, and reactive to light. Extraocular movements intact. No sinus tenderness.
  - Cardiovascular: Regular rate and rhythm, no murmurs
  - Respiratory: Clear to auscultation bilaterally

## Assessment
1. Tension headache, likely related to work stress and possibly poor ergonomics
2. Rule out migraine headache
3. Rule out hypertension-related headache (slightly elevated BP)

## Plan
1. Start Sumatriptan 50mg PO at onset of headache, may repeat after 2 hours if no relief, not to exceed 200mg/day
2. Recommend stress management techniques and regular breaks during work hours
3. Consider ergonomic assessment of workspace
4. Daily headache diary to track frequency, duration, and potential triggers
5. Follow up in 2 weeks to assess response to treatment
6. If symptoms worsen or change in character, return sooner for reevaluation`;

const MOCK_CODES = [
  { code: "G44.209", description: "Tension-type headache, unspecified, not intractable", primary: true },
  { code: "F41.9", description: "Anxiety disorder, unspecified", primary: false },
  { code: "G43.909", description: "Migraine, unspecified, not intractable, without status migrainosus", primary: false },
  { code: "I10", description: "Essential (primary) hypertension", primary: false },
  { code: "Z56.1", description: "Change of job", primary: false }
];

const MOCK_HCC = [
  { code: "I10", description: "Essential (primary) hypertension", risk: "Low (0.169)" },
  { code: "F41.9", description: "Anxiety disorder, unspecified", risk: "Low (0.102)" }
];

// Mock transcript data - simulates real-time speech recognition
const MOCK_TRANSCRIPT_SEGMENTS = [
  "Patient is reporting recurring headaches for the past two weeks.",
  "Pain is described as throbbing, concentrated in the temples and behind the eyes.",
  "Pain severity ranges from 4 to 8 out of 10.",
  "Headaches typically occur in the afternoons and evenings.",
  "Each episode lasts approximately 3 to 6 hours.",
  "No clear triggers identified, though patient suspects work stress may be contributing.",
  "Patient has been taking over-the-counter ibuprofen with minimal relief."
];

export default function AIAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState("note");
  const [noteContent, setNoteContent] = useState(MOCK_SOAP_NOTE);
  const [formattedNote, setFormattedNote] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [liveTranscriptIndex, setLiveTranscriptIndex] = useState(0);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(["G44.209"]);
  const [showCodeAlert, setShowCodeAlert] = useState(false);
  const [patientContext, setPatientContext] = useState({
    name: "John Doe",
    age: 45,
    gender: "Male",
    pastMedicalHistory: ["Seasonal allergies", "Mild hypertension"],
    medications: ["Loratadine 10mg daily PRN"]
  });
  const [transcriptInput, setTranscriptInput] = useState("");
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 100,
    maxHeight: 600,
  });

  useEffect(() => {
    // Format note sections for display
    const sections = noteContent.split("##").filter(s => s.trim() !== "");
    setFormattedNote(sections.map(s => "##" + s));
    
    // Log the action
    if (formattedNote.length === 0) {
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenScribe: SOAP note template loaded`]);
    }
  }, [noteContent, formattedNote.length]);
  
  // Auto-scroll to the bottom of transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);
  
  // Simulate real-time transcription during recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && liveTranscriptIndex < MOCK_TRANSCRIPT_SEGMENTS.length) {
      interval = setInterval(() => {
        setTranscript(prev => [...prev, MOCK_TRANSCRIPT_SEGMENTS[liveTranscriptIndex]]);
        setLiveTranscriptIndex(prev => prev + 1);
        
        if (liveTranscriptIndex === MOCK_TRANSCRIPT_SEGMENTS.length - 1) {
          clearInterval(interval);
        }
      }, 2000);
    }
    
    return () => clearInterval(interval);
  }, [isRecording, liveTranscriptIndex]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording
      setTranscript([]);
      setLiveTranscriptIndex(0);
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenScribe: Started recording`]);
    } else {
      // Stop recording and process
      setIsProcessing(true);
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenScribe: Stopped recording`]);
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenScribe: Processing audio...`]);
      
      // Simulate generating SOAP note from transcript
      setTimeout(() => {
        const generatedNote = generateSoapNote(transcript);
        setNoteContent(generatedNote);
        setIsProcessing(false);
        setAuditLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] XenScribe: Audio processed successfully`,
          `[${new Date().toLocaleTimeString()}] XenScribe: Generated SOAP note with ${transcript.length} data points`
        ]);
        
        // Switch to the note tab to show the generated note
        setActiveTab("note");
        
        // Simulate suggesting new codes based on the content
        setTimeout(() => {
          setAuditLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] XenScribe: Updated code suggestions based on transcript content`
          ]);
          setShowCodeAlert(true);
          setTimeout(() => setShowCodeAlert(false), 5000);
        }, 1000);
      }, 3000);
    }
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(noteContent);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenScribe: SOAP note copied to clipboard`]);
  };
  
  const handleManualTranscriptInput = () => {
    if (transcriptInput.trim()) {
      setTranscript(prev => [...prev, transcriptInput.trim()]);
      setTranscriptInput("");
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenScribe: Manual transcript entry added`]);
    }
  };
  
  const handleCodeSelection = (code: string) => {
    setSelectedCodes(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code) 
        : [...prev, code]
    );
    
    setAuditLogs(prev => [
      ...prev, 
      `[${new Date().toLocaleTimeString()}] XenScribe: ${prev.includes(code) ? "Removed" : "Added"} code ${code}`
    ]);
  };
  
  const generateSoapNote = (transcriptSegments: string[]) => {
    // In a real implementation, this would use AI to convert transcript to a properly formatted SOAP note
    // Here we'll create a simple template-based note
    if (transcriptSegments.length === 0) return MOCK_SOAP_NOTE;
    
    const subjectiveContent = transcriptSegments.join(" ");
    
    return `## Subjective
${subjectiveContent}

## Objective
- Vital signs:
  - BP: 138/85 mmHg
  - HR: 78 bpm
  - Temp: 98.6°F
  - SpO2: 99% on room air
- Physical examination:
  - Head/Neck: No visible abnormalities, mild tenderness to palpation of temporal regions bilaterally
  - Neurological: Cranial nerves II-XII intact, strength 5/5 in all extremities, sensory intact, normal reflexes
  - HEENT: Pupils equal, round, and reactive to light. Extraocular movements intact. No sinus tenderness.
  - Cardiovascular: Regular rate and rhythm, no murmurs
  - Respiratory: Clear to auscultation bilaterally

## Assessment
1. Tension headache, likely related to work stress and possibly poor ergonomics
2. Rule out migraine headache
3. Rule out hypertension-related headache (slightly elevated BP)

## Plan
1. Start Sumatriptan 50mg PO at onset of headache, may repeat after 2 hours if no relief, not to exceed 200mg/day
2. Recommend stress management techniques and regular breaks during work hours
3. Consider ergonomic assessment of workspace
4. Daily headache diary to track frequency, duration, and potential triggers
5. Follow up in 2 weeks to assess response to treatment
6. If symptoms worsen or change in character, return sooner for reevaluation`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-muted/20">
        <h1 className="text-2xl font-bold flex items-center">
          <FileText className="mr-2 h-6 w-6 text-blue-500" />
          XenScribe
          <span className="ml-2 text-sm font-normal text-muted-foreground">AI Documentation Assistant</span>
        </h1>
        <p className="text-muted-foreground">Generate comprehensive SOAP notes from patient encounters</p>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-4 border-r overflow-auto">
          <Tabs defaultValue="note" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="note" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  SOAP Note
                </TabsTrigger>
                <TabsTrigger value="codes" className="flex items-center position-relative">
                  <Code className="mr-2 h-4 w-4" />
                  Coding
                  {showCodeAlert && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-ping" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="hcc" className="flex items-center">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  HCC Risk
                </TabsTrigger>
                <TabsTrigger value="transcript" className="flex items-center">
                  <Mic className="mr-2 h-4 w-4" />
                  Transcript
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                {activeTab === "note" && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground"
                      onClick={handleCopyNote}
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      variant={isRecording ? "destructive" : "default"} 
                      size="sm"
                      onClick={toggleRecording}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : isRecording ? (
                        <>
                          <PauseCircle className="mr-2 h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </>
                )}
                
                {activeTab === "transcript" && (
                  <Button 
                    variant={isRecording ? "destructive" : "default"} 
                    size="sm"
                    onClick={toggleRecording}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isRecording ? (
                      <>
                        <PauseCircle className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            <TabsContent value="note" className="flex-1 mt-0">
              <div className="rounded-md border bg-background">
                <Textarea
                  ref={textareaRef}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full h-full border-0 focus-visible:ring-0 rounded-none font-mono text-sm resize-none"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="codes" className="flex-1 mt-0">
              <div className="rounded-md border bg-background p-4">
                <h3 className="font-semibold mb-2">Suggested ICD-10 Codes</h3>
                
                {showCodeAlert && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start text-sm dark:bg-blue-900/20 dark:border-blue-800">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">New code suggestions available</p>
                      <p className="text-blue-700 dark:text-blue-400">Based on the latest transcript data, we've updated code suggestions.</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {MOCK_CODES.map((code) => (
                    <div 
                      key={code.code} 
                      className={cn(
                        "p-3 rounded-md flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedCodes.includes(code.code) 
                          ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-900" 
                          : "bg-muted"
                      )}
                      onClick={() => handleCodeSelection(code.code)}
                    >
                      <div>
                        <div className="flex items-center">
                          <span className="font-mono">{code.code}</span>
                          {code.primary && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded dark:bg-green-800 dark:text-green-100">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{code.description}</div>
                      </div>
                      <div>
                        <Button 
                          variant={selectedCodes.includes(code.code) ? "default" : "outline"} 
                          size="sm"
                        >
                          {selectedCodes.includes(code.code) ? (
                            <Check className="h-4 w-4 text-primary-foreground" />
                          ) : (
                            "Select"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Selected Codes</h3>
                  <div className="p-3 rounded-md bg-muted">
                    {selectedCodes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCodes.map(code => (
                          <div key={code} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center">
                            {code}
                            <button 
                              className="ml-1.5 text-primary/70 hover:text-primary"
                              onClick={() => handleCodeSelection(code)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No codes selected</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hcc" className="flex-1 mt-0">
              <div className="rounded-md border bg-background p-4">
                <h3 className="font-semibold mb-2">HCC Risk Adjustment</h3>
                <div className="space-y-2">
                  {MOCK_HCC.map((hcc, i) => (
                    <div 
                      key={hcc.code} 
                      className="p-3 rounded-md bg-muted flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center font-mono">{hcc.code}</div>
                        <div className="text-sm text-muted-foreground">{hcc.description}</div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm mr-2">Risk: {hcc.risk}</span>
                        <Button variant="outline" size="sm">
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">About HCC Risk Adjustment</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Hierarchical Condition Category (HCC) coding helps ensure appropriate risk adjustment for patient care. 
                    Select relevant codes to improve documentation accuracy and care management.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transcript" className="flex-1 mt-0">
              <div className="rounded-md border bg-background p-4 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto mb-4">
                  {transcript.length > 0 ? (
                    <div className="space-y-3">
                      {transcript.map((segment, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "p-2 rounded-md",
                            i === transcript.length - 1 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-muted"
                          )}
                        >
                          <p className="text-sm">{segment}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                      <div ref={transcriptEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      {isRecording ? (
                        <div className="text-center">
                          <div className="flex justify-center mb-2">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Mic className="h-6 w-6 text-blue-500" />
                              </div>
                              <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping"></div>
                            </div>
                          </div>
                          <p>Listening...</p>
                          <p className="text-sm mt-1">Speak clearly to capture encounter details</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Mic className="h-10 w-10 mb-2 mx-auto text-muted-foreground/50" />
                          <p>No transcript available</p>
                          <p className="text-sm mt-1">Click &quot;Start Recording&quot; to begin capturing audio</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add manual transcript entry..." 
                      value={transcriptInput}
                      onChange={(e) => setTranscriptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleManualTranscriptInput();
                        }
                      }}
                      disabled={isRecording}
                    />
                    <Button 
                      onClick={handleManualTranscriptInput}
                      disabled={!transcriptInput.trim() || isRecording}
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isRecording ? "Recording in progress..." : "Add manual entries when not recording"}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="w-1/3 p-4 bg-muted/10">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Patient Context</h3>
            <div className="rounded-md border bg-background p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">{patientContext.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {patientContext.age} y/o {patientContext.gender}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Wand2 className="h-4 w-4 mr-1" />
                  Apply Context
                </Button>
              </div>
              
              <div className="text-sm mt-3">
                <div className="font-medium mb-1">Past Medical History</div>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {patientContext.pastMedicalHistory.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="text-sm mt-3">
                <div className="font-medium mb-1">Current Medications</div>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {patientContext.medications.map((med, i) => (
                    <li key={i}>{med}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <h3 className="font-semibold mb-2">Activity Log</h3>
          <div className="h-[calc(100%-12rem)] border rounded-md bg-background p-2 overflow-y-auto">
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