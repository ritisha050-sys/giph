/* ---------------- RENDER: SHELL ---------------- */
function renderSidebar(){
  const ul = document.getElementById("stagelist");
  const hasCriticalConflicts = allConflicts().some(c => c.level === "critical");
  ul.innerHTML = STAGES.map(s => `
    <li><button class="stagebtn ${state.view===s.id?'active':''} ${s.id==='integrity' && hasCriticalConflicts ? 'alert' : ''}" onclick="setView('${s.id}')">
      <span class="num">${s.num}</span><span>${s.label}</span>
    </button></li>
  `).join("");
}

function setView(v){ state.view = v; render(); }

function renderStatStrip(){
  const activePilots = pilots.filter(p => !procurements[p.id]).length;
  const procured = Object.keys(procurements).length;
  const criticalCount = allConflicts().filter(c=>c.level==="critical").length;
  return `
  <div class="statstrip">
    <div class="stat"><div class="n mono">${problems.length}</div><div class="l">Active dockets</div></div>
    <div class="stat"><div class="n mono">${startups.length}</div><div class="l">Startups onboarded</div></div>
    <div class="stat"><div class="n mono">${activePilots}</div><div class="l">Pilots running</div></div>
    <div class="stat"><div class="n mono">${procured ? "62 days" : "—"}</div><div class="l">Avg. time to contract (vs 180 std.)</div></div>
    <div class="stat"><div class="n mono ${criticalCount?'warn':''}">${criticalCount}</div><div class="l">Integrity Radar: critical flags</div></div>
  </div>`;
}

function render(){
  renderSidebar();
  const main = document.getElementById("main");
  main.innerHTML = renderStatStrip() + ({
    intake: renderIntake,
    matching: renderMatching,
    pilot: renderPilot,
    eval: renderEval,
    procure: renderProcure,
    scale: renderScale,
    integrity: renderIntegrity
  }[state.view])();
  renderOverrideModal();
}

/* ---------------- Override justification modal ---------------- */
function renderOverrideModal(){
  const root = document.getElementById("modal-root");
  if(!state.pendingOverride){ root.innerHTML = ""; return; }
  const { problemId, startupId, topPickId, conflictLevel } = state.pendingOverride;
  const startup = getStartup(startupId);
  const topPick = topPickId ? getStartup(topPickId) : null;
  const reasons = [];
  if(conflictLevel === "critical") reasons.push("Integrity Radar has flagged a critical conflict of interest for this startup against the evaluating official for this docket.");
  if(topPick && topPick.id !== startupId) reasons.push(`This overrides the AI's top-ranked candidate (${topPick.name}).`);
  root.innerHTML = `
  <div class="modal-backdrop">
    <div class="modal">
      <h3>Justification required</h3>
      <p>${reasons.join(" ")}</p>
      <p>Shortlisting <b>${startup.name}</b> requires a public, logged justification before it can proceed. This entry is permanent and visible on the Integrity Radar audit trail.</p>
      <label>Written justification</label>
      <textarea id="override-justification" placeholder="Explain why this candidate is being selected despite the flag..."></textarea>
      <div class="actions">
        <button class="btn ghost" onclick="cancelOverride()">Cancel</button>
        <button class="btn brick" onclick="confirmOverride()">Log justification &amp; proceed</button>
      </div>
    </div>
  </div>`;
}
function cancelOverride(){ state.pendingOverride = null; render(); }
function confirmOverride(){
  const text = document.getElementById("override-justification").value.trim();
  if(!text){ alert("A written justification is required to proceed."); return; }
  const { problemId, startupId, topPickId, conflictLevel } = state.pendingOverride;
  logOverride({ problemId, startupId, topPickId, conflictLevel, justification: text });
  state.selectedStartupId = startupId;
  state.pendingOverride = null;
  createPilot(problemId, startupId);
}
