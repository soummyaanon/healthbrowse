"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  Copy,
  Check,
  Send,
  MessageCircle,
  Pill,
  FileText,
  Heart,
  MessageSquare,
  Filter,
  ArrowUpDown,
  CheckCircle,
  Clock3,
  HelpCircle,
  Check as CheckIcon,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

// Message types and interfaces
type MessagePriority = "high" | "routine" | "fyi";
type MessageCategory = "refill" | "lab" | "patient" | "appointment" | "other";

interface InboxMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  received: string;
  read: boolean;
  priority: MessagePriority;
  category: MessageCategory;
  patientName?: string;
  lastRefillDate?: string;
  medicationName?: string;
  labType?: string;
}

interface SuggestedResponse {
  id: string;
  messageId: string;
  text: string;
  actions?: {
    name: string;
    value: string;
  }[];
}

// Mock data
const MOCK_MESSAGES: InboxMessage[] = [
  {
    id: "msg1",
    from: "Patient Portal: John Smith",
    subject: "Refill Request: Lisinopril",
    body: "I need a refill of my Lisinopril medication. I'm almost out and have been taking it regularly. Thanks!",
    received: "2024-05-22T09:30:00",
    read: false,
    priority: "high",
    category: "refill",
    patientName: "John Smith",
    lastRefillDate: "2024-03-22",
    medicationName: "Lisinopril 10mg"
  },
  {
    id: "msg2",
    from: "Patient Portal: Maria Rodriguez",
    subject: "Lab Results Question",
    body: "I received my A1C results and it says 7.2%. What does this mean? Is this something I should be concerned about?",
    received: "2024-05-21T14:20:00",
    read: false,
    priority: "routine",
    category: "lab",
    patientName: "Maria Rodriguez",
    labType: "HbA1c"
  },
  {
    id: "msg3",
    from: "Patient Portal: Robert Johnson",
    subject: "Feeling Better Update",
    body: "Just wanted to let you know that I'm feeling much better after starting the antibiotics you prescribed. The fever is gone and the cough is improving.",
    received: "2024-05-20T16:45:00",
    read: true,
    priority: "fyi",
    category: "patient",
    patientName: "Robert Johnson"
  },
  {
    id: "msg4",
    from: "Patient Portal: Sarah Williams",
    subject: "Appointment Reschedule Request",
    body: "I need to reschedule my appointment for next Monday, May 27th. I have a work conflict that came up. Could I get an appointment later in the week instead?",
    received: "2024-05-21T11:05:00",
    read: false,
    priority: "routine",
    category: "appointment",
    patientName: "Sarah Williams"
  },
  {
    id: "msg5",
    from: "Patient Portal: David Chen",
    subject: "Refill Request: Metformin",
    body: "I would like to request a refill for my Metformin. I've been taking 500mg twice daily as prescribed. My pharmacy is Walgreens on Main Street.",
    received: "2024-05-22T08:15:00",
    read: false,
    priority: "high",
    category: "refill",
    patientName: "David Chen",
    lastRefillDate: "2024-03-15",
    medicationName: "Metformin 500mg"
  }
];

