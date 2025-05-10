"use client"

import React, { useState, useEffect, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Settings, User, MessageSquare, X, Shield, Bot } from "lucide-react";
import Image from 'next/image';
import AIInput_04 from "@/components/kokonutui/ai-input-04";
import { Input } from "@/components/ui/input";
import { House, Stethoscope, ShieldCheck, CalendarDays } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ClinicalConsult from "@/components/ClinicalConsult";
import { Tab } from "@/components/types";
const ClinicalAgentChat = lazy(() => import("@/components/ClinicalAgentChat"));

const tabs: Tab[] = ["Home", "Patient Records", "Appointments", "Prescriptions", "AI Assistant", "Insurance", "Consult"];

export default function BrowserShell() {
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const [showAIWidget, setShowAIWidget] = useState(false);
  const [agentWorking, setAgentWorking] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon"><ChevronLeft /></Button>
          <Button variant="ghost" size="icon"><ChevronRight /></Button>
          <Button variant="ghost" size="icon"><RefreshCw /></Button>
          <button
            className={cn(
              "px-3 py-1 rounded-md transition",
              activeTab === "Home"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted hover:bg-opacity-20"
            )}
            onClick={() => setActiveTab("Home")}
          >
            <House />
          </button>
          <button
            className={cn(
              "px-3 py-1 rounded-md transition flex items-center space-x-1",
              activeTab === "Insurance"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted hover:bg-opacity-20"
            )}
            onClick={() => setActiveTab("Insurance")}
          >
            <Shield size={16} />
            <span className="text-xs">HealthShield Insurance</span>
          </button>
        </div>
        <div className="flex flex-1 px-4">
          <Input
            type="text"
            className="flex-1 bg-muted text-foreground placeholder-muted-foreground px-3 py-1 rounded-md focus:outline-none"
            placeholder="Search or enter address"
            defaultValue={activeTab === "Insurance" ? "https://healthshield-insurance.com/apply" : ""}
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs bg-green-500 text-white px-2 py-1 rounded-full">
            <span>Secure</span>
          </div>
          <Settings className="cursor-pointer" />
          <User className="cursor-pointer" />
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto p-4 relative">
          <div key={activeTab} className="h-full animate__animated animate__fadeIn">
            {activeTab === "Home" && <HomeContent setActiveTab={setActiveTab} setAgentWorking={setAgentWorking} />}
            {activeTab === "Patient Records" && <PatientRecordsContent />}
            {activeTab === "Appointments" && <AppointmentsContent />}
            {activeTab === "Prescriptions" && <PrescriptionsContent />}
            {activeTab === "AI Assistant" && <AIAssistantContent />}
            {activeTab === "Insurance" && <InsuranceContent agentWorking={agentWorking} setAgentWorking={setAgentWorking} />}
            {activeTab === "Consult" && (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="w-full max-w-4xl mx-auto flex-1">
                  <Suspense fallback={
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="animate-pulse flex flex-col items-center gap-3">
                        <Bot size={40} className="text-primary" />
                        <div className="text-lg font-medium">Loading Clinical Consult...</div>
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  }>
                    <ClinicalAgentChat />
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        </div>
        <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} agentWorking={agentWorking} />
      </main>
      {showAIWidget ? (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-card rounded-lg shadow-lg flex flex-col">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <div className="font-semibold">AI Assistant</div>
            <Button variant="ghost" size="icon" onClick={() => setShowAIWidget(false)}>
              <X />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            <div className="flex justify-start">
              <div className="bg-muted px-3 py-1 rounded-lg">Hello, how can I help you?</div>
            </div>
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-lg">Show patient records</div>
            </div>
            <div className="flex justify-start">
              <div className="bg-muted px-3 py-1 rounded-lg">Sure, here are some records.</div>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
          onClick={() => setShowAIWidget(true)}
        >
          <MessageSquare />
        </button>
      )}
    </div>
  );
}

