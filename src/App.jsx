import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "jurisdiction",
    question: "Which market are you targeting?",
    hint: "Select the regulatory jurisdiction for your device submission.",
    type: "single",
    options: [
      { value: "eu", label: "🇪🇺 European Union", sub: "EU MDR 2017/745" },
      { value: "india", label: "🇮🇳 India", sub: "CDSCO MDR 2017" },
      { value: "both", label: "🌍 Both Markets", sub: "EU MDR + CDSCO" },
    ],
  },
  {
    id: "device_type",
    question: "What type of device is it?",
    hint: "Choose the category that best describes your device.",
    type: "single",
    options: [
      { value: "non_invasive", label: "Non-invasive", sub: "e.g. BP monitor, weighing scale, thermometer" },
      { value: "invasive_transient", label: "Invasive – short term", sub: "e.g. surgical gloves, hypodermic needles, catheters <60 min" },
      { value: "invasive_longterm", label: "Invasive – long term / implantable", sub: "e.g. stents, pacemakers, orthopaedic implants" },
      { value: "active", label: "Active device (energy-powered)", sub: "e.g. X-ray machine, ultrasound, infusion pump, TENS device" },
      { value: "ivd", label: "In-vitro diagnostic (IVD)", sub: "e.g. blood glucose meter, pregnancy test, PCR kit" },
      { value: "software", label: "Software / SaMD / Digital health", sub: "e.g. diagnostic app, AI triage tool, clinical decision support" },
    ],
  },
  {
    id: "intended_use",
    question: "What is the primary intended use?",
    hint: "Select what the device is designed to do.",
    type: "single",
    options: [
      { value: "diagnosis", label: "Diagnosis", sub: "Detecting or identifying a disease or condition" },
      { value: "treatment", label: "Treatment / Therapy", sub: "Treating, relieving, or managing a condition" },
      { value: "monitoring", label: "Monitoring", sub: "Continuous or periodic patient monitoring" },
      { value: "prevention", label: "Prevention", sub: "Preventing a disease or injury" },
      { value: "cosmetic", label: "Cosmetic / Aesthetic", sub: "No medical purpose — appearance-related use" },
    ],
  },
  {
    id: "body_contact",
    question: "Does the device contact the human body?",
    hint: "Select the most invasive level of contact.",
    type: "single",
    options: [
      { value: "none", label: "No body contact", sub: "Device does not touch the patient at all" },
      { value: "skin", label: "Skin surface only", sub: "External contact with intact skin" },
      { value: "mucosa", label: "Mucous membranes / orifices", sub: "e.g. oral, nasal, vaginal, rectal contact" },
      { value: "blood", label: "Internal tissue or blood", sub: "Surgically invasive or blood-contacting" },
      { value: "cns", label: "CNS, heart, or brain", sub: "Most critical — central nervous system or cardiac contact" },
    ],
  },
  {
    id: "duration",
    question: "How long is the device used continuously?",
    hint: "Based on intended clinical use duration.",
    type: "single",
    options: [
      { value: "transient", label: "Transient", sub: "Less than 60 minutes" },
      { value: "short", label: "Short-term", sub: "60 minutes to 30 days" },
      { value: "long", label: "Long-term", sub: "More than 30 days" },
      { value: "permanent", label: "Permanent implant", sub: "Intended to remain in body indefinitely" },
    ],
  },
  {
    id: "sterile",
    question: "Does sterility apply to this device?",
    hint: "Sterile devices require additional validation documentation.",
    type: "single",
    options: [
      { value: "yes_sterile", label: "Yes — supplied sterile", sub: "Device is sterilized by manufacturer before shipping" },
      { value: "yes_sterilize", label: "Yes — user must sterilize", sub: "Device requires sterilization before each use" },
      { value: "no", label: "No sterility required", sub: "Device is not sterile and does not require sterilization" },
    ],
  },
  {
    id: "existing_docs",
    question: "Which documents do you already have?",
    hint: "Select all that are complete and available. Select none if you are just starting.",
    type: "multi",
    options: [
      { value: "intended_use_doc", label: "Intended Use / Indications for Use statement" },
      { value: "risk_management", label: "Risk Management File (ISO 14971)" },
      { value: "clinical_eval", label: "Clinical Evaluation Report (CER) or Clinical Performance Data" },
      { value: "biocompat", label: "Biocompatibility Testing (ISO 10993)" },
      { value: "technical_file", label: "Technical Documentation / Design Dossier" },
      { value: "qms", label: "Quality Management System — ISO 13485 Certificate" },
      { value: "labelling", label: "Labelling and Instructions for Use (IFU)" },
      { value: "pms", label: "Post-Market Surveillance (PMS) Plan" },
      { value: "declaration", label: "Declaration of Conformity" },
      { value: "udi", label: "UDI (Unique Device Identification) registration" },
    ],
  },
];

