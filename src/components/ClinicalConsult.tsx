import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, BookOpen, Link2 } from "lucide-react";

// Define categories and mock Q&A data
const CATEGORIES = [
  "Ask for Evidence",
  "Ask in a Language Other Than English",
  "Construct a Workup",
  "Ask About Labs to Consider",
  "Research a Topic",
  "Ask about Treatment Alternatives",
  "Ask about Treatment Options",
  "Ask about Drug Interactions",
  "Write an Exam Question",
  "Ask about Drug Side Effects",
  "Ask for a Quick Fact",
  "Ask a Tough Question",
  "Ask about Drug Dosing",
  "Ask about Guidelines",
  "Prepare For MOC Exams",
  "Ask about Primary Evidence",
  "Ask a Pop-Science Question"
];

// Hardcoded Q&A map (expandable)
const QA_MAP: Record<string, { answer: string; links: { title: string; url: string }[] }> = {
  "Ask for Evidence": {
    answer:
      "The latest evidence for hypertension management recommends lifestyle modification as first-line therapy, followed by pharmacologic intervention if blood pressure remains above target. See the referenced guidelines and studies for details.",
    links: [
      { title: "2023 ACC/AHA Hypertension Guideline", url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065" },
      { title: "PubMed: Hypertension Evidence", url: "https://pubmed.ncbi.nlm.nih.gov/?term=hypertension+management+evidence" },
      { title: "UpToDate: Hypertension in Adults", url: "https://www.uptodate.com/contents/overview-of-hypertension-in-adults" },
      { title: "CDC: High Blood Pressure", url: "https://www.cdc.gov/bloodpressure/index.htm" },
      { title: "NICE: Hypertension in Adults", url: "https://www.nice.org.uk/guidance/ng136" }
    ]
  },
  "Ask about Drug Interactions": {
    answer:
      "Simvastatin and clarithromycin should not be co-administered due to risk of severe myopathy. Always check for CYP3A4 interactions. See the following resources for more details.",
    links: [
      { title: "FDA Drug Interaction Table", url: "https://www.fda.gov/drugs/drug-interactions-labeling/drug-development-and-drug-interactions-table-substrates-inhibitors-and-inducers" },
      { title: "Lexicomp Drug Interactions", url: "https://www.wolterskluwer.com/en/solutions/lexicomp/drug-interactions" },
      { title: "UpToDate: Drug Interactions", url: "https://www.uptodate.com/contents/drug-interactions-principles-and-examples" },
      { title: "Medscape Drug Interaction Checker", url: "https://reference.medscape.com/drug-interactionchecker" },
      { title: "PubMed: Statin Interactions", url: "https://pubmed.ncbi.nlm.nih.gov/?term=statin+drug+interactions" }
    ]
  },
  "Ask about Guidelines": {
    answer:
      "For diabetes management, the ADA 2024 Standards of Care provide comprehensive, evidence-based guidelines. See the following links for the full guideline and summaries.",
    links: [
      { title: "ADA Standards of Care 2024", url: "https://diabetesjournals.org/care/issue/47/Supplement_1" },
      { title: "NICE Diabetes Guidelines", url: "https://www.nice.org.uk/guidance/ng28" },
      { title: "CDC: Diabetes Management", url: "https://www.cdc.gov/diabetes/managing/index.html" },
      { title: "UpToDate: Diabetes Mellitus", url: "https://www.uptodate.com/contents/overview-of-medical-care-in-adults-with-diabetes-mellitus" },
      { title: "PubMed: Diabetes Guidelines", url: "https://pubmed.ncbi.nlm.nih.gov/?term=diabetes+guidelines" }
    ]
  },
  "Ask for a Quick Fact": {
    answer:
      "Normal adult serum sodium is 135-145 mmol/L. Hyponatremia is defined as sodium <135 mmol/L.",
    links: [
      { title: "MedlinePlus: Sodium in Blood Test", url: "https://medlineplus.gov/lab-tests/sodium-blood-test/" },
      { title: "UpToDate: Hyponatremia", url: "https://www.uptodate.com/contents/overview-of-hyponatremia-in-adults" },
      { title: "Lab Tests Online: Sodium", url: "https://labtestsonline.org/tests/sodium" },
      { title: "CDC: Hyponatremia", url: "https://www.cdc.gov/niosh/updates/upd-07-27-15.html" },
      { title: "PubMed: Hyponatremia", url: "https://pubmed.ncbi.nlm.nih.gov/?term=hyponatremia" }
    ]
  },
  "Research a Topic": {
    answer:
      "To research COVID-19 vaccine efficacy, see the following peer-reviewed studies and official resources.",
    links: [
      { title: "NEJM: COVID-19 Vaccine Efficacy", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2035389" },
      { title: "CDC: COVID-19 Vaccines", url: "https://www.cdc.gov/coronavirus/2019-ncov/vaccines/effectiveness/work.html" },
      { title: "WHO: COVID-19 Vaccines", url: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/covid-19-vaccines" },
      { title: "PubMed: COVID-19 Vaccine", url: "https://pubmed.ncbi.nlm.nih.gov/?term=covid-19+vaccine+efficacy" },
      { title: "JAMA: COVID-19 Vaccine", url: "https://jamanetwork.com/journals/jama/fullarticle/2777059" }
    ]
  }
  // Add more categories as needed
};

function getAnswerAndLinks(query: string): { answer: string; links: { title: string; url: string }[] } {
  // Try to match category first
  const cat = CATEGORIES.find(c => query.toLowerCase().includes(c.toLowerCase()));
  if (cat && QA_MAP[cat]) return QA_MAP[cat];
  // Fallback: pick a random answer
  const keys = Object.keys(QA_MAP);
  const random = QA_MAP[keys[Math.floor(Math.random() * keys.length)]];
  return random;
}

export default function ClinicalConsult() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; links: { title: string; url: string }[] } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input && !selectedCategory) return;
    setLoading(true);
    setTimeout(() => {
      const q = input || selectedCategory || "";
      setResult(getAnswerAndLinks(q));
      setLoading(false);
    }, 1200);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setInput(cat);
    setResult(null);
    setTimeout(() => handleSubmit(), 100);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><BookOpen size={22} /> Clinical Knowledge Search</h2>
      <p className="text-muted-foreground mb-4">Ask a clinical question or select a category below. Answers are simulated for demo purposes and include referenced links.</p>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          value={input}
          onChange={e => { setInput(e.target.value); setSelectedCategory(null); setResult(null); }}
          placeholder="Type your clinical question..."
          className="flex-1"
        />
        <Button type="submit" className="flex gap-1 items-center"><Search size={16} /> Search</Button>
      </form>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 animate-pulse"><Loader2 className="animate-spin" size={20} /> Agent is searching for evidence...</div>
      )}
      {result && !loading && (
        <div className="mt-4 bg-muted rounded-lg p-4">
          <div className="mb-2 text-base font-semibold flex items-center gap-2"><BookOpen size={18} /> Answer</div>
          <div className="mb-3 text-foreground">{result.answer}</div>
          <div className="mb-1 text-sm font-medium">References:</div>
          <ul className="list-disc pl-6 space-y-1">
            {result.links.map((l, i) => (
              <li key={i} className="flex items-center gap-1 text-blue-700 hover:underline">
                <Link2 size={14} className="inline-block mr-1" />
                <a href={l.url} target="_blank" rel="noopener noreferrer">{l.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 