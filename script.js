// Screens & Navigation
// Screens & Navigation
const subHeader = document.getElementById("subHeader");
const homeBtn = document.getElementById("homeBtn");
const switchModeBtn = document.getElementById("switchModeBtn");
const settingsBtn = document.getElementById("settingsBtn");
const apiDrawer = document.getElementById("apiDrawer");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiBtn = document.getElementById("saveApiBtn");

const modeSelectScreen = document.getElementById("modeSelectScreen");
const chooseInsuranceBtn = document.getElementById("chooseInsuranceBtn");
const chooseVehicleBtn = document.getElementById("chooseVehicleBtn");

const vehicleScreen = document.getElementById("vehicleScreen");
const vehicleForm = document.getElementById("vehicleForm");
const vehicleNoInput = document.getElementById("vehicleNoInput");
const vehicleResultBox = document.getElementById("vehicleResultBox");

const chatScreen = document.getElementById("chatScreen");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatImgInput = document.getElementById("chatImgInput");
const imgPreviewBar = document.getElementById("imgPreviewBar");
const previewImg = document.getElementById("previewImg");
const previewName = document.getElementById("previewName");
const removeImgBtn = document.getElementById("removeImgBtn");
const canvasInspector = document.getElementById("canvasInspector");

let currentMode = null; // "insurance" | "vehicle"
let pendingPhoto = null;
let chatHistory = [];
let apiKey = sessionStorage.getItem("insure_api_key") || "";
if (apiKey) apiKeyInput.value = apiKey;

// Simulated police records keyed by vehicle number (kept strictly in Vehicle Data screen)
const POLICE_CASE_DB = {
  "KA01AB1234": {
    vehicleType: "Motorbike / Two-Wheeler (Demo)",
    previousCases: [
      "CASE-2023-402 (19 Jun 2023) — Minor skidding incident; closed with no third-party injury."
    ],
    currentCases: [
      "CHALLAN-2026-190 (02 Nov 2026) — Pending helmet/signal challan (₹1,000)."
    ],
    summaryNote: "One closed historical record and one pending traffic challan."
  },
  "KA05CD5678": {
    vehicleType: "Hatchback Car (Demo)",
    previousCases: [
      "FIR-2024-881 (11 Sep 2024) — Rear-end bump at junction; settled and case closed."
    ],
    currentCases: [
      "No active FIR or pending police case currently open."
    ],
    summaryNote: "Previous FIR closed; no active police cases at present."
  },
  "KA09EF9012": {
    vehicleType: "Commercial / SUV (Demo)",
    previousCases: [
      "CHALLAN-2025-311 (28 Jan 2025) — Speeding fine paid and cleared."
    ],
    currentCases: [
      "FIR-2026-774 (14 Nov 2026) — Active / Under Investigation following highway collision."
    ],
    summaryNote: "Previous challan cleared; one FIR currently under investigation."
  }
};

function showScreen(screenName) {
  modeSelectScreen.classList.add("hidden");
  vehicleScreen.classList.add("hidden");
  chatScreen.classList.add("hidden");
  homeBtn.classList.remove("hidden");
  switchModeBtn.classList.remove("hidden");

  if (screenName === "menu") {
    currentMode = null;
    modeSelectScreen.classList.remove("hidden");
    homeBtn.classList.add("hidden");
    switchModeBtn.classList.add("hidden");
    subHeader.textContent = "Choose a mode to begin";
  } else if (screenName === "vehicle") {
    currentMode = "vehicle";
    vehicleScreen.classList.remove("hidden");
    subHeader.textContent = "Option 2: Vehicle Data & Police Case Lookup";
    vehicleNoInput.focus();
  } else if (screenName === "chat") {
    currentMode = "insurance";
    chatScreen.classList.remove("hidden");
    subHeader.textContent = "Option 1: Info About Insurance";
    if (chatLog.children.length === 0) {
      pushBotMessage(
        "Ask me any question about insurance—health, motor, term/life, travel, property, claims, waiting periods, deductibles, add-ons, or exclusions. Each answer adapts to your question and covers <strong>Age</strong>, <strong>Amount</strong>, <strong>Time Period</strong>, and <strong>Rules</strong>."
      );
    }
    chatInput.focus();
  }
}

chooseInsuranceBtn.addEventListener("click", () => showScreen("chat"));
chooseVehicleBtn.addEventListener("click", () => showScreen("vehicle"));
homeBtn.addEventListener("click", () => showScreen("menu"));
switchModeBtn.addEventListener("click", () => {
  if (currentMode === "insurance") showScreen("vehicle");
  else showScreen("chat");
});

