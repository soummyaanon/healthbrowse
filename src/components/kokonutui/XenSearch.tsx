"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  RefreshCw, 
  Book, 

  Link as LinkIcon, 
  ArrowUpRight, 
  BookOpen,

  Bookmark,
  History,
  AlertCircle,
  ClipboardCopy
} from "lucide-react";
import { motion } from "framer-motion";


interface SearchResult {
  id: number;
  title: string;
  source: string;
  snippet: string;
  relevance: number;
  url: string;
  datePublished: string;
}

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: 1,
    title: "Diagnosis and Management of Tension-Type Headache",
    source: "American Family Physician",
    snippet: "Tension-type headache is the most common primary headache disorder, with a lifetime prevalence of up to 78% in the general population. It is characterized by bilateral, non-pulsating pain of mild to moderate intensity that is not aggravated by routine physical activity...",
    relevance: 0.92,
    url: "https://www.aafp.org/pubs/afp/issues/2022/0900/tension-headache.html",
    datePublished: "2022-09-01"
  },
  {
    id: 2,
    title: "Sumatriptan for Acute Migraine and Tension-Type Headaches",
    source: "Cochrane Database of Systematic Reviews",
    snippet: "For people with acute migraine headaches, oral sumatriptan 50 mg and 100 mg provided relief from pain and associated symptoms. The evidence for tension-type headache is more limited but suggests potential benefits...",
    relevance: 0.87,
    url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD008541.pub3/full",
    datePublished: "2021-04-15"
  },
  {
    id: 3,
    title: "Stress Management for Tension-Type Headache",
    source: "Journal of Neurology",
    snippet: "Stress is a significant trigger for tension-type headaches. This study evaluated various stress management techniques including mindfulness meditation, progressive muscle relaxation, and cognitive behavioral therapy. Results indicated a 45% reduction in headache frequency...",
    relevance: 0.79,
    url: "https://link.springer.com/article/10.1007/s00415-020-10050-y",
    datePublished: "2020-08-22"
  },
  {
    id: 4,
    title: "Comparison of First-Line Treatments for Tension-Type Headache",
    source: "The New England Journal of Medicine",
    snippet: "This randomized controlled trial compared the efficacy of NSAIDs, acetaminophen, and low-dose tricyclic antidepressants for tension-type headache prophylaxis. Results showed comparable efficacy between NSAIDs and acetaminophen for acute treatment, while amitriptyline demonstrated superior results for prevention...",
    relevance: 0.85,
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2023107",
    datePublished: "2023-01-05"
  }
];

const RECENT_SEARCHES = [
  "tension headache treatment",
  "migraine vs tension headache",
  "headache with elevated blood pressure",
  "nsaids for headache"
];

// Add clinical terms detection data
const CLINICAL_TERMS = [
  { term: "CKD Stage 3", id: "ckd-3" },
  { term: "Type 2 Diabetes", id: "t2dm" },
  { term: "Tension Headache", id: "tension-headache" },
  { term: "Hypertension", id: "htn" }
];

const CLINICAL_GUIDELINES = {
  "ckd-3": {
    title: "CKD Stage 3 Management",
    summary: "• Monitor eGFR q6mo\n• Avoid NSAIDs\n• Refer to nephrology if eGFR <30\n• Target BP <130/80 mmHg\n• ACEi/ARB preferred for BP control",
    source: "UpToDate, 2024",
    url: "https://www.uptodate.com/contents/chronic-kidney-disease"
  },
  "t2dm": {
    title: "Type 2 Diabetes Management",
    summary: "• Target HbA1c <7.0%\n• First-line: Metformin\n• Lifestyle modification essential\n• Consider SGLT2i or GLP-1 RA with established cardiovascular disease\n• Screen for complications annually",
    source: "ADA Standards of Care, 2024",
    url: "https://diabetesjournals.org/care/issue/47/Supplement_1"
  },
  "tension-headache": {
    title: "Tension Headache Management",
    summary: "• First-line: NSAIDs or acetaminophen\n• Consider stress management techniques\n• Evaluate for triggers (posture, sleep, stress)\n• Prophylaxis if >2 headaches per week\n• Physical therapy may be beneficial",
    source: "American Family Physician, 2022",
    url: "https://www.aafp.org/pubs/afp/issues/2022/0900/tension-headache.html"
  },
  "htn": {
    title: "Hypertension Management",
    summary: "• Target BP <130/80 mmHg for most adults\n• Lifestyle modifications recommended for all\n• First-line medications: thiazides, CCBs, ACEIs, ARBs\n• Consider home BP monitoring\n• Assess for secondary causes if resistant",
    source: "ACC/AHA Guidelines, 2023",
    url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000206"
  }
};

