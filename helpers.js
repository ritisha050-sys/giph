/* ---------------- HELPERS ---------------- */
function fmtINR(n){ return "₹" + (n/100000).toFixed(1) + "L"; }
function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }
function fmtTime(d){ return d.toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }); }

function matchScore(startup, problem){
  const overlap = startup.domains.filter(d => problem.domains.includes(d)).length;
  const domainFit = clamp((overlap / problem.domains.length) * 100, 0, 100);
  const trlFit = clamp(100 - Math.abs(startup.trl - problem.trl) * 15, 0, 100);
  const pastPerf = clamp(startup.pastGovtPilots * 35, 0, 100);
  const compliance = (startup.dpiit && startup.gem) ? 100 : (startup.dpiit || startup.gem) ? 50 : 0;
  const total = domainFit*0.40 + trlFit*0.25 + pastPerf*0.20 + compliance*0.15;
  return { total: Math.round(total), domainFit: Math.round(domainFit), trlFit: Math.round(trlFit), pastPerf: Math.round(pastPerf), compliance: Math.round(compliance) };
}

function getProblem(id){ return problems.find(p=>p.id===id); }
function getStartup(id){ return startups.find(s=>s.id===id); }
function getPilot(id){ return pilots.find(p=>p.id===id); }
function getOfficialForDept(dept){ return officials.find(o=>o.dept===dept); }

/* ---------------- INTEGRITY RADAR: conflict engine ---------------- */
function surname(fullName){
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length-1].toLowerCase();
}
function sameAddress(a,b){ return a.trim().toLowerCase() === b.trim().toLowerCase(); }

/* Checks a single startup against a single official and returns the
   highest-severity conflict found among its directors.
   level: "critical" | "medium" | "none" */
function checkConflict(startup, official){
  if(!official || !startup.directors || startup.directors.length===0){
    return { level:"none", reason:null, director:null };
  }
  let best = { level:"none", reason:null, director:null };
  for(const d of startup.directors){
    const nameMatch = surname(d.name) === surname(official.name);
    const addrMatch = sameAddress(d.address, official.address);
    if(nameMatch && addrMatch){
      return { level:"critical", director:d,
        reason:`Director ${d.name} shares both surname and registered address with evaluating official ${official.name} (${official.dept}).` };
    }
    if(nameMatch && best.level!=="critical"){
      best = { level:"medium", director:d,
        reason:`Director ${d.name} shares a surname with evaluating official ${official.name} (${official.dept}) — address does not match.` };
    }
  }
  return best;
}

/* Conflict of a startup against the official for a given problem's department. */
function conflictForProblem(startup, problem){
  return checkConflict(startup, getOfficialForDept(problem.dept));
}

/* Full conflict matrix across every startup × every official — used to
   draw the network graph and the summary table on the Integrity Radar page. */
function allConflicts(){
  const rows = [];
  for(const o of officials){
    for(const s of startups){
      const c = checkConflict(s, o);
      if(c.level !== "none") rows.push({ official:o, startup:s, ...c });
    }
  }
  return rows;
}

function logOverride({ problemId, startupId, topPickId, conflictLevel, justification }){
  auditLog.push({
    ts: new Date(),
    problemId, startupId, topPickId, conflictLevel,
    overrodeTopPick: topPickId && topPickId !== startupId,
    justification
  });
}
