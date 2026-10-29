# 📡 Nexora REST API Specification

Base URL (Local): `http://localhost:5000/api`  
Base URL (Production): `https://<render-service-url>/api`

All endpoints accept and return `application/json`. Personas can be simulated by providing the `x-user-id` header (e.g., `usr_manager`, `usr_researcher`).

---

## 1. System Health
### `GET /health`
Returns system status, active database engine, and record counts.
```json
{
  "status": "healthy",
  "system": "Nexora Platform API",
  "version": "1.0.0",
  "database": "connected (SQLite WAL)",
  "records": { "users": 5, "resources": 8, "bookings": 5 }
}
```

---

## 2. Authentication & Personas
### `GET /auth/users`
Returns all seeded and registered user accounts with verified certification counts.

### `POST /auth/register`
**Lifecycle Role:** Custom Profile Creation  
**Body:**
```json
{
  "name": "Shivam Sharma",
  "email": "shivam@college.edu",
  "role": "researcher",
  "institution": "Indian Institute of Technology",
  "department": "Robotics & Advanced Fabrication",
  "phone": "+91 98765 43210",
  "bio": "Building autonomous aerial robotics prototypes.",
  "credits": 1500,
  "trust_score": 95
}
```

### `PUT /auth/users/:id`
**Lifecycle Role:** Manual Detail Management  
**Body:** `{ "name", "role", "institution", "department", "phone", "bio", "credits", "trust_score" }`

### `POST /auth/login`
**Body:** `{ "email": "manager@mit.edu", "password": "password123" }`  
**Response:** JWT token and sanitized user profile.

### `GET /auth/me`
Returns current user profile, credit balance, and active certifications.

---

## 3. Resources & Eligibility (Steps 1 & 2)
### `GET /resources`
**Query Parameters:**
- `category`: `fabrication` | `equipment` | `space` | `testing_rig` | `computing`
- `search`: Keyword string
- `status`: `available` | `maintenance`

### `GET /resources/:id/eligibility`
**Lifecycle Step:** Step 2 Pre-flight Check  
**Query Parameters:** `userId` (string)  
**Response:**
```json
{
  "success": true,
  "isEligible": true,
  "requirements": {
    "requiredCertifications": ["5-Axis CNC Mill Certified Operator"],
    "satisfiedCertifications": ["5-Axis CNC Mill Certified Operator"],
    "missingCertifications": [],
    "securityDepositRequired": 150
  },
  "recommendation": "ELIGIBLE: All safety credentials verified."
}
```

### `POST /resources`
**Lifecycle Step:** Step 1 Listing & Conditions  
**Body:** `{ "title", "description", "category", "type", "hourly_rate", "deposit", "min_hours", "max_hours", "requires_supervision", "required_certifications" }`

---

## 4. Bookings & Lifecycle (Steps 3 to 8)
### `POST /bookings`
**Lifecycle Steps:** Steps 3 & 4 Request & Fair Allocation  
**Body:**
```json
{
  "resource_id": "res_cnc_haas",
  "start_time": "2026-11-02T13:00:00Z",
  "end_time": "2026-11-02T16:00:00Z",
  "purpose": "Academic Thesis / Core Research",
  "project_title": "Titanium Soft Robotics Machining",
  "supervisor_name": "Dr. Sarah Chen"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Booking request submitted successfully for lab manager review.",
  "booking": {
    "id": "bk_8f912",
    "bookingCode": "NX-8921",
    "status": "pending_approval",
    "fairnessScore": 82.5,
    "fairnessExplanation": "Purpose 'Academic Thesis': +40 pts | Trust (94%): +18.8 pts | Clean Usage: 2.5h"
  }
}
```

### `POST /bookings/:id/approve`
**Lifecycle Steps:** Steps 5 & 6 Manager Review & Approval  
**Body:** `{ "approval_notes": "Safety checklist assigned." }`

### `POST /bookings/:id/checkin`
**Lifecycle Step:** Step 7 Station Check-in Baseline  
**Body:**
```json
{
  "initial_condition_status": "good",
  "initial_notes": "Emergency stop verified, bed clean.",
  "initial_photos": ["https://..."],
  "checklist_answers": { "eStop": true, "ppe": true }
}
```
**Response:** Issues active digital pass code `NX-PASS-XXXX`.

### `POST /bookings/:id/return`
**Lifecycle Steps:** Steps 8 & 9 Return Handover & AI Condition Diff  
**Body:**
```json
{
  "final_condition_status": "good",
  "final_notes": "Session finished cleanly, tools racked.",
  "cleanliness_rating": 5,
  "consumables_used": { "hours": 3.0 }
}
```
**Response:** Runs AI Condition Vision diff, evaluates deposit action, triggers incident if damaged.

---

## 5. Incidents & Disputes (Step 9)
### `GET /incidents`
Returns flagged damage reports and dispute statuses.

### `POST /incidents/:id/resolve`
**Body:** `{ "resolution_notes": "...", "deposit_action": "refunded" | "partially_retained" | "held_for_review" }`

---

## 6. Immutable Audit Trail (Step 10)
### `GET /audit`
**Query Parameters:** `entityType`, `entityId`, `limit`  
Returns tamper-evident transaction log with actor roles, timestamps, and payload proofs.

---

## 7. AI Suite Endpoints
- `POST /ai/match`: Natural language technical capability matching.
- `POST /ai/analyze-condition`: Simulated vision comparison of Step 7 vs Step 8 records.
- `POST /ai/verify-cert`: Document credential OCR extraction.
- `GET /ai/fairness-report`: Gini index and anti-monopolization analytics.
