# 📐 Nexora Wireframes & UI Component Architecture

This document documents the layout specifications for the Nexora application.

---

## 1. Top Navigation & Persona Switcher Bar
```
+-----------------------------------------------------------------------------------------------------------------+
| [CPU Icon] Nexora [Trust OS]       [Catalog]  [My Lifecycle (10)]  [Lab Control]  [AI Studio]  [Audit Trail]   |
| Multi-Tenant Safety Fabric         ------------------------------------------------------------------------   |
|                                                     [+ List Resource]   [Avatar] Alex Rivera (94% Trust) [v]   |
+-----------------------------------------------------------------------------------------------------------------+
```

---

## 2. 10-Step Interactive Lifecycle Stepper (Hero Component)
```
+-----------------------------------------------------------------------------------------------------------------+
| END-TO-END RESOURCE SHARING LIFECYCLE                                    [10-Step Hackathon Workflow Verified] |
| +-------------------------------------------------------------------------------------------------------------+ |
| | [01 Listed] [02 Eligible] [03 Request] [04 Fair Score] [05 Review] [06 Decision] [07 Checkin] [08 Return]... | |
| +-------------------------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------------------------+
```

---

## 3. Catalog & AI Natural Language Matcher
```
+-----------------------------------------------------------------------------------------------------------------+
| Unlock Underused Institutional Spaces, Equipment & Tools                                                        |
| +-------------------------------------------------------------------------------------------------------------+ |
| | [Sparkles] "Need 4-axis CNC mill to machine titanium parts on Friday afternoon"           [ AI Match ]      | |
| +-------------------------------------------------------------------------------------------------------------+ |
| Quick prompts: [4-Axis CNC Titanium] [FEI SEM Nanotech] [High-Speed Optics]                                     |
+-----------------------------------------------------------------------------------------------------------------+
| Categories: (All)  (Fabrication & CNC)  (Scientific Equipment)  (Cleanrooms & Studios)  (Robotics Flight Arena) |
+-----------------------------------------------------------------------------------------------------------------+
| +--------------------------+ +--------------------------+ +--------------------------+                          |
| | [Image: Haas VF-2 CNC]   | | [Image: Confocal Micro]  | | [Image: Class 5 Cleanrm] |                          |
| | Haas VF-2 4-Axis CNC     | | Leica TCS SP8 Confocal   | | ISO Class 5 Cleanroom    |                          |
| | Required: CNC Operator   | | Required: Laser Safety 2 | | Required: Cleanroom 1000 |                          |
| | $35/hr ($150 dep)        | | $55/hr ($200 dep)        | | $80/hr ($400 dep)        |                          |
| | [ Request Access (1-4) ] | | [ Request Access (1-4) ] | | [ Request Access (1-4) ] |                          |
| +--------------------------+ +--------------------------+ +--------------------------+                          |
+-----------------------------------------------------------------------------------------------------------------+
```

---

## 4. Check-In Studio Modal (Step 7)
```
+------------------------------------------------------------------------------------+
| Step 7 in Sharing Lifecycle: Check-In & Initial Condition Documentation       [ X ] |
+------------------------------------------------------------------------------------+
| Booking Ref: NX-8923 | Phantom v2512 Ultra High-Speed Camera                       |
|                                                                                    |
| [Pristine]  [*] [Good (Normal)]  [Fair (Minor Wear)]  [Pre-Existing Wear Noted]    |
|                                                                                    |
| Safety Checklist:                                                                  |
| [x] Emergency Stop tested & functional                                             |
| [x] PPE (Goggles/Lab Coat) donned                                                  |
| [x] Workbay clean and free of combustible debris                                   |
| [x] Documented pre-existing scratches (protects user against false blame)          |
|                                                                                    |
| Baseline Inspection Notes:                                                         |
| [ Clean bed, power-on self-test passed cleanly. Minor scuff on base plate.       ] |
|                                                                                    |
| Station Inspection Photo URL: [ https://...                                      ] |
|                                                                                    |
|                                         [ Cancel ]   [ Complete Check-In (Step 7) ]|
+------------------------------------------------------------------------------------+
```