settingsBtn.addEventListener("click", () => apiDrawer.classList.toggle("hidden"));
saveApiBtn.addEventListener("click", () => {
  apiKey = apiKeyInput.value.trim();
  if (apiKey) sessionStorage.setItem("insure_api_key", apiKey);
  else sessionStorage.removeItem("insure_api_key");
  apiDrawer.classList.add("hidden");
});

function getOrCreateVehicleRecord(vehNo) {
  const clean = vehNo.trim().toUpperCase();
  if (POLICE_CASE_DB[clean]) return POLICE_CASE_DB[clean];

  const lastDigit = parseInt(clean.replace(/\D/g, "").slice(-1) || "0", 10);
  const hasCurrent = lastDigit % 2 === 1;
  return {
    vehicleType: "Registered Vehicle (Demo Record)",
    previousCases: [
      `CASE-2024-${100 + lastDigit} (08 May 2024) — Routine traffic check / minor incident; closed.`
    ],
    currentCases: hasCurrent
      ? [`FIR-2026-${300 + lastDigit} (10 Nov 2026) — Active / Pending police verification.`]
      : ["No active FIR or pending police case currently recorded."],
    summaryNote: hasCurrent
      ? "One historical record and one active case in demo data."
      : "One historical record and no active case in demo data."
  };
}

function renderVehicleData(vehNo) {
  const cleanNo = vehNo.trim().toUpperCase();
  const rec = getOrCreateVehicleRecord(cleanNo);

  vehicleResultBox.classList.remove("hidden");
  vehicleResultBox.innerHTML = `
    <h3>Vehicle Number: <strong>${cleanNo}</strong></h3>
    <p style="color:var(--muted);font-size:0.84rem;margin-top:2px;">${rec.vehicleType}</p>

    <div class="case-block">
      <h4>Previous Police Cases</h4>
      <ul>${rec.previousCases.map((c) => `<li>${c}</li>`).join("")}</ul>
    </div>

    <div class="case-block">
      <h4>Current Police Cases</h4>
      <ul>${rec.currentCases.map((c) => `<li>${c}</li>`).join("")}</ul>
    </div>

    <p style="margin-top:12px;font-size:0.86rem;"><strong>Record Summary:</strong> ${rec.summaryNote}</p>
  `;
}

vehicleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!vehicleNoInput.value.trim()) return;
  renderVehicleData(vehicleNoInput.value);
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    vehicleNoInput.value = chip.dataset.veh;
    renderVehicleData(chip.dataset.veh);
  });
});

// Image upload & real pixel check (Insurance chat only)
function inspectImage(img) {
  const w = 160;
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
  canvasInspector.width = w;
  canvasInspector.height = h;
  const ctx = canvasInspector.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  let lumSum = 0;
  const pxCount = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    lumSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    brightness: Math.round(lumSum / pxCount)
  };
}

chatImgInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      pendingPhoto = { file, dataUrl: reader.result, info: inspectImage(img) };
      previewImg.src = reader.result;
      previewName.textContent = `${file.name} (${pendingPhoto.info.width}×${pendingPhoto.info.height})`;
      imgPreviewBar.classList.remove("hidden");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

removeImgBtn.addEventListener("click", () => {
  pendingPhoto = null;
  chatImgInput.value = "";
  imgPreviewBar.classList.add("hidden");
});

