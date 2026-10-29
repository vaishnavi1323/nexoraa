# 🎨 Nexora Design System & UX Specification

## 1. Design Philosophy
Sharing institutional hardware—such as 4-axis CNC mills, confocal fluorescence microscopes, and Class 5 cleanrooms—requires a level of psychological trust and rigorous accountability far beyond ordinary meeting room reservations.

Our visual language, **"High-Precision Laboratory & Trust Framework"**, communicates:
- **Scientific Rigor & Clarity:** Crisp neutral canvas (`#f8fafc`) with white card elevations and indigo accents.
- **Safety Transparency:** Pre-flight eligibility badges immediately signal qualified vs. missing training certificates before reservation.
- **Clarity of Accountability:** Step-by-step progress tracking across all 10 stages of the equipment sharing lifecycle.

---

## 2. Color Palette & Hierarchy
| Token | Hex / Value | Semantic Role |
|---|---|---|
| `bg-canvas` | `#f8fafc` (Slate-50) | Root clean background |
| `surface-card` | `#ffffff` (White) | Elevated card surfaces with soft shadow |
| `accent-primary` | `#4f46e5` (Indigo-600) | Primary actions, CTA buttons |
| `semantic-success` | `#16a34a` (Green-600) | Verified certificates, clean returns |
| `semantic-warning` | `#d97706` (Amber-600) | Step 7 Check-in active, quota warnings |
| `semantic-danger` | `#e11d48` (Rose-600) | Step 9 Damage flags, missing prerequisites |

---

## 3. The 10-Step Lifecycle Component Paradigm
Every action in Nexora maps to an auditable step:
1. **Listing Created:** Owner sets specs, hourly rate, deposit, and required training badges.
2. **Eligibility Checked:** Automated verification of operator certifications.
3. **Request Submitted:** Purpose-weighted access request.
4. **Fair Allocation Scored:** Transparent anti-monopoly scoring algorithm.
5. **Manager Oversight:** Human-in-the-loop review.
6. **Pass Authorized:** Passcode and digital signature generated.
7. **Check-In Studio:** Baseline condition photo upload & safety checklists.
8. **Return Studio:** Handover condition inspection & consumables logging.
9. **Dispute & Damage Resolution:** AI vision discrepancy detection & deposit adjudication.
10. **Immutable Ledger:** Tamper-evident transaction timeline.

---

## 4. Accessibility & Inclusive Design (WCAG 2.1 AA)
- High contrast text (`#0f172a` text on `#f8fafc` canvas = 17:1 contrast ratio, far exceeding AA standards).
- Visual status indicators paired with explicit textual labels (never color alone).
- Full keyboard focus rings (`focus:ring-2 focus:ring-indigo-600`).
