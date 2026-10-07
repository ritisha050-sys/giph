/* ---------------- VIEW 4: EVIDENCE EVALUATION ---------------- */
const METRIC_TEMPLATES = {
  p1: [{name:"Time to detect overcrowding", base:"Reactive only (post-incident reports)", pilot:"Under 90 seconds", improve:92},
       {name:"Supervisor alerts per week", base:"0 (manual walk-throughs)", pilot:"~140 automated alerts", improve:80}],
  p2: [{name:"Grievance routing time", base:"2.4 days", pilot:"11 minutes", improve:87},
       {name:"Mis-routed cases", base:"31%", pilot:"6%", improve:81}],
  p3: [{name:"Leak localisation time", base:"9-14 days (manual survey)", pilot:"36 hours", improve:78},
       {name:"Non-revenue water loss", base:"28%", pilot:"19% (pilot zone)", improve:32}],
  p4: [{name:"Verification time per taluka", base:"6-8 weeks", pilot:"9 days", improve:74},
       {name:"Field visits required", base:"100%", pilot:"22% (flagged cases only)", improve:78}]
};
function renderEval(){
  if(pilots.length===0) return `<div class="empty">No completed pilots yet.</div>`;
  const pilot = getPilot(state.selectedPilotId) || pilots[pilots.length-1];
  const problem = getProblem(pilot.problemId);
  const startup = getStartup(pilot.startupId);
  const metrics = METRIC_TEMPLATES[problem.id] || METRIC_TEMPLATES.p1;
  const avgImprove = Math.round(metrics.reduce((a,m)=>a+m.improve,0)/metrics.length);
  const recommend = avgImprove >= 30;
  evaluations[pilot.id] = { avgImprove, recommend };
  return `
  <div class="docket-head">
    <div><h2>Evidence Evaluation</h2><div class="sub">${startup.name} pilot on ${problem.ref} — ${problem.title}</div></div>
    <span class="ref">${pilot.id.toUpperCase()}</span>
  </div>

  <div class="panel">
    <h3>Baseline vs. pilot outcome</h3>
    <table>
      <tr><th>Metric</th><th>Baseline (pre-pilot)</th><th>Pilot outcome</th><th>Improvement</th></tr>
      ${metrics.map(m=>`<tr><td>${m.name}</td><td>${m.base}</td><td>${m.pilot}</td>
        <td><div style="display:flex; align-items:center; gap:8px;"><div class="barwrap"><div class="bar good" style="width:${m.improve}%"></div></div><span class="mono">${m.improve}%</span></div></td></tr>`).join("")}
    </table>
  </div>

  <div class="panel">
    <h3>Recommendation</h3>
    <div style="display:flex; align-items:center; gap:18px; flex-wrap:wrap;">
      <div class="cmp" style="border:none; grid-template-columns:auto auto;">
        <div style="padding:0 20px 0 0;"><div class="foot-note">Average improvement across metrics</div><div class="big mono">${avgImprove}%</div></div>
      </div>
      <span class="pill ${recommend?'forest':'brick'}" style="font-size:13px; padding:7px 16px;">${recommend ? "GO — recommend procurement" : "NO-GO — needs a second pilot cycle"}</span>
    </div>
    <p class="foot-note" style="margin-top:12px;">Threshold: ≥30% average improvement over baseline, with no unresolved compliance flags, triggers a GO recommendation.</p>
    ${recommend ? `<div style="margin-top:14px;"><button class="btn" onclick="state.view='procure'; render();">Proceed to Procurement Bridge</button></div>` : ""}
  </div>`;
}
