/* ---------------- VIEW 1: INTAKE ---------------- */
function renderIntake(){
  const np = state.newProblem;
  return `
  <div class="docket-head">
    <div><h2>Problem Intake</h2><div class="sub">Departments file operational problems as public dockets; AI tags them for matching.</div></div>
  </div>

  <div class="grid2">
    <div class="panel">
      <h3>File a new docket</h3>
      <label>Department</label>
      <select onchange="np('dept', this.value)">
        ${["Urban Local Bodies","Public Grievances","Jal Shakti (Water Resources)","Revenue Department","Health & Family Welfare","Transport"].map(d=>`<option ${np.dept===d?'selected':''}>${d}</option>`).join("")}
      </select>
      <label>Problem title</label>
      <input type="text" value="${np.title}" oninput="np('title', this.value)" placeholder="e.g. Overflowing storm drains go unreported until flooding">
      <label>Description</label>
      <textarea oninput="np('desc', this.value)" placeholder="What's failing today, and what would 'solved' look like?">${np.desc}</textarea>
      <label>Relevant domains (AI will refine these on submit)</label>
      <div class="tags">
        ${DOMAIN_OPTIONS.map(d=>`<div class="tag ${np.domains.includes(d)?'on':''}" onclick="toggleDomain('${d}')">${d}</div>`).join("")}
      </div>
      <label>Pilot budget ceiling: <span class="mono">${fmtINR(np.budget)}</span></label>
      <input type="range" min="500000" max="4000000" step="100000" value="${np.budget}" oninput="np('budget', parseInt(this.value))">
      <label>Minimum technology readiness (TRL): <span class="mono">${np.trl}</span></label>
      <input type="range" min="1" max="9" value="${np.trl}" oninput="np('trl', parseInt(this.value))">
      <div style="margin-top:16px;"><button class="btn" onclick="submitProblem()">File docket</button></div>
    </div>

    <div class="panel">
      <h3>Open dockets (${problems.length})</h3>
      <table>
        <tr><th>Ref</th><th>Title</th><th>Dept.</th><th>Budget</th><th></th></tr>
        ${problems.map(p=>`
          <tr class="clickable ${state.selectedProblemId===p.id?'selected':''}" onclick="selectProblem('${p.id}')">
            <td class="mono">${p.ref}</td>
            <td>${p.title}</td>
            <td>${p.dept}</td>
            <td class="mono">${fmtINR(p.budget)}</td>
            <td><span class="pill ${p.status==='Matching'?'ochre':p.status==='Open'?'slate':'forest'}">${p.status}</span></td>
          </tr>`).join("")}
      </table>
      <p class="foot-note">Select a docket, then go to <b>02 · AI Matching</b> to see ranked startups.</p>
    </div>
  </div>`;
}
function np(field, val){ state.newProblem[field] = val; render(); }
function toggleDomain(d){
  const arr = state.newProblem.domains;
  const i = arr.indexOf(d);
  if(i>-1) arr.splice(i,1); else arr.push(d);
  render();
}
function selectProblem(id){ state.selectedProblemId = id; render(); }
function submitProblem(){
  const np = state.newProblem;
  if(!np.title.trim()) return;
  const id = "p" + (problems.length+1);
  const ref = "GIPH-2026-" + String(20 + problems.length).padStart(3,"0");
  problems.push({ id, ref, dept:np.dept, title:np.title, desc:np.desc || "No description provided.", domains: np.domains.length?np.domains:["IoT / Sensors"], budget:np.budget, trl:np.trl, status:"Open" });
  state.newProblem = { title:"", dept:"Urban Local Bodies", desc:"", domains:[], budget:1500000, trl:6 };
  state.selectedProblemId = id;
  render();
}
