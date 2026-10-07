/* ---------------- VIEW 3: PILOT SANDBOX ---------------- */
const MS_LABELS = ["Kickoff & sandbox onboarding","Mid-pilot review","Field completion & sign-off"];
function renderPilot(){
  if(pilots.length===0) return `<div class="empty">No pilots yet. Shortlist a startup from 02 · AI Matching.</div>`;
  const pilot = getPilot(state.selectedPilotId) || pilots[pilots.length-1];
  state.selectedPilotId = pilot.id;
  const problem = getProblem(pilot.problemId);
  const startup = getStartup(pilot.startupId);
  return `
  <div class="docket-head">
    <div><h2>${startup.name} × ${problem.dept}</h2><div class="sub">Pilot sandbox for ${problem.ref} — ${problem.title}</div></div>
    <span class="ref">${pilot.id.toUpperCase()}</span>
  </div>

  ${pilots.length>1 ? `<div class="panel"><h3>All pilots</h3><table><tr><th>Pilot</th><th>Startup</th><th>Docket</th><th>Stage</th></tr>
    ${pilots.map(p=>`<tr class="clickable ${p.id===pilot.id?'selected':''}" onclick="state.selectedPilotId='${p.id}'; render();">
      <td class="mono">${p.id.toUpperCase()}</td><td>${getStartup(p.startupId).name}</td><td>${getProblem(p.problemId).ref}</td>
      <td><span class="pill ${p.milestoneIdx>=2?'forest':'ochre'}">${MS_LABELS[p.milestoneIdx]}</span></td></tr>`).join("")}
    </table></div>` : ""}

  <div class="panel">
    <h3>Sandbox terms</h3>
    <div class="grid2">
      <div>
        <p class="foot-note"><b>Pilot value:</b> <span class="mono">${fmtINR(pilot.budget)}</span> (40% of full-scope ceiling, released in tranches)</p>
        <p class="foot-note"><b>Procurement exemption:</b> EMD waived, turnover threshold relaxed under startup pilot provision — full-scope tender rules apply only after Procurement Bridge</p>
        <p class="foot-note"><b>Duration:</b> 8 weeks</p>
      </div>
      <div>
        <p class="foot-note"><b>Startup:</b> ${startup.name} (${startup.hq})</p>
        <p class="foot-note"><b>DPIIT recognised:</b> ${startup.dpiit?"Yes":"No"} &nbsp; <b>GeM registered:</b> ${startup.gem?"Yes":"No"}</p>
      </div>
    </div>
  </div>

  <div class="panel">
    <h3>Milestones</h3>
    <div class="milestones">
      ${MS_LABELS.map((l,i)=>`<div class="ms ${i<pilot.milestoneIdx?'done':i===pilot.milestoneIdx?'active':''}"><div class="dot"></div><div class="lab">${l}</div></div>`).join("")}
    </div>
    <div style="margin-top:18px;">
      ${pilot.milestoneIdx < MS_LABELS.length-1
        ? `<button class="btn" onclick="advancePilot('${pilot.id}')">Mark "${MS_LABELS[pilot.milestoneIdx]}" complete</button>`
        : `<button class="btn ochre" onclick="state.view='eval'; render();">Pilot complete → go to Evidence Evaluation</button>`}
    </div>
  </div>`;
}
function advancePilot(id){
  const pilot = getPilot(id);
  pilot.milestoneIdx = clamp(pilot.milestoneIdx+1, 0, MS_LABELS.length-1);
  render();
}
