# GIPH — Government Innovation Procurement Hub

Interactive prototype for SIH: a 6-stage government-to-startup procurement
pipeline (Problem Intake → AI Matching → Pilot Sandbox → Evidence Evaluation
→ Procurement Bridge → Scale-Up), plus a 7th module: **Integrity Radar**,
a live conflict-of-interest layer sitting on top of AI Matching.

No build step, no dependencies. Open `index.html` in a browser, or in
VS Code use the **Live Server** extension (right-click `index.html` →
"Open with Live Server") so the Google Fonts link and relative paths
resolve cleanly.

## Structure

```
giph-project/
├── index.html          shell: sidebar + font/CSS links + script tags, no logic
├── css/
│   └── styles.css       all styling (design tokens as CSS custom properties)
└── js/
    ├── data.js           mock problems / startups / officials / app state
    ├── helpers.js        formatting, match scoring, conflict-detection engine
    ├── render-shell.js   sidebar, stat strip, top-level render(), override modal
    ├── view-intake.js    01 · Problem Intake
    ├── view-matching.js  02 · AI Matching (now conflict-aware)
    ├── view-pilot.js     03 · Pilot Sandbox
    ├── view-eval.js      04 · Evidence Evaluation
    ├── view-procure.js   05 · Procurement Bridge
    ├── view-scale.js     06 · Scale-Up
    ├── view-integrity.js 07 · Integrity Radar (new)
    └── app.js            boots the first render()
```

Scripts are loaded as plain (non-module) `<script>` tags in dependency
order, so every function stays in one global scope — same pattern as the
original single-file prototype, just split across files instead of one
blob, and every `onclick="..."` in the HTML strings still resolves.

## Integrity Radar — the added feature

The pitch: procurement platforms streamline paperwork, but the actual
reason a well-connected incumbent beats a better startup is rarely a
missing form — it's a quiet conflict of interest nobody checked for.
Integrity Radar checks for it, automatically, on every match.

**How it works in this prototype:**

- Each startup carries a `directors` list (name + registered address).
  Each government department has one `official` of record (also name +
  address). This mock registry stands in for a production integration
  with MCA21 director filings and GeM vendor records.
- `checkConflict()` in `helpers.js` cross-checks a startup's directors
  against the relevant official on every AI Matching render — independent
  of the match score, so it can't be gamed by tuning the ranking model.
  - **Critical**: surname *and* address match → shortlisting is blocked
    behind a forced justification.
  - **Medium**: surname matches, address doesn't → shown as a "Review"
    badge, doesn't block on its own.
- **Override audit log**: shortlisting a startup that either (a) isn't
  the AI's top-ranked candidate, or (b) carries a critical flag, opens a
  modal that requires a written justification before the pilot is
  created. Every override is logged with a timestamp and stays visible
  on the Integrity Radar page for the rest of the session.
- **Live conflict graph**: an SVG bipartite graph (officials ↔ startups)
  on the Integrity Radar page, redrawn from the same registry on every
  render, with edges colored by severity.

**Demo script:** open a fresh docket in **02 · AI Matching** for
*GIPH-2026-009 — Water leakage detection* (Jal Shakti). AquaSense Labs
ranks #1 on pure merit. Click through to shortlist it — Integrity Radar
stops you: AquaSense's director shares a name *and* registered address
with the Jal Shakti evaluating official. That's the jaw-drop beat. Try
overriding it (or picking a non-top-ranked candidate anywhere else) and
watch the entry land in **07 · Integrity Radar**'s audit log.

## Known scope limits (honest, for the judges)

This is a front-end prototype with mock, in-memory data — nothing
persists on reload, there's no backend, and the director/official
registry is hand-authored rather than pulled from a real government
data source. The wider write-up this was built from also describes
several other enhancements (blockchain-anchored evidence ledger, live
telemetry ingestion, citizen feedback, offline-first field app, etc.)
that are **not** implemented here — Integrity Radar was the one feature
built out in full, end-to-end, as the differentiator.
