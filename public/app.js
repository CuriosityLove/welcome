/* Curiosity.Love onboarding: portal logic. No edits needed for day-to-day use. */

/* ============================================================
   APP
   ============================================================ */
const $ = (s, el=document) => el.querySelector(s);
const root = $("#root");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const HEART = '<svg viewBox="0 0 26 24" aria-hidden="true" style="width:12px;height:11px;fill:var(--red)"><path d="M13 23.2 2.1 12.4A6.6 6.6 0 0 1 11.4 3l1.6 1.6L14.6 3a6.6 6.6 0 0 1 9.3 9.4Z"/></svg>';
const DISPLAY = {group:1, upload:1, note:1};
const CONTROLLERS = new Set(SECTIONS.flatMap(s => s.fields.filter(f=>f.when).map(f=>f.when.k)));
const OVERVIEW = -1, REVIEW = SECTIONS.length;

let slug = null, client = null, data = {}, step = OVERVIEW;
const store = {
  get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k){ try { localStorage.removeItem(k); } catch {} },
  sget(k){ try { return sessionStorage.getItem(k); } catch { return null; } },
  sset(k,v){ try { sessionStorage.setItem(k,v); } catch {} },
};
async function sha(text){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("");
}
const slugify = s => String(s||"").toLowerCase().trim().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const visible = f => !f.when || data[f.when.k] === f.when.v;
const asks = s => s.fields.filter(f => !(f.type in DISPLAY) && visible(f));
const filled = v => Array.isArray(v) ? v.length > 0 : String(v||"").trim() !== "";
const missingIn = s => asks(s).filter(f => f.req && !filled(data[f.id]));
const sectionDone = s => missingIn(s).length === 0 && asks(s).some(f => filled(data[f.id]));
function fmt(f){ const v = data[f.id]; return Array.isArray(v) ? v.join(", ") : String(v||"").trim(); }
function answered(){ let t=0,a=0; SECTIONS.forEach(s=>asks(s).forEach(f=>{ t++; if(filled(data[f.id])) a++; })); return {t,a}; }

function readSlug(){
  const q = new URLSearchParams(location.search).get("c");
  if (q) return slugify(q);
  const h = location.hash.replace(/^#/,"");
  if (h && h !== "admin") return slugify(h);
  const p = location.pathname.replace(/\/index\.html$/,"").split("/").filter(Boolean)[0];
  if (p && p !== "admin" && !p.includes(".")) return slugify(p);
  return null;
}
const isAdmin = () => location.hash === "#admin" || /\/admin\/?$/.test(location.pathname);
const onStudioDomain = () => /curiosity\.love$/.test(location.hostname);

/* ---------- gate ---------- */
function renderGate(msg=""){
  $("#who").textContent = "Client Onboarding";
  const known = slug && CLIENTS[slug];
  root.innerHTML = `
  <section class="gate"><div class="gate-card">
    <div class="mono muted">Private client portal</div>
    <h1>${known ? `Welcome,<br><em>${esc(CLIENTS[slug].name)}</em>` : `Client <em>onboarding</em>`}</h1>
    <p>Enter the password we sent you. Everything you share here comes directly to the Curiosity.Love team.</p>
    <form id="gateForm" novalidate>
      ${known ? "" : `<div class="f"><label for="g_client">Client code</label><input type="text" id="g_client" autocomplete="username" value="${esc(slug||"")}" placeholder="From your invitation"></div>`}
      <div class="f"><label for="g_pw">Password</label><input type="password" id="g_pw" autocomplete="current-password"></div>
      <div class="err" id="g_err" role="alert">${esc(msg)}</div>
      <div><button class="btn" type="submit">Enter ${HEART}</button></div>
    </form>
    ${onStudioDomain() ? "" : `<div class="hint">Preview access: client code <b>demo</b>, password <b>curiosity</b></div>`}
  </div></section>`;
  $("#gateForm").addEventListener("submit", async e => {
    e.preventDefault();
    const s = known ? slug : slugify($("#g_client").value);
    const pw = $("#g_pw").value;
    if (!s || !CLIENTS[s]) return renderGate("We could not find that client code. Check your invitation, or write to " + STUDIO.email + ".");
    if (await sha(s + ":" + pw) !== CLIENTS[s].hash) { $("#g_err").textContent = "That password does not match. Passwords are case sensitive."; return; }
    store.sset("cl_auth_" + s, CLIENTS[s].hash);
    open(s);
  });
  setTimeout(() => ($("#g_client") || $("#g_pw")).focus(), 30);
}
function open(s){
  slug = s; client = CLIENTS[s];
  const saved = store.get("cl_draft_" + s) || {};
  data = saved.data || {}; step = saved.step ?? OVERVIEW;
  render();
}
let savedTimer;
function save(){ store.set("cl_draft_" + slug, {data, step}); const el = $("#saved"); if (!el) return; el.textContent = "Saved on this device"; clearTimeout(savedTimer); savedTimer = setTimeout(()=> el.textContent = "Progress saves automatically", 1800); }

/* ---------- shell ---------- */
function render(){
  $("#who").textContent = client.name;
  const {t,a} = answered();
  root.innerHTML = `
  <div class="app">
    <aside class="rail">
      <div class="progress" aria-hidden="true"><i style="width:${Math.round(a/t*100)}%"></i></div>
      <ol class="steps">
        <li><button data-go="${OVERVIEW}" class="${step===OVERVIEW?"on":""}"><span class="n">00</span><span>Overview</span><span></span></button></li>
        ${SECTIONS.map((s,i)=>`<li><button data-go="${i}" class="${step===i?"on":""} ${sectionDone(s)?"done":""}"><span class="n">${String(i+1).padStart(2,"0")}</span><span>${esc(s.title)}</span><span class="tick">${sectionDone(s)?"✓":""}</span></button></li>`).join("")}
        <li><button data-go="${REVIEW}" class="${step===REVIEW?"on":""}"><span class="n">${String(REVIEW+1).padStart(2,"0")}</span><span>Review and send</span><span></span></button></li>
      </ol>
      <div class="save" id="saved">Progress saves automatically</div>
    </aside>
    <div id="pane"></div>
  </div>`;
  root.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(+b.dataset.go));
  const pane = $("#pane");
  pane.innerHTML = step === OVERVIEW ? overviewHTML() : step === REVIEW ? reviewHTML() : sectionHTML(SECTIONS[step]);
  bind(pane);
}
function go(n){ step = Math.max(OVERVIEW, Math.min(REVIEW, n)); save(); render(); window.scrollTo({top:0, behavior:"smooth"}); }

