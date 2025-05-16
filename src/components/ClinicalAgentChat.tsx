import React, { useState, useEffect, useRef, Fragment } from "react";
import AIInput_04, { AIInput04Ref } from "@/components/kokonutui/ai-input-04";
import { Loader2,  Bot, StethoscopeIcon, ScrollText, Pill, Activity,  BookOpen, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Drug side effects questions
const DRUG_SIDE_EFFECT_QUESTIONS = [
  "What are the most common side effects of metformin?",
  "Are there any serious or life-threatening side effects associated with long-term use of lisinopril?",
  "What are the known side effects of apixaban, particularly in elderly patients or those with kidney impairment?"
];

// Drug interactions questions
const DRUG_INTERACTION_QUESTIONS = [
  "What are the major drug interactions with warfarin?",
  "Are there any significant interactions between metoprolol and SSRIs?",
  "Can amiodarone be safely combined with simvastatin?"
];

// Guidelines questions
const GUIDELINE_QUESTIONS = [
  "What are the latest diabetes management guidelines?",
  "What are the current hypertension treatment guidelines?",
  "What are the guidelines for anticoagulation in atrial fibrillation?"
];

// General medical questions
const MEDICAL_QUESTIONS = [
  "What's the recommended workup for unexplained weight loss?",
  "How should I interpret elevated troponin levels?",
  "What's the standard vaccination schedule for adults?"
];

// All suggestion categories
const SUGGESTION_CATEGORIES = [
  {
    title: "Ask about Drug Side Effects",
    icon: <Pill className="w-5 h-5" />,
    questions: DRUG_SIDE_EFFECT_QUESTIONS
  },
  {
    title: "Ask about Drug Interactions",
    icon: <Activity className="w-5 h-5" />,
    questions: DRUG_INTERACTION_QUESTIONS
  },
  {
    title: "Ask about Guidelines",
    icon: <ScrollText className="w-5 h-5" />,
    questions: GUIDELINE_QUESTIONS
  },
  {
    title: "Ask Common Medical Questions",
    icon: <StethoscopeIcon className="w-5 h-5" />,
    questions: MEDICAL_QUESTIONS
  }
];

// Hardcoded Q&A map with follow-ups
const QA_MAP: Record<string, { answer: string; links: { title: string; url: string }[]; followups: string[] }> = {
  "What are the latest diabetes management guidelines?": {
    answer: "The ADA 2024 Standards of Care provide comprehensive, evidence-based guidelines for diabetes management. Key updates include earlier use of GLP-1 receptor agonists and SGLT2 inhibitors for high-risk patients with type 2 diabetes, regardless of A1C level. The guidelines also emphasize a person-centered approach, health equity, and social determinants of health.",
    links: [
      { title: "ADA Standards of Care 2024", url: "https://diabetesjournals.org/care/issue/47/Supplement_1" },
      { title: "NICE Diabetes Guidelines", url: "https://www.nice.org.uk/guidance/ng28" },
      { title: "CDC: Diabetes Management", url: "https://www.cdc.gov/diabetes/managing/index.html" },
      { title: "UpToDate: Diabetes Mellitus", url: "https://www.uptodate.com/contents/overview-of-medical-care-in-adults-with-diabetes-mellitus" },
      { title: "PubMed: Diabetes Guidelines", url: "https://pubmed.ncbi.nlm.nih.gov/?term=diabetes+guidelines" }
    ],
    followups: [
      "What are the first-line medications for type 2 diabetes?",
      "What are the A1C targets for different patient populations?",
      "What screening tests are recommended for diabetic complications?"
    ]
  },
  "What are the most common side effects of metformin?": {
    answer: "The most common side effects of metformin include gastrointestinal symptoms such as diarrhea, nausea, vomiting, gas, bloating, and abdominal discomfort. Less commonly, patients may experience vitamin B12 deficiency with long-term use. Rare but serious adverse effects include lactic acidosis, particularly in those with renal impairment. To minimize GI side effects, start metformin at a low dose (e.g., 500 mg once daily), take it with meals, and titrate up gradually. Extended-release formulations may improve tolerability.",
    links: [
      { title: "MedlinePlus: Metformin", url: "https://medlineplus.gov/druginfo/meds/a696005.html" },
      { title: "DailyMed: Metformin Label", url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=38d96cac-5c78-4101-9a7e-e5e09a10f0d2" },
      { title: "PubMed: GI Side Effects of Metformin", url: "https://pubmed.ncbi.nlm.nih.gov/11837151/" },
      { title: "American Diabetes Association: Standards of Care", url: "https://care.diabetesjournals.org/content/46/Supplement_1/S38" },
      { title: "NICE Type 2 Diabetes Guideline", url: "https://www.nice.org.uk/guidance/ng28" }
    ],
    followups: [
      "How should metformin be dosed to minimize side effects?",
      "When is metformin contraindicated?",
      "What monitoring is required for patients on metformin?"
    ]
  },
  "Are there any serious or life-threatening side effects associated with long-term use of lisinopril?": {
    answer: "Yes, there are several serious adverse effects associated with long-term lisinopril use, though they are relatively rare. These include angioedema (potentially life-threatening swelling), hyperkalemia (high potassium levels), acute kidney injury (especially with concurrent NSAID use or dehydration), and agranulocytosis (low white blood cell count). Fetal toxicity can occur when used during pregnancy. The most common side effect is a persistent dry cough, which is not serious but often leads to discontinuation.",
    links: [
      { title: "FDA: Lisinopril Label", url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/019777s093lbl.pdf" },
      { title: "UpToDate: ACE Inhibitor Toxicity", url: "https://www.uptodate.com/contents/major-side-effects-of-angiotensin-converting-enzyme-inhibitors-and-angiotensin-ii-receptor-blockers" },
      { title: "MedlinePlus: Lisinopril", url: "https://medlineplus.gov/druginfo/meds/a692051.html" },
      { title: "AHA: Antihypertensive Medications", url: "https://www.heart.org/en/health-topics/high-blood-pressure/changes-you-can-make-to-manage-high-blood-pressure/types-of-blood-pressure-medications" },
      { title: "PubMed: Lisinopril Safety", url: "https://pubmed.ncbi.nlm.nih.gov/?term=lisinopril+safety+long+term" }
    ],
    followups: [
      "What monitoring is required for patients on ACE inhibitors?",
      "What are alternatives to lisinopril for patients who develop a cough?",
      "What drug interactions should I be concerned about with lisinopril?"
    ]
  },
  "What are the major drug interactions with warfarin?": {
    answer: "Warfarin has numerous significant drug interactions. NSAIDs, antiplatelet agents, and other anticoagulants increase bleeding risk. Many antibiotics (particularly macrolides, fluoroquinolones, metronidazole) potentiate warfarin effects by altering gut flora or inhibiting metabolism. Antiepileptics, rifampin, and barbiturates can decrease effectiveness through enzyme induction. SSRIs and SNRIs increase bleeding risk. Foods high in vitamin K antagonize warfarin. Regular INR monitoring is critical when starting or stopping any medication in patients on warfarin.",
    links: [
      { title: "FDA: Warfarin Label", url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/009218s117lbl.pdf" },
      { title: "UpToDate: Warfarin Interactions", url: "https://www.uptodate.com/contents/pharmacology-of-warfarin-and-oral-direct-thrombin-factor-xa-inhibitors" },
      { title: "American College of Cardiology", url: "https://www.acc.org/latest-in-cardiology/articles/2016/10/19/09/58/drug-interactions-with-warfarin" },
      { title: "Medscape: Warfarin Interactions", url: "https://reference.medscape.com/drug/coumadin-jantoven-warfarin-342182#3" },
      { title: "PubMed: Warfarin Interactions", url: "https://pubmed.ncbi.nlm.nih.gov/?term=warfarin+drug+interactions" }
    ],
    followups: [
      "What foods significantly affect warfarin efficacy?",
      "How should warfarin be managed perioperatively?",
      "When should a patient be switched from warfarin to a DOAC?"
    ]
  },
  "What are the current hypertension treatment guidelines?": {
    answer: "The 2023 ESC/ESH guidelines define hypertension as office BP ≥140/90 mmHg. Initial therapy includes lifestyle modifications for all patients. For pharmacotherapy, most patients should start with a combination of an ACE inhibitor/ARB plus calcium channel blocker or thiazide diuretic. The BP target is generally <130/80 mmHg for most adults under 70, and <140/80 mmHg for those over 70. Treatment should be personalized based on comorbidities, with special considerations for diabetes, CKD, CVD, and pregnancy.",
    links: [
      { title: "2023 ESC/ESH Hypertension Guidelines", url: "https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Arterial-Hypertension-Management-of" },
      { title: "ACC/AHA Hypertension Guidelines", url: "https://www.jacc.org/doi/10.1016/j.jacc.2017.11.006" },
      { title: "UpToDate: Hypertension Management", url: "https://www.uptodate.com/contents/overview-of-hypertension-in-adults" },
      { title: "NICE Hypertension Guidelines", url: "https://www.nice.org.uk/guidance/ng136" },
      { title: "PubMed: Hypertension Guidelines", url: "https://pubmed.ncbi.nlm.nih.gov/?term=hypertension+guidelines" }
    ],
    followups: [
      "What are the recommended first-line medications for hypertension?",
      "How should resistant hypertension be managed?",
      "What are the blood pressure targets for patients with diabetes?"
    ]
  },
  "What are the known side effects of apixaban, particularly in elderly patients or those with kidney impairment?": {
    answer: "The primary side effect of apixaban is bleeding, which is increased in elderly patients and those with renal impairment. Major bleeding occurs in approximately 2-3% of patients annually. Elderly patients have higher bleeding risk due to age-related changes in pharmacokinetics, frailty, falls risk, and polypharmacy. In renal impairment, dose adjustment is required when CrCl is 15-29 mL/min (2.5mg BID). Other side effects include nausea, rash, and elevated liver enzymes. Unlike warfarin, there's no routine monitoring, which can mask accumulation and bleeding risk in vulnerable patients.",
    links: [
      { title: "FDA: Eliquis (Apixaban) Label", url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/202155s029lbl.pdf" },
      { title: "UpToDate: Apixaban", url: "https://www.uptodate.com/contents/apixaban-drug-information" },
      { title: "American College of Cardiology", url: "https://www.acc.org/latest-in-cardiology/articles/2020/04/08/08/35/anticoagulation-in-the-older-adult" },
      { title: "Journal of the American Geriatrics Society", url: "https://pubmed.ncbi.nlm.nih.gov/30019494/" },
      { title: "PubMed: Apixaban Elderly Renal", url: "https://pubmed.ncbi.nlm.nih.gov/?term=apixaban+elderly+renal" }
    ],
    followups: [
      "How should apixaban be dosed in renal impairment?",
      "What is the management approach for apixaban-related bleeding?",
      "Is there a role for monitoring apixaban levels in high-risk patients?"
    ]
  },
  "What's the recommended workup for unexplained weight loss?": {
    answer: "The workup for unexplained weight loss (typically defined as >5% of body weight in 6-12 months) should begin with a thorough history and physical examination, focusing on red flags for malignancy, GI disorders, psychological issues, and medication effects. Initial laboratory testing should include CBC, comprehensive metabolic panel, TSH, HbA1c, ESR/CRP, and urinalysis. Age-appropriate cancer screening should be up to date. Additional focused testing may include chest X-ray, abdominal imaging, HIV testing, and stool studies. If initial evaluation is unrevealing, consider specialized testing based on specific symptoms or CT chest/abdomen/pelvis if malignancy is suspected.",
    links: [
      { title: "American Family Physician", url: "https://www.aafp.org/pubs/afp/issues/2018/0515/p632.html" },
      { title: "UpToDate: Approach to Unintentional Weight Loss", url: "https://www.uptodate.com/contents/approach-to-the-adult-with-unintentional-weight-loss" },
      { title: "JAMA Internal Medicine", url: "https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/217249" },
      { title: "Cleveland Clinic", url: "https://www.clevelandclinicmeded.com/medicalpubs/diseasemanagement/preventive-medicine/weight-loss/" },
      { title: "PubMed: Unexplained Weight Loss", url: "https://pubmed.ncbi.nlm.nih.gov/?term=unexplained+weight+loss+workup" }
    ],
    followups: [
      "What are the most common causes of unexplained weight loss in elderly patients?",
      "When should endoscopy be considered in the workup?",
      "What psychiatric conditions can present with significant weight loss?"
    ]
  },
  "Are there any significant interactions between metoprolol and SSRIs?": {
    answer: "Yes, there are significant interactions between metoprolol and some SSRIs. Fluoxetine, paroxetine, and fluvoxamine are potent inhibitors of CYP2D6, the enzyme primarily responsible for metoprolol metabolism. This interaction can increase metoprolol blood levels by 2-5 fold, potentially causing bradycardia, hypotension, and AV block. Sertraline has a weaker effect, while citalopram and escitalopram have minimal impact on CYP2D6. For patients requiring both drugs, consider using SSRIs with minimal CYP2D6 inhibition, monitoring for metoprolol adverse effects, or dose reduction of metoprolol.",
    links: [
      { title: "UpToDate: Drug Interactions with SSRIs", url: "https://www.uptodate.com/contents/selective-serotonin-reuptake-inhibitors-pharmacology-administration-and-side-effects" },
      { title: "FDA: Metoprolol Label", url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2008/019962s037lbl.pdf" },
      { title: "Journal of Clinical Psychopharmacology", url: "https://journals.lww.com/psychopharmacology/Abstract/2001/08000/Interactions_Between_Antidepressants_and.2.aspx" },
      { title: "Clinical Pharmacokinetics", url: "https://link.springer.com/article/10.2165/00003088-199732030-00004" },
      { title: "PubMed: Metoprolol SSRI Interaction", url: "https://pubmed.ncbi.nlm.nih.gov/?term=metoprolol+ssri+interaction" }
    ],
    followups: [
      "Which SSRIs are safest to use with metoprolol?",
      "How should patients on metoprolol and SSRIs be monitored?",
      "What are alternatives to metoprolol for patients requiring SSRIs?"
    ]
  },
  "Can amiodarone be safely combined with simvastatin?": {
    answer: "The combination of amiodarone and simvastatin carries significant risk and requires caution. Amiodarone inhibits CYP3A4, which metabolizes simvastatin, potentially increasing simvastatin plasma concentrations by 2-3 fold. This significantly increases the risk of myopathy and potentially life-threatening rhabdomyolysis. Current recommendations limit simvastatin dosing to a maximum of 20mg daily when combined with amiodarone. Alternative strategies include using statins less dependent on CYP3A4 metabolism (rosuvastatin, pravastatin) or switching to a different antiarrhythmic when appropriate.",
    links: [
      { title: "FDA: Simvastatin Dose Limitations", url: "https://www.fda.gov/drugs/drug-safety-and-availability/fda-drug-safety-communication-new-restrictions-contraindications-and-dose-limitations-zocor" },
      { title: "American Heart Association", url: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000040" },
      { title: "UpToDate: Statin Drug Interactions", url: "https://www.uptodate.com/contents/statins-actions-side-effects-and-administration" },
      { title: "Journal of Clinical Lipidology", url: "https://www.lipidjournal.com/article/S1933-2874(14)00328-8/fulltext" },
      { title: "PubMed: Amiodarone Simvastatin Interaction", url: "https://pubmed.ncbi.nlm.nih.gov/?term=amiodarone+simvastatin+interaction" }
    ],
    followups: [
      "Which statins are safest to use with amiodarone?",
      "What monitoring is recommended for patients on both medications?",
      "What are the warning signs of statin-induced myopathy?"
    ]
  },
  "What are the guidelines for anticoagulation in atrial fibrillation?": {
    answer: "The 2024 AHA/ACC/HRS AF Guidelines recommend anticoagulation based on the CHA₂DS₂-VASc score. For patients with AF and a CHA₂DS₂-VASc score ≥2 in men or ≥3 in women, anticoagulation is strongly recommended (Class I). For men with a score of 1 or women with a score of 2, anticoagulation should be considered (Class IIa). DOACs are preferred over warfarin for eligible patients with non-valvular AF (Class I). Anticoagulation is contraindicated in patients with high bleeding risk. Aspirin monotherapy is no longer recommended for stroke prevention. For patients undergoing cardioversion, adequate anticoagulation should be established for ≥3 weeks or with TEE guidance.",
    links: [
      { title: "2024 AHA/ACC/HRS AF Guidelines", url: "https://www.jacc.org/doi/abs/10.1016/j.jacc.2023.12.005" },
      { title: "ESC Guidelines for AF (2020)", url: "https://academic.oup.com/eurheartj/article/42/5/373/5899003" },
      { title: "UpToDate: Anticoagulation in AF", url: "https://www.uptodate.com/contents/atrial-fibrillation-anticoagulant-therapy-to-prevent-embolization" },
      { title: "American College of Cardiology", url: "https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2019/01/09/14/28/2019-aha-acc-hrs-focused-update" },
      { title: "PubMed: AF Anticoagulation Guidelines", url: "https://pubmed.ncbi.nlm.nih.gov/?term=atrial+fibrillation+anticoagulation+guidelines" }
    ],
    followups: [
      "How do I calculate the CHA₂DS₂-VASc score?",
      "When should DOACs be preferred over warfarin?",
      "How should anticoagulation be managed perioperatively in AF patients?"
    ]
  },
  "How should I interpret elevated troponin levels?": {
    answer: "Elevated troponin indicates myocardial injury but is not specific to acute coronary syndrome (ACS). Interpretation requires clinical context. In suspected ACS, a rising/falling pattern with at least one value above the 99th percentile upper reference limit is diagnostic of acute MI when accompanied by ischemic symptoms, ECG changes, or imaging evidence. Other causes include myocarditis, pulmonary embolism, heart failure, sepsis, renal failure, stroke, and strenuous exercise. The degree of elevation and dynamic changes help differentiate causes. High-sensitivity troponin assays detect more subtle injury but have lower specificity, requiring serial measurements and assessment of absolute/relative changes.",
    links: [
      { title: "Fourth Universal Definition of MI", url: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000617" },
      { title: "UpToDate: Troponin Testing", url: "https://www.uptodate.com/contents/troponin-testing-clinical-use" },
      { title: "American College of Cardiology", url: "https://www.acc.org/latest-in-cardiology/articles/2017/02/13/10/08/interpreting-cardiac-biomarkers-in-the-setting-of-chronic-diseases" },
      { title: "European Heart Journal", url: "https://academic.oup.com/eurheartj/article/40/40/3363/5566815" },
      { title: "PubMed: Troponin Interpretation", url: "https://pubmed.ncbi.nlm.nih.gov/?term=troponin+interpretation" }
    ],
    followups: [
      "What are the non-cardiac causes of elevated troponin?",
      "How should high-sensitivity troponin be interpreted differently?",
      "What's the recommended timing for serial troponin measurements?"
    ]
  },
  "What's the standard vaccination schedule for adults?": {
    answer: "The CDC's 2024 adult vaccination schedule recommends: Influenza (annually for all adults); Td/Tdap (booster every 10 years); COVID-19 (per current CDC guidance); Zoster (2 doses of RZV for adults ≥50); Pneumococcal (PCV15/PCV20 for all adults ≥65 and high-risk younger adults); HPV (through age 26 if not previously vaccinated); MMR and Varicella (for adults without immunity); Hepatitis B (for all adults ages 19-59 and risk-based for ≥60); Hepatitis A (for risk factors or those wanting immunity); Meningococcal (ACWY for high-risk adults, B series for special populations). Special considerations apply for pregnant women, immunocompromised persons, and those with certain medical conditions or occupational risks.",
    links: [
      { title: "CDC: Adult Immunization Schedule 2024", url: "https://www.cdc.gov/vaccines/schedules/hcp/imz/adult.html" },
      { title: "ACIP Vaccine Recommendations", url: "https://www.cdc.gov/vaccines/acip/recommendations.html" },
      { title: "UpToDate: Adult Vaccinations", url: "https://www.uptodate.com/contents/standard-immunizations-for-nonpregnant-adults" },
      { title: "Immunization Action Coalition", url: "https://www.immunize.org/catg.d/p4030.pdf" },
      { title: "PubMed: Adult Vaccination Guidelines", url: "https://pubmed.ncbi.nlm.nih.gov/?term=adult+vaccination+guidelines" }
    ],
    followups: [
      "What vaccinations are recommended for immunocompromised adults?",
      "Which vaccines are contraindicated during pregnancy?",
      "What's the recommended vaccination schedule for adults over 65?"
    ]
  },
  // Add more Q&A pairs as needed
};

// Default followups for questions without explicit followups
const DEFAULT_FOLLOWUPS = [
  "Ask about drug interactions",
  "Ask about evidence quality",
  "Ask about guidelines",
  "Ask about dosing considerations",
  "Ask about contraindications"
];

function getQA(query: string) {
  // Try to match exactly, then try substring
  if (QA_MAP[query]) return QA_MAP[query];
  
  // Check if this is a followup question
  if (FOLLOWUP_ANSWERS[query]) {
    return {
      answer: FOLLOWUP_ANSWERS[query].answer,
      links: FOLLOWUP_ANSWERS[query].links,
      followups: DEFAULT_FOLLOWUPS // Use default followups for followup questions
    };
  }
  
  const keys = Object.keys(QA_MAP);
  const match = keys.find(k => query.toLowerCase().includes(k.toLowerCase()) || 
                          k.toLowerCase().includes(query.toLowerCase()));
  if (match) return QA_MAP[match];
  
  // Fallback: generic answer
  return {
    answer: "I'm sorry, I don't have a hardcoded answer for that specific clinical question yet. Please try one of the suggested questions or ask something else about medications, guidelines, or common medical issues.",
    links: [
      { title: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" },
      { title: "UpToDate", url: "https://www.uptodate.com/" },
      { title: "FDA Drug Database", url: "https://www.accessdata.fda.gov/scripts/cder/daf/" },
      { title: "CDC Clinical Resources", url: "https://www.cdc.gov/clinicians/index.html" },
      { title: "Medscape Reference", url: "https://reference.medscape.com/" }
    ],
    followups: DEFAULT_FOLLOWUPS
  };
}

// Chart data schema
type ChartData = {
  type: 'bar' | 'line';
  title: string;
  data: { label: string; value: number }[];
  color: string;
}

// Sample chart data to show for certain questions
const QUESTION_CHART_DATA: Record<string, ChartData> = {
  "What are the most common side effects of metformin?": {
    type: 'bar',
    title: 'Common Side Effects of Metformin (%)',
    data: [
      { label: 'Diarrhea', value: 28 },
      { label: 'Nausea/Vomiting', value: 16 },
      { label: 'Abdominal Pain', value: 12 },
      { label: 'Metallic Taste', value: 8 },
      { label: 'Vitamin B12 Deficiency', value: 6 }
    ],
    color: 'rgb(59, 130, 246)'
  },
  "What are the current hypertension treatment guidelines?": {
    type: 'line',
    title: 'BP Target Recommendations by Age (mmHg)',
    data: [
      { label: '<50 yrs', value: 120 },
      { label: '50-59 yrs', value: 130 },
      { label: '60-69 yrs', value: 135 },
      { label: '70-79 yrs', value: 140 },
      { label: '≥80 yrs', value: 145 }
    ],
    color: 'rgb(239, 68, 68)'
  },
  "What are the major drug interactions with warfarin?": {
    type: 'bar',
    title: 'Warfarin Interaction Risk',
    data: [
      { label: 'NSAIDs', value: 9 },
      { label: 'Antibiotics', value: 8 },
      { label: 'Antifungals', value: 7 },
      { label: 'SSRIs', value: 6 },
      { label: 'Antiplatelet', value: 10 }
    ],
    color: 'rgb(147, 51, 234)'
  },
  "What are the guidelines for anticoagulation in atrial fibrillation?": {
    type: 'bar',
    title: 'Stroke Risk (%) Based on CHA₂DS₂-VASc',
    data: [
      { label: 'Score 0', value: 0.2 },
      { label: 'Score 1', value: 0.6 },
      { label: 'Score 2', value: 2.2 },
      { label: 'Score 3', value: 3.2 },
      { label: 'Score 4', value: 4.8 },
      { label: 'Score 5+', value: 7.2 }
    ],
    color: 'rgb(220, 38, 38)'
  },
  "What are the first-line medications for type 2 diabetes?": {
    type: 'bar',
    title: 'Expected A1C Reduction (%)',
    data: [
      { label: 'Metformin', value: 1.5 },
      { label: 'GLP-1 RA', value: 1.6 },
      { label: 'SGLT2i', value: 0.9 },
      { label: 'DPP-4i', value: 0.8 },
      { label: 'SU', value: 1.5 }
    ],
    color: 'rgb(16, 185, 129)'
  }
};

// Additional answers for follow-up questions
const FOLLOWUP_ANSWERS: Record<string, { answer: string; links: { title: string; url: string }[] }> = {
  "What are the first-line medications for type 2 diabetes?": {
    answer: "According to the ADA 2024 Standards of Care, metformin remains the preferred initial medication for most patients with type 2 diabetes due to its efficacy, safety, and cost. However, for patients with established ASCVD, heart failure, CKD, or multiple cardiovascular risk factors, either a GLP-1 receptor agonist or SGLT2 inhibitor with proven cardiovascular benefit is recommended regardless of A1C or metformin use. In patients with heart failure or CKD, an SGLT2 inhibitor is particularly beneficial. Combination therapy may be considered at diagnosis for patients with A1C >1.5% above target. Cost, side effects, comorbidities, and patient preferences should guide medication selection.",
    links: [
      { title: "ADA Standards of Care 2024", url: "https://diabetesjournals.org/care/issue/47/Supplement_1" },
      { title: "AACE Diabetes Management Algorithm", url: "https://pro.aace.com/disease-state-resources/diabetes/clinical-practice-guidelines-treatment-algorithms/comprehensive" },
      { title: "UpToDate: Type 2 Diabetes Treatment", url: "https://www.uptodate.com/contents/management-of-persistent-hyperglycemia-in-type-2-diabetes-mellitus" },
      { title: "Diabetologia", url: "https://link.springer.com/article/10.1007/s00125-021-05407-5" },
      { title: "PubMed: First Line Therapy Diabetes", url: "https://pubmed.ncbi.nlm.nih.gov/?term=first+line+therapy+type+2+diabetes" }
    ]
  },
  "What are the A1C targets for different patient populations?": {
    answer: "A1C targets should be individualized based on patient factors. The general target is <7.0% for most adults with diabetes according to ADA guidelines. A more stringent target of <6.5% may be appropriate for selected patients (younger, early disease, no significant CVD, if achievable without hypoglycemia). Less stringent targets of <8.0% are reasonable for patients with limited life expectancy, advanced complications, extensive comorbidities, history of severe hypoglycemia, or inability to safely achieve lower targets due to patient circumstances. For older adults, targets range from <7.0-7.5% for healthy older adults with few comorbidities to <8.0-8.5% for those with multiple conditions, cognitive impairment, or functional dependence. During pregnancy, targets are more stringent: <6.0-6.5%.",
    links: [
      { title: "ADA Standards of Care 2024", url: "https://diabetesjournals.org/care/issue/47/Supplement_1" },
      { title: "AACE Diabetes Management Guidelines", url: "https://pro.aace.com/disease-state-resources/diabetes/clinical-practice-guidelines-treatment-algorithms/comprehensive" },
      { title: "AGS Guidelines for Older Adults", url: "https://agsjournals.onlinelibrary.wiley.com/doi/10.1111/jgs.15767" },
      { title: "UpToDate: Glycemic Control in Diabetes", url: "https://www.uptodate.com/contents/glycemic-control-and-vascular-complications-in-type-2-diabetes-mellitus" },
      { title: "PubMed: A1C Targets", url: "https://pubmed.ncbi.nlm.nih.gov/?term=a1c+targets+individualized" }
    ]
  },
  "How should metformin be dosed to minimize side effects?": {
    answer: "To minimize metformin's GI side effects, start with a low dose and gradually titrate upward. Begin with 500mg once daily with dinner for 1 week, then increase to 500mg twice daily (with breakfast and dinner) for 1 week, and finally to the target dose of 1000mg twice daily if needed and tolerated. Taking metformin with meals reduces GI symptoms. Extended-release formulations have fewer GI side effects and can be given once daily, making them a good option for patients experiencing side effects on immediate-release preparations. If side effects occur during dose escalation, reduce to the previously tolerated dose and attempt a slower titration. The maximum recommended dose is 2000mg daily, with little additional glycemic benefit and increased side effects above this dose.",
    links: [
      { title: "FDA: Metformin Prescribing Information", url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/020357s037s039,021202s021s023lbl.pdf" },
      { title: "UpToDate: Metformin Dosing", url: "https://www.uptodate.com/contents/metformin-drug-information" },
      { title: "American Diabetes Association", url: "https://diabetes.org/healthy-living/medication-treatments/metformin" },
      { title: "Diabetes Care", url: "https://diabetesjournals.org/care/article/35/6/1364/38596/Management-of-Hyperglycemia-in-Type-2-Diabetes-A" },
      { title: "PubMed: Metformin Tolerability", url: "https://pubmed.ncbi.nlm.nih.gov/?term=metformin+dosing+tolerability" }
    ]
  },
  "What foods significantly affect warfarin efficacy?": {
    answer: "Foods high in vitamin K can significantly decrease warfarin efficacy by antagonizing its anticoagulant effect. The most significant sources include dark green leafy vegetables (kale, spinach, collard greens, turnip greens), green tea, Brussels sprouts, broccoli, cabbage, and avocados. Patients should maintain consistent vitamin K intake rather than avoiding these foods completely - sudden large changes in consumption can destabilize INR. Certain dietary supplements can also interact with warfarin, including ginseng, ginkgo biloba, garlic, and St. John's wort. Cranberry juice in large amounts may increase INR. Grapefruit juice can affect warfarin metabolism but the clinical significance is controversial. Alcohol in large amounts can affect warfarin metabolism and increase bleeding risk by multiple mechanisms, particularly in patients with liver disease.",
    links: [
      { title: "American Heart Association", url: "https://www.heart.org/en/health-topics/heart-attack/treatment-of-a-heart-attack/vitamin-k-and-warfarin" },
      { title: "CHEST Guidelines on Antithrombotic Therapy", url: "https://journal.chestnet.org/article/S0012-3692(18)32244-X/fulltext" },
      { title: "UpToDate: Warfarin Drug Interactions", url: "https://www.uptodate.com/contents/overview-of-the-management-of-warfarin-and-its-interactions" },
      { title: "Journal of Clinical Pharmacology", url: "https://accp1.onlinelibrary.wiley.com/doi/abs/10.1177/0091270006286286" },
      { title: "PubMed: Warfarin Food Interactions", url: "https://pubmed.ncbi.nlm.nih.gov/?term=warfarin+food+interactions" }
    ]
  },
  "What monitoring is required for patients on ACE inhibitors?": {
    answer: "Patients on ACE inhibitors like lisinopril require monitoring of several parameters: (1) Renal function (creatinine, eGFR) and electrolytes (particularly potassium) before initiation, 1-2 weeks after starting or dose increases, and periodically thereafter (every 3-12 months based on baseline kidney function); (2) Blood pressure monitoring to assess efficacy and avoid hypotension, especially after initial doses; (3) Clinical assessment for angioedema, particularly within the first month of treatment; (4) Symptoms of hyperkalemia, especially in patients with risk factors (CKD, diabetes, concurrent potassium-sparing diuretics or potassium supplements); (5) Complete blood count in patients with pre-existing renal impairment or collagen vascular diseases to monitor for neutropenia; and (6) Pregnancy testing in women of childbearing age before initiation, with contraception counseling due to fetal toxicity risks.",
    links: [
      { title: "FDA: ACE Inhibitor Class Labeling", url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/019777s093lbl.pdf" },
      { title: "KDIGO Guideline on Blood Pressure Management", url: "https://kdigo.org/guidelines/blood-pressure-in-ckd/" },
      { title: "UpToDate: ACE Inhibitor Monitoring", url: "https://www.uptodate.com/contents/major-side-effects-of-angiotensin-converting-enzyme-inhibitors-and-angiotensin-ii-receptor-blockers" },
      { title: "American College of Cardiology", url: "https://www.acc.org/latest-in-cardiology/articles/2015/11/23/12/57/hyperkalemia-in-heart-failure" },
      { title: "PubMed: ACE Inhibitor Safety Monitoring", url: "https://pubmed.ncbi.nlm.nih.gov/?term=ace+inhibitor+safety+monitoring" }
    ]
  }
};

// Loading shimmer component
const LoadingShimmer = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
  </div>
);

// Simple chart component
const SimpleChart = ({ data }: { data: ChartData }) => {
  const maxValue = Math.max(...data.data.map(d => d.value));
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="mt-4 mb-6 p-4 bg-white rounded-lg border shadow-sm"
    >
      <h4 className="text-sm font-medium mb-3 text-gray-700">{data.title}</h4>
      
      {data.type === 'bar' ? (
        <div className="space-y-2">
          {data.data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs w-24 text-gray-600">{item.label}</span>
              <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
                  className="h-full rounded-full flex items-center pl-2"
                  style={{ backgroundColor: data.color }}
                >
                  <span className="text-xs font-medium text-white">{item.value}%</span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-40 flex items-end gap-1">
          {data.data.map((item, i) => (
            <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / maxValue) * 80}%` }}
                transition={{ duration: 0.5, delay: i * 0.1, type: "spring" }}
                className="w-4 rounded-t"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-xs mt-1 text-gray-600">{item.label}</span>
              <span className="text-xs font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Main component - now designed for full tab view, not a floating window
function ClinicalAgentChat({ initialQuestion }: { initialQuestion?: string }) {
  const [messages, setMessages] = useState<{ sender: "user" | "agent"; text: string; thinking?: boolean; tool?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQA, setLastQA] = useState<{ answer: string; links: { title: string; url: string }[]; followups: string[] } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [inputValue, setInputValue] = useState(initialQuestion || "");
  
  // Ref to access the AIInput component's methods
  const aiInputRef = useRef<AIInput04Ref>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([{
      sender: "agent",
      text: "Welcome to Clinical Consult. Ask a question about medications, guidelines, or common medical issues."
    }]);

    // If initialQuestion is provided, automatically submit it after a short delay
    if (initialQuestion) {
      console.log("initialQuestion in useEffect:", initialQuestion);
      
      // Set the input value to match the initial question
      setInputValue(initialQuestion);
      if (aiInputRef.current) {
        aiInputRef.current.setValue(initialQuestion);
      }
      
      // Auto-submit the question immediately
      // Using a very short timeout to ensure the state updates have happened
      setTimeout(() => {
        if (initialQuestion) {
          console.log("Auto-submitting question:", initialQuestion);
          handleUserSubmit(initialQuestion);
        }
      }, 100);
    }
  }, [initialQuestion]); // eslint-disable-line react-hooks/exhaustive-deps
  // We're intentionally leaving out handleUserSubmit from dependencies
  // to prevent infinite loops while still responding to initialQuestion changes

  const handleUserSubmit = (query: string) => {
    if (!query) return;
    
    // Clear previous state
    setLastQA(null);
    setChartData(null);
    setMessages(msgs => [...msgs, { sender: "user", text: query }]);
    setLoading(true);
    
    // Simulate agentic steps with more detailed steps and timing
    setTimeout(() => {
      setMessages(msgs => [...msgs, { sender: "agent", text: "Thinking...", thinking: true }]);
      
      setTimeout(() => {
        setMessages(msgs => msgs.filter(m => !m.thinking));
        setMessages(msgs => [...msgs, { sender: "agent", text: "Searching medical literature...", tool: "search_database" }]);
        
        setTimeout(() => {
          setMessages(msgs => msgs.filter(m => !m.tool));
          setMessages(msgs => [...msgs, { sender: "agent", text: "Analyzing clinical evidence...", tool: "evidence_analysis" }]);
          
          setTimeout(() => {
            setMessages(msgs => msgs.filter(m => !m.tool));
            setMessages(msgs => [...msgs, { sender: "agent", text: "Generating response...", tool: "response_generation" }]);
            
            setTimeout(() => {
              setMessages(msgs => msgs.filter(m => !m.tool));
              const qa = getQA(query);
              
              // Format answer with line breaks for better readability
              const formattedAnswer = qa.answer.replace(/\. /g, '.\n\n');
              
              setLastQA(qa);
              setMessages(msgs => [...msgs, { sender: "agent", text: formattedAnswer }]);
              
              // Check if this question has associated chart data
              if (QUESTION_CHART_DATA[query]) {
                setChartData(QUESTION_CHART_DATA[query]);
              }
              
              setLoading(false);
            }, 1000);
          }, 800);
        }, 1200);
      }, 1000);
    }, 600);
  };

  const handleSuggestionClick = (question: string) => {
    // Set the input value
    setInputValue(question);
    if (aiInputRef.current) {
      aiInputRef.current.setValue(question);
    }
    // Close any open category
    setSelectedCategory(null);
    
    // Automatically submit the question after setting the input
    handleUserSubmit(question);
  };

  const handleCategoryClick = (index: number) => {
    setSelectedCategory(index === selectedCategory ? null : index);
  };

  // Quick suggestion button component
  const QuickSuggestion = ({ icon, title, questions, index }: { 
    icon: React.ReactNode, 
    title: string, 
    questions: string[],
    index: number
  }) => (
    <div className="relative">
      <button 
        onClick={() => handleCategoryClick(index)}
        className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border",
          selectedCategory === index 
            ? "bg-blue-100 text-blue-700 border-blue-200" 
            : "bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 border-gray-200"
        )}
      >
        <span className="text-blue-600">{icon}</span>
        <span>{title.replace("Ask about ", "").replace("Ask Common ", "")}</span>
      </button>
      
      {selectedCategory === index && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute left-0 top-full mt-1 z-10 bg-white rounded-lg shadow-lg border p-2 min-w-48 w-60"
        >
          <div className="space-y-1">
            {questions.map((q, i) => (
              <button
                key={i}
                className="w-full text-left p-1.5 text-xs rounded hover:bg-blue-50 text-blue-800"
                onClick={() => handleSuggestionClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  // Card display for references and followups
  const ResponseCardGroup = ({ title, icon, items, isLink = false, onClick }: {
    title: string;
    icon: React.ReactNode;
    items: string[] | { title: string; url: string }[];
    isLink?: boolean;
    onClick?: (item: string) => void;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border rounded-lg p-3 mb-3"
    >
      <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2 text-blue-700">
        {icon}
        <span>{title}</span>
      </h3>
      {isLink ? (
        // For reference links - compact display with headings
        <div className="space-y-2">
          {(items as { title: string; url: string }[]).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
              className="border-b border-gray-100 pb-1.5 last:border-0"
            >
              <div className="font-medium text-xs text-gray-800">{item.title}</div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-[10px] break-all"
              >
                {item.url}
              </a>
            </motion.div>
          ))}
        </div>
      ) : (
        // For followup questions
        <div className="flex flex-wrap gap-2">
          {(items as string[]).map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
              className="px-3 py-1.5 text-xs rounded-full bg-white hover:bg-blue-50 text-blue-700 border border-blue-200"
              onClick={() => onClick && onClick(item)}
            >
              {item}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="w-full h-full max-w-7xl mx-auto">
      {/* Header with title */}
      <div className="flex justify-center py-4 border-b mb-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-2xl font-bold"
        >
          <Bot className="text-blue-600" size={28} />
          <h1>Clinical Consult</h1>
        </motion.div>
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100%-4rem)] gap-6 px-4">
        {/* Left column - Input and user messages */}
        <div className={`${messages.length > 1 ? 'w-full lg:w-1/4' : 'w-full'} flex flex-col h-full`}>
          {/* Input area */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full mb-4"
          >
            <AIInput_04 
              onSubmit={handleUserSubmit} 
              ref={aiInputRef}
              value={inputValue}
              onChange={setInputValue}
            />
            
            {/* Quick suggestion categories */}
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex flex-wrap items-center justify-start mt-4 border-t border-gray-200 pt-4 gap-2"
            >
              {SUGGESTION_CATEGORIES.map((category, idx) => (
                <Fragment key={idx}>
                  <QuickSuggestion 
                    icon={category.icon}
                    title={category.title}
                    questions={category.questions}
                    index={idx}
                  />
                </Fragment>
              ))}
            </motion.div>
          </motion.div>

          {/* User messages section */}
          {messages.length > 1 && (
            <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-gray-50 max-h-[calc(100vh-320px)]">
              <h3 className="text-sm font-medium mb-3 text-gray-700">Conversation History</h3>
              <div className="space-y-3">
                {messages.filter(msg => msg.sender === "user").map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-primary text-primary-foreground rounded-lg p-3 text-sm"
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - Agent response area - only show when there are messages */}
        {messages.length > 1 && (
          <div className="w-full lg:w-3/4 flex flex-col h-full overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex-1 overflow-y-auto px-6 py-6 border rounded-lg bg-card w-full shadow-sm max-h-[calc(100vh-120px)]"
            >
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.filter(msg => msg.sender === "agent").map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex justify-start"
                    >
                      <div className={cn(
                        "rounded-2xl px-4 py-3 max-w-[90%]",
                        msg.thinking
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : msg.tool
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-muted text-foreground rounded-tl-none"
                      )}>
                        {msg.thinking && (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 size={16} />
                            </motion.div>
                            {msg.text}
                          </span>
                        )}
                        {msg.tool && (
                          <span className="flex items-center gap-2 text-xs text-blue-700">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 size={14} />
                            </motion.div>
                            {msg.text}
                          </span>
                        )}
                        {!msg.thinking && !msg.tool && (
                          <div className="whitespace-pre-line text-sm">{msg.text}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Chart display when available */}
                {chartData && (
                  <SimpleChart data={chartData} />
                )}

                {/* Loading state when waiting for response */}
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-4 bg-blue-50 rounded-lg"
                  >
                    <LoadingShimmer />
                  </motion.div>
                )}

                {/* References and followups with cards */}
                {lastQA && !loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 border-t border-border pt-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* References Card */}
                      <div className="md:col-span-2">
                        <ResponseCardGroup 
                          title="References" 
                          icon={<BookOpen size={16} />} 
                          items={lastQA.links} 
                          isLink={true}
                        />
                      </div>
                      
                      {/* Follow-up Questions Card */}
                      <ResponseCardGroup 
                        title="Follow-up Questions" 
                        icon={<StethoscopeIcon size={16} />} 
                        items={lastQA.followups} 
                        onClick={handleSuggestionClick}
                      />
                      
                      {/* Related Topics Card */}
                      <ResponseCardGroup 
                        title="Related Topics" 
                        icon={<SearchIcon size={16} />} 
                        items={Object.keys(QA_MAP)
                          .slice(0, 6)
                          .filter(key => key !== messages[messages.length - 2]?.text)}
                        onClick={handleSuggestionClick}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the component
export default ClinicalAgentChat; 