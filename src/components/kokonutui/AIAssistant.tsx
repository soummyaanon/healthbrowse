"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Mic,
  PauseCircle,
  FileText,
  FileCheck,
  Code,
  ClipboardCheck,
  RefreshCw,
  Check,
  Wand2,
  AlertCircle,
  SendHorizonal,
  X,
  Sparkles,
  Volume2,
  Volume1,
  BookmarkPlus,
  Clock,
  DownloadCloud
} from "lucide-react";
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

// Mock transcription accuracy data
const MOCK_ACCURACY_METRICS = {
  confidence: 0.94,
  noiseLevel: 0.12,
  recognizedTerms: 42,
  medicalTermsAccuracy: 0.97,
  processingTime: "1.2s",
};

// Mock clinical key phrases
const MOCK_CLINICAL_PHRASES = [
  { text: "recurring headaches", relevance: 0.95 },
  { text: "throbbing pain", relevance: 0.88 },
  { text: "temples and behind eyes", relevance: 0.85 },
  { text: "severity 4-8/10", relevance: 0.92 },
  { text: "minimal relief with ibuprofen", relevance: 0.89 }
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
  // const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [showAccuracyMetrics, setShowAccuracyMetrics] = useState(false);
  const [keyPhrases, setKeyPhrases] = useState<typeof MOCK_CLINICAL_PHRASES>([]);
  const [saveFormats, setSaveFormats] = useState<string[]>([]);
  const [showFormatOptions, setShowFormatOptions] = useState(false);
  const [savedNotes, setSavedNotes] = useState<{id: number, title: string, timestamp: string}[]>([]);
  const [showSavedAlert, setShowSavedAlert] = useState(false);
  const [noteSaveTitle, setNoteSaveTitle] = useState("");
  const [audioPaused, setAudioPaused] = useState(false);
  // const [audioVolume, setAudioVolume] = useState(0.7);
  
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
    
    if (isRecording && !audioPaused && liveTranscriptIndex < MOCK_TRANSCRIPT_SEGMENTS.length) {
      interval = setInterval(() => {
        setTranscript(prev => [...prev, MOCK_TRANSCRIPT_SEGMENTS[liveTranscriptIndex]]);
        setLiveTranscriptIndex(prev => prev + 1);
        
        if (liveTranscriptIndex === MOCK_TRANSCRIPT_SEGMENTS.length - 1) {
          clearInterval(interval);
        }
      }, 2000);
    }
    
    return () => clearInterval(interval);
  }, [isRecording, liveTranscriptIndex, audioPaused]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    setAudioPaused(false);
    
    if (!isRecording) {
      // Start recording
      setTranscript([]);
      setLiveTranscriptIndex(0);
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenScribe: Started recording`]);
      setKeyPhrases([]);
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
        setKeyPhrases(MOCK_CLINICAL_PHRASES);
        setShowAccuracyMetrics(true);
        setAuditLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] XenScribe: Audio processed successfully`,
          `[${new Date().toLocaleTimeString()}] XenScribe: Generated SOAP note with ${transcript.length} data points`,
          `[${new Date().toLocaleTimeString()}] XenScribe: Identified ${MOCK_CLINICAL_PHRASES.length} key clinical phrases`
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
  
  const toggleAudioPaused = () => {
    setAudioPaused(!audioPaused);
    setAuditLogs(prev => [
      ...prev, 
      `[${new Date().toLocaleTimeString()}] XenScribe: ${!audioPaused ? "Paused" : "Resumed"} audio recording`
    ]);
  };
  
  const handleSaveNote = () => {
    setShowFormatOptions(true);
    setSaveFormats(["EHR Format", "Word Document", "PDF", "Plain Text"]);
  };
  
  const handleSaveFormat = (format: string) => {
    setShowFormatOptions(false);
    
    // Simulate saving the note
    const newSavedNote = {
      id: savedNotes.length + 1,
      title: noteSaveTitle || `SOAP Note - ${patientContext.name} - ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setSavedNotes(prev => [...prev, newSavedNote]);
    setShowSavedAlert(true);
    setAuditLogs(prev => [
      ...prev, 
      `[${new Date().toLocaleTimeString()}] XenScribe: Saved note as ${format}: "${newSavedNote.title}"`
    ]);
    
    setTimeout(() => setShowSavedAlert(false), 3000);
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

  const updatePatientName = (name: string) => {
    setPatientContext(prev => ({...prev, name}));
  };
  
  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight, noteContent, textareaRef]);

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
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground"
                      onClick={handleSaveNote}
                    >
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      Save
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
                  <>
                    {isRecording && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAudioPaused}
                        disabled={isProcessing}
                      >
                        {audioPaused ? (
                          <>
                            <Volume1 className="mr-2 h-4 w-4" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Volume2 className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        )}
                      </Button>
                    )}
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
              </div>
            </div>
            
            {showFormatOptions && (
              <div className="absolute z-10 right-4 top-[7rem] bg-background border rounded-md shadow-md p-3 min-w-56">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Save Note As</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowFormatOptions(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Note title"
                  value={noteSaveTitle}
                  onChange={(e) => setNoteSaveTitle(e.target.value)}
                  className="mb-2"
                />
                <div className="space-y-1">
                  {saveFormats.map((format) => (
                    <Button
                      key={format}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleSaveFormat(format)}
                    >
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      {format}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {showSavedAlert && (
              <div className="fixed z-10 bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 rounded-md p-3 flex items-start shadow-md dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
                <Check className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium">Note Saved Successfully</p>
                  <p className="text-sm text-green-700 dark:text-green-400">Your note has been saved and can be accessed in your records.</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 w-6 p-0 text-green-700 dark:text-green-400"
                  onClick={() => setShowSavedAlert(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <TabsContent value="note" className="flex-1 mt-0">
              <div className="rounded-md border bg-background">
                <Textarea
                  ref={textareaRef}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full h-full border-0 focus-visible:ring-0 rounded-none font-mono text-sm resize-none"
                />
              </div>
              
              {keyPhrases.length > 0 && (
                <div className="mt-4 border rounded-md p-3 bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="text-sm font-medium flex items-center text-blue-800 dark:text-blue-300 mb-2">
                    <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
                    Key Clinical Phrases Detected
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {keyPhrases.map((phrase, index) => (
                      <div 
                        key={index}
                        className="bg-white text-blue-800 px-2 py-1 rounded-md text-xs flex items-center border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                      >
                        {phrase.text}
                        <span className="ml-1 text-xs opacity-70">{Math.round(phrase.relevance * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="codes" className="flex-1 mt-0">
              <div className="rounded-md border bg-background p-4">
                <h3 className="font-semibold mb-2">Suggested ICD-10 Codes</h3>
                
                {showCodeAlert && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start text-sm dark:bg-blue-900/20 dark:border-blue-800">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">New code suggestions available</p>
                      <p className="text-blue-700 dark:text-blue-400">Based on the latest transcript data, we have updated code suggestions.</p>
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
                  {MOCK_HCC.map((hcc) => (
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
                {showAccuracyMetrics && (
                  <div className="mb-4 p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                    <h4 className="text-sm font-medium flex items-center text-green-800 dark:text-green-300 mb-2">
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      Transcription Quality Metrics
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground mb-1">Confidence</div>
                        <div className="font-medium">{Math.round(MOCK_ACCURACY_METRICS.confidence * 100)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Medical Terms</div>
                        <div className="font-medium">{Math.round(MOCK_ACCURACY_METRICS.medicalTermsAccuracy * 100)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Processing Time</div>
                        <div className="font-medium">{MOCK_ACCURACY_METRICS.processingTime}</div>
                      </div>
                    </div>
                  </div>
                )}
                
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
                          <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1 opacity-70" />
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
                              <div className={cn(
                                "absolute inset-0 rounded-full",
                                audioPaused ? "bg-gray-400/20" : "bg-blue-400/20 animate-ping"
                              )}></div>
                            </div>
                          </div>
                          <p>{audioPaused ? "Recording paused" : "Listening..."}</p>
                          <p className="text-sm mt-1">{audioPaused ? "Press resume to continue" : "Speak clearly to capture encounter details"}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Mic className="h-10 w-10 mb-2 mx-auto text-muted-foreground/50" />
                          <p>No transcript available</p>
                          <p className="text-sm mt-1">Click the Start Recording button to begin capturing audio</p>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => updatePatientName(patientContext.name)}
                >
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
          
          {savedNotes.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <BookmarkPlus className="mr-1 h-4 w-4" />
                Saved Notes
              </h3>
              <div className="rounded-md border bg-background overflow-hidden">
                <div className="max-h-[180px] overflow-y-auto">
                  {savedNotes.map((note) => (
                    <div key={note.id} className="p-2 border-b last:border-b-0 hover:bg-muted/20">
                      <div className="font-medium text-sm">{note.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {note.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
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