function pushUserMessage(text, imgUrl) {
  const div = document.createElement("div");
  div.className = "msg user";
  const b = document.createElement("div");
  b.className = "bubble";
  b.textContent = text;
  div.appendChild(b);
  if (imgUrl) {
    const im = document.createElement("img");
    im.src = imgUrl;
    im.className = "chat-img";
    div.appendChild(im);
  }
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function pushBotMessage(html) {
  const div = document.createElement("div");
  div.className = "msg bot";
  const b = document.createElement("div");
  b.className = "bubble";
  b.innerHTML = html;
  div.appendChild(b);
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return b;
}

// Question-aware Insurance Info engine (no vehicle data mixed in)
function buildQuestionTailoredReply(question) {
  const q = question.toLowerCase();
  const prevUserTurn = [...chatHistory].reverse().find((m) => m.role === "user");

  let domain = "General Insurance";
  if (/(health|medical|hospital|cashless|maternity|pre-existing|room rent|copay|co-pay)/.test(q)) {
    domain = "Health Insurance";
  } else if (/(motor|car|bike|vehicle|two wheeler|rc|dl|driving licence|idv|ncb|zero dep|depreciation|bumper|accident|collision)/.test(q)) {
    domain = "Motor Insurance";
  } else if (/(term|life|nominee|sum assured|maturity|death claim|critical illness)/.test(q)) {
    domain = "Life / Term Insurance";
  } else if (/(travel|flight|baggage|passport|visa|abroad|international trip)/.test(q)) {
    domain = "Travel Insurance";
  } else if (/(home|house|property|fire|flood|burglary|theft|appliance|landlord|tenant)/.test(q)) {
    domain = "Home / Property Insurance";
  } else if (prevUserTurn && /(what about|and for|why|how does that|explain more|in that case)/.test(q)) {
    domain = "Follow-up on Your Previous Question";
  }

  let directAnswer = "";
  if (/(waiting period|wait)/.test(q)) {
    directAnswer = "Waiting periods exist so policies aren't bought right after a condition starts. Initial illness waiting is typically short (often ~30 days), while specific illnesses, maternity, or pre-existing conditions usually have longer waiting windows depending on the plan.";
  } else if (/(claim|how to claim|claim process|claim rejected|rejection)/.test(q)) {
    directAnswer = "To make a claim smoothly, notify the insurer promptly, keep evidence intact before inspection/documentation (for motor/property) or follow cashless/reimbursement steps (for health), and submit accurate supporting documents. Delays or rejections often stem from late intimation, non-disclosure, exclusions, or missing paperwork.";
  } else if (/(deductible|co-pay|copay|excess)/.test(q)) {
    directAnswer = "A deductible or co-pay is the portion of an approved claim you pay out of pocket before or alongside the insurer's payout. A higher deductible or co-pay usually lowers the premium, while increasing your out-of-pocket share at claim time.";
  } else if (/(ncb|no claim bonus|zero dep|depreciation|idv)/.test(q)) {
    directAnswer = "In motor policies, IDV is the insured market value of the vehicle (minus depreciation), Zero Depreciation avoids depreciation cuts on eligible replaced parts, and NCB discounts renewal premiums for claim-free years.";
  } else if (/(cancel|lapse|renew|renewal|grace period)/.test(q)) {
    directAnswer = "If you miss a renewal date, insurers often allow a grace period to renew without losing continuity benefits (like NCB or waiting-period credit), whereas letting a policy lapse for too long can reset benefits or require fresh underwriting.";
  } else if (/(premium|cost|cheaper|expensive|price)/.test(q)) {
    directAnswer = "Premiums depend on risk factors such as age/health (health/life), vehicle value/age/location/add-ons (motor), trip duration/destination (travel), or property value/perils (property), along with deductibles and discounts.";
  } else if (/(exclusion|not covered|cover)/.test(q)) {
    directAnswer = "Coverage depends on whether the specific event is included in your policy schedule and outside standard exclusions (such as intentional acts, illegal activity, wear-and-tear, or undisclosed pre-existing conditions).";
  } else {
    directAnswer = `Addressing your question—<strong>"${question.replace(/</g, "&lt;")}"</strong>—under <strong>${domain}</strong>: coverage depends on active policy terms, covered perils versus exclusions, applicable limits or deductibles, and timely documentation.`;
  }

  let specs = {
    age: "Eligibility depends on product type (adults 18+ for contracts; specific age brackets for health, life, and senior plans).",
    amount: "Payout is bounded by Sum Insured / IDV / Sum Assured minus deductibles, co-pay, sub-limits, or depreciation.",
    timePeriod: "Covers the active policy period, subject to claim intimation timelines, waiting periods, or renewal grace windows.",
    rules: "Requires accurate disclosure, valid supporting documents, and compliance with policy terms and exclusions."
  };

  if (domain === "Health Insurance") {
    specs = {
      age: "Adults typically enter from 18–65 years (children from newborn/91 days); renewal is generally available lifelong.",
      amount: "Sum insured spans modest to high floater/individual limits; room-rent caps, sub-limits, or co-pay may apply by plan.",
      timePeriod: "Annual/multi-year policy term; includes initial waiting, specific-illness/pre-existing waiting, and cashless pre-auth timelines.",
      rules: "Full medical disclosure at onboarding, network hospital rules for cashless, and itemized bills/discharge records for claims."
    };
  } else if (domain === "Motor Insurance") {
    specs = {
      age: "Driver must hold a valid license (typically 18+); vehicle age impacts IDV and add-ons like Zero Depreciation.",
      amount: "Own-damage payout is capped by IDV (minus depreciation/deductible); third-party liability follows statutory/policy rules.",
      timePeriod: "Policy validity (1-year OD, multi-year TP options), prompt accident/theft intimation, and renewal grace rules.",
      rules: "Valid RC & DL, no driving under intoxication or unauthorized commercial use, and required claim/surveyor steps."
    };
  } else if (domain === "Life / Term Insurance") {
    specs = {
      age: "Entry typically from 18 up to ~60–65 years, with cover running up to chosen maturity age.",
      amount: "Sum assured chosen at purchase based on income/liabilities and underwriting approval.",
      timePeriod: "Policy term (e.g., 5–40+ years), premium payment term, grace period, and early-year policy contestability rules.",
      rules: "Accurate health/lifestyle/occupation disclosures, valid nominee details, and proper claim proof."
    };
  } else if (domain === "Travel Insurance") {
    specs = {
      age: "Covers infants, adults, and seniors; higher age brackets often carry different rates, screening, or deductibles.",
      amount: "Plan limits cover medical emergencies, trip delays/cancellations, or baggage loss up to stated sub-limits.",
      timePeriod: "Valid strictly for the trip dates/duration stated on the policy.",
      rules: "Keep trip/medical/other supporting proofs and follow assistance instructions when filing claims."
    };
  } else if (domain === "Home / Property Insurance") {
    specs = {
      age: "Insured owner/occupant must be of legal age; building age and construction type can affect terms.",
      amount: "Based on declared value of structure and/or contents; under-insurance can proportionally reduce payouts.",
      timePeriod: "Policy term plus prompt incident reporting and timely claim filing.",
      rules: "Covers named perils (such as fire, flood, burglary per policy) while excluding wear-and-tear or unmaintained hazards."
    };
  }

  let imgNote = "";
  if (pendingPhoto) {
    imgNote = `<div class="case-block"><h4>Uploaded Image Check (${pendingPhoto.file.name})</h4><p style="font-size:0.84rem;">Resolution: ${pendingPhoto.info.width}×${pendingPhoto.info.height}px • Avg brightness: ${pendingPhoto.info.brightness}/255. Preliminary visual check only—official claim decisions rely on authorized inspection/documents.</p></div>`;
  }

  return `
    <strong>${domain}</strong>
    <p style="margin-top:6px;">${directAnswer}</p>
    <div class="spec-grid">
      <div class="spec-item"><strong>Age</strong>${specs.age}</div>
      <div class="spec-item"><strong>Amount</strong>${specs.amount}</div>
      <div class="spec-item"><strong>Time Period</strong>${specs.timePeriod}</div>
      <div class="spec-item"><strong>Rules</strong>${specs.rules}</div>
    </div>
    ${imgNote}
  `;
}

async function callGeminiIfConfigured(question) {
  const parts = [{ text: question }];
  if (pendingPhoto) {
    parts.push({
      inlineData: {
        mimeType: pendingPhoto.file.type || "image/jpeg",
        data: pendingPhoto.dataUrl.split(",")[1]
      }
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "You are InsureAI, an accurate insurance assistant. Directly answer the user's exact question about any insurance type, and clearly include Age, Amount, Time Period, and Rules when explaining policy details. Do not pull vehicle police case records into insurance answers."
          }]
        },
        contents: [
          ...chatHistory.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: "user", parts }
        ]
      })
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "API error");
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  return raw.replace(/\n/g, "<br>");
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = chatInput.value.trim();
  if (!q) return;

  const photoSnapshot = pendingPhoto;
  pushUserMessage(q, photoSnapshot ? photoSnapshot.dataUrl : null);
  chatInput.value = "";
  pendingPhoto = null;
  chatImgInput.value = "";
  imgPreviewBar.classList.add("hidden");

  const botBubble = pushBotMessage("<em>Thinking...</em>");

  try {
    const html = apiKey ? await callGeminiIfConfigured(q) : buildQuestionTailoredReply(q);
    botBubble.innerHTML = html;
    chatHistory.push({ role: "user", text: q });
    chatHistory.push({ role: "model", text: botBubble.textContent });
  } catch (err) {
    botBubble.innerHTML = `<strong>Error:</strong> ${err.message}`;
  } finally {
    chatLog.scrollTop = chatLog.scrollHeight;
  }
});

showScreen("menu");