const SUGGESTED_RESPONSES: SuggestedResponse[] = [
  {
    id: "resp1",
    messageId: "msg1",
    text: "Your Lisinopril 10mg refill has been approved and sent to your pharmacy. It should be ready for pickup within 24 hours. Please continue taking as prescribed.",
    actions: [
      { name: "Approve Refill", value: "approve" },
      { name: "Request Follow-up", value: "followup" }
    ]
  },
  {
    id: "resp2",
    messageId: "msg2",
    text: "An A1C of 7.2% indicates that your blood sugar has been slightly higher than the target range (below 7.0%) over the past 3 months. This isn't an emergency, but we should discuss adjustments to your diabetes management plan at your next appointment.",
    actions: [
      { name: "Schedule Appointment", value: "schedule" },
      { name: "Send Education Materials", value: "educate" }
    ]
  },
  {
    id: "resp3",
    messageId: "msg3",
    text: "Thank you for the update. I'm glad to hear you're feeling better with the antibiotics. Please remember to complete the full course of antibiotics even if you're feeling better. Let us know if symptoms return or worsen.",
    actions: []
  },
  {
    id: "resp4",
    messageId: "msg4",
    text: "I'd be happy to reschedule your appointment. We have openings on Thursday, May 30th at 10:00 AM or 2:30 PM. Would either of these work for you?",
    actions: [
      { name: "Offer Thursday 10AM", value: "thurs10" },
      { name: "Offer Thursday 2:30PM", value: "thurs230" }
    ]
  },
  {
    id: "resp5",
    messageId: "msg5",
    text: "Your Metformin 500mg refill has been approved and sent to Walgreens on Main Street. It should be ready for pickup later today. Please continue taking as prescribed (500mg twice daily).",
    actions: [
      { name: "Approve Refill", value: "approve" },
      { name: "Request Follow-up", value: "followup" }
    ]
  }
];

