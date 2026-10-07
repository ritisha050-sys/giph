/* ---------------- VIEW 6: SCALE-UP ---------------- */
function renderScale(){
  const procuredPilots = Object.keys(procurements);
  if(procuredPilots.length===0) return `<div class="empty">No procured solutions yet — issue a Letter of Award in Procurement Bridge first.</div>`;
  const pilotId = procuredPilots[procuredPilots.length-1];
  const pilot = getPilot(pilotId);
  const problem = getProblem(pilot.problemId);
  const startup = getStartup(pilot.startupId);
  const rollout = scaleups[pilotId];
  return `
  <div class="docket-head">
    <div><h2>Scale-Up Tracker</h2><div class="sub">${startup.name}'s validated solution, replicated across adopters</div></div>
    <span class="ref">${problem.ref}</span>
  </div>

  <div class="panel">
    <h3>Replication pipeline</h3>
    <table>
      <tr><th>Adopter</th><th>Onboarding basis</th><th>Progress</th></tr>
      ${rollout.map(r=>`<tr><td>${r.dept}</td><td>Reuses existing pilot evidence — 30-day onboarding, no new pilot required</td>
        <td><div style="display:flex; align-items:center; gap:8px;"><div class="barwrap"><div class="bar ${r.pct>0?'good':''}" style="width:${r.pct}%"></div></div><span class="mono">${r.pct}%</span></div></td></tr>`).join("")}
    </table>
    <p class="foot-note" style="margin-top:12px;">Because the solution already cleared Evidence Evaluation once, downstream adopters skip straight to a shortened compliance check — this is the mechanism that turns one pilot into a reusable public asset.</p>
  </div>

  <div class="panel">
    <h3>Why this matters</h3>
    <p class="foot-note">Standard path: every department re-runs its own tender + pilot from zero, ~8-10 months per adopter.<br>GIPH path: first adopter validates, every subsequent adopter reuses the evidence — cutting repeat evaluation cost and time by roughly 70%.</p>
  </div>`;
}