/* ---------- overview: engagement status ---------- */
function pill(state){
  const map = { signed:["ok","Signed"], paid:["ok","Paid"], sent:["ok","Sent"], booked:["ok","Booked"],
                pending:["due","To sign"], due:["due","Due"], draft:["","In progress"], todo:["due","To do"], upcoming:["","Upcoming"], soon:["","Coming soon"] };
  const [c,l] = map[state] || ["",state];
  return `<span class="pill ${c}">${esc(l)}</span>`;
}
function overviewHTML(){
  const first = String(data.contact_name||"").split(" ")[0];
  const sent = store.get("cl_sent_" + slug);
  const {t,a} = answered();
  const briefState = sent ? "sent" : a ? "draft" : "todo";
  const rows = [];
  if (client.agreement){
    const s = client.agreement.status === "signed" ? "signed" : "pending";
    rows.push({t:"Agreement", d: s==="signed" ? "Signed and on file." : "Review and sign the engagement agreement.",
      st:s, act: s==="pending" ? (client.agreement.link ? `<a class="btn sm" href="${esc(client.agreement.link)}" target="_blank" rel="noopener">Review and sign</a>` : "") : ""});
  }
  rows.push({t:"Onboarding brief", d: sent ? `Received ${new Date(sent).toLocaleDateString(undefined,{month:"short",day:"numeric"})}.` : `About ten minutes. ${a} of ${t} questions answered.`,
    st:briefState, act:`<button class="btn sm${sent?" ghost":""}" data-start>${sent ? "View answers" : a ? "Continue" : "Start"}</button>`});
  if (client.kickoff){
    const k = client.kickoff;
    rows.push({t:"Kickoff session", d: k.date ? esc(k.date) : "We schedule this once your brief is in.", st: k.date ? "booked" : (k.link ? "todo" : "soon"),
      act: !k.date && k.link ? `<a class="btn sm ghost" href="${esc(k.link)}" target="_blank" rel="noopener">Book a time</a>` : ""});
  }
  return `<div class="welcome">
    <div class="mono muted" style="margin-bottom:18px">Client portal · ${esc(client.name)}</div>
    <h1>${first ? `Welcome back, <em>${esc(first)}</em>.` : `Let’s <em>begin</em>.`}</h1>
    <p class="lede">This portal holds everything we need to start well: your brief, assets, access and agreement. Your answers save on this device as you go, so you can leave and come back.</p>
    <div class="eng">
      <div class="eng-head"><div><div class="mono muted">Engagement</div><b>${esc(client.engagement || "Curiosity.Love engagement")}</b></div>
        <div class="meta">${client.lead?`<span>Led by ${esc(client.lead)}</span>`:""}<span>${esc(STUDIO.email)}</span></div></div>
      ${rows.map((r,i)=>`<div class="row"><span class="n">${String(i+1).padStart(2,"0")}</span>
        <div class="t"><b>${r.t}</b><span>${r.d}</span></div>
        <div class="act">${pill(r.st)}${r.act}</div></div>`).join("")}
    </div>
  </div>`;
}
/* ---------- sections ---------- */
function fieldHTML(f){
  if (!visible(f)) return "";
  const v = data[f.id];
  const lab = `<label for="q_${f.id}">${esc(f.label)}${f.req?'<span class="req" aria-hidden="true">*</span>':""}</label>`;
  const help = f.help ? `<div class="help">${esc(f.help)}</div>` : "";
  const cls = `f${f.full?" full":""}`;
  const ph = f.ph ? ` placeholder="${esc(f.ph)}"` : "";
  switch(f.type){
    case "group": return `<div class="group-label mono">${esc(f.label)}</div>`;
    case "note": return `<div class="panel note"><h3>Please do not enter passwords here</h3><p>Tell us which accounts you can share and we will send access invitations from ${esc(STUDIO.email)}. Adding us as a user keeps your credentials private and lets you remove access anytime.</p></div>`;
    case "upload": return `<div class="panel"><h3>Upload your files</h3>
        ${client.uploadLink
          ? `<p>We have set up a private folder for ${esc(client.name)}. Drop files there directly, no account needed.</p><div><a class="btn" href="${esc(client.uploadLink)}" target="_blank" rel="noopener">Open your upload folder</a></div>`
          : `<p>Put your files in a shared Google Drive, Dropbox or WeTransfer folder and paste the link below. If you would rather we send you a private upload folder, write to ${esc(STUDIO.email)}.</p>`}</div>`;
    case "textarea": return `<div class="${cls}">${lab}<textarea id="q_${f.id}" data-k="${f.id}"${ph}>${esc(v)}</textarea>${help}</div>`;
    case "select": return `<div class="${cls}">${lab}<select id="q_${f.id}" data-k="${f.id}"${CONTROLLERS.has(f.id)?" data-ctrl":""}><option value="">Select</option>${f.options.map(o=>`<option${v===o?" selected":""}>${esc(o)}</option>`).join("")}</select>${help}</div>`;
    case "chips": { const arr = Array.isArray(v)?v:[];
      return `<fieldset class="${cls}" style="border:0;padding:0;margin:0"><legend class="lab" style="padding:0;margin-bottom:8px;font-size:13px;font-weight:500">${esc(f.label)}</legend><div class="chips">${f.options.map((o,i)=>`<label class="chip"><input type="checkbox" id="q_${f.id}_${i}" data-chip="${f.id}" value="${esc(o)}"${arr.includes(o)?" checked":""}><span>${esc(o)}</span></label>`).join("")}</div>${help}</fieldset>`; }
    default: return `<div class="${cls}">${lab}<input type="${f.type||"text"}" id="q_${f.id}" data-k="${f.id}" value="${esc(v)}"${ph}>${help}</div>`;
  }
}
function sectionHTML(sec){
  const i = SECTIONS.indexOf(sec);
  return `<div class="sec-head"><div class="mono muted">Section ${i+1} of ${SECTIONS.length}</div><h2>${esc(sec.title)}</h2><p>${esc(sec.intro)}</p></div>
  <form class="grid" id="secForm" novalidate>${sec.fields.map(fieldHTML).join("")}</form>
  <div class="nav"><button class="btn ghost" data-prev>Back</button><button class="btn" data-next>${i===SECTIONS.length-1?"Review answers":"Continue"}</button></div>`;
}