export default function Light() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [bookmarkedResults, setBookmarkedResults] = useState<number[]>([]);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [detectedTerms, setDetectedTerms] = useState<string[]>([]);
  const [activeGuideline, setActiveGuideline] = useState<string | null>(null);
  const [mockChartText] = useState("Patient is a 67-year-old male with history of Type 2 Diabetes, Hypertension, and CKD Stage 3. Blood pressure is elevated at 142/88 mmHg. Patient reports tension headache 2-3 times weekly.");
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: Searching for "${searchQuery}"`]);
    
    // Simulate search delay
    setTimeout(() => {
      setResults(MOCK_SEARCH_RESULTS);
      setIsSearching(false);
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: Found ${MOCK_SEARCH_RESULTS.length} results for "${searchQuery}"`]);
    }, 1500);
  };
  
  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: Viewed "${result.title}"`]);
  };
  
  const toggleBookmark = (resultId: number) => {
    setBookmarkedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
    
    const action = bookmarkedResults.includes(resultId) ? "removed from" : "added to";
    const result = MOCK_SEARCH_RESULTS.find(r => r.id === resultId);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: "${result?.title}" ${action} bookmarks`]);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Add function to detect clinical terms
  useEffect(() => {
    // Detect clinical terms in mock chart text
    const detected = CLINICAL_TERMS.filter(term => 
      mockChartText.toLowerCase().includes(term.term.toLowerCase())
    ).map(term => term.id);
    
    setDetectedTerms(detected);
    
    if (detected.length > 0 && !activeGuideline) {
      setActiveGuideline(detected[0]);
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: Detected clinical term "${CLINICAL_TERMS.find(t => t.id === detected[0])?.term}"`]);
      
      // Animate sidebar entry
      setTimeout(() => {
        setSidebarVisible(true);
        // Log the sidebar appearance
        setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: Opened sidebar with clinical guidelines`]);
      }, 500);
    }
  }, [mockChartText, activeGuideline]);

  const handleCopyToNotes = (guidelineId: string) => {
    const guideline = CLINICAL_GUIDELINES[guidelineId as keyof typeof CLINICAL_GUIDELINES];
    if (guideline) {
      navigator.clipboard.writeText(`${guideline.title}\n${guideline.summary}\nSource: ${guideline.source}`);
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: Copied "${guideline.title}" to clipboard`]);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  const handleToggleFullSummary = () => {
    setShowFullSummary(!showFullSummary);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: ${showFullSummary ? 'Collapsed' : 'Expanded'} full summary view`]);
  };

  const handleAddToPatientNote = () => {
    if (selectedResult) {
      // Simulate adding to patient note
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: Added "${selectedResult.title}" to patient note`]);
      // Show notification
      alert("Content added to patient note successfully!");
    }
  };

  // Function to simulate opening a PubMed link in a new tab
  const handleOpenPubMed = (guidelineId: string) => {
    const guideline = CLINICAL_GUIDELINES[guidelineId as keyof typeof CLINICAL_GUIDELINES];
    if (guideline) {
      window.open("https://pubmed.ncbi.nlm.nih.gov/?term=" + encodeURIComponent(guideline.title), "_blank");
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: Opened PubMed search for "${guideline.title}"`]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-muted/20">
        <h1 className="text-2xl font-bold flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-blue-500" />
          Light
          <span className="ml-2 text-sm font-normal text-muted-foreground">Clinical Knowledge Search</span>
        </h1>
        <p className="text-muted-foreground">Access evidence-based clinical information based on patient context</p>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-4 flex flex-col overflow-hidden">
          {/* Only show search bar at top if no results are present */}
          {results.length === 0 && !selectedResult && (
            <div className="relative mb-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for clinical information..."
                className="pr-24"
                onKeyDown={handleKeyDown}
              />
              <Button 
                className="absolute right-0 top-0 h-full rounded-l-none"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          
          {/* Animated slide-in for clinical terms section */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: sidebarVisible ? 0 : -20, opacity: sidebarVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {detectedTerms.length > 0 && (
              <div className="mb-4 border rounded-md p-3 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-sm font-medium flex items-center text-blue-800 dark:text-blue-300 mb-2">
                  <AlertCircle className="h-4 w-4 mr-1 text-blue-500" />
                  Clinical Terms Detected
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {detectedTerms.map(termId => {
                    const term = CLINICAL_TERMS.find(t => t.id === termId);
                    return (
                      <Button
                        key={termId}
                        variant={activeGuideline === termId ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setActiveGuideline(termId);
                          setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Light: Viewed guidelines for "${term?.term}"`]);
                        }}
                      >
                        {term?.term}
                      </Button>
                    );
                  })}
                </div>
                
                {activeGuideline && (
                  <div className="border rounded-md p-3 bg-white dark:bg-background">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">
                        {CLINICAL_GUIDELINES[activeGuideline as keyof typeof CLINICAL_GUIDELINES]?.title}
                      </h4>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-100">
                        {CLINICAL_GUIDELINES[activeGuideline as keyof typeof CLINICAL_GUIDELINES]?.source}
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-line mb-3">
                      {showFullSummary 
                        ? CLINICAL_GUIDELINES[activeGuideline as keyof typeof CLINICAL_GUIDELINES]?.summary + 
                          "\n\nAdditional information: This condition requires regular monitoring and medication management. Patient education about lifestyle modifications including dietary sodium restriction, exercise recommendations, and medication adherence is essential." 
                        : CLINICAL_GUIDELINES[activeGuideline as keyof typeof CLINICAL_GUIDELINES]?.summary
                      }
                    </div>
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                      <div className="flex gap-2">
                        <a 
                          href={CLINICAL_GUIDELINES[activeGuideline as keyof typeof CLINICAL_GUIDELINES]?.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center"
                        >
                          View Source
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleOpenPubMed(activeGuideline)}
                        >
                          <Search className="h-3 w-3 mr-1" />
                          PubMed
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={handleToggleFullSummary}
                        >
                          {showFullSummary ? "Collapse" : "Expand"} Summary
                        </Button>
                      </div>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleCopyToNotes(activeGuideline)}
                      >
                        <ClipboardCopy className="h-3 w-3 mr-1" />
                        Copy to Notes
                      </Button>
                    </div>
                    {showCopiedMessage && (
                      <div className="mt-2 text-xs text-green-600 bg-green-50 p-1 rounded text-center dark:bg-green-900/20 dark:text-green-400">
                        Copied to clipboard!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
          
          {searchQuery.trim() && results.length === 0 && !isSearching && (
            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
              <Book className="h-12 w-12 mb-2 opacity-20" />
              <p>No results found. Try a different search term.</p>
            </div>
          )}
          
          {isSearching ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <RefreshCw className="h-8 w-8 text-primary animate-spin mb-2" />
              <p>Searching medical knowledge bases...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto mt-4">
              {!selectedResult ? (
                <div className="space-y-4">
                  {results.length > 0 && (
                    <div className="text-sm text-muted-foreground mb-2">
                      Found {results.length} results for &quot;{searchQuery}&quot;
                    </div>
                  )}
                  
                  {results.map(result => (
                    <div 
                      key={result.id} 
                      className="border rounded-md p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-primary">{result.title}</h3>
                        <div className="flex items-center">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {Math.round(result.relevance * 100)}% match
                          </span>
                          <button 
                            className="ml-2 text-muted-foreground hover:text-primary transition-colors"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              toggleBookmark(result.id); 
                            }}
                          >
                            <Bookmark 
                              className="h-4 w-4" 
                              fill={bookmarkedResults.includes(result.id) ? "currentColor" : "none"} 
                            />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 flex items-center">
                        <span className="font-medium">{result.source}</span>
                        <span className="mx-2">•</span>
                        <span>{result.datePublished}</span>
                      </div>
                      <p className="text-sm text-foreground/80 mb-2 line-clamp-2">{result.snippet}</p>
                      <div className="flex items-center text-xs text-blue-500">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        <span className="truncate">{result.url}</span>
                      </div>
                    </div>
                  ))}
                  
                  {results.length === 0 && !isSearching && searchQuery === "" && (
                    <div className="space-y-4">
                      <div className="border-b pb-2">
                        <h3 className="text-sm font-medium flex items-center">
                          <History className="h-4 w-4 mr-1" />
                          Recent Searches
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {RECENT_SEARCHES.map((term, i) => (
                          <Button 
                            key={i} 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSearchQuery(term);
                              handleSearch();
                            }}
                            className="text-xs"
                          >
                            {term}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mb-4"
                    onClick={() => setSelectedResult(null)}
                  >
                    ← Back to results
                  </Button>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-primary">{selectedResult.title}</h2>
                      <button 
                        className="text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => toggleBookmark(selectedResult.id)}
                      >
                        <Bookmark 
                          className="h-5 w-5" 
                          fill={bookmarkedResults.includes(selectedResult.id) ? "currentColor" : "none"} 
                        />
                      </button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4 flex items-center">
                      <span className="font-medium">{selectedResult.source}</span>
                      <span className="mx-2">•</span>
                      <span>{selectedResult.datePublished}</span>
                      <span className="mx-2">•</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {Math.round(selectedResult.relevance * 100)}% relevance
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="mb-4">
                        {selectedResult.snippet}
                      </p>
                      
                      <p className="mb-4">
                        This article provides evidence-based guidance on the diagnosis and management of {selectedResult.title.toLowerCase()}. The content is based on current clinical guidelines and peer-reviewed research.
                      </p>
                      
                      <div className="bg-muted/20 p-3 rounded-md border mb-4">
                        <h4 className="font-medium mb-2">Key Clinical Points:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>First-line treatments include NSAIDs and acetaminophen for acute episodes</li>
                          <li>Consider prophylactic treatment for patients with frequent headaches ({'>'}2/week)</li>
                          <li>Non-pharmacological approaches including stress management show strong evidence</li>
                          <li>Patient education on trigger avoidance is critical to management</li>
                          <li>Red flags requiring further evaluation include sudden onset, older age of onset, and neurological symptoms</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <a 
                        href={selectedResult.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        View Original Source
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </a>
                      
                      <Button 
                        size="sm"
                        onClick={handleAddToPatientNote}
                      >
                        Add to Patient Note
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Search bar at the bottom when results are present */}
          {(results.length > 0 || selectedResult) && (
            <div className="relative mt-4 border-t pt-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for clinical information..."
                className="pr-24"
                onKeyDown={handleKeyDown}
              />
              <Button 
                className="absolute right-0 top-4 h-10 rounded-l-none"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="w-1/3 p-4 bg-muted/10 border-l">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Active Chart Context</h3>
            <div className="border rounded-md bg-background p-3 text-sm">
              <p className="whitespace-pre-line">
                {/* Highlight the clinical terms in the text */}
                {mockChartText.split(/(CKD Stage 3|Type 2 Diabetes|Hypertension|Tension Headache)/gi).map((part, i) => {
                  const isTerm = CLINICAL_TERMS.some(term => 
                    term.term.toLowerCase() === part.toLowerCase()
                  );
                  return isTerm ? (
                    <span key={i} className="bg-yellow-100 font-medium text-yellow-800 px-1 rounded dark:bg-yellow-900/30 dark:text-yellow-300">
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  );
                })}
              </p>
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