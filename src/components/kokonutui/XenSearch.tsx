"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  RefreshCw, 
  Book, 
  FileText, 
  Link as LinkIcon, 
  ArrowUpRight, 
  BookOpen,
  PlusCircle,
  MinusCircle,
  Bookmark,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function XenSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [bookmarkedResults, setBookmarkedResults] = useState<number[]>([]);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenSearch: Searching for "${searchQuery}"`]);
    
    // Simulate search delay
    setTimeout(() => {
      setResults(MOCK_SEARCH_RESULTS);
      setIsSearching(false);
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenSearch: Found ${MOCK_SEARCH_RESULTS.length} results for "${searchQuery}"`]);
    }, 1500);
  };
  
  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenSearch: Viewed "${result.title}"`]);
  };
  
  const toggleBookmark = (resultId: number) => {
    setBookmarkedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
    
    const action = bookmarkedResults.includes(resultId) ? "removed from" : "added to";
    const result = MOCK_SEARCH_RESULTS.find(r => r.id === resultId);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] XenSearch: "${result?.title}" ${action} bookmarks`]);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-muted/20">
        <h1 className="text-2xl font-bold flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-blue-500" />
          XenSearch
          <span className="ml-2 text-sm font-normal text-muted-foreground">Clinical Knowledge Search</span>
        </h1>
        <p className="text-muted-foreground">Access evidence-based clinical information based on patient context</p>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-4 flex flex-col overflow-hidden">
          <div className="relative">
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
                      Found {results.length} results for "{searchQuery}"
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
                      
                      <Button size="sm">
                        Add to Patient Note
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="w-1/3 p-4 bg-muted/10 border-l">
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