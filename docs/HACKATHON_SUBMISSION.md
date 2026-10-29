# 🏆 Nexora: Hackathon Project Submission Document
**Problem Statement:** Unlock Underused Equipment and Spaces  
**One-Line Description:** A trusted, multi-tenant platform that helps universities, research labs, makerspaces, and communities safely share underused spaces, advanced equipment, and technical resources with automated safety verification, explainable fair allocation, and tamper-evident condition auditing.

---

## 1. Selected Use Case & Scope
While ordinary room booking software treats specialized technical property as generic calendar blocks, high-value physical equipment—such as 4-axis CNC milling centers, confocal laser microscopes, ISO Class 5 photolithography cleanrooms, and high-speed photonics rigs—involves critical operational risks:
- Operator qualification and liability (e.g., laser eye injury, spindle collision, chemical contamination).
- Monopolization by dominant research groups or commercial actors.
- Unsubstantiated condition disputes (pre-existing wear vs. negligent damage).
- Starvation of early-stage student researchers and community innovators.

**Nexora** targets **Inter-Institutional Research Consortia, University Shared Facilities, Makerspaces, and Regional Innovation Labs**. It formalizes the complete 10-step lifecycle of physical asset sharing from listing to return, backed by an autonomous AI safety and fairness layer.

---

## 2. Target Users & Resource Owners

| Persona | Role | Primary Objective | Key Safety / Access Requirement |
|---|---|---|---|
| **Dr. Sarah Chen** | Lab Manager & Safety Officer (MIT Center for Bits and Atoms) | Protect $350k+ equipment from unauthorized access and untracked damage while maximizing public utilization | Mandatory certification verification, pre-checkin condition baselines, human-in-the-loop dispute adjudication |
| **Alex Rivera** | PhD Robotics Researcher (Stanford Bio-X & Robotics) | Access high-speed CNC and laser imaging facilities across partner campuses for thesis prototyping | Transparent scheduling, pre-flight qualification verification, prompt deposit release |
| **Maya Lin** | Undergraduate Student (Carnegie Mellon Innovation Institute) | Access high-speed imaging cameras for senior capstone without prohibitive private rental rates | Equitable allocation weighting (thesis priority), low-barrier access pass |
| **Marcus Vance** | Community Innovator (Downtown Community MakerSpace) | Utilize industrial metal 3D printers during off-peak windows for clean-energy hardware startup | Verifiable trust passport, deposit transparency, safety checklists |
| **Dean Arthur Vance** | Consortium Safety Auditor (Research Oversight Board) | Ensure institutional compliance, anti-monopoly fairness, and liability audits | Tamper-evident, immutable transaction ledger with cryptographic proofs |

---

## 3. Evidence & Reasoning: Why the Problem Matters
1. **Economic Inefficiency:** Academic research institutions spend billions annually on specialized instruments that sit idle 60% to 75% of the time during off-peak hours and weekends.
2. **The "Access Chasm":** Early-stage researchers and students cannot afford commercial access ($300-$800/hr) or private purchase of equipment ($100k-$1M+).
3. **The Liability Bottleneck:** Traditional booking platforms fail to verify whether the operator has completed required biosafety, laser radiation, or rotary machining safety courses, exposing institutions to severe regulatory and financial liability.
4. **The Monopolization Dilemma:** Without explainable anti-monopolization curves, dominant research groups reserve entire facilities months in advance, locking out smaller teams.

---

## 4. The Complete 10-Step Sharing Lifecycle

Nexora implements and automates every stage of the 10-step resource-sharing journey:

1. **Step 1: Resource Listed with Governance Conditions:** Owner publishes asset specifications, access limits, required certifications, and staff supervision rules.
2. **Step 2: Discovery & Pre-Flight Eligibility Check:** System validates the user's verified credentials, remaining hourly quota, and security deposit before booking.
3. **Step 3: Purpose-Weighted Request Submission:** User submits research project title, intended application, requested duration, and safety supervisor name.
4. **Step 4: Fair Allocation & Anti-Monopolization Scoring:** The algorithmic fairness engine evaluates rolling 7-day usage, purpose weighting, and waitlist starvation bonuses; detects schedule conflicts and queues waitlist entries transparently.
5. **Step 5: Manager Oversight & Review:** Lab Manager inspects applicant profile, trust rating, and safety prerequisites.
6. **Step 6: Access Authorization / Explainable Decision:** Manager approves request (issuing a station access pass code) or declines with documented feedback.
7. **Step 7: Station Check-In & Initial Condition Baseline:** User completes pre-operation safety checklist (E-stop functional, PPE donned), documents pre-existing scuffs/wear, uploads baseline inspection photo, and activates pass.
8. **Step 8: Station Return & Handover Inspection:** User records final state, logs consumables used (e.g., run hours, filament), and submits handover cleanliness rating.
9. **Step 9: AI Damage Discrepancy & Dispute Resolution:** The AI Condition Diff Analyzer compares Step 7 baseline vs. Step 8 return. If hardware collision or wear discrepancy is detected, an incident is flagged with estimated repair cost, deposit is held, and the Safety Officer adjudicates.
10. **Step 10: Immutable Consortium Audit Ledger:** Every state transition, digital signature, and decision is written to an append-only, tamper-evident audit history log viewable by both parties.