// ─── CLASSIFICATION LOGIC ─────────────────────────────────────────────────────

function classifyDevice(answers) {
  const { device_type, body_contact, duration, intended_use } = answers;

  let euClass = "Class I";
  let euRule = "Rule 1 — Non-invasive device";
  let euRisk = "Low Risk";

  if (device_type === "ivd") {
    euClass = "Class B (IVD)";
    euRule = "IVDR 2017/746 — Rule 2";
    euRisk = "Low-Moderate Risk";
  } else if (device_type === "software") {
    if (intended_use === "diagnosis" || intended_use === "treatment") {
      euClass = "Class IIa / IIb";
      euRule = "Rule 11 — SaMD (serious condition / critical situation)";
      euRisk = "Moderate-High Risk";
    } else {
      euClass = "Class I";
      euRule = "Rule 11 — SaMD (non-critical monitoring)";
      euRisk = "Low Risk";
    }
  } else if (body_contact === "cns" || duration === "permanent") {
    euClass = "Class III";
    euRule = "Rule 6 / 7 — CNS contact or permanent implant";
    euRisk = "High Risk";
  } else if (body_contact === "blood" || device_type === "invasive_longterm") {
    euClass = "Class IIb";
    euRule = "Rule 5 / 8 — Blood contact or long-term invasive";
    euRisk = "Moderate-High Risk";
  } else if (body_contact === "mucosa" || device_type === "invasive_transient") {
    euClass = "Class IIa";
    euRule = "Rule 5 — Mucous membrane or transient invasive";
    euRisk = "Moderate Risk";
  } else if (device_type === "active") {
    euClass = "Class IIa";
    euRule = "Rule 9 — Active therapeutic device";
    euRisk = "Moderate Risk";
  }

  let cdscoClass = "Class A";
  let cdscoRisk = "Low Risk";

  if (body_contact === "cns" || duration === "permanent") {
    cdscoClass = "Class D";
    cdscoRisk = "High Risk";
  } else if (body_contact === "blood" || device_type === "invasive_longterm") {
    cdscoClass = "Class C";
    cdscoRisk = "Moderate-High Risk";
  } else if (body_contact === "mucosa" || device_type === "invasive_transient" || device_type === "active") {
    cdscoClass = "Class B";
    cdscoRisk = "Low-Moderate Risk";
  }

  return { euClass, euRule, euRisk, cdscoClass, cdscoRisk };
}

function getConformityRoute(euClass) {
  const routes = {
    "Class I": { route: "Self-Declaration", detail: "Manufacturer issues EU Declaration of Conformity independently. No Notified Body involvement required, unless the device is sterile, has a measuring function, or is a reusable surgical instrument." },
    "Class IIa": { route: "Notified Body — QMS or Type Examination", detail: "Requires Notified Body assessment of the Quality Management System (Annex IX) OR type-examination (Annex X) combined with product verification (Annex XI)." },
    "Class IIb": { route: "Notified Body — Full QMS + Technical Review", detail: "Requires full Notified Body assessment of QMS (Annex IX) with review of technical documentation. More rigorous than Class IIa." },
    "Class III": { route: "Notified Body — Design Dossier Examination", detail: "Most stringent pathway. Requires Notified Body full QMS assessment plus design dossier examination. Clinical investigation data typically mandatory." },
    "Class IIa / IIb": { route: "Notified Body — SaMD-specific assessment", detail: "Classification depends on specific SaMD intended use and patient risk. Notified Body assessment strongly recommended. Refer to MDCG 2019-11 guidance." },
    "Class B (IVD)": { route: "Notified Body — IVDR Assessment", detail: "Notified Body conformity assessment under IVDR Annex IX or Annex X required. Performance evaluation and scientific validity data essential." },
  };
  return routes[euClass] || { route: "Consult regulatory expert", detail: "Device classification is complex — engage a qualified regulatory consultant for the appropriate conformity route." };
}

