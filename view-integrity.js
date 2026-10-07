/* ---------------- VIEW 7: INTEGRITY RADAR ---------------- */
/* This module is GIPH's "wow feature": every match, shortlist, and
   override in the platform is cross-checked, live, against a director /
   evaluating-official conflict-of-interest graph — and any human attempt
   to bypass the AI ranking (or push a flagged startup through anyway)
   gets forced into a public, timestamped justification. Nothing here
   changes the match score itself; Integrity Radar is a separate,
   independent check specifically so it can't be gamed by tuning the AI. */

function renderIntegrity(){
  const conflicts = allConflicts();
  const critical = conflicts.filter(c=>c.level==="critical");
  const medium = conflicts.filter(c=>c.level==="medium");

  return `
  <div class="docket-head">
    <div><h2>Integrity Radar</h2><div class="sub">Live conflict-of-interest monitoring across every official ↔ startup pairing, plus a permanent override audit trail.</div></div>
  </div>

  <div class="panel">
    <h3>Live conflict graph</h3>
    <div class="graph-wrap">${renderConflictGraphSVG(conflicts)}</div>
    <div class="legend">
      <span><span class="sw" style="background:var(--navy)"></span> Evaluating official</span>
      <span><span class="sw" style="background:#fff; border:1.5px solid var(--ochre);"></span> Startup</span>
      <span><span class="sw" style="background:var(--brick)"></span> Critical — surname + address match</span>
      <span><span class="sw" style="background:var(--ochre)"></span> Medium — surname match only</span>
    </div>
    <p class="foot-note" style="margin-top:10px;">Recomputed on every render, straight from the director/official registry — not a one-time audit. In production this cross-checks MCA21 director filings and GeM vendor records instead of the mock registry used here.</p>
  </div>

  <div class="panel ${critical.length?'warn':''}">
    <h3>Detected flags (${conflicts.length})</h3>
    ${conflicts.length===0 ? `<div class="empty">No conflicts detected against the current official ↔ director registry.</div>` : `
    <table>
      <tr><th>Severity</th><th>Evaluating official</th><th>Department</th><th>Startup</th><th>Basis</th></tr>
      ${conflicts.sort((a,b)=> (a.level==='critical'?0:1) - (b.level==='critical'?0:1)).map(c=>`
        <tr class="${c.level==='critical'?'flagged':''}">
          <td><span class="risk-dot ${c.level}"></span>${c.level==='critical'?'Critical':'Medium'}</td>
          <td>${c.official.name}</td>
          <td>${c.official.dept}</td>
          <td>${c.startup.name}</td>
          <td class="foot-note">${c.reason}</td>
        </tr>`).join("")}
    </table>`}
    <p class="foot-note" style="margin-top:10px;">Critical flags block a one-click shortlist in AI Matching — proceeding requires the logged justification below. Medium flags are shown as a "Review" badge but don't force a justification on their own.</p>
  </div>

  <div class="panel">
    <h3>Override audit log (${auditLog.length})</h3>
    ${auditLog.length===0 ? `<div class="empty">No overrides logged yet. Try shortlisting a flagged startup, or one that isn't the AI's top pick, in 02 · AI Matching.</div>` : `
    <table>
      <tr><th>Logged at</th><th>Docket</th><th>Selected</th><th>AI top pick</th><th>Flag at time</th><th>Justification</th></tr>
      ${[...auditLog].reverse().map(a=>{
        const problem = getProblem(a.problemId);
        const startup = getStartup(a.startupId);
        const topPick = a.topPickId ? getStartup(a.topPickId) : null;
        return `<tr>
          <td class="mono foot-note">${fmtTime(a.ts)}</td>
          <td>${problem ? problem.ref : '—'}</td>
          <td>${startup ? startup.name : '—'}</td>
          <td>${a.overrodeTopPick && topPick ? topPick.name : '<span class="foot-note">— was top pick —</span>'}</td>
          <td><span class="pill ${a.conflictLevel==='critical'?'brick':a.conflictLevel==='medium'?'ochre':'slate'}">${a.conflictLevel}</span></td>
          <td class="foot-note">${a.justification}</td>
        </tr>`;
      }).join("")}
    </table>`}
    <p class="foot-note" style="margin-top:10px;">This log is append-only within the session: every entry stays visible on this page for the lifetime of the docket, regardless of what happens afterward in Pilot Sandbox or Procurement Bridge.</p>
  </div>`;
}

/* Builds an SVG bipartite graph: officials on the left, startups on the
   right, with an edge drawn only where checkConflict() found something. */
function renderConflictGraphSVG(conflicts){
  const W = 640, H = 60 + Math.max(officials.length, startups.length) * 52;
  const leftX = 130, rightX = W - 130;

  const oPos = {};
  officials.forEach((o,i)=>{ oPos[o.id] = { x:leftX, y: 50 + i * ((H-100)/Math.max(officials.length-1,1)) + 25 }; });
  const sPos = {};
  startups.forEach((s,i)=>{ sPos[s.id] = { x:rightX, y: 50 + i * ((H-100)/Math.max(startups.length-1,1)) + 25 }; });

  const edges = conflicts.map(c=>{
    const a = oPos[c.official.id], b = sPos[c.startup.id];
    const color = c.level === "critical" ? "var(--brick)" : "var(--ochre)";
    const width = c.level === "critical" ? 2.4 : 1.4;
    return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${width}" opacity="0.85"/>`;
  }).join("");

  const officialNodes = officials.map(o=>{
    const p = oPos[o.id];
    return `
      <circle cx="${p.x}" cy="${p.y}" r="15" fill="var(--navy)"/>
      <text x="${p.x - 24}" y="${p.y + 4}" text-anchor="end" font-size="11.5" font-family="IBM Plex Sans, sans-serif" fill="var(--ink)">${o.name}</text>
      <text x="${p.x - 24}" y="${p.y + 17}" text-anchor="end" font-size="9.5" font-family="IBM Plex Sans, sans-serif" fill="var(--slate)">${o.dept}</text>`;
  }).join("");

  const startupNodes = startups.map(s=>{
    const p = sPos[s.id];
    const flagged = conflicts.some(c=>c.startup.id===s.id && c.level==='critical');
    return `
      <circle cx="${p.x}" cy="${p.y}" r="15" fill="#fff" stroke="${flagged?'var(--brick)':'var(--ochre)'}" stroke-width="2"/>
      <text x="${p.x + 24}" y="${p.y + 4}" text-anchor="start" font-size="11.5" font-family="IBM Plex Sans, sans-serif" fill="var(--ink)">${s.name}</text>`;
  }).join("");

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block;">
    ${edges}
    ${officialNodes}
    ${startupNodes}
  </svg>`;
}
