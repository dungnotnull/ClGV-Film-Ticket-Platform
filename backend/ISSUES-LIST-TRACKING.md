# ISSUES-LIST-TRACKING.md - Backend Issues & Bug Fix Tracking Log

> **NOTICE FOR BE-AGENT**:
> This document tracks all backend issues, race conditions, edge cases, bugs, and resolution status.
> Whenever a bug is discovered or fixed in `/backend`, record it here with reproduction steps and root cause analysis.

---

## 📊 Issues Summary Dashboard

* **Total Reported**: 0
* **Open / Investigating**: 0
* **Resolved**: 0

---

## 🐛 Issues & Bugs Log

| Issue ID | Module | Severity | Summary / Symptom | Status | Reported Date | Fixed Date | Fix Summary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| *No issues recorded yet* | - | - | - | - | - | - | - |

---

## 📝 Issue Template (Copy for new issues)

```markdown
### [ISSUE-BE-XXX] Issue Title Here

* **Module**: `booking` / `websocket` / `showtime` / `ticket` / `auth`
* **Severity**: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`
* **Status**: `OPEN` / `IN_PROGRESS` / `RESOLVED` / `CLOSED`
* **Date Reported**: YYYY-MM-DD
* **Assigned Agent**: `BE-Agent`

#### Symptom & Description
Detailed explanation of what went wrong or failed during development/testing.

#### Reproduction Steps
1. Step 1
2. Step 2

#### Expected Behavior vs Actual Behavior
* **Expected**: ...
* **Actual**: ...

#### Root Cause Analysis
Technical explanation of why the failure occurred (e.g. race condition, missing Redis key TTL handling, unindexed query).

#### Fix Details & Resolution
* **Commit/Pull Request**: ...
* **Files Modified**: `file:///d:/ClGV-Film-Ticket-Platform/backend/...`
* **Verification**: (Vitest unit test / Supertest / K6 load test script results)
```