function buildDocLists(answers) {
  const { sterile, device_type } = answers;
  const classification = classifyDevice(answers);

  const euDocs = [
    { id: "intended_use_doc", label: "Intended Use & Indications for Use", ref: "Annex II §1.1", priority: "critical" },
    { id: "technical_file", label: "Technical Documentation (Design Dossier)", ref: "Annex II", priority: "critical" },
    { id: "risk_management", label: "Risk Management File — ISO 14971", ref: "Annex II §3", priority: "critical" },
    { id: "clinical_eval", label: "Clinical Evaluation Report (CER)", ref: "Annex XIV", priority: "critical" },
    { id: "labelling", label: "Labelling & Instructions for Use (IFU)", ref: "Annex I §23", priority: "critical" },
    { id: "declaration", label: "EU Declaration of Conformity", ref: "Annex IV", priority: "critical" },
    { id: "qms", label: "Quality Management System — ISO 13485", ref: "Article 10(9)", priority: "high" },
    { id: "pms", label: "Post-Market Surveillance Plan (PMS)", ref: "Annex III", priority: "high" },
    { id: "udi", label: "UDI Registration in EUDAMED", ref: "Article 27", priority: "high" },
    { id: "biocompat", label: "Biocompatibility Assessment — ISO 10993", ref: "Annex II §5.4", priority: device_type === "non_invasive" ? "recommended" : "critical" },
  ];

  const cdscoDocsBase = [
    { id: "intended_use_doc", label: "Intended Use / Purpose Statement", ref: "MDR 2017 — Schedule I", priority: "critical" },
    { id: "technical_file", label: "Technical Documentation / Design Dossier", ref: "MDR 2017 — Schedule I", priority: "critical" },
    { id: "risk_management", label: "Risk Management File", ref: "MDR 2017 — Schedule II", priority: "critical" },
    { id: "clinical_eval", label: "Clinical Performance / Evaluation Data", ref: "MDR 2017 — Schedule III", priority: "critical" },
    { id: "labelling", label: "Labelling & IFU (English + regional language)", ref: "MDR 2017 — Rule 16", priority: "critical" },
    { id: "qms", label: "ISO 13485 QMS Certificate", ref: "MDR 2017 — Rule 9", priority: "critical" },
    { id: "declaration", label: "Declaration of Conformity", ref: "MDR 2017 — Schedule IV", priority: "high" },
    { id: "biocompat", label: "Biocompatibility / Safety Testing Data", ref: "MDR 2017 — Schedule II", priority: "high" },
  ];

  if (sterile === "yes_sterile" || sterile === "yes_sterilize") {
    euDocs.push({ id: "sterile_doc", label: "Sterilization Validation Records", ref: "Annex II §5.2", priority: "critical" });
    cdscoDocsBase.push({ id: "sterile_doc", label: "Sterilization Validation Records", ref: "MDR 2017 — Schedule II", priority: "critical" });
  }

  if (["Class IIb", "Class III"].includes(classification.euClass)) {
    euDocs.push({ id: "clinical_invest", label: "Clinical Investigation Plan / Summary of Safety & Performance (SSCP)", ref: "Annex XV / Article 32", priority: "critical" });
  }

  return { euDocs, cdscoDocuments: cdscoDocsBase, classification };
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

const STEP_LABELS = ["Market", "Device", "Purpose", "Contact", "Duration", "Sterility", "Documents", "Report"];

export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [multiSelections, setMultiSelections] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);

  const currentQ = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;

  const handleSingle = (value) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (step < totalSteps - 1) setStep(step + 1);
      else setShowResults(true);
    }, 250);
  };

  const handleMultiToggle = (value) => {
    setMultiSelections((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleMultiSubmit = () => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: multiSelections }));
    setShowResults(true);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setMultiSelections([]);
    setShowResults(false);
    setHoveredOption(null);
  };

  const computeResults = () => {
    const { euDocs, cdscoDocuments, classification } = buildDocLists(answers);
    const existing = answers.existing_docs || [];
    const jurisdiction = answers.jurisdiction;
    const conformity = getConformityRoute(classification.euClass);

    const euHave = euDocs.filter((d) => existing.includes(d.id));
    const euMissing = euDocs.filter((d) => !existing.includes(d.id));
    const cdscoHave = cdscoDocuments.filter((d) => existing.includes(d.id));
    const cdscoMissing = cdscoDocuments.filter((d) => !existing.includes(d.id));

    let score = 0;
    if (jurisdiction === "eu") {
      score = euDocs.length > 0 ? Math.round((euHave.length / euDocs.length) * 100) : 0;
    } else if (jurisdiction === "india") {
      score = cdscoDocuments.length > 0 ? Math.round((cdscoHave.length / cdscoDocuments.length) * 100) : 0;
    } else {
      const allIds = [...new Set([...euDocs.map((d) => d.id), ...cdscoDocuments.map((d) => d.id)])];
      score = allIds.length > 0 ? Math.round((allIds.filter((id) => existing.includes(id)).length / allIds.length) * 100) : 0;
    }

    return { euDocs, cdscoDocuments, euHave, euMissing, cdscoHave, cdscoMissing, score, classification, conformity, jurisdiction };
  };

  const pct = showResults ? 100 : Math.round(((step) / totalSteps) * 100);

  if (showResults) {
    const { euHave, euMissing, cdscoHave, cdscoMissing, score, classification, conformity, jurisdiction, euDocs, cdscoDocuments } = computeResults();
    const scoreColor = score >= 75 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
    const scoreLabel = score >= 75 ? "Submission Ready" : score >= 40 ? "In Progress" : "Early Stage";
    const criticalMissing = [...(jurisdiction !== "india" ? euMissing : []), ...(jurisdiction !== "eu" ? cdscoMissing : [])].filter(d => d.priority === "critical");

    return (
      <div style={s.page}>
        <Header />
        <div style={s.resultsContainer}>

          {/* ── Score ── */}
          <div style={s.card}>
            <div style={s.scoreRow}>
              <div style={s.scoreCircleWrap}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="9" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="9"
                    strokeDasharray={`${(score / 100) * 326.7} 326.7`}
                    strokeLinecap="round" transform="rotate(-90 60 60)"
                    style={{ transition: "stroke-dasharray 1.2s ease" }} />
                </svg>
                <div style={s.scoreInner}>
                  <div style={{ ...s.scoreNum, color: scoreColor }}>{score}%</div>
                  <div style={s.scoreLabel}>{scoreLabel}</div>
                </div>
              </div>
              <div style={s.scoreSummary}>
                <div style={s.scoreSummaryTitle}>Readiness Assessment Complete</div>
                <div style={s.scoreSummaryText}>
                  {score >= 75
                    ? "Your documentation profile is strong. Conduct a final internal audit before formal submission."
                    : score >= 40
                    ? "You have made a good start. Focus on completing the critical missing documents before submission."
                    : "Your documentation is in early stages. Begin with the Risk Management File and Technical Documentation as your foundation."}
                </div>
                {criticalMissing.length > 0 && (
                  <div style={s.criticalAlert}>
                    ⚠ {criticalMissing.length} critical document{criticalMissing.length > 1 ? "s" : ""} missing
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Classification ── */}
          <div style={s.classGrid}>
            {(jurisdiction === "eu" || jurisdiction === "both") && (
              <div style={s.card}>
                <div style={s.cardLabel}>🇪🇺 EU MDR Classification</div>
                <div style={s.classBadge}>{classification.euClass}</div>
                <div style={s.classRule}>{classification.euRule}</div>
                <div style={s.riskPill} data-risk={classification.euRisk}>{classification.euRisk}</div>
                <div style={s.divider} />
                <div style={s.cardLabel}>Conformity Assessment Route</div>
                <div style={s.conformityRoute}>{conformity.route}</div>
                <div style={s.conformityDetail}>{conformity.detail}</div>
              </div>
            )}
            {(jurisdiction === "india" || jurisdiction === "both") && (
              <div style={s.card}>
                <div style={s.cardLabel}>🇮🇳 CDSCO Classification</div>
                <div style={s.classBadge}>{classification.cdscoClass}</div>
                <div style={s.classRule}>Medical Devices Rules 2017 (India)</div>
                <div style={s.riskPill} data-risk={classification.cdscoRisk}>{classification.cdscoRisk}</div>
                <div style={s.divider} />
                <div style={s.cardLabel}>Registration Route</div>
                <div style={s.conformityRoute}>
                  {classification.cdscoClass === "Class A" ? "Self-Certification (Class A)" :
                   classification.cdscoClass === "Class B" ? "CDSCO Registration — Class B" :
                   classification.cdscoClass === "Class C" ? "CDSCO Registration — Class C (Third-party audit)" :
                   "CDSCO Registration — Class D (Most stringent)"}
                </div>
                <div style={s.conformityDetail}>
                  Submit application via the SUGAM portal (sugam.gov.in).
                  {classification.cdscoClass !== "Class A" && " Third-party audit and CDSCO inspection may be required."}
                </div>
              </div>
            )}
          </div>

          {/* ── EU Checklist ── */}
          {(jurisdiction === "eu" || jurisdiction === "both") && (
            <ChecklistSection
              flag="🇪🇺" title="EU MDR Documentation Checklist"
              have={euHave} missing={euMissing} refKey="ref"
            />
          )}

          {/* ── CDSCO Checklist ── */}
          {(jurisdiction === "india" || jurisdiction === "both") && (
            <ChecklistSection
              flag="🇮🇳" title="CDSCO Documentation Checklist"
              have={cdscoHave} missing={cdscoMissing} refKey="ref"
            />
          )}

          {/* ── Next Steps ── */}
          <div style={{ ...s.card, ...s.nextStepsCard }}>
            <div style={s.nextTitle}>📋 Recommended Next Steps</div>
            <NextStep show={score < 40} text="Start with your Risk Management File (ISO 14971) — it is the foundation for all other documentation." />
            <NextStep show={score < 60} text="Prepare your Technical Documentation file. This is the core submission dossier required by both EU MDR and CDSCO." />
            <NextStep show={true} text="Ensure your Quality Management System is certified to ISO 13485 before any formal regulatory submission." />
            <NextStep show={(jurisdiction === "eu" || jurisdiction === "both") && !["Class I"].includes(classification.euClass)} text="Identify and engage a Notified Body early — lead times for EU MDR assessments are typically 12–18 months." />
            <NextStep show={jurisdiction === "india" || jurisdiction === "both"} text="Register on the SUGAM portal (sugam.gov.in) and create your manufacturer account ahead of submission." />
            <NextStep show={score >= 75} text="Conduct a final internal audit using this checklist before initiating formal submission. Consider a pre-submission meeting with your regulatory authority." />
          </div>

          {/* ── Disclaimer ── */}
          <div style={s.disclaimer}>
            <strong>Disclaimer:</strong> This tool provides indicative guidance only and does not constitute formal regulatory advice. Device classification and documentation requirements may vary based on specific device characteristics, intended use, and applicable national regulations. Always consult a qualified regulatory affairs professional or Notified Body for formal regulatory assessment. References: EU MDR 2017/745, IVDR 2017/746, CDSCO Medical Devices Rules 2017.
          </div>

          <div style={s.actionRow}>
            <button style={s.printBtn} onClick={() => window.print()}>🖨 Print Report</button>
            <button style={s.resetBtn} onClick={reset}>← New Assessment</button>
          </div>

          <Footer />
        </div>
      </div>
    );
  }

  // ── Question Screen ──
  return (
    <div style={s.page}>
      <Header />
      <div style={s.questionContainer}>
        <ProgressBar pct={pct} step={step} labels={STEP_LABELS} total={totalSteps} />

        <div style={s.card}>
          <div style={s.qNum}>Question {step + 1} of {totalSteps}</div>
          <div style={s.qText}>{currentQ.question}</div>
          {currentQ.hint && <div style={s.qHint}>{currentQ.hint}</div>}

          {currentQ.type === "single" && (
            <div style={s.optionsList}>
              {currentQ.options.map((opt) => (
                <button
                  key={opt.value}
                  style={{
                    ...s.optionBtn,
                    ...(answers[currentQ.id] === opt.value ? s.optionBtnSelected : {}),
                    ...(hoveredOption === opt.value && answers[currentQ.id] !== opt.value ? s.optionBtnHover : {}),
                  }}
                  onClick={() => handleSingle(opt.value)}
                  onMouseEnter={() => setHoveredOption(opt.value)}
                  onMouseLeave={() => setHoveredOption(null)}
                >
                  <div style={s.optionLabel}>{opt.label}</div>
                  {opt.sub && <div style={s.optionSub}>{opt.sub}</div>}
                </button>
              ))}
            </div>
          )}

          {currentQ.type === "multi" && (
            <>
              <div style={s.multiHint}>Select all that apply — or click Continue with none selected if you are just starting out.</div>
              <div style={s.optionsList}>
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.value}
                    style={{
                      ...s.optionBtn,
                      ...(multiSelections.includes(opt.value) ? s.optionBtnSelected : {}),
                      ...(hoveredOption === opt.value && !multiSelections.includes(opt.value) ? s.optionBtnHover : {}),
                    }}
                    onClick={() => handleMultiToggle(opt.value)}
                    onMouseEnter={() => setHoveredOption(opt.value)}
                    onMouseLeave={() => setHoveredOption(null)}
                  >
                    <span style={s.checkbox}>{multiSelections.includes(opt.value) ? "☑" : "☐"}</span>
                    <div style={s.optionLabel}>{opt.label}</div>
                  </button>
                ))}
              </div>
              <button style={s.continueBtn} onClick={handleMultiSubmit}>
                Generate Report →
              </button>
            </>
          )}
        </div>

        {step > 0 && (
          <button style={s.backBtn} onClick={() => setStep(step - 1)}>← Previous</button>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Header() {
  return (
    <div style={s.header}>
      <div style={s.headerInner}>
        <div style={s.logoMark}>RC</div>
        <div>
          <div style={s.logoText}>RegCheck</div>
          <div style={s.logoSub}>Regulatory Submissions Readiness Checker</div>
        </div>
      </div>
      <div style={s.headerBadges}>
        <span style={s.badge}>EU MDR 2017/745</span>
        <span style={s.badge}>CDSCO MDR 2017</span>
        <span style={s.badge}>ISO 13485</span>
      </div>
    </div>
  );
}

function ProgressBar({ pct, step, labels, total }) {
  return (
    <div style={s.progressWrap}>
      <div style={s.progressLabels}>
        {labels.map((l, i) => (
          <div key={l} style={{ ...s.progLabel, ...(i <= step ? s.progLabelActive : {}) }}>
            <div style={{ ...s.progDot, ...(i <= step ? s.progDotActive : {}) }}>{i + 1}</div>
            <div style={s.progLabelText}>{l}</div>
          </div>
        ))}
      </div>
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ChecklistSection({ flag, title, have, missing, refKey }) {
  return (
    <div style={s.card}>
      <div style={s.checklistTitle}>{flag} {title}</div>
      <div style={s.checklistStats}>
        <span style={s.statGreen}>✓ {have.length} complete</span>
        <span style={s.statRed}>✗ {missing.length} missing</span>
      </div>
      {have.map((doc) => (
        <div key={doc.id} style={s.checkRow}>
          <span style={s.checkIconYes}>✓</span>
          <span style={s.checkText}>{doc.label}</span>
          <span style={s.checkRef}>{doc[refKey]}</span>
          {doc.priority === "critical" && <span style={s.pillCritical}>Critical</span>}
        </div>
      ))}
      {missing.map((doc) => (
        <div key={doc.id} style={{ ...s.checkRow, ...s.checkRowMissing }}>
          <span style={s.checkIconNo}>✗</span>
          <span style={s.checkText}>{doc.label}</span>
          <span style={s.checkRef}>{doc[refKey]}</span>
          {doc.priority === "critical" && <span style={s.pillCritical}>Critical</span>}
        </div>
      ))}
    </div>
  );
}

function NextStep({ show, text }) {
  if (!show) return null;
  return <div style={s.nextItem}>→ {text}</div>;
}

function Footer() {
  return (
    <div style={s.footer}>
      Built by <strong>Vedika RH</strong> · B.Pharm Final Year · CSMU Panvel · 2026<br />
      Coding & Development · <strong>Reisha Kumar</strong> · SIES 4th Year Student<br />
      <span style={{ opacity: 0.5 }}>For educational and professional demonstration purposes</span>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: "100vh",
    background: "#060d1a",
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
    color: "#dde4ef",
    paddingBottom: "60px",
  },
  header: {
    background: "rgba(255,255,255,0.02)",
    borderBottom: "1px solid rgba(148,163,184,0.08)",
    padding: "28px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerInner: { display: "flex", alignItems: "center", gap: "16px" },
  logoMark: {
    width: "44px", height: "44px", borderRadius: "10px",
    background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1rem", fontWeight: "800", color: "#fff", letterSpacing: "0.05em",
  },
  logoText: {
    fontSize: "1.5rem", fontWeight: "700", color: "#f1f5f9",
    letterSpacing: "-0.02em",
  },
  logoSub: { fontSize: "0.72rem", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px" },
  headerBadges: { display: "flex", gap: "8px", flexWrap: "wrap" },
  badge: {
    padding: "4px 10px", background: "rgba(30,58,138,0.25)",
    border: "1px solid rgba(59,130,246,0.25)", borderRadius: "20px",
    fontSize: "0.7rem", color: "#93c5fd", letterSpacing: "0.05em",
  },

  // Question layout
  questionContainer: { maxWidth: "680px", margin: "0 auto", padding: "32px 20px" },
  resultsContainer: { maxWidth: "800px", margin: "0 auto", padding: "32px 20px" },

  // Progress
  progressWrap: { marginBottom: "28px" },
  progressLabels: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  progLabel: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: 0.3, transition: "opacity 0.3s" },
  progLabelActive: { opacity: 1 },
  progDot: {
    width: "26px", height: "26px", borderRadius: "50%",
    background: "#0f172a", border: "2px solid #1e293b",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.7rem", color: "#475569",
  },
  progDotActive: { background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)", border: "2px solid #60a5fa", color: "#fff" },
  progLabelText: { fontSize: "0.6rem", color: "#475569", letterSpacing: "0.05em" },
  progressTrack: { height: "2px", background: "#0f172a", borderRadius: "2px", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #1d4ed8, #0ea5e9)", borderRadius: "2px", transition: "width 0.5s ease" },

  // Card
  card: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(148,163,184,0.1)",
    borderRadius: "14px",
    padding: "28px",
    marginBottom: "20px",
  },

  // Questions
  qNum: { fontSize: "0.7rem", color: "#3b82f6", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" },
  qText: { fontSize: "1.35rem", fontWeight: "600", color: "#f1f5f9", marginBottom: "8px", lineHeight: "1.4" },
  qHint: { fontSize: "0.82rem", color: "#64748b", marginBottom: "22px", lineHeight: "1.5" },
  multiHint: { fontSize: "0.8rem", color: "#64748b", fontStyle: "italic", marginBottom: "16px" },

  optionsList: { display: "flex", flexDirection: "column", gap: "8px" },
  optionBtn: {
    padding: "13px 16px", background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(148,163,184,0.12)", borderRadius: "10px",
    color: "#94a3b8", textAlign: "left", cursor: "pointer",
    transition: "all 0.15s", fontFamily: "inherit", display: "flex", alignItems: "flex-start", gap: "10px",
  },
  optionBtnHover: { background: "rgba(255,255,255,0.05)", borderColor: "rgba(148,163,184,0.25)", color: "#cbd5e1" },
  optionBtnSelected: { background: "rgba(29,78,216,0.15)", borderColor: "#3b82f6", color: "#93c5fd" },
  optionLabel: { fontSize: "0.92rem", fontWeight: "500", lineHeight: "1.3" },
  optionSub: { fontSize: "0.75rem", color: "#64748b", marginTop: "3px", lineHeight: "1.4" },
  checkbox: { fontSize: "1.1rem", color: "#3b82f6", minWidth: "18px", marginTop: "1px" },

  continueBtn: {
    marginTop: "22px", padding: "13px 30px",
    background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
    border: "none", borderRadius: "10px", color: "#fff",
    fontSize: "0.95rem", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
  },
  backBtn: {
    display: "block", margin: "14px auto 0", padding: "8px 20px",
    background: "transparent", border: "1px solid #1e293b",
    borderRadius: "8px", color: "#475569", fontSize: "0.82rem",
    cursor: "pointer", fontFamily: "inherit",
  },

  // Results
  scoreRow: { display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" },
  scoreCircleWrap: { position: "relative", flexShrink: 0 },
  scoreInner: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" },
  scoreNum: { fontSize: "1.7rem", fontWeight: "700" },
  scoreLabel: { fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" },
  scoreSummary: { flex: 1 },
  scoreSummaryTitle: { fontSize: "1.1rem", fontWeight: "600", color: "#f1f5f9", marginBottom: "8px" },
  scoreSummaryText: { fontSize: "0.88rem", color: "#94a3b8", lineHeight: "1.6" },
  criticalAlert: {
    marginTop: "12px", padding: "8px 14px",
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "8px", fontSize: "0.82rem", color: "#fca5a5",
  },

  classGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "16px", marginBottom: "4px" },
  cardLabel: { fontSize: "0.68rem", color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" },
  classBadge: {
    display: "inline-block", padding: "5px 16px",
    background: "rgba(29,78,216,0.2)", border: "1px solid #3b82f6",
    borderRadius: "20px", color: "#93c5fd", fontSize: "1rem", fontWeight: "600", marginBottom: "6px",
  },
  classRule: { fontSize: "0.78rem", color: "#64748b", marginBottom: "10px", lineHeight: "1.5" },
  riskPill: {
    display: "inline-block", padding: "3px 12px",
    background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "20px", fontSize: "0.72rem", color: "#fbbf24", marginBottom: "16px",
  },
  divider: { height: "1px", background: "rgba(148,163,184,0.08)", margin: "16px 0" },
  conformityRoute: { fontSize: "0.88rem", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" },
  conformityDetail: { fontSize: "0.8rem", color: "#64748b", lineHeight: "1.6" },

  checklistTitle: { fontSize: "1rem", fontWeight: "600", color: "#f1f5f9", marginBottom: "6px" },
  checklistStats: { display: "flex", gap: "16px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(148,163,184,0.08)" },
  statGreen: { fontSize: "0.8rem", color: "#22c55e" },
  statRed: { fontSize: "0.8rem", color: "#ef4444" },
  checkRow: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "9px 0", borderBottom: "1px solid rgba(148,163,184,0.05)" },
  checkRowMissing: { opacity: 0.65 },
  checkIconYes: { color: "#22c55e", fontWeight: "700", fontSize: "0.9rem", minWidth: "14px", paddingTop: "1px" },
  checkIconNo: { color: "#ef4444", fontWeight: "700", fontSize: "0.9rem", minWidth: "14px", paddingTop: "1px" },
  checkText: { flex: 1, fontSize: "0.85rem", color: "#cbd5e1", lineHeight: "1.4" },
  checkRef: { fontSize: "0.68rem", color: "#334155", whiteSpace: "nowrap", fontStyle: "italic", paddingTop: "2px" },
  pillCritical: {
    padding: "2px 8px", background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px",
    fontSize: "0.62rem", color: "#fca5a5", whiteSpace: "nowrap",
  },

  nextStepsCard: { background: "rgba(29,78,216,0.06)", borderColor: "rgba(59,130,246,0.15)" },
  nextTitle: { fontSize: "1rem", fontWeight: "600", color: "#93c5fd", marginBottom: "14px" },
  nextItem: { fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.6", marginBottom: "8px", paddingLeft: "4px" },

  disclaimer: {
    fontSize: "0.72rem", color: "#334155", lineHeight: "1.7",
    padding: "16px 20px", background: "rgba(0,0,0,0.2)",
    border: "1px solid rgba(148,163,184,0.06)", borderRadius: "10px",
    marginBottom: "20px",
  },
  actionRow: { display: "flex", gap: "12px", justifyContent: "center", marginBottom: "28px", flexWrap: "wrap" },
  printBtn: {
    padding: "11px 24px", background: "rgba(29,78,216,0.15)",
    border: "1px solid rgba(59,130,246,0.3)", borderRadius: "10px",
    color: "#93c5fd", fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit",
  },
  resetBtn: {
    padding: "11px 24px", background: "transparent",
    border: "1px solid #1e293b", borderRadius: "10px",
    color: "#475569", fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit",
  },
  footer: {
    textAlign: "center", fontSize: "0.75rem", color: "#1e293b",
    lineHeight: "1.8", paddingTop: "8px",
  },
};