/* ---------- review ---------- */
function reviewHTML(){
  const missing = SECTIONS.flatMap(s => missingIn(s).map(f=>({s,f})));
  return `<div class="sec-head"><div class="mono muted">Final step</div><h2>Review and send</h2><p>Check your answers, then send them to the studio. You can edit any section before sending, and resend later if something changes.</p></div>
  <div class="review">
    ${SECTIONS.map((s,i)=>`<section><header><h3>${esc(s.title)}</h3><button class="linkbtn" data-go2="${i}">Edit</button></header><dl>
      ${asks(s).map(f=>{ const v=fmt(f); return `<dt>${esc(f.label)}</dt><dd>${v?esc(v):`<span class="empty">${f.req?"Required":"Not answered"}</span>`}</dd>`; }).join("")}
    </dl></section>`).join("")}
    ${missing.length ? `<div class="panel note"><h3>${missing.length} required ${missing.length===1?"answer is":"answers are"} missing</h3><p>${missing.map(m=>`<button class="linkbtn" data-go2="${SECTIONS.indexOf(m.s)}">${esc(m.f.label)}</button>`).join(" · ")}</p></div>` : ""}
    <label class="consent"><input type="checkbox" id="q_consent"${data._consent?" checked":""}> The information above is accurate, and Curiosity.Love may use the shared materials for our work together.</label>
    <div class="err" id="sendErr" role="alert"></div>
    <div class="nav" style="margin-top:0"><button class="btn ghost" data-prev>Back</button>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost" id="copyAll">Copy my answers</button><button class="btn" id="send"${missing.length?" disabled":""}>Send to Curiosity.Love</button></div></div>
    <div id="fallback"></div>
  </div>`;
}

