/* ---------------- VIEW 2: MATCHING ---------------- */
function renderMatching(){
  const problem = getProblem(state.selectedProblemId);
  if(!problem) return `<div class="empty">Select a docket in Problem Intake first.</div>`;
  const official = getOfficialForDept(problem.dept);
  const scored = startups
    .map(s => ({ s, m: matchScore(s, problem), c: conflictForProblem(s, problem) }))
    .sort((a,b)=>b.m.total - a.m.total);
  const topPickId = scored[0].s.id;
  const topHasCritical = scored[0].c.level === "critical";

  return `
  <div class="docket-head">
    <div><h2>${problem.title}</h2><div class="sub">${problem.dept} · requires TRL ${problem.trl}+ · budget ceiling ${fmtINR(problem.budget)}</div></div>
    <span class="ref">${problem.ref}</span>
  </div>
  <div class="panel">
    <h3>Ranked candidates</h3>
    <table>
      <tr><th>Startup</th><th>Domain fit</th><th>TRL fit</th><th>Track record</th><th>Compliance</th><th>Match</th><th>Integrity</th><th></th></tr>
      ${scored.map(({s,m,c})=>`
        <tr class="${c.level==='critical'?'flagged':''}">
          <td><b>${s.name}</b><br><span class="foot-note">${s.hq} · TRL ${s.trl}</span></td>
          <td><div class="barwrap"><div class="bar" style="width:${m.domainFit}%"></div></div></td>
          <td><div class="barwrap"><div class="bar" style="width:${m.trlFit}%"></div></div></td>
          <td><div class="barwrap"><div class="bar" style="width:${m.pastPerf}%"></div></div></td>
          <td><div class="barwrap"><div class="bar ${m.compliance>=100?'good':m.compliance===0?'bad':''}" style="width:${m.compliance}%"></div></div></td>
          <td class="mono" style="font-weight:600; font-size:15px;">${m.total}</td>
          <td>${c.level==='critical' ? `<span class="pill brick"><span class="risk-dot critical"></span>Conflict</span>`
              : c.level==='medium' ? `<span class="pill ochre"><span class="risk-dot medium"></span>Review</span>`
              : `<span class="pill forest"><span class="risk-dot none"></span>Clear</span>`}</td>
          <td>${state.selectedStartupId===s.id ? `<button class="btn" onclick="attemptShortlist('${problem.id}','${s.id}','${topPickId}','${c.level}')">Shortlist → pilot</button>` : `<button class="btn ghost" onclick="state.selectedStartupId='${s.id}'; render();">Select</button>`}</td>
        </tr>`).join("")}
    </table>
    <p class="foot-note">Match score = domain fit (40%) + TRL readiness (25%) + past government pilot track record (20%) + DPIIT / GeM compliance (15%). Integrity column is computed independently by <b>Integrity Radar</b> — it never feeds the match score, so it can't be gamed by tuning the AI ranking.</p>
    ${official ? `<p class="foot-note">Evaluating official of record for ${problem.dept}: <b>${official.name}</b>.</p>` : ""}
    ${topHasCritical ? `<div class="conflict-note"><b>⚠ Integrity Radar:</b> the AI's top-ranked candidate on pure merit, <b>${scored[0].s.name}</b>, has a critical conflict-of-interest flag against the evaluating official for this docket. See <b>07 · Integrity Radar</b> for details before shortlisting.</div>` : ""}
  </div>`;
}

/* Gate any shortlist that either (a) overrides the AI's top pick, or
   (b) has a critical Integrity Radar flag, behind a logged justification. */
function attemptShortlist(problemId, startupId, topPickId, conflictLevel){
  const overridesTop = startupId !== topPickId;
  if(overridesTop || conflictLevel === "critical"){
    state.pendingOverride = { problemId, startupId, topPickId, conflictLevel };
    render();
    return;
  }
  createPilot(problemId, startupId);
}

function createPilot(problemId, startupId){
  const id = "pilot" + (pilotSeq++);
  const problem = getProblem(problemId);
  pilots.push({ id, problemId, startupId, milestoneIdx: 0, budget: Math.round(problem.budget * 0.4) });
  problem.status = "Piloting";
  state.selectedPilotId = id;
  state.view = "pilot";
  render();
}