function HomeContent({ setActiveTab, setAgentWorking }: { 
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>,
  setAgentWorking: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [loading, setLoading] = useState(true);
  const [simulationMessages, setSimulationMessages] = useState<{ sender: string; text: string }[]>([]);

  const handleSearch = (query: string) => {
    const msgs = [
      { sender: 'User', text: query },
      { sender: 'ErachI', text: `Searching for "${query}"...` },
      { sender: 'ErachI', text: `I found some insurance options related to "${query}". Would you like to apply?` },
      { sender: 'ErachI', text: `Let me help you fill out an application form.` },
    ];
    setSimulationMessages(msgs);
    setAgentWorking(true);
    setTimeout(() => setActiveTab("Insurance"), (msgs.length + 1) * 1000);
  };

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);
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
      <Image src="/helo.jpeg" alt="Background" fill className="object-cover object-center" />
      <div className="absolute inset-0  bg-opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-4 p-4">
        <AIInput_04 onSubmit={handleSearch} />
        <div className="flex flex-wrap justify-center gap-6">
          <button className="p-4 bg-primary text-primary-foreground rounded-full hover:bg-opacity-90 transition">
            <Stethoscope size={24} />
          </button>
          <button className="p-4 bg-primary text-primary-foreground rounded-full hover:bg-opacity-90 transition">
            <ShieldCheck size={24} />
          </button>
          <button className="p-4 bg-primary text-primary-foreground rounded-full hover:bg-opacity-90 transition">
            <CalendarDays size={24} />
          </button>
        </div>
        {simulationMessages.length > 0 && <AgenticSimulation messages={simulationMessages} />}
      </div>
    </div>
  );
}