function bind(pane){
  pane.querySelectorAll("[data-k]").forEach(el => el.addEventListener(el.tagName==="SELECT"?"change":"input", () => {
    data[el.dataset.k] = el.value; el.closest(".f")?.classList.remove("invalid"); save();
    if (el.hasAttribute("data-ctrl")) { const id = el.id; render(); $("#"+id)?.focus(); }
  }));
  pane.querySelectorAll("[data-chip]").forEach(el => el.addEventListener("change", () => {
    const k = el.dataset.chip; data[k] = [...pane.querySelectorAll(`[data-chip="${k}"]:checked`)].map(x=>x.value); save(); }));
  pane.querySelectorAll("[data-go2]").forEach(b => b.onclick = () => go(+b.dataset.go2));
  pane.querySelector("[data-start]")?.addEventListener("click", () => {
    if (store.get("cl_sent_"+slug)) return go(REVIEW);
    const first = SECTIONS.findIndex(s => !sectionDone(s)); go(first < 0 ? REVIEW : first);
  });
  pane.querySelector("[data-prev]")?.addEventListener("click", () => go(step-1));
  pane.querySelector("[data-next]")?.addEventListener("click", () => {
    const sec = SECTIONS[step];
    const bad = missingIn(sec);
    const emails = asks(sec).filter(f=>f.type==="email" && filled(data[f.id]) && !String(data[f.id]).split(",").every(e=>/^\S+@\S+\.\S+$/.test(e.trim())));
    [...bad, ...emails].forEach(f => $("#q_"+f.id)?.closest(".f")?.classList.add("invalid"));
    if (bad.length || emails.length){ $("#q_"+(bad[0]||emails[0]).id)?.focus(); return; }
    go(step+1);
  });
  const c = $("#q_consent", pane); if (c) c.onchange = () => { data._consent = c.checked; save(); };
  $("#send", pane)?.addEventListener("click", submit);
  $("#copyAll", pane)?.addEventListener("click", () => copyText(plainText(), $("#copyAll")));
}

