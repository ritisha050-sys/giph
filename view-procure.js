/* ---------------- VIEW 5: PROCUREMENT BRIDGE ---------------- */
function renderProcure(){
  if(pilots.length===0) return `<div class="empty">No evaluated pilots yet.</div>`;
  const pilot = getPilot(state.selectedPilotId) || pilots[pilots.length-1];
  const evalR = evaluations[pilot.id];
  const problem = getProblem(pilot.problemId);
  const startup = getStartup(pilot.startupId);
  if(!evalR || !evalR.recommend) return `<div class="empty">This pilot hasn't cleared Evidence Evaluation with a GO recommendation yet.</div>`;
  const proc = procurements[pilot.id];
  const contractValue = problem.budget * 2.2;
  return `
  <div class="docket-head">
    <div><h2>Procurement Bridge</h2><div class="sub">${startup.name} → ${problem.dept} full-scope deployment</div></div>
    <span class="ref">${pilot.id.toUpperCase()}</span>
  </div>

  <div class="panel">
    <h3>Fast-track vs. standard tender</h3>
    <div class="cmp">
      <div class="std">
        <h4>Standard open tender</h4>
        <div class="big mono">180 days</div>
        <ul><li>Fresh EOI + technical bid + financial bid cycle</li><li>Full EMD & 3-year turnover eligibility</li><li>No pilot evidence considered</li></ul>
      </div>
      <div>
        <h4>GIPH Startup Runway</h4>
        <div class="big mono" style="color:var(--forest);">45 days</div>
        <ul><li>Single-vendor negotiated contract, scoped to validated pilot</li><li>EMD waived, turnover relaxed (startup provision)</li><li>Pilot evaluation stands in for technical bid</li></ul>
      </div>
    </div>
  </div>

  <div class="panel">
    <h3>Contract summary</h3>
    <div class="grid2">
      <div>
        <p class="foot-note"><b>Vendor:</b> ${startup.name}</p>
        <p class="foot-note"><b>Department:</b> ${problem.dept}</p>
        <p class="foot-note"><b>Scope:</b> Full deployment per ${problem.ref}</p>
      </div>
      <div>
        <p class="foot-note"><b>Contract value:</b> <span class="mono">${fmtINR(contractValue)}</span></p>
        <p class="foot-note"><b>Term:</b> 24 months, renewable</p>
        <p class="foot-note"><b>Basis:</b> Pilot evaluation ${pilot.id.toUpperCase()} (${evaluations[pilot.id].avgImprove}% avg. improvement)</p>
      </div>
    </div>
    ${proc ? `<div style="margin-top:14px;"><span class="pill forest">Letter of Award issued · ${proc.date}</span></div>`
           : `<div style="margin-top:16px;"><button class="btn" onclick="issueLoA('${pilot.id}')">Issue Letter of Award</button></div>`}
  </div>

  ${proc ? `<div style="margin-top:6px;"><button class="btn ghost" onclick="state.view='scale'; render();">View scale-up tracker</button></div>` : ""}
  `;
}
function issueLoA(pilotId){
  procurements[pilotId] = { date: "issued", value: getProblem(getPilot(pilotId).problemId).budget * 2.2 };
  getProblem(getPilot(pilotId).problemId).status = "Procured";
  scaleups[pilotId] = [
    {dept:"Same department, 3 more sites", pct:20},
    {dept:"Neighbouring municipal corporation", pct:0},
    {dept:"State-level rollout (pending budget approval)", pct:0}
  ];
  render();
}
