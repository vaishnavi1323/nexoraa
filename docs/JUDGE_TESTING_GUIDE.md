# 🧪 Nexora: Official Judge Testing & Evaluation Guide
**Hackathon Problem Statement:** Unlock Underused Equipment and Spaces  
**Repository:** [https://github.com/shiivuuu/hachk](https://github.com/shiivuuu/hachk)  
**Evaluation Target:** 100% Verified 10-Step Operational Lifecycle in Under 3 Minutes

---

## ⚡ Quick-Start: 1-Click Evaluation Hub

Nexora includes an in-app **Judge Demo Hub** accessible at any time from the top navigation bar.

1. Click the glowing **"🏆 Judge Demo Hub"** button in the top navbar.
2. Choose your evaluation method:
   - **⚡ 1-Click Full Lifecycle:** Click **"Run Full 10-Step Journey (1-Click)"** to programmatically execute listing, pre-flight check, booking, manager sign-off, station check-in, clean return handover, and redirect directly to the cryptographic audit ledger.
   - **🎯 Guided 10-Step Stepper:** Click step-by-step buttons to experience each stage interactively with pre-filled winning demo values.
   - **👥 Persona Switcher:** Switch between the 5 personas with a single click without logging out.
   - **🧪 5 Pre-Orchestrated Scenarios:** Test edge cases including safety qualification blocks, anti-monopoly penalties, collision damage diffs, and transparent waitlist queues.
   - **📊 100-Point Rubric:** Review the point-by-point breakdown mapping every hackathon criteria to concrete platform features.

---

## 👥 Pre-Configured Demo Personas (1-Click Switcher)

Use the **Persona Switcher** in the top-right corner of the application or inside the **Judge Demo Hub**:

| Persona | Role | Key Attribute | Test Scenario |
|---|---|---|---|
| 🎓 **Dr. Sarah Chen** | Lab Manager & Safety Officer (MIT) | Full Approval & Dispute Authority | Authorize requests (Step 6), Adjudicate damage reports (Step 9) |
| 🔬 **Alex Rivera** | PhD Researcher (Stanford) | Fully Certified (5-Axis CNC, Laser L2) | Eligible for advanced equipment; Request Haas CNC Mill (Step 3) |
| 💡 **Maya Lin** | Undergraduate Student (CMU) | Basic Safety Certified | Missing 5-Axis CNC cert (Step 2 Ineligibility demonstration) |
| 🛠️ **Marcus Vance** | Community Hardware Maker | MakerSpace Certified | Test Step 9 Damage incident scenario on Metal 3D printer |
| 🛡️ **Dean Arthur Vance** | Consortium Compliance Auditor | Compliance & Ledger Oversight | Inspect complete immutable audit trail (Step 10) |

---

## 🚀 3-Minute Walkthrough of the Complete 10-Step Lifecycle

### Step 1: Owner Lists a Resource & Defines Conditions
1. Switch to persona **Dr. Sarah Chen (Lab Manager)**.
2. Click **"+ List Resource"** in the top navigation bar.
3. Fill in:
   - Resource Name: `Stratasys F370 Industrial 3D Printer`
   - Category: `Fabrication & CNC`
   - Required Certification: `3D Additive Sintering Operator`
   - Hourly Rate: `$25`, Deposit: `$100`
4. Click **"Publish Listing (Step 1)"**. The resource is instantly published to the catalog and logged to the audit ledger.

---

### Step 2: User Discovers Resource & Checks Eligibility
1. Switch to persona **Maya Lin (Student)**.
2. On the Catalog page, click **"Request Access"** on the **Haas VF-2 4-Axis CNC Milling Center**.
3. **Observe Step 2 Pre-flight Check:** A red banner appears alerting that Maya Lin lacks the mandatory *"5-Axis CNC Mill Certified Operator"* badge.
4. Now switch to persona **Alex Rivera (Researcher)** and click **"Request Access"** on the same machine.
5. **Observe:** The banner turns green! *"Pre-Flight Eligibility Verified: Alex Rivera holds all required certifications."*

---

### Step 3 & 4: Submit Booking Request & Fair Allocation Scoring
1. While still on the Haas VF-2 modal as **Alex Rivera**:
   - Purpose: Select `Academic Thesis / Core Research (+40 pts)`
   - Project Title: `Soft-Robotic Gripper Machining`
   - Duration: `3 hours`
2. **Observe Step 4 Fair Allocation Preview:** The system dynamically computes the Priority Score (~`80+ pts`), incorporating thesis weight and rolling 7-day usage limits.
3. Click **"Submit Request (Step 3)"**. Confetti celebrates the submission, and the request moves to the Manager Review queue.

---

### Step 5 & 6: Lab Manager Reviews & Authorizes Access Pass
1. Switch to persona **Dr. Sarah Chen (Lab Manager)**.
2. Click the **"Lab Control"** tab in the navigation bar.
3. In the **Requests Queue**, locate Alex Rivera's pending request.
4. Review the applicant's 94% trust score and fairness score breakdown.
5. Click **"Authorize Access Pass (Step 6)"**. An immutable audit record is logged and access pass `NX-PASS-XXXX` is issued.

---

### Step 7: Station Check-In & Initial Condition Baseline
1. Switch back to persona **Alex Rivera (Researcher)**.
2. Click the **"My Lifecycle (1-10)"** tab in the navbar.
3. On the newly approved booking, click the amber button: **"Check In (Step 7)"**.
4. Review the station checklist (Emergency stop tested, PPE donned).
5. Document baseline wear notes (e.g., *"Tooling clean, bed tram checked, minor fixture scratch"*).
6. Click **"Complete Check-In (Step 7)"**. Station access pass is activated and baseline condition is permanently recorded.

---

### Step 8 & 9: Return, AI Condition Diff & Dispute Handling
1. On the same booking card (now in active use), click the teal button: **"Return & Inspection (Step 8)"**.
2. **Clean Return Path:**
   - Condition: `Good`
   - Cleanliness: `5 Stars`
   - Click **"Submit Return & Audit (Step 8)"**.
   - **Observe:** AI Vision Diff compares Step 7 baseline vs Step 8 handover, clears deposit refund, and automatically closes booking.
3. **Damage / Discrepancy Path (Step 9):**
   - Click the **"Lab Control"** tab -> **"Incidents"** subtab.
   - Review pre-seeded incident `INC-2026-001` on the Markforged Metal 3D Printer where an extruder nozzle collision was detected.
   - Click **"Adjudicate Incident (Step 9)"** -> choose *"Partial Repair Deduction"* -> click **"Sign Off & Close Incident"**.

---

### Step 10: Immutable Consortium Audit Ledger
1. Click the **"Audit Trail"** tab in the navbar.
2. View the chronological ledger recording every state transition, actor role, timestamp, and cryptographic SHA256 hash.
3. Click **"Inspect Payload"** on any record to view the JSON diff proof.
4. Click **"Export Compliance JSON"** to download the auditable transcript.

---

## 🧪 5 Deep-Dive Evaluator Test Scenarios

| Scenario | Objective | How to Test | Expected Outcome |
|---|---|---|---|
| **Scenario A** | The Golden 10-Step Journey | Click *🏆 Judge Demo Hub* -> *Run Full 10-Step Journey* | All 10 steps execute programmatically in 2 seconds; redirects to Audit Trail |
| **Scenario B** | Safety Qualification Barrier | Switch to Maya Lin -> Request Haas CNC | Red ineligibility warning; booking blocked until certified |
| **Scenario C** | Anti-Monopoly Fair Scoring | Open *AI & Fairness* tab | Review rolling 7-day usage penalties and starvation relief math |
| **Scenario D** | Damage Diff & Dispute Sign-off | Switch to Dr. Chen -> Lab Control -> Incidents | Review $850 collision damage estimate and sign off deposit action |
| **Scenario E** | Transparent Waiting List | View Waitlist in Lab Control | Shows explainable waitlist position ordered by fairness score |

---

## 📊 100-Point Judging Criteria Mapping

| Rubric Dimension | Max Pts | Nexora Implementation Evidence |
|---|---|---|
| **1. Problem Understanding** | **15** | Directly addresses the $2.4B idle equipment paradox, safety liability, and monopolization in shared facilities. |
| **2. Strength of Solution** | **20** | Unified Trust & Safety OS with pre-flight check, condition baselines, deposit escrow, and manager governance. |
| **3. Working End-to-End Product** | **20** | Complete 10-step lifecycle operating without broken links or manual simulation; 1-click evaluation hub included. |
| **4. Technical Depth & Reliability** | **15** | React 19 + Tailwind v4 + Node.js 24 + SQLite WAL + full client-side offline fallback resilience + e2e test suites. |
| **5. Trust, Safety & Accountability** | **10** | E-stop/PPE checklists, pre-existing damage exoneration, AI vision diff, and cryptographic append-only audit trail. |
| **6. Fair Allocation & Accessibility** | **10** | Mathematical anti-monopoly scoring, starvation relief (+1.5 pts/hr), and WCAG AA accessible light-mode UI. |
| **7. Originality & Potential** | **10** | Transcends simple room booking calendars; built for immediate adoption across university consortia. |
| **TOTAL SCORE** | **100** | **Complete Full-Score Implementation** |

---

## 🔄 Quick System Reset
Need to start your evaluation from a clean state?
1. Open the **"🏆 Judge Demo Hub"** modal.
2. Go to the **"Submission Links & Docs"** tab.
3. Click **"Reset Demo Data to Initial State"**.
4. The system clears local storage and restores pristine initial demonstration records immediately.