export default function Whisper() {
  const [messages, setMessages] = useState<InboxMessage[]>(MOCK_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [suggestedResponse, setSuggestedResponse] = useState<string>("");
  const [customResponse, setCustomResponse] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [filter, setFilter] = useState<MessagePriority | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
  const [showCopied, setShowCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Effect to log initial state
  useEffect(() => {
    setAuditLogs([
      `[${new Date().toLocaleTimeString()}] Whisper: Inbox loaded with ${messages.length} messages`,
      `[${new Date().toLocaleTimeString()}] Whisper: Found ${messages.filter(m => m.priority === "high").length} high priority messages`
    ]);
  }, [messages.length]);

  // Handle message selection
  const handleSelectMessage = (message: InboxMessage) => {
    setSelectedMessage(message);
    setCustomResponse("");
    setSuggestedResponse("");
    setIsEditing(false);
    
    // Mark as read
    if (!message.read) {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, read: true } : m)
      );
      
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Whisper: Opened message "${message.subject}"`]);
    }
    
    // Simulate analysis delay
    setIsAnalyzing(true);
    setTimeout(() => {
      const response = SUGGESTED_RESPONSES.find(r => r.messageId === message.id);
      if (response) {
        setSuggestedResponse(response.text);
        setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Whisper: Generated response suggestion for "${message.subject}"`]);
      }
      setIsAnalyzing(false);
    }, 1000);
  };
  
  // Filter messages
  const filteredMessages = messages.filter(message => 
    filter === "all" || message.priority === filter
  );
  
  // Sort messages
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (sortBy === "priority") {
      // High, routine, fyi
      const priorityWeight = { high: 0, routine: 1, fyi: 2 };
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    } else {
      // Date (newest first)
      return new Date(b.received).getTime() - new Date(a.received).getTime();
    }
  });
  
  // Handle copy response
  const handleCopyResponse = () => {
    const textToCopy = isEditing ? customResponse : suggestedResponse;
    navigator.clipboard.writeText(textToCopy);
    setShowCopied(true);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Whisper: Copied response to clipboard`]);
    setTimeout(() => setShowCopied(false), 2000);
  };
  
  // Handle edit toggle
  const handleEditToggle = () => {
    if (!isEditing) {
      setCustomResponse(suggestedResponse);
    }
    setIsEditing(!isEditing);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Whisper: ${isEditing ? "Completed" : "Started"} editing response`]);
  };
  
  // Handle send response
  const handleSendResponse = () => {
    if (!selectedMessage) return;
    
    setIsResponding(true);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Whisper: Sending response to "${selectedMessage.subject}"`]);
    
    // Simulate send delay
    setTimeout(() => {
      // Remove message from inbox
      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
      setSelectedMessage(null);
      setSuggestedResponse("");
      setCustomResponse("");
      setIsEditing(false);
      setIsResponding(false);
      
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Whisper: Response sent successfully`]);
    }, 1500);
  };
  
  // Get icon for message category
  const getCategoryIcon = (category: MessageCategory) => {
    switch (category) {
      case "refill": return <Pill className="h-4 w-4" />;
      case "lab": return <FileText className="h-4 w-4" />;
      case "patient": return <Heart className="h-4 w-4" />;
      case "appointment": return <Clock className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };
  
  // Get formatted date
  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  // Get priority icon
  const getPriorityIcon = (priority: MessagePriority) => {
    switch (priority) {
      case "high": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "routine": return <Clock3 className="h-4 w-4 text-amber-500" />;
      case "fyi": return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-muted/20">
        <h1 className="text-2xl font-bold flex items-center">
          <MessageCircle className="mr-2 h-6 w-6 text-emerald-500" />
          Whisper
          <span className="ml-2 text-sm font-normal text-muted-foreground">Smart Inbox Assistant</span>
        </h1>
        <p className="text-muted-foreground">Efficiently manage and prioritize patient messages</p>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/5 p-4 border-r overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={() => setFilter("all")}
              >
                <Filter className="h-4 w-4 mr-1" />
                {filter === "all" ? "All Messages" : "Clear Filter"}
              </Button>
              
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => setSortBy(sortBy === "date" ? "priority" : "date")}
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Sort: {sortBy === "date" ? "Date" : "Priority"}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {sortedMessages.length} message{sortedMessages.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex space-x-2 mb-4">
            <Button
              variant={filter === "high" ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex items-center",
                filter === "high" && "bg-red-500 hover:bg-red-600"
              )}
              onClick={() => setFilter(filter === "high" ? "all" : "high")}
            >
              <AlertTriangle className={cn("h-4 w-4 mr-1", filter !== "high" && "text-red-500")} />
              Urgent
            </Button>
            
            <Button
              variant={filter === "routine" ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex items-center",
                filter === "routine" && "bg-amber-500 hover:bg-amber-600"
              )}
              onClick={() => setFilter(filter === "routine" ? "all" : "routine")}
            >
              <Clock3 className={cn("h-4 w-4 mr-1", filter !== "routine" && "text-amber-500")} />
              Routine
            </Button>
            
            <Button
              variant={filter === "fyi" ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex items-center",
                filter === "fyi" && "bg-green-500 hover:bg-green-600"
              )}
              onClick={() => setFilter(filter === "fyi" ? "all" : "fyi")}
            >
              <HelpCircle className={cn("h-4 w-4 mr-1", filter !== "fyi" && "text-green-500")} />
              FYI
            </Button>
          </div>
          
          <div className="space-y-2">
            {sortedMessages.length > 0 ? (
              sortedMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "border rounded-md p-3 cursor-pointer transition-colors",
                    selectedMessage?.id === message.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    !message.read && "border-l-4 border-l-blue-500"
                  )}
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      {getPriorityIcon(message.priority)}
                      <span className={cn(
                        "ml-2 font-medium",
                        !message.read && "font-semibold"
                      )}>
                        {message.from}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getFormattedDate(message.received)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm mb-1">
                    {getCategoryIcon(message.category)}
                    <span className="ml-1 font-medium">{message.subject}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {message.body}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No messages found</p>
                <p className="text-sm mt-1">
                  {filter !== "all" ? "Try changing your filter" : "Your inbox is empty"}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-3/5 p-4 flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              <div className="mb-4 border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold flex items-center">
                    {getPriorityIcon(selectedMessage.priority)}
                    <span className="ml-2">{selectedMessage.subject}</span>
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedMessage.received).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-4">
                  <div>
                    <span className="font-medium">From:</span> {selectedMessage.from}
                  </div>
                  
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    selectedMessage.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                    selectedMessage.priority === "routine" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  )}>
                    {selectedMessage.priority === "high" ? "Urgent" : 
                     selectedMessage.priority === "routine" ? "Routine" : "FYI"}
                  </div>
                </div>
                
                <div className="border rounded-md p-3 bg-muted/10">
                  <p className="whitespace-pre-line">{selectedMessage.body}</p>
                </div>
                
                {selectedMessage.category === "refill" && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm dark:bg-blue-900/20 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Medication Details</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-blue-700 dark:text-blue-400 font-medium">Medication:</div>
                        <div>{selectedMessage.medicationName}</div>
                      </div>
                      <div>
                        <div className="text-blue-700 dark:text-blue-400 font-medium">Last Filled:</div>
                        <div>{selectedMessage.lastRefillDate}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedMessage.category === "lab" && (
                  <div className="mt-3 bg-purple-50 border border-purple-200 rounded-md p-3 text-sm dark:bg-purple-900/20 dark:border-purple-800">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Lab Context</h4>
                    <div>
                      <div className="text-purple-700 dark:text-purple-400 font-medium">Test Type:</div>
                      <div>{selectedMessage.labType}</div>
                    </div>
                    {selectedMessage.labType === "HbA1c" && (
                      <div className="mt-2 text-purple-700 dark:text-purple-400">
                        <span className="font-medium">Normal Range:</span> &lt;5.7% (normal), 5.7-6.4% (prediabetes), ≥6.5% (diabetes)
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-auto">
                <h3 className="font-medium mb-2 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1 text-emerald-500" />
                  AI-Suggested Response
                </h3>
                
                {isAnalyzing ? (
                  <div className="border rounded-md p-4 flex items-center justify-center h-32">
                    <RefreshCw className="h-5 w-5 text-primary animate-spin mr-2" />
                    <span>Analyzing message and generating response...</span>
                  </div>
                ) : (
                  <div className="mb-4">
                    {isEditing ? (
                      <Textarea
                        value={customResponse}
                        onChange={(e) => setCustomResponse(e.target.value)}
                        className="min-h-[150px] border-primary"
                        placeholder="Edit the suggested response..."
                      />
                    ) : (
                      <div className="border rounded-md p-3 bg-muted/10 min-h-[150px]">
                        {suggestedResponse ? (
                          <p className="whitespace-pre-line">{suggestedResponse}</p>
                        ) : (
                          <div className="text-muted-foreground text-center py-8">
                            No response suggestion available
                          </div>
                        )}
                      </div>
                    )}
                    
                    {suggestedResponse && (
                      <div className="flex justify-end space-x-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditToggle}
                          disabled={isResponding}
                        >
                          {isEditing ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Done Editing
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Response
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyResponse}
                          disabled={isResponding}
                        >
                          {showCopied ? (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={handleSendResponse}
                          size="sm"
                          disabled={isResponding || !suggestedResponse}
                        >
                          {isResponding ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-1" />
                              Send Reply
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {suggestedResponse && selectedMessage && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Suggested Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_RESPONSES.find(r => r.messageId === selectedMessage.id)?.actions?.map(action => (
                        <Button
                          key={action.value}
                          variant="outline"
                          size="sm"
                          className="text-xs bg-muted/30"
                          disabled={isResponding}
                        >
                          {action.name}
                        </Button>
                      ))}
                      {(!SUGGESTED_RESPONSES.find(r => r.messageId === selectedMessage.id)?.actions?.length) && (
                        <div className="text-sm text-muted-foreground">
                          No specific actions suggested for this message
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Mail className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-xl font-medium mb-2">Select a message</h3>
              <p className="text-center max-w-md">
                Choose a message from your inbox to view its contents and get AI-suggested responses
              </p>
              
              {messages.filter(m => m.priority === "high").length > 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilter("high")}
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  View {messages.filter(m => m.priority === "high").length} Urgent Messages
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t p-4 bg-muted/10">
        <h3 className="font-semibold mb-2">Activity Log</h3>
        <div className="max-h-32 overflow-y-auto border rounded-md bg-background p-2">
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
  );
} 