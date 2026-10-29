# 🗺️ Nexora User Journeys & Workflow Architecture

This document maps the primary user personas and their end-to-end interactions across the 10-step equipment sharing lifecycle.

---

## 1. Primary Personas

### 🔬 Persona 1: Alex Rivera (PhD Robotics Researcher)
- **Goal:** Access high-precision 4-Axis CNC mill for prototype titanium gripper fingers.
- **Attributes:** Fully certified (Laser Safety Level 2, 5-Axis CNC certified), 94% institutional trust rating.
- **Pain Point:** Equipment at home lab is overbooked; needs transparent cross-institutional access to neighboring facilities.

### 🎓 Persona 2: Dr. Sarah Chen (Shared Facilities Director & Safety Officer)
- **Goal:** Protect $350k institutional equipment from unauthorized operation, tool damage, and scheduling monopolization while ensuring maximum utilization.
- **Attributes:** 14 years in academic safety governance, presiding manager.
- **Pain Point:** Lack of baseline condition verification leaves lab vulnerable to untracked damage disputes.

### 💡 Persona 3: Maya Lin (Undergraduate Engineering Student)
- **Goal:** Access high-speed dynamic camera for senior capstone fluid dynamics study.
- **Attributes:** Clean record, limited credit balance, needs transparent waitlist visibility.
- **Pain Point:** Commercial labs are unaffordable; ordinary booking systems favor tenured faculty over students.

---

## 2. End-to-End Workflow Diagram (10-Step Journey)

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Dr. Sarah Chen (Manager)
    actor User as Alex Rivera (Researcher)
    participant Platform as Nexora Platform
    participant AI as AI Safety & Fairness Suite
    participant Audit as Immutable Ledger

    Note over Owner, Platform: Step 1: Listing & Conditions
    Owner->>Platform: List Haas VF-2 CNC Mill with safety prerequisites & deposit
    Platform->>Audit: Record RESOURCE_LISTED

    Note over User, Platform: Step 2: Discovery & Eligibility
    User->>Platform: Natural Language Search ("4-axis titanium CNC")
    Platform->>AI: Run NL Matcher & Prerequisite Scan
    AI-->>Platform: 100% Synergy Match, All Certifications Satisfied

    Note over User, Platform: Step 3 & 4: Request & Fair Allocation
    User->>Platform: Submit Booking Request (Academic Thesis, 3 hrs)
    Platform->>AI: Compute Fair Allocation Score (Purpose + Trust - Recent Hours)
    Platform->>Platform: Detect Schedule Conflicts
    Platform->>Audit: Record REQUEST_SUBMITTED (Score: 82.5 pts)

    Note over Owner, Platform: Step 5 & 6: Manager Review & Authorization
    Owner->>Platform: Review Request & Safety Credentials
    Owner->>Platform: Authorize Access Pass (Step 6)
    Platform->>User: Notify with Access Pass NX-PASS-7729
    Platform->>Audit: Record REQUEST_APPROVED

    Note over User, Platform: Step 7: Check-In & Condition Baseline
    User->>Platform: Complete Station Safety Checklist & Document Baseline Photos
    Platform->>Audit: Record STEP7_CHECKIN_COMPLETED

    Note over User, Platform: Step 8 & 9: Return, AI Diff & Damage Handling
    User->>Platform: Complete Return Handover Notes & Cleanliness Rating
    Platform->>AI: Run Condition Vision Diff (Step 7 Baseline vs Step 8 Handover)
    alt Flawless Return
        AI-->>Platform: Clean return, deposit refunded automatically
        Platform->>Audit: Record STEP8_RETURN_COMPLETED
    else Damage Discrepancy Detected
        AI-->>Platform: Hardware damage flagged (est. cost $220), hold deposit
        Platform->>Owner: Open Incident Dispute (Step 9)
        Owner->>Platform: Adjudicate Dispute (partial deposit retention)
        Platform->>Audit: Record INCIDENT_RESOLVED
    end

    Note over Owner, User: Step 10: Complete Transaction History
    Platform->>Audit: Display Complete Tamper-Evident Chronological Ledger
```