function InsuranceContent({ agentWorking, setAgentWorking }: { 
  agentWorking: boolean, 
  setAgentWorking: React.Dispatch<React.SetStateAction<boolean>> 
}) {
  const [loading, setLoading] = useState(true);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    ssn: "",
    employer: "",
    income: "",
    coverageType: "",
    coverageLevel: "",
    dependents: "",
    preExistingConditions: "",
    currentMedications: "",
    primaryPhysician: "",
    smoker: "",
    exerciseFrequency: "",
    paymentMethod: "",
  });
  const [fillingStatus, setFillingStatus] = useState<"idle" | "filling" | "completed">("idle");
  const [currentField, setCurrentField] = useState("");
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      if (agentWorking) {
        setPermissionRequested(true);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [agentWorking]);

  useEffect(() => {
    if (!loading && permissionGranted) {
      setFillingStatus("filling");
      
      // Slower delays for more visible filling
      const fields = [
        // Personal Information
        { field: "firstName", value: "John", delay: 2000 },
        { field: "lastName", value: "Doe", delay: 3000 },
        { field: "dob", value: "1985-06-15", delay: 4000 },
        { field: "address", value: "123 Health St", delay: 5000 },
        { field: "city", value: "Medical City", delay: 6000 },
        { field: "state", value: "CA", delay: 7000 },
        { field: "zip", value: "90210", delay: 8000 },
        { field: "phone", value: "(555) 123-4567", delay: 9000 },
        { field: "email", value: "john.doe@example.com", delay: 10000 },
        { field: "ssn", value: "***-**-4321", delay: 11000 },
        
        // Employment & Financial
        { field: "employer", value: "TechHealth Inc.", delay: 12500 },
        { field: "income", value: "$75,000", delay: 13500 },
        
        // Coverage Details
        { field: "coverageType", value: "Comprehensive", delay: 15000 },
        { field: "coverageLevel", value: "Gold", delay: 16500 },
        { field: "dependents", value: "2 (Spouse, Child)", delay: 18000 },
        
        // Health Information
        { field: "preExistingConditions", value: "None", delay: 20000 },
        { field: "currentMedications", value: "Multivitamin", delay: 21500 },
        { field: "primaryPhysician", value: "Dr. Sarah Johnson", delay: 23000 },
        { field: "smoker", value: "No", delay: 24500 },
        { field: "exerciseFrequency", value: "3-4 times weekly", delay: 26000 },
        
        // Payment Information
        { field: "paymentMethod", value: "Monthly Direct Debit", delay: 28000 },
      ];

      fields.forEach(({ field, value, delay }) => {
        setTimeout(() => {
          setCurrentField(field);
          setFormState(prev => ({ ...prev, [field]: value }));
          
          // Auto-advance steps with longer delays
          if (field === "email") {
            setTimeout(() => setStep(2), 1500);
          } else if (field === "dependents") {
            setTimeout(() => setStep(3), 1500);
          }
          
          if (field === "paymentMethod") {
            setTimeout(() => {
              setFillingStatus("completed");
              setAgentWorking(false);
            }, 2000);
          }
        }, delay);
      });
    }
  }, [loading, permissionGranted, setAgentWorking]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="bg-muted h-6 w-1/4 rounded"></div>
            <div className="bg-muted h-6 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const handleGrantPermission = () => {
    setPermissionGranted(true);
    setPermissionRequested(false);
  };

  const handleDenyPermission = () => {
    setPermissionRequested(false);
    setAgentWorking(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">HealthShield Insurance Application</h2>
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            Application #HD-78291
          </div>
        </div>
      </div>
      
      {permissionRequested && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center mb-4">
              <Bot size={24} className="text-blue-500 mr-2" />
              <h3 className="text-lg font-bold">AI Assistant Permission</h3>
            </div>
            <p className="mb-4">I&apos;d like to help you complete this form automatically. Would you like me to fill out the application for you?</p>
            <div className="flex space-x-3">
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700" 
                onClick={handleGrantPermission}
              >
                Yes, fill it automatically
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDenyPermission}
              >
                No, I&apos;ll do it myself
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div key={idx} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-medium",
                step > idx ? "bg-green-500 text-white" : 
                step === idx + 1 ? "bg-blue-500 text-white" : 
                "bg-gray-200 text-gray-500"
              )}>
                {idx + 1}
              </div>
              {idx < totalSteps - 1 && (
                <div className={cn(
                  "h-1 w-16 sm:w-24 md:w-32",
                  step > idx + 1 ? "bg-green-500" : "bg-gray-200"
                )}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Personal Info</span>
          <span>Coverage Details</span>
          <span>Health & Payment</span>
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
          <div className="font-medium">Step {step} of {totalSteps}: {step === 1 ? "Personal Information" : step === 2 ? "Coverage Details" : "Health & Payment"}</div>
          {fillingStatus === "filling" && (
            <div className="text-sm flex items-center">
              <span className="inline-block h-3 w-3 mr-2 bg-white rounded-full animate-ping"></span>
              AI Agent is filling your form...
            </div>
          )}
          {fillingStatus === "completed" && (
            <div className="text-sm flex items-center">
              <span className="inline-block h-2 w-2 mr-2 bg-green-300 rounded-full"></span>
              Form filled successfully
            </div>
          )}
        </div>
        
        {fillingStatus === "filling" && (
          <div className="w-full bg-gray-100">
            <div className="bg-green-500 h-1 transition-all duration-700" style={{ width: `${(Object.values(formState).filter(Boolean).length / 21) * 100}%` }}></div>
          </div>
        )}
        
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">
                    <span>First Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formState.firstName} 
                    className={cn(
                      currentField === "firstName" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "firstName" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">
                    <span>Last Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formState.lastName} 
                    className={cn(
                      currentField === "lastName" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "lastName" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Date of Birth</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={formState.dob} 
                  className={cn(
                    currentField === "dob" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "dob" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Street Address</label>
                <Input 
                  value={formState.address} 
                  className={cn(
                    currentField === "address" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "address" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={formState.city} 
                    className={cn(
                      currentField === "city" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "city" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input 
                    value={formState.state} 
                    className={cn(
                      currentField === "state" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "state" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ZIP</label>
                  <Input 
                    value={formState.zip} 
                    className={cn(
                      currentField === "zip" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "zip" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">
                    <span>Phone Number</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formState.phone} 
                    className={cn(
                      currentField === "phone" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "phone" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">
                    <span>Email</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formState.email} 
                    className={cn(
                      currentField === "email" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "email" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Social Security Number</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={formState.ssn} 
                  className={cn(
                    currentField === "ssn" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "ssn" && "animate-pulse"
                  )}
                  readOnly 
                />
                <p className="text-xs text-gray-500">Your SSN is encrypted and stored securely</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Employer</label>
                  <Input 
                    value={formState.employer} 
                    className={cn(
                      currentField === "employer" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "employer" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Annual Income</label>
                  <Input 
                    value={formState.income} 
                    className={cn(
                      currentField === "income" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "income" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Coverage Type</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={formState.coverageType} 
                  className={cn(
                    currentField === "coverageType" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "coverageType" && "animate-pulse"
                  )}
                  readOnly 
                />
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  <p className="font-medium text-blue-700">Comprehensive Coverage includes:</p>
                  <ul className="list-disc pl-5 mt-1 text-blue-600 space-y-1">
                    <li>Preventive care covered 100%</li>
                    <li>Hospitalization</li>
                    <li>Emergency services</li>
                    <li>Prescription drugs</li>
                    <li>Mental health services</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Coverage Level</label>
                <Input 
                  value={formState.coverageLevel} 
                  className={cn(
                    currentField === "coverageLevel" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "coverageLevel" && "animate-pulse"
                  )}
                  readOnly 
                />
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                  <p className="font-medium text-yellow-700">Gold Plan Details:</p>
                  <ul className="list-disc pl-5 mt-1 text-yellow-600 space-y-1">
                    <li>$1,000 annual deductible</li>
                    <li>$20 primary care visit copay</li>
                    <li>$40 specialist visit copay</li>
                    <li>$5,000 out-of-pocket maximum</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Dependents to Cover</label>
                <Input 
                  value={formState.dependents} 
                  className={cn(
                    currentField === "dependents" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "dependents" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pre-existing Conditions</label>
                <Input 
                  value={formState.preExistingConditions} 
                  className={cn(
                    currentField === "preExistingConditions" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "preExistingConditions" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Medications</label>
                <Input 
                  value={formState.currentMedications} 
                  className={cn(
                    currentField === "currentMedications" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "currentMedications" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Physician</label>
                <Input 
                  value={formState.primaryPhysician} 
                  className={cn(
                    currentField === "primaryPhysician" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "primaryPhysician" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Smoker</label>
                  <Input 
                    value={formState.smoker} 
                    className={cn(
                      currentField === "smoker" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "smoker" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Exercise Frequency</label>
                  <Input 
                    value={formState.exerciseFrequency} 
                    className={cn(
                      currentField === "exerciseFrequency" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                      currentField === "exerciseFrequency" && "animate-pulse"
                    )}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Payment Method</label>
                <Input 
                  value={formState.paymentMethod} 
                  className={cn(
                    currentField === "paymentMethod" ? "border-blue-500 bg-blue-50 transition-all duration-300" : "",
                    currentField === "paymentMethod" && "animate-pulse"
                  )}
                  readOnly 
                />
              </div>
              
              {fillingStatus === "completed" && (
                <div className="mt-6 space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Application Complete!</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Your information has been filled automatically. Please review and submit.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center mb-4">
                      <input id="terms" type="checkbox" checked className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" readOnly />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-700">I confirm all information is accurate and agree to the <a className="text-blue-600 underline">Terms of Service</a> and <a className="text-blue-600 underline">Privacy Policy</a></label>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">Submit Application</Button>
                      <Button variant="outline" className="flex-1">Save & Continue Later</Button>
                    </div>
                    
                    <p className="text-center text-xs text-gray-500 mt-4">
                      Need help? Contact our support at <span className="text-blue-600">support@healthshield.com</span> or call <span className="text-blue-600">(800) 555-1234</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientRecordsContent() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="bg-muted h-6 w-1/4 rounded"></div>
            <div className="bg-muted h-6 w-1/4 rounded"></div>
            <div className="bg-muted h-6 w-1/4 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-border">
          <th className="pb-2">Name</th>
          <th className="pb-2">Age</th>
          <th className="pb-2">Condition</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Alice Smith</td>
          <td>29</td>
          <td>Hypertension</td>
        </tr>
        <tr className="bg-card">
          <td>Bob Johnson</td>
          <td>45</td>
          <td>Diabetes</td>
        </tr>
        <tr>
          <td>Carol Williams</td>
          <td>37</td>
          <td>Asthma</td>
        </tr>
      </tbody>
    </table>
  );
}

function AppointmentsContent() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted h-8 rounded"></div>
        ))}
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      <li className="p-4 bg-card rounded-lg shadow">
        <div className="font-semibold">Dr. Adams</div>
        <div className="text-sm">2025-05-10 10:00 AM</div>
        <div className="text-xs text-muted-foreground">Confirmed</div>
      </li>
      <li className="p-4 bg-card rounded-lg shadow">
        <div className="font-semibold">Dr. Baker</div>
        <div className="text-sm">2025-05-12 02:00 PM</div>
        <div className="text-xs text-muted-foreground">Pending</div>
      </li>
    </ul>
  );
}

function PrescriptionsContent() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted h-6 rounded"></div>
        ))}
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      <li className="p-4 bg-card rounded-lg shadow">
        <div className="font-semibold">Lisinopril</div>
        <div>10mg, once daily</div>
      </li>
      <li className="p-4 bg-card rounded-lg shadow">
        <div className="font-semibold">Metformin</div>
        <div>500mg, twice daily</div>
      </li>
    </ul>
  );
}

function AIAssistantContent() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted h-8 rounded"></div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-start">
        <div className="bg-muted px-3 py-1 rounded-lg">How do I add a new patient?</div>
      </div>
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-lg">
          Click on the &apos;Patient Records&apos; tab and then &apos;Add Record&apos;.
        </div>
      </div>
    </div>
  );
}

function AgenticSimulation({ messages }: { messages: { sender: string; text: string }[] }) {
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
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></div>
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