async function copyText(text, btn){
  try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
  catch { $("#fallback").innerHTML = `<pre class="copy" id="cpText">${esc(text)}</pre>`; const rg=document.createRange(); rg.selectNodeContents($("#cpText")); const sel=getSelection(); sel.removeAllRanges(); sel.addRange(rg); btn.textContent = "Selected, press copy"; }
}
function plainText(){
  const lines = [`CURIOSITY.LOVE CLIENT ONBOARDING`, `Client: ${client.name} (${slug})`, `Engagement: ${client.engagement||""}`, `Prepared: ${new Date().toLocaleString()}`, ""];
  SECTIONS.forEach(s => { lines.push(s.title.toUpperCase()); asks(s).forEach(f => lines.push(`${f.label}: ${fmt(f) || "n/a"}`)); lines.push(""); });
  return lines.join("\n");
}
async function submit(){
  const err = $("#sendErr"), btn = $("#send");
  if (!data._consent){ err.textContent = "Please confirm the statement above before sending."; return; }
  btn.disabled = true; btn.textContent = "Sending…"; err.textContent = "";
  const payload = { _subject: `Onboarding brief: ${client.name}`, client: client.name, client_code: slug, engagement: client.engagement||"" };
  SECTIONS.forEach(s => asks(s).forEach(f => payload[`${s.title} / ${f.label}`] = fmt(f)));
  if (data.contact_email) payload._replyto = data.contact_email;
  payload.full_brief = plainText();
  try {
    const r = await fetch(STUDIO.formEndpoint, { method:"POST", headers:{ "Content-Type":"application/json", "Accept":"application/json" }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error("status " + r.status);
    store.set("cl_sent_" + slug, Date.now());
    renderDone();
  } catch(e) {
    btn.disabled = false; btn.textContent = "Try again";
    err.innerHTML = `We could not send your brief from this page. Your answers are saved. Copy them and email them to <b>${esc(STUDIO.email)}</b>.`;
    $("#fallback").innerHTML = `<pre class="copy">${esc(plainText())}</pre>`;
  }
}
function renderDone(){
  root.innerHTML = `<section class="done">
    <div class="mono muted" style="margin-bottom:18px">Brief received</div>
    <h1>Thank you, <em>${esc(client.name)}</em>.</h1>
    <p>Your brief is with the Curiosity.Love team. We will review everything within ${esc(STUDIO.turnaround)} and reach out to confirm our kickoff session.</p>
    <p>Files to add later, or a question? Write to <b>${esc(STUDIO.email)}</b>.</p>
    <div style="margin-top:28px"><button class="btn" id="back">Back to your portal</button></div>
  </section>`;
  $("#back").onclick = () => { step = OVERVIEW; save(); render(); };
}

/* ---------- admin: add a client ---------- */
function renderAdmin(){
  $("#who").textContent = "Studio · Add a client";
  root.innerHTML = `<section class="admin">
    <div class="mono muted">Studio use only</div>
    <h1>Add a client</h1>
    <p style="margin:0;color:var(--ink-2)">Fill this in, paste the generated entry into public/config.js, then commit and push. Render redeploys automatically. Send the link and password to the client separately.</p>
    <form class="grid" id="adm" novalidate>
      <div class="f"><label for="a_name">Client name</label><input type="text" id="a_name" placeholder="LDV Hospitality"></div>
      <div class="f"><label for="a_slug">Client code</label><input type="text" id="a_slug" placeholder="ldv-hospitality"></div>
      <div class="f"><label for="a_pw">Password</label><input type="text" id="a_pw" placeholder="10 or more characters"></div>
      <div class="f"><label for="a_lead">Studio lead</label><input type="text" id="a_lead" value="Anthony Morey"></div>
      <div class="f full"><label for="a_eng">Engagement</label><input type="text" id="a_eng" placeholder="Brand strategy and website"></div>
      <div class="f full"><label for="a_agr">Agreement link</label><input type="url" id="a_agr" placeholder="DocuSign or PandaDoc link"></div>
      <div class="f full"><label for="a_cal">Kickoff booking link</label><input type="url" id="a_cal" placeholder="Calendly or Google booking page"></div>
      <div class="f full"><label for="a_up">Upload folder link</label><input type="url" id="a_up" placeholder="Google Drive or Dropbox file request link"></div>
      <div class="full"><button class="btn" type="submit">Generate</button></div>
    </form>
    <div id="admOut"></div>
  </section>`;
  $("#a_name").oninput = () => { $("#a_slug").value = slugify($("#a_name").value); };
  $("#adm").onsubmit = async e => {
    e.preventDefault();
    const v = id => $("#"+id).value.trim();
    const name=v("a_name"), s=slugify(v("a_slug")||name), pw=$("#a_pw").value;
    if(!name||!s||pw.length<10){ $("#admOut").innerHTML='<div class="err">Add a client name and a password of at least 10 characters.</div>'; return; }
    const h = await sha(s+":"+pw);
    const J = JSON.stringify;
    const entry = `  ${J(s)}: {\n    name: ${J(name)}, hash: "${h}",\n    lead: ${J(v("a_lead"))}, engagement: ${J(v("a_eng"))},\n    uploadLink: ${J(v("a_up"))},\n    agreement: { status: "pending", link: ${J(v("a_agr"))} },\n    kickoff: { date: "", link: ${J(v("a_cal"))} }\n  },`;
    const msg = `Welcome to Curiosity.Love. Your client portal is ready:\n${STUDIO.domain}/${s}\n\nPassword: ${pw}\n\nInside you will find your onboarding brief and agreement. The brief takes about ten minutes and saves as you go.`;
    $("#admOut").innerHTML = `<div class="out"><div class="mono">1 · Add to CLIENTS</div><pre>${esc(entry)}</pre>
      <div class="mono" style="margin-top:12px">2 · Send to the client</div><pre>${esc(msg)}</pre>
      <p class="muted" style="font-size:13px;margin:8px 0 0">Later, mark progress by editing the entry: agreement status "signed", or add a kickoff date.</p></div>`;
  };
}

/* ---------- boot ---------- */
(function boot(){
  if (isAdmin()) return renderAdmin();
  slug = readSlug();
  if (slug && CLIENTS[slug] && store.sget("cl_auth_" + slug) === CLIENTS[slug].hash) return open(slug);
  renderGate();
})();
window.addEventListener("hashchange", () => location.reload());
