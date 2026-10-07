/* ---------------- DATA ---------------- */
/* Mock data for demonstration purposes only. */

const DOMAIN_OPTIONS = ["IoT / Sensors","Computer Vision","NLP / Conversational AI","GeoAI / Remote Sensing","Blockchain / Records","Predictive Analytics","Acoustic Sensing","Edge Hardware"];

let problems = [
  {
    id:"p1", ref:"GIPH-2026-014", dept:"Urban Local Bodies", title:"Real-time crowd density monitoring at municipal markets",
    desc:"Manual headcounts at 40 municipal markets miss overcrowding until it's already unsafe. Need passive sensing that flags density thresholds to market supervisors in real time.",
    domains:["IoT / Sensors","Computer Vision"], budget:1800000, trl:6, status:"Matching"
  },
  {
    id:"p2", ref:"GIPH-2026-021", dept:"Public Grievances", title:"Automated grievance triage for citizen helpline",
    desc:"Helpline receives ~4,000 grievances/week across 12 categories; manual routing adds 2-3 days before a case reaches the right desk.",
    domains:["NLP / Conversational AI","Predictive Analytics"], budget:1200000, trl:7, status:"Open"
  },
  {
    id:"p3", ref:"GIPH-2026-009", dept:"Jal Shakti (Water Resources)", title:"Water leakage detection in municipal pipelines",
    desc:"Non-revenue water loss estimated at 28% across the district network. Need continuous acoustic monitoring to localise leaks without full excavation surveys.",
    domains:["Acoustic Sensing","Edge Hardware","IoT / Sensors"], budget:2500000, trl:5, status:"Open"
  },
  {
    id:"p4", ref:"GIPH-2026-033", dept:"Revenue Department", title:"Satellite-assisted land record verification",
    desc:"Field verification of land-use mismatches takes surveyors 6-8 weeks per taluka. Need satellite-imagery cross-checks to pre-flag likely mismatches.",
    domains:["GeoAI / Remote Sensing","Predictive Analytics"], budget:3000000, trl:5, status:"Open"
  }
];

/* Startups now carry a `directors` list (name + registered address).
   This is the raw data Integrity Radar cross-checks against evaluating
   officials — it is never shown in AI Matching, only surfaced when a
   conflict is detected. */
let startups = [
  {id:"s1", name:"UrbanPulse Analytics", domains:["IoT / Sensors","Computer Vision"], trl:7, pastGovtPilots:2, dpiit:true, gem:true, hq:"Pune",
    directors:[{name:"D. Patil", address:"14 FC Road, Pune"}]},
  {id:"s2", name:"ChatSahayak AI", domains:["NLP / Conversational AI","Predictive Analytics"], trl:8, pastGovtPilots:1, dpiit:true, gem:true, hq:"Bengaluru",
    directors:[{name:"K. Menon", address:"Indiranagar, Bengaluru"}]},
  {id:"s3", name:"AquaSense Labs", domains:["Acoustic Sensing","Edge Hardware"], trl:6, pastGovtPilots:0, dpiit:true, gem:true, hq:"Coimbatore",
    directors:[{name:"A. Krishnan", address:"7 Lake View Road, Coimbatore"}]},
  {id:"s4", name:"GeoVerify Systems", domains:["GeoAI / Remote Sensing"], trl:5, pastGovtPilots:1, dpiit:true, gem:true, hq:"Hyderabad",
    directors:[{name:"P. Reddy", address:"Banjara Hills, Hyderabad"}]},
  {id:"s5", name:"CrowdLens IO", domains:["Computer Vision"], trl:5, pastGovtPilots:0, dpiit:false, gem:false, hq:"Delhi",
    directors:[{name:"V. Singh", address:"Karol Bagh, Delhi"}]},
  {id:"s6", name:"PipeGuard Systems", domains:["IoT / Sensors","Acoustic Sensing"], trl:4, pastGovtPilots:0, dpiit:true, gem:false, hq:"Ahmedabad",
    directors:[{name:"K. Shah", address:"Navrangpura, Ahmedabad"}]},
  {id:"s7", name:"VaaniDesk", domains:["NLP / Conversational AI"], trl:6, pastGovtPilots:0, dpiit:false, gem:true, hq:"Chennai",
    directors:[{name:"S. Subramaniam", address:"22 Anna Salai, Chennai"}]}
];

/* One evaluating official per department. Two entries are deliberately
   planted to collide with startup directors above, so the Integrity
   Radar demo has something real to catch:
   - o3 (Jal Shakti) shares name + address exactly with AquaSense's director.
   - o2 (Public Grievances) shares only a surname with VaaniDesk's director
     (different address), so it lands as a medium-severity flag instead. */
let officials = [
  {id:"o1", name:"R. Iyer", dept:"Urban Local Bodies", address:"Shivajinagar, Pune"},
  {id:"o2", name:"S. Subramaniam", dept:"Public Grievances", address:"Nungambakkam, Chennai"},
  {id:"o3", name:"A. Krishnan", dept:"Jal Shakti (Water Resources)", address:"7 Lake View Road, Coimbatore"},
  {id:"o4", name:"M. Rao", dept:"Revenue Department", address:"Banjara Hills, Hyderabad"}
];

let pilots = [];      // {id, problemId, startupId, milestoneIdx, budget}
let evaluations = {}; // keyed by pilotId
let procurements = {};// keyed by pilotId
let scaleups = {};    // keyed by procurement id
let auditLog = [];    // Integrity Radar: {ts, problemId, startupId, topPickId, conflictLevel, justification}

let pilotSeq = 1;

/* ---------------- STATE ---------------- */
let state = {
  view: "intake",
  selectedProblemId: "p1",
  selectedStartupId: null,
  selectedPilotId: null,
  selectedProcId: null,
  newProblem: { title:"", dept:"Urban Local Bodies", desc:"", domains:[], budget:1500000, trl:6 },
  pendingOverride: null // {problemId, startupId, topPickId, conflictLevel} while the justification modal is open
};

const STAGES = [
  {id:"intake", num:"01", label:"Problem Intake"},
  {id:"matching", num:"02", label:"AI Matching"},
  {id:"pilot", num:"03", label:"Pilot Sandbox"},
  {id:"eval", num:"04", label:"Evidence Evaluation"},
  {id:"procure", num:"05", label:"Procurement Bridge"},
  {id:"scale", num:"06", label:"Scale-Up"},
  {id:"integrity", num:"07", label:"Integrity Radar"}
];