---

## 5. Technology Stack & System Architecture

```
[ Frontend: React + Vite + Tailwind CSS ]  <--- Edge-Deployed on Vercel
                    │
           REST API (JSON / CORS)
                    │
[ Backend: Node.js + Express Server ]      <--- Web Service on Render
    ├── Fair Allocation Engine
    ├── Safety Qualification Verifier
    ├── Condition Vision Diff Module
    └── SQLite WAL (High Concurrency Store) / PostgreSQL Cloud Ready
                    │
[ Immutable Audit Trail (SHA256 Proofs) ]
```

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide Icons, Canvas Confetti. Deployed to **Vercel** with SPA rewrites (`vercel.json`).
- **Backend:** Node.js 24, Express 4, Better-SQLite3 with Write-Ahead Logging (WAL) and foreign keys enabled. Deployed to **Render** with blueprint specification (`render.yaml`).
- **AI Suite (`/ai`):** Modular NLP technical matcher, Document OCR qualification extractor, Computer Vision Condition & Damage Diff Analyzer, and Gini Fair-Share Utilization Optimizer.
- **Persistence:** SQLite WAL embedded database (zero setup required for evaluators), with automated seed migrations on startup.

---

## 6. AI Tools, Models & Algorithmic Capabilities

All AI components feature **human-in-the-loop oversight**: AI provides automated extraction, risk flags, and discrepancy recommendations, while final safety and forfeiture decisions remain reviewable by authorized personnel.

### 1. Natural Language Resource Matcher (`/ai/matcher.js`)
- Translates unstructured natural language queries (e.g., *"Need a 4-axis machine to cut titanium aerospace brackets Friday afternoon"*) into technical domain capabilities.
- Evaluates domain taxonomy synergy, equipment tolerances, and user certification eligibility.

### 2. Safety Document OCR Credential Verifier (`/ai/cert_verifier.js`)
- Simulates multi-modal OCR parsing on uploaded safety cards and certificates.
- Cross-references issuing body against trusted registries (e.g., MIT EHS, OSHA, Laser Safety Officer Board).
- Validates expiration timelines and flags impending renewals.

### 3. Pre/Post Condition Vision Diff Analyzer (`/ai/condition_analyzer.js`)
- Performs comparative diff analysis between Step 7 Baseline notes/photos and Step 8 Handover notes/photos.
- Distinguishes expected operational wear-and-tear from negligent collision, spindle damage, thermal trips, or fractured print heads.
- Computes damage severity (`NONE`, `LOW`, `MEDIUM`, `CRITICAL`), estimates repair costs, and drafts incident reports for safety officers.

### 4. Transparent Fair Allocation & Anti-Monopolization Algorithm (`/ai/fairness_optimizer.js`)
- Implements an explainable mathematical scoring formula:
  $$\text{Score} = w_{\text{purpose}} \times S_{\text{purpose}} + w_{\text{trust}} \times S_{\text{trust}} + w_{\text{wait}} \times \min(48, H_{\text{wait}}) - w_{\text{usage}} \times H_{\text{rolling\_usage}}$$
- Academic Thesis receives +40 pts; Coursework receives +30 pts; Student Innovation receives +25 pts; Commercial receives +10 pts.
- Rolling 7-day usage exceeding 10 hours triggers progressive monopolization penalties.
- Starvation prevention grants +1.5 pts/hour waiting on the waitlist, ensuring smaller research teams are never permanently locked out.
- Gini coefficient monitoring detects facility monopolization hotspots across departments.

---

## 7. Privacy, Security & Accountability Controls
- **Data Minimization:** Only training certifications, institutional affiliations, and machine operating logs are stored.
- **Tamper-Evident Ledger:** All approvals, rejections, check-in baselines, returns, and dispute resolutions are recorded in the `audit_logs` table with actor roles, timestamps, and cryptographic integrity proof identifiers.
- **Pre-Existing Damage Exoneration:** Users are encouraged during Step 7 Check-in to photograph pre-existing cosmetic flaws, protecting them from being unfairly held liable upon return.
- **Role-Based Access Control (RBAC):** Strict boundaries between Student, Researcher, Lab Manager, and Consortium Safety Auditor.

---

## 8. Known Limitations & Future Development
- **Hardware Telemetry Integration (Future):** Direct IoT integration with machine hours counters, digital smart locks, and smart power plugs to automate check-in upon physical badge tap.
- **Multi-Campus Transport:** Extending the platform to coordinate secure transit logistics for mobile equipment (e.g., drone kits, high-speed cameras).
- **Federated Identity:** Integration with InCommon / EduGAIN SSO for automated multi-university student identity federation.

---

## 9. Disclosure of Libraries & Pre-Existing Code
- **Original Work:** All application architecture, database schemas, API routes, fair allocation algorithms, AI matcher/diff/verifier engines, and frontend interfaces were built specifically for this hackathon.
- **Third-Party Open Source Libraries:** React, Vite, Tailwind CSS, Lucide React, Express, Better-SQLite3, BcryptJS, JsonWebToken, Canvas Confetti.
- **Demo Data:** All names, lab facilities, and certificate records are fictionalized demonstration profiles created for hackathon evaluation.
