"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const E = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const api = p => fetch(p).then(r => r.json());
const sleep = ms => new Promise(r => setTimeout(r, ms));
const C = {ink:"#0E1B33", gold:"#B8893B", blue:"#2F5BD3", sky:"#7EA2E8", gray:"#C3CBD8", red:"#B42318", green:"#16A34A"};
const STEPS = [["\u8f93\u5165\u89e3\u6790","\u901a\u77e5\u00b7\u7ad9\u70b9"],["\u4e8b\u5b9e\u62bd\u53d6","\u63aa\u65bd\u00b7\u7126\u70b9"],["\u89c4\u5219\u68c0\u7d22","\u6cd5\u57df\u52a0\u6743"],["\u4e09\u6bb5\u8bba\u63a8\u7406","\u89c4\u5219\u2014\u4e8b\u5b9e\u2014\u7ed3\u8bba"],["\u5f15\u7528\u6821\u9a8c","\u62e6\u622a\u7f16\u9020"],["\u6587\u4e66\u751f\u6210","\u7533\u8bc9\u00b7\u6458\u8981"],["\u4eba\u5de5\u5206\u6d41","\u9ad8\u98ce\u9669\u8f6c\u4eba\u5de5"]];
const SEAL = {"\u4f4e":"#16A34A","\u4e2d":"#C27C0E","\u9ad8":"#B42318","\u5c01\u53f7\u7ea7":"#8E1F1A"};
const TITLES = {tools:["\u5de5\u5177\u7bb1","\u7533\u8bc9\u5de5\u5177\u7bb1"],live:["\u6cd5\u89c4\u52a8\u6001","\u5b98\u65b9\u6cd5\u89c4\u4e0e\u53ec\u56de\u52a8\u6001\uff08\u8054\u7f51\u66f4\u65b0\uff09"],learn:["\u65b0\u624b\u5b66\u5802","\u65b0\u624b\u5b66\u5802\uff1a72 \u5c0f\u65f6\u884c\u52a8\u8def\u7ebf"],home:["\u5de5\u4f5c\u53f0","\u8de8\u5883\u8d26\u53f7\u5408\u89c4\u5de5\u4f5c\u53f0"],diag:["\u6848\u4ef6\u8bca\u65ad","\u8fdd\u89c4\u901a\u77e5\u667a\u80fd\u8bca\u65ad"],check:["\u5408\u89c4\u81ea\u67e5","\u4e0a\u67b6\u524d\u5408\u89c4\u81ea\u67e5\u4e0e\u98ce\u9669\u9884\u8b66"],screen:["\u6570\u636e\u5927\u5c4f","\u5408\u89c4\u6001\u52bf\u6570\u636e\u5927\u5c4f"],graph:["\u77e5\u8bc6\u56fe\u8c31","\u6cd5\u89c4\u77e5\u8bc6\u56fe\u8c31"],kb:["\u6cd5\u89c4\u77e5\u8bc6\u5e93","\u6cd5\u89c4\u4e0e\u5e73\u53f0\u653f\u7b56\u77e5\u8bc6\u5e93"],eval:["\u8bc4\u6d4b\u770b\u677f","\u6548\u679c\u8bc4\u6d4b\u770b\u677f"],about:["\u7cfb\u7edf\u67b6\u6784","\u7cfb\u7edf\u67b6\u6784\u4e0e\u65b9\u6cd5"]};
const RULES = [["2023-06-27","INFORM \u6d88\u8d39\u8005\u6cd5\u6848\u751f\u6548","\u7f8e\u56fd \u00b7 \u5e73\u53f0\u6838\u9a8c\u9ad8\u9500\u91cf\u5356\u5bb6\u8eab\u4efd"],["2024-10-21","FTC \u6d88\u8d39\u8005\u8bc4\u8bba\u4e0e\u63a8\u8350\u89c4\u5219\u751f\u6548","\u7f8e\u56fd \u00b7 \u865a\u5047\u8bc4\u8bba\u53ef\u5904\u6c11\u4e8b\u7f5a\u6b3e"],["2024-12-13","\u6b27\u76df GPSR \u5f00\u59cb\u9002\u7528","\u6b27\u76df \u00b7 \u987b\u6709\u6b27\u76df\u5883\u5185\u8d23\u4efb\u4eba"],["2025-10-15","\u53cd\u4e0d\u6b63\u5f53\u7ade\u4e89\u6cd5\u4fee\u8ba2\u65bd\u884c","\u4e2d\u56fd \u00b7 \u865a\u5047\u5ba3\u4f20\u8c03\u6574\u4e3a\u7b2c\u4e5d\u6761"],["2026-07","\u7535\u5b50\u5546\u52a1\u6cd5\u4fee\u6b63\u8349\u6848\u5f81\u6c42\u610f\u89c1","\u4e2d\u56fd \u00b7 \u62df\u65b0\u589e\u57df\u5916\u9002\u7528\uff08\u672a\u751f\u6548\uff09"]];
let META = {}, STATS = null, EX = [], charts = {}, cur = "", lastResult = null;

const dark = () => document.body.classList.contains("dark") || cur === "screen";
function chart(id, opt) {
  const el = document.getElementById(id); if (!el) return;
  charts[id]?.dispose();
  const c = echarts.init(el, null, {renderer: "canvas"});
  const tc = dark() ? "#9FB3D1" : "#667085";
  c.setOption(Object.assign({textStyle: {fontFamily: getComputedStyle(document.body).fontFamily, color: tc}, animationDuration: 1100, animationEasing: "cubicOut"}, opt));
  charts[id] = c; return c;
}
window.addEventListener("resize", () => Object.values(charts).forEach(c => c.resize()));
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 1800); }
function countUp(el) {
  const n = parseFloat(el.dataset.n), d = (el.dataset.n.split(".")[1] || "").length, t0 = performance.now();
  const f = t => { const p = Math.min(1, (t - t0) / 1100); el.textContent = (n * (1 - Math.pow(1 - p, 3))).toFixed(d); if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}
async function type(el, text, speed = 22) { el.classList.add("caret"); el.textContent = ""; for (const ch of text) { el.textContent += ch; await sleep(speed); } el.classList.remove("caret"); }

/* ---------- \u8def\u7531 ---------- */
const DRAW = {};
function go(p) {
  if (!(p in TITLES)) p = "home";
  cur = p;
  $$("nav a").forEach(a => a.classList.toggle("on", a.dataset.page === p));
  $$(".page").forEach(s => s.classList.toggle("on", s.id === "p-" + p));
  $("#crumb").textContent = "\u5929\u8861\u3000/\u3000" + TITLES[p][0];
  $("#title").textContent = TITLES[p][1];
  document.body.classList.toggle("scrmode", p === "screen");
  if (location.hash.slice(1) !== p) history.replaceState(null, "", "#" + p);
  window.scrollTo({top: 0});
  DRAW[p]?.();
  $$("#p-" + p + " [data-n]").forEach(countUp);
}
$$("nav a").forEach(a => a.onclick = () => go(a.dataset.page));
document.addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) go(g.dataset.go); });
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (h !== cur) go(h); });

/* ---------- \u521d\u59cb\u5316 ---------- */
async function init() {
  try { if (localStorage.getItem("th-theme") === "dark") document.body.classList.add("dark"); } catch (e) {}
  [META, STATS, EX] = await Promise.all([api("/api/meta"), api("/api/stats"), api("/api/examples")]);
  setMeta();
  heroCanvas(); diagInit(); kbInit(); about(); histRender();
  go(location.hash.slice(1) || "home");
  setTimeout(() => $("#splash").classList.add("out"), 900);
}
function setMeta() {
  $("#modelName").textContent = META.mock ? "\u79bb\u7ebf\u6f14\u793a\u6a21\u5f0f" : META.model;
  $(".dot").classList.toggle("off", !META.has_key && !META.replay);
  const pill = $("#modePill");
  pill.textContent = META.replay ? "\u6f14\u793a\uff1a\u771f\u5b9e\u8fd0\u884c\u7ed3\u679c\u56de\u653e" : (META.mock ? "\u79bb\u7ebf\u6f14\u793a\uff08\u6a21\u62df\u6a21\u578b\uff09" : (META.has_key ? "\u5df2\u8fde\u63a5 \u00b7 " + META.model : "\u672a\u8bbe\u7f6e API Key"));
  pill.classList.toggle("rp", !!META.replay);
}
$("#themeBtn").onclick = () => { document.body.classList.toggle("dark"); try { localStorage.setItem("th-theme", document.body.classList.contains("dark") ? "dark" : "light"); } catch (e) {} $("#themeBtn").textContent = document.body.classList.contains("dark") ? "\u6d45\u8272" : "\u6df1\u8272"; go(cur); };

const nJur = () => STATS.kb_jur.filter(([j]) => !j.startsWith("\u5e73\u53f0-") && j !== "\u901a\u7528\u65b9\u6cd5").length;
const nPlat = () => STATS.kb_jur.filter(([j]) => j.startsWith("\u5e73\u53f0-")).length;
function kpi(k, v, unit, d, hl) { const num = /^[\d.]+$/.test(v); return `<div class="kpi${hl ? " hl" : ""}"><div class="k"><i></i>${k}</div><div class="v"><span ${num ? `data-n="${v}"` : ""}>${v}</span><small>${unit}</small></div><div class="d">${d}</div></div>`; }

/* ---------- \u5de5\u4f5c\u53f0 ---------- */
function heroCanvas() {
  const cv = $("#heroCanvas"), ctx = cv.getContext("2d"); let W, H, pts;
  const rs = () => { W = cv.width = cv.offsetWidth * devicePixelRatio; H = cv.height = cv.offsetHeight * devicePixelRatio; pts = Array.from({length: 46}, () => ({x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35})); };
  rs(); window.addEventListener("resize", rs);
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 150 * devicePixelRatio) { ctx.strokeStyle = `rgba(231,201,140,${.16 * (1 - d / (150 * devicePixelRatio))})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    ctx.fillStyle = "rgba(160,190,255,.55)"; for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * devicePixelRatio, 0, 7); ctx.fill(); }
    requestAnimationFrame(loop);
  })();
}
DRAW.home = () => {
  $("#heroFlow").innerHTML = STEPS.map((s, i) => `<div class="hf"><b>${i + 1}</b>${s[0]}<span>${s[1]}</span></div>`).join("");
  $$("#heroFlow .hf").forEach((h, i) => setTimeout(() => h.classList.add("in"), 120 + i * 90));
  $("#kpis").innerHTML = kpi("\u6cd5\u89c4\u4e0e\u653f\u7b56\u6761\u76ee", String(STATS.kb_total), "\u6761", `${nJur()} \u4e2a\u6cd5\u57df \u00b7 ${nPlat()} \u4e2a\u5e73\u53f0 \u00b7 \u8054\u7f51\u589e\u8865`) + kpi("\u6807\u6ce8\u6848\u4f8b", String(STATS.cases_total), "\u4e2a", "\u5f00\u53d1 27 \u00b7 \u6d4b\u8bd5 43")
    + kpi("\u98ce\u9669\u7b49\u7ea7\u51c6\u786e\u7387", "83.7", "%", "\u76f4\u63a5\u95ee\u5927\u6a21\u578b\u4ec5 39.5%", true) + kpi("\u7f16\u9020\u5f15\u7528", "0", "\u6761", "\u76f4\u63a5\u95ee\u5927\u6a21\u578b\u4f9d\u636e\u6709\u8bef 14.9%", true);
  $("#cJur").previousElementSibling.querySelector(".sub").textContent = `${STATS.kb_total} \u6761\uff0c\u9010\u6761\u9644\u539f\u6587\u94fe\u63a5`;
  chart("cJur", {tooltip: {trigger: "item"}, legend: {bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: {color: dark() ? "#9FB3D1" : "#667085"}}, color: [C.ink, C.blue, C.gold, C.sky, C.gray],
    series: [{type: "pie", radius: ["46%", "72%"], center: ["50%", "44%"], label: {formatter: "{c}", fontWeight: 700}, itemStyle: {borderColor: dark() ? "#111C31" : "#fff", borderWidth: 3, borderRadius: 4},
      data: STATS.kb_jur.map(([n, v]) => ({name: n.replace("\u5e73\u53f0-", ""), value: v}))}]});
  chart("cRisk", {grid: {left: 44, right: 10, top: 30, bottom: 30}, tooltip: {},
    xAxis: {type: "category", data: ["\u76f4\u63a5\u95ee\u5927\u6a21\u578b", "\uff0b\u76f8\u540c\u6807\u51c6", "\u5929\u8861"], axisTick: {show: false}, axisLine: {lineStyle: {color: "#C3CBD8"}}},
    yAxis: {max: 100, axisLabel: {formatter: "{value}%"}, splitLine: {lineStyle: {color: dark() ? "#1F2D47" : "#EEF1F5"}}},
    series: [{type: "bar", barWidth: 42, label: {show: true, position: "top", formatter: "{c}%", fontWeight: 700}, itemStyle: {borderRadius: [6, 6, 0, 0]},
      data: [{value: 39.5, itemStyle: {color: C.gray}}, {value: 93.0, itemStyle: {color: C.sky}}, {value: 83.7, itemStyle: {color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: "#2F5BD3"}, {offset: 1, color: "#0E1B33"}])}}]}]});
  if (!window.liveTimeline?.()) $("#tline").innerHTML = RULES.slice().reverse().map(r => `<div class="tl"><div class="d">${r[0]}</div><div class="t">${r[1]}</div><div class="s">${r[2]}</div></div>`).join("");
  $("#exHome").innerHTML = EX.slice(0, 9).map(c => `<div class="ex" data-ex="${c.id}"><div class="t"><span>${c.id}\u3000${E(c.platform)} \u00b7 ${E(c.marketplace)}</span><b>${E(c.gold_category)}</b></div><div class="n">${E(c.notice)}</div></div>`).join("");
  $$("#exHome .ex").forEach(d => d.onclick = () => { go("diag"); loadEx(d.dataset.ex); });
};

/* ---------- \u8bca\u65ad ---------- */
function stepsHtml(cur) {
  return STEPS.map((s, i) => `<div class="st ${i + 1 < cur ? "done" : (i + 1 === cur ? "now" : "")}"><div class="c">${i + 1 < cur ? "\u2713" : i + 1}</div>${s[0]}<div class="s2">${s[1]}</div></div>`).join("");
}
const EMPTY = `<div class="empty"><div class="em-ico"><svg viewBox="0 0 24 24"><path d="M12 3v18M6 21h12M4 7h16M4 7l-3 7h6zM20 7l-3 7h6z"/></svg></div><div class="em-t">\u8bca\u65ad\u7ed3\u679c\u5c06\u663e\u793a\u5728\u8fd9\u91cc</div><div class="em-s">\u586b\u5199\u5de6\u4fa7\u901a\u77e5\u4e0e\u9648\u8ff0\uff0c\u6216\u8f7d\u5165\u4e00\u4e2a\u793a\u4f8b\u6848\u4ef6\u540e\u70b9\u51fb\u201c\u5f00\u59cb\u8bca\u65ad\u201d\u3002</div></div>`;
function loadEx(id) {
  const c = EX.find(x => x.id === id); if (!c) return;
  $("#exSel").value = id; $("#fPlat").value = c.platform === "\u4e9a\u9a6c\u900a" ? "\u4e9a\u9a6c\u900a" : "\u5176\u4ed6";
  $("#fSite").value = [...$("#fSite").options].some(o => o.value === c.marketplace) ? c.marketplace : "\u7f8e\u56fd";
  $("#fNotice").value = c.notice; $("#fStmt").value = c.seller_statement;
}
function diagInit() {
  $("#steps").innerHTML = stepsHtml(0); $("#result").innerHTML = EMPTY;
  $("#exSel").innerHTML += EX.map(c => `<option value="${c.id}">${c.id}\u3000${E(c.notice.slice(0, 26))}</option>`).join("");
  $("#exSel").onchange = e => loadEx(e.target.value);
  $("#go").onclick = run;
}
function run() {
  const notice = $("#fNotice").value.trim();
  if (!notice) { $("#err").textContent = "\u8bf7\u5148\u586b\u5199\u8fdd\u89c4\u901a\u77e5\u3002"; return; }
  $("#err").textContent = ""; const b = $("#go"); b.disabled = true; b.classList.add("run"); b.firstChild.textContent = "\u6b63\u5728\u8bca\u65ad\u2026";
  $("#result").innerHTML = `<div class="skel"><div class="sk" style="width:30%"></div><div class="sk" style="width:90%;height:22px"></div><div class="sk" style="width:70%;height:22px"></div><div class="sk" style="width:100%;margin-top:22px"></div></div><div class="skel"><div class="sk" style="width:20%"></div><div class="sk"></div><div class="sk" style="width:85%"></div><div class="sk" style="width:60%"></div></div>`;
  const q = new URLSearchParams({platform: $("#fPlat").value, marketplace: $("#fSite").value, notice, statement: $("#fStmt").value, draft: $("#fDraft").checked ? "1" : "0"});
  const es = new EventSource("/api/diagnose?" + q);
  const done = () => { es.close(); b.disabled = false; b.classList.remove("run"); b.firstChild.textContent = "\u5f00\u59cb\u8bca\u65ad"; };
  es.addEventListener("step", e => { $("#steps").innerHTML = stepsHtml(+e.data); });
  es.addEventListener("result", e => { done(); const r = JSON.parse(e.data); render(r); histSave(r); });
  es.addEventListener("fail", e => { done(); $("#err").textContent = JSON.parse(e.data); $("#result").innerHTML = EMPTY; });
  es.onerror = () => { if (b.disabled) { done(); $("#err").textContent = "\u8fde\u63a5\u4e2d\u65ad\uff0c\u8bf7\u68c0\u67e5\u670d\u52a1\u7a97\u53e3\u662f\u5426\u4ecd\u5728\u8fd0\u884c\u3002"; } };
}
function moveInk(tabs) { const on = $("button.on", tabs), ink = $(".ink", tabs); if (on && ink) { ink.style.left = on.offsetLeft + "px"; ink.style.width = on.offsetWidth + "px"; } }
function render(r) {
  lastResult = r;
  const a = r.analysis, ck = r.check, tr = r.triage, cs = r.case || {}, risk = a["\u98ce\u9669\u7b49\u7ea7"] || "";
  const d = r.document, ev = a["\u8bc1\u636e\u6e05\u5355"] || [];
  let h = (r.model || "").includes("MOCK") ? `<div class="triage warn"><b>\u6ce8\u610f</b><span>\u5f53\u524d\u4e3a\u79bb\u7ebf\u6a21\u62df\u6a21\u578b\u8f93\u51fa\uff0c\u4ec5\u7528\u4e8e\u6f14\u793a\u754c\u9762\u6d41\u7a0b\uff0c\u5185\u5bb9\u6ca1\u6709\u6cd5\u5f8b\u610f\u4e49\u3002</span></div>` : "";
  h += `<div class="verdict reveal">
    <div class="vh"><span class="t">\u8bca\u65ad\u4e66</span><span class="m">${E(cs.platform)} \u00b7 ${E(cs.marketplace)}\u7ad9\u3000\u7528\u65f6 ${r.seconds} \u79d2${r.replay ? "\u3000\uff08\u771f\u5b9e\u8fd0\u884c\u7ed3\u679c\u56de\u653e\uff09" : ""}</span></div>
    <div class="seal" style="--c:${SEAL[risk] || "#8E1F1A"}"><span class="a">\u98ce\u9669\u7b49\u7ea7</span><span class="b">${E(risk)}</span></div>
    <div class="vf" id="vf"></div>
    <div class="vg"><div><div class="k">\u8fdd\u89c4\u7c7b\u522b</div><div class="v">${E(a["\u8fdd\u89c4\u7c7b\u522b"])}</div></div>
      <div><div class="k">\u5efa\u8bae\u8def\u5f84</div><div class="v">${E(a["\u4e3b\u8981\u8def\u5f84"])}</div></div>
      <div><div class="k">\u8fdd\u89c4\u4e8b\u5b9e</div><div class="v">${E(a["\u8fdd\u89c4\u4e8b\u5b9e\u662f\u5426\u6210\u7acb"])}</div></div>
      <div><div class="k">\u7efc\u5408\u7f6e\u4fe1\u5ea6</div><div class="v">${(ck.confidence * 100).toFixed(0)}%</div><div class="conf"><i id="confBar"></i></div></div></div></div>`;
  h += tr.need_human ? `<div class="triage warn reveal"><b>\u5efa\u8bae\u8f6c\u4eba\u5de5\u6216\u5f8b\u5e08\u590d\u6838</b><span>${E(tr.reasons.join("\uff1b"))}</span></div>`
    : `<div class="triage ok reveal"><b>\u7f6e\u4fe1\u5ea6\u8fbe\u6807</b><span>\u53ef\u53c2\u8003\u4e0b\u65b9\u4f9d\u636e\u4e0e\u6587\u4e66\u8349\u7a3f\u4fee\u6539\u4f7f\u7528\u3002${a["\u98ce\u9669\u7406\u7531"] ? "\u98ce\u9669\u7406\u7531\uff1a" + E(a["\u98ce\u9669\u7406\u7531"]) : ""}</span></div>`;
  const tabs = [["chain", "\u6cd5\u5f8b\u63a8\u7406\u94fe", ""], ["cite", "\u4f9d\u636e\u4e0e\u5f15\u7528\u6821\u9a8c", ck.kept.length], ["ev", "\u8bc1\u636e\u6e05\u5355", ev.length]];
  if (d) tabs.push(["doc", "\u6587\u4e66\u8349\u7a3f", ""]);
  h += `<div class="card reveal"><div class="tabs" id="rtabs">${tabs.map((t, i) => `<button data-t="${t[0]}" class="${i ? "" : "on"}">${t[1]}${t[2] !== "" ? `<span>${t[2]}</span>` : ""}</button>`).join("")}<i class="ink"></i>
    <div class="acts"><button class="btn2" id="expWord">\u5bfc\u51fa Word</button></div></div>`;
  h += `<div class="tp on" id="t-chain">
    <div class="syl"><div class="k">\u5927\u524d\u63d0<small>\u9002\u7528\u89c4\u5219</small></div><div class="v"><ul>${ck.kept.map(k => `<li>${E(k["\u6765\u6e90"])} ${E(k["\u4f4d\u7f6e"])}</li>`).join("")}</ul></div></div>
    <div class="syl"><div class="k">\u5c0f\u524d\u63d0<small>\u8ba4\u5b9a\u4e8b\u5b9e</small></div><div class="v"><ul>${(a["\u8ba4\u5b9a\u4e8b\u5b9e"] || []).map(x => `<li>${E(x)}</li>`).join("")}</ul></div></div>
    <div class="syl"><div class="k">\u7ed3\u3000\u8bba<small>\u63a8\u7406\u8fc7\u7a0b</small></div><div class="v">${E(a["\u63a8\u7406\u8fc7\u7a0b"])}</div></div></div>`;
  h += `<div class="tp" id="t-cite">${ck.kept.map(k => `<div class="cite"><div class="h"><span class="src">${E(k["\u6765\u6e90"])} ${E(k["\u4f4d\u7f6e"])}</span><span class="tag">\u7f16\u53f7 ${E(k["\u6761\u6b3e\u7f16\u53f7"])}</span>
      ${k["\u6821\u9a8c"] === "\u901a\u8fc7" ? `<span class="ok2">\u2713 \u6821\u9a8c\u901a\u8fc7</span>` : `<span class="fl2">${E(k["\u6821\u9a8c"])}</span>`}</div>
      <div class="why">${E(k["\u9002\u7528\u7406\u7531"] || "")}</div><div class="pt">\u6761\u6587\u8981\u70b9\uff1a${E(k["\u8981\u70b9"])}${k["\u94fe\u63a5"] ? `<a href="${E(k["\u94fe\u63a5"])}" target="_blank">\u67e5\u770b\u539f\u6587 \u2197</a>` : ""}</div></div>`).join("")}
    ${ck.removed.length ? `<div class="triage warn"><b>\u5df2\u62e6\u622a</b><span>\u6a21\u578b\u5f15\u7528\u4e86\u77e5\u8bc6\u5e93\u4e2d\u4e0d\u5b58\u5728\u7684\u7f16\u53f7\uff1a${E(ck.removed.join("\u3001"))}</span></div>` : ""}
    <div class="metrics"><span>\u5f15\u7528\u901a\u8fc7\u7387 <b>${(ck.pass_rate * 100).toFixed(0)}%</b></span><span>\u68c0\u7d22\u76f8\u5173\u5ea6 <b>${ck.retrieval_strength}</b></span><span>\u6a21\u578b\u81ea\u8bc4 <b>${ck.self_confidence}</b></span></div></div>`;
  h += `<div class="tp" id="t-ev"><div class="evp">\u5df2\u51c6\u5907 <b id="evN">0</b> / ${ev.length}<div class="bar"><i id="evBar"></i></div></div><div class="ev">${ev.map(x => `<label><input type="checkbox">${E(x)}</label>`).join("")}</div></div>`;
  const en = d ? (d["\u82f1\u6587\u6b63\u6587"] || "").trim() : "", hasEn = en && !en.startsWith("\uff08");
  const mark = t => E(t).replace(/\[([^\]\n]{1,40})\]/g, '<span class="ph">[$1]</span>');
  if (d) h += `<div class="tp" id="t-doc"><div class="doch"><b>${E(d["\u6587\u4e66\u7c7b\u578b"])}</b>
      ${hasEn ? `<div class="seg"><button class="on" data-l="en">\u82f1\u6587\u6b63\u6587</button><button data-l="zh">\u4e2d\u6587\u5bf9\u7167</button></div>` : ""}
      <div class="r"><button class="btn2" id="cp">\u590d\u5236</button></div></div>
      <div class="paper" id="paper">${mark(hasEn ? en : d["\u4e2d\u6587\u5bf9\u7167"])}</div>
      ${(d["\u5f85\u5356\u5bb6\u8865\u5145"] || []).length ? `<div class="todo"><b>\u5f85\u5356\u5bb6\u8865\u5145\uff1a</b>${E(d["\u5f85\u5356\u5bb6\u8865\u5145"].join("\uff1b"))}</div>` : ""}</div>`;
  h += `</div>`;
  $("#result").innerHTML = h;
  type($("#vf"), a["\u4e00\u53e5\u8bdd\u5b9a\u6027"] || "", 26);
  setTimeout(() => { const cb = $("#confBar"); if (cb) cb.style.width = (ck.confidence * 100) + "%"; }, 200);
  const T = $("#rtabs"); moveInk(T);
  $$("button[data-t]", T).forEach(b => b.onclick = () => { $$("button[data-t]", T).forEach(x => x.classList.toggle("on", x === b)); $$(".tp").forEach(p => p.classList.toggle("on", p.id === "t-" + b.dataset.t)); moveInk(T); });
  $$("#t-ev input").forEach(i => i.onchange = () => { i.parentElement.classList.toggle("d", i.checked); const n = $$("#t-ev input:checked").length; $("#evN").textContent = n; $("#evBar").style.width = (n / ev.length * 100) + "%"; });
  $$(".seg button").forEach(b => b.onclick = () => { $$(".seg button").forEach(x => x.classList.toggle("on", x === b)); $("#paper").innerHTML = mark(b.dataset.l === "en" ? en : d["\u4e2d\u6587\u5bf9\u7167"]); });
  if ($("#cp")) $("#cp").onclick = () => { navigator.clipboard?.writeText($("#paper").innerText); toast("\u6587\u4e66\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f"); };
  $("#expWord").onclick = () => exportWord(r);
}
function exportWord(r) {
  const a = r.analysis, ck = r.check, d = r.document;
  const p = s => `<p>${E(s).replace(/\n/g, "<br>")}</p>`;
  const html = `<html><head><meta charset="utf-8"><style>body{font-family:"Microsoft YaHei";font-size:11pt;line-height:1.7}h1{font-size:20pt;color:#0E1B33}h2{font-size:14pt;color:#0E1B33;border-bottom:1px solid #ccc}td,th{border:1px solid #ccc;padding:4px 8px}table{border-collapse:collapse}</style></head><body>
  <h1>\u5929\u8861 \u00b7 \u8bca\u65ad\u4e66</h1><p>${E(r.case?.platform)} \u00b7 ${E(r.case?.marketplace)}\u7ad9\u3000\u751f\u6210\u65f6\u95f4 ${new Date().toLocaleString("zh-CN")}</p>
  <table><tr><th>\u8fdd\u89c4\u7c7b\u522b</th><td>${E(a["\u8fdd\u89c4\u7c7b\u522b"])}</td><th>\u98ce\u9669\u7b49\u7ea7</th><td>${E(a["\u98ce\u9669\u7b49\u7ea7"])}</td></tr><tr><th>\u5efa\u8bae\u8def\u5f84</th><td>${E(a["\u4e3b\u8981\u8def\u5f84"])}</td><th>\u7efc\u5408\u7f6e\u4fe1\u5ea6</th><td>${(ck.confidence * 100).toFixed(0)}%</td></tr></table>
  <h2>\u4e00\u53e5\u8bdd\u5b9a\u6027</h2>${p(a["\u4e00\u53e5\u8bdd\u5b9a\u6027"])}<h2>\u8ba4\u5b9a\u4e8b\u5b9e</h2>${(a["\u8ba4\u5b9a\u4e8b\u5b9e"] || []).map(p).join("")}
  <h2>\u9002\u7528\u89c4\u5219</h2>${ck.kept.map(k => p(`${k["\u6765\u6e90"]} ${k["\u4f4d\u7f6e"]}\uff1a${k["\u9002\u7528\u7406\u7531"] || ""}`)).join("")}
  <h2>\u63a8\u7406\u8fc7\u7a0b</h2>${p(a["\u63a8\u7406\u8fc7\u7a0b"])}<h2>\u8bc1\u636e\u6e05\u5355</h2>${(a["\u8bc1\u636e\u6e05\u5355"] || []).map(x => p("\u25a1 " + x)).join("")}
  ${d ? `<h2>${E(d["\u6587\u4e66\u7c7b\u578b"])}</h2>${p(d["\u82f1\u6587\u6b63\u6587"] || "")}${p(d["\u4e2d\u6587\u5bf9\u7167"] || "")}` : ""}
  <p style="color:#888">\u672c\u8bca\u65ad\u4e66\u7531\u5929\u8861\u751f\u6210\uff0c\u4e3a\u521d\u6b65\u5206\u6790\u4e0e\u6587\u4e66\u8349\u7a3f\uff0c\u4e0d\u6784\u6210\u6cd5\u5f8b\u610f\u89c1\u3002</p></body></html>`;
  const u = URL.createObjectURL(new Blob(["\ufeff" + html], {type: "application/msword"}));
  const x = document.createElement("a"); x.href = u; x.download = `\u5929\u8861\u8bca\u65ad\u4e66_${a["\u8fdd\u89c4\u7c7b\u522b"] || ""}.doc`; x.click(); toast("\u5df2\u5bfc\u51fa Word \u8bca\u65ad\u4e66");
}

/* ---------- \u5386\u53f2 ---------- */
function histGet() { try { return JSON.parse(localStorage.getItem("th-hist") || "[]"); } catch (e) { return []; } }
function histSave(r) { const h = histGet(); h.unshift({t: Date.now(), r}); try { localStorage.setItem("th-hist", JSON.stringify(h.slice(0, 20))); } catch (e) {} histRender(); }
function histRender() {
  const h = histGet(); $("#histN").textContent = h.length;
  $("#histList").innerHTML = h.length ? h.map((x, i) => `<div class="hi" data-i="${i}"><div class="t"><span>${new Date(x.t).toLocaleString("zh-CN")}</span><span class="tag">${E(x.r.analysis["\u98ce\u9669\u7b49\u7ea7"])}</span><span class="tag j">${E(x.r.analysis["\u4e3b\u8981\u8def\u5f84"])}</span></div><div class="n">${E(x.r.case?.notice)}</div></div>`).join("") : `<div class="empty sm"><div class="em-t">\u8fd8\u6ca1\u6709\u8bca\u65ad\u8bb0\u5f55</div><div class="em-s">\u5b8c\u6210\u4e00\u6b21\u8bca\u65ad\u540e\u4f1a\u81ea\u52a8\u4fdd\u5b58\u5728\u672c\u673a</div></div>`;
  $$("#histList .hi").forEach(el => el.onclick = () => { $("#hist").classList.remove("on"); go("diag"); $("#steps").innerHTML = stepsHtml(8); render(histGet()[+el.dataset.i].r); });
}
$("#histBtn").onclick = () => $("#hist").classList.add("on");
$("#histX").onclick = () => $("#hist").classList.remove("on");
$("#hist").onclick = e => { if (e.target.id === "hist") $("#hist").classList.remove("on"); };

/* ---------- \u5408\u89c4\u81ea\u67e5 ---------- */
const Q = [
  ["\u77e5\u8bc6\u4ea7\u6743", "\u5546\u54c1\u6807\u9898\u6216\u56fe\u7247\u4e2d\u662f\u5426\u4f7f\u7528\u4e86\u4ed6\u4eba\u54c1\u724c\u540d\uff08\u5982\u201cFor XX\u201d\uff09\uff1f", 1, 3, "\u4ec5\u4ee5\u6307\u793a\u6027\u65b9\u5f0f\u8bf4\u660e\u517c\u5bb9\u578b\u53f7\uff0c\u4e0d\u7a81\u51fa\u4ed6\u4eba\u5546\u6807\uff1b\u4fdd\u7559\u9002\u914d\u8bf4\u660e\u3002", ["US-TM-02", "AMZ-IP-04"]],
  ["\u77e5\u8bc6\u4ea7\u6743", "\u80fd\u5426\u63d0\u4f9b\u5b8c\u6574\u7684\u8fdb\u8d27\u6388\u6743\u94fe\u548c\u53d1\u7968\uff1f", 0, 3, "\u5411\u4e0a\u6e38\u7d22\u53d6\u6388\u6743\u4e66\u4e0e\u53d1\u7968\uff0c\u4fdd\u5b58\u53ef\u8ffd\u6eaf\u7684\u91c7\u8d2d\u8bb0\u5f55\uff0c\u4ee5\u5907\u5047\u5192\u6295\u8bc9\u7533\u8bc9\u3002", ["AMZ-IP-03", "US-TM-03"]],
  ["\u77e5\u8bc6\u4ea7\u6743", "\u4ea7\u54c1\u5916\u89c2\u662f\u5426\u53ef\u80fd\u4e0e\u4ed6\u4eba\u5916\u89c2\u8bbe\u8ba1\u4e13\u5229\u76f8\u8fd1\uff08\u5982\u516c\u6a21\uff09\uff1f", 1, 2, "\u4e0a\u67b6\u524d\u505a\u4e13\u5229\u68c0\u7d22\uff1b\u4fdd\u7559\u9996\u6b21\u9500\u552e\u65f6\u95f4\u8bc1\u636e\uff0c\u5fc5\u8981\u65f6\u8bf7\u5f8b\u5e08\u505a\u4e0d\u4fb5\u6743\u5206\u6790\u3002", ["US-PAT-02", "AMZ-IP-05"]],
  ["\u77e5\u8bc6\u4ea7\u6743", "\u4e3b\u56fe\u548c\u8be6\u60c5\u9875\u56fe\u7247\u662f\u5426\u5168\u90e8\u4e3a\u81ea\u6709\u62cd\u6444\u6216\u5df2\u83b7\u6388\u6743\uff1f", 0, 2, "\u66ff\u6362\u6765\u6e90\u4e0d\u660e\u7684\u56fe\u7247\uff0c\u4fdd\u5b58\u62cd\u6444\u539f\u56fe\u548c\u6388\u6743\u8bb0\u5f55\u3002", ["US-CR-01", "AMZ-IP-04"]],
  ["\u8bc4\u8bba\u64cd\u7eb5", "\u662f\u5426\u4ee5\u8fd4\u73b0\u3001\u793c\u54c1\u5361\u3001\u6298\u6263\u7b49\u65b9\u5f0f\u6362\u53d6\u8bc4\u8bba\uff1f", 1, 4, "\u7acb\u5373\u505c\u6b62\u6709\u507f\u7d22\u8bc4\uff0c\u6e05\u7406\u76f8\u5173\u6e20\u9053\uff1b\u8fd9\u662f\u4e9a\u9a6c\u900a\u505c\u7528\u8d26\u6237\u548c FTC \u7f5a\u6b3e\u7684\u9ad8\u53d1\u539f\u56e0\u3002", ["AMZ-COC-03", "US-FTC-03"]],
  ["\u8bc4\u8bba\u64cd\u7eb5", "\u5305\u88f9\u5185\u662f\u5426\u653e\u7f6e\u4ec5\u9080\u8bf7\u597d\u8bc4\u7684\u5361\u7247\uff1f", 1, 2, "\u6539\u4e3a\u4e2d\u7acb\u63aa\u8f9e\u7684\u552e\u540e\u5361\uff0c\u4e0d\u5f97\u53ea\u9080\u8bf7\u597d\u8bc4\u6216\u9644\u5e26\u4efb\u4f55\u597d\u5904\u3002", ["AMZ-COC-03"]],
  ["\u8bc4\u8bba\u64cd\u7eb5", "\u662f\u5426\u8981\u6c42\u4e70\u5bb6\u4fee\u6539\u6216\u5220\u9664\u5dee\u8bc4\uff1f", 1, 3, "\u4e0d\u5f97\u4ee5\u9000\u6b3e\u7b49\u6761\u4ef6\u6362\u53d6\u5220\u8bc4\uff1b\u901a\u8fc7\u5b98\u65b9\u6e20\u9053\u89e3\u51b3\u552e\u540e\u95ee\u9898\u3002", ["AMZ-COC-03", "US-FTC-05"]],
  ["\u5546\u54c1\u5b89\u5168\u4e0e\u5408\u89c4", "\u662f\u5426\u9500\u552e\u9762\u5411 12 \u5c81\u53ca\u4ee5\u4e0b\u513f\u7ae5\u7684\u4ea7\u54c1\u4e14\u5c1a\u65e0 CPC \u8bc1\u4e66\uff1f", 1, 4, "\u9001 CPSC \u8ba4\u53ef\u5b9e\u9a8c\u5ba4\u68c0\u6d4b\u5e76\u51fa\u5177 CPC\uff0c\u6309\u8981\u6c42\u9644\u6c38\u4e45\u8ffd\u8e2a\u6807\u7b7e\u3002", ["US-CPSIA-01", "AMZ-PC-01"]],
  ["\u5546\u54c1\u5b89\u5168\u4e0e\u5408\u89c4", "\u5728\u6b27\u76df\uff0f\u5317\u7231\u5c14\u5170\u9500\u552e\uff0c\u662f\u5426\u5df2\u6307\u5b9a\u6b27\u76df\u5883\u5185\u8d1f\u8d23\u4eba\u5e76\u5728\u540e\u53f0\u63d0\u4ea4\uff1f", 0, 3, "\u59d4\u6258\u6b27\u76df\u5883\u5185\u8d23\u4efb\u4eba\uff0c\u5728\u540e\u53f0\u586b\u5199\u8d1f\u8d23\u4eba\u4e0e\u5236\u9020\u5546\u4fe1\u606f\u53ca\u5b89\u5168\u8d44\u6599\u3002", ["EU-GPSR-02", "AMZ-PC-02"]],
  ["\u5546\u54c1\u5b89\u5168\u4e0e\u5408\u89c4", "\u5411\u5fb7\u56fd\u53d1\u8d27\uff0c\u662f\u5426\u5df2\u5b8c\u6210\u5305\u88c5\u6cd5\uff08LUCID\uff09\u6ce8\u518c\uff1f", 0, 2, "\u5728 LUCID \u6ce8\u518c\u5e76\u52a0\u5165\u56de\u6536\u7cfb\u7edf\uff0c\u5411\u5e73\u53f0\u63d0\u4ea4\u6ce8\u518c\u53f7\u3002", ["DE-VERPACKG-01"]],
  ["\u8eab\u4efd\u4e0e\u4fe1\u606f", "\u8425\u4e1a\u6267\u7167\u3001\u94f6\u884c\u8d26\u6237\u3001\u8d26\u5355\u5730\u5740\u7b49\u4fe1\u606f\u662f\u5426\u5b8c\u5168\u4e00\u81f4\u4e14\u4e3a\u6700\u65b0\uff1f", 0, 3, "\u7edf\u4e00\u5e76\u66f4\u65b0\u5404\u9879\u8d44\u6599\uff1b\u5730\u5740\u53d8\u66f4\u540e\u53ca\u65f6\u529e\u7406\u6267\u7167\u53d8\u66f4\u5e76\u7559\u5b58\u8bc1\u660e\u3002", ["AMZ-COC-02", "US-INFORM-02"]],
  ["\u8eab\u4efd\u4e0e\u4fe1\u606f", "\u662f\u5426\u4e0e\u4ed6\u4eba\u5171\u7528\u8bbe\u5907\u3001\u7f51\u7edc\u6216\u6536\u6b3e\u8d26\u6237\u8fd0\u8425\u591a\u4e2a\u5e97\u94fa\uff1f", 1, 3, "\u591a\u8d26\u6237\u987b\u6709\u6b63\u5f53\u5546\u4e1a\u7406\u7531\u5e76\u4e8b\u5148\u7533\u8bf7\uff1b\u907f\u514d\u4e0e\u65e0\u5173\u4e3b\u4f53\u5171\u7528\u8d44\u6e90\u3002", ["AMZ-COC-07"]],
  ["\u8eab\u4efd\u4e0e\u4fe1\u606f", "\u5e97\u94fa\u662f\u5426\u7531\u4e2d\u4ecb\u4f7f\u7528\u4ed6\u4eba\u8eab\u4efd\u6ce8\u518c\uff1f", 1, 5, "\u5b58\u5728\u8eab\u4efd\u5192\u7528\u548c\u5211\u4e8b\u98ce\u9669\uff0c\u5e94\u5c3d\u5feb\u54a8\u8be2\u5f8b\u5e08\uff0c\u4e0d\u5f97\u4f2a\u9020\u6216\u8865\u9020\u8eab\u4efd\u6750\u6599\u3002", ["AMZ-COC-02", "CN-CASE-03"]],
  ["\u7ee9\u6548\u4e0e\u7ecf\u8425", "\u8fd1\u671f\u8ba2\u5355\u7f3a\u9677\u7387\u662f\u5426\u63a5\u8fd1\u6216\u8d85\u8fc7 1%\uff1f", 1, 3, "\u6392\u67e5\u5dee\u8bc4\u3001\u7d22\u8d54\u548c\u62d2\u4ed8\u539f\u56e0\uff0c\u6539\u8fdb\u8d28\u68c0\u4e0e\u5ba2\u670d\u6d41\u7a0b\uff0c\u4fdd\u7559\u6574\u6539\u8bb0\u5f55\u3002", ["AMZ-OPP-01"]],
  ["\u7ee9\u6548\u4e0e\u7ecf\u8425", "\u591a\u5e73\u53f0\u9500\u552e\u65f6\u5e93\u5b58\u662f\u5426\u4e0d\u540c\u6b65\u3001\u7ecf\u5e38\u8d85\u5356\u53d6\u6d88\uff1f", 1, 2, "\u63a5\u5165\u5e93\u5b58\u540c\u6b65\u5de5\u5177\uff0c\u8bbe\u7f6e\u5b89\u5168\u5e93\u5b58\uff0c\u53d6\u6d88\u7387\u63a7\u5236\u5728 2.5% \u4ee5\u4e0b\u3002", ["AMZ-OPP-02"]],
  ["\u7ee9\u6548\u4e0e\u7ecf\u8425", "\u662f\u5426\u8d2d\u4e70\u8fc7\u5237\u5355\u3001\u5173\u952e\u8bcd\u6392\u540d\u3001\u52a0\u8d2d\u7b49\u201c\u6d41\u91cf\u670d\u52a1\u201d\uff1f", 1, 4, "\u7acb\u5373\u505c\u6b62\u5e76\u89e3\u7ea6\uff1b\u6b64\u7c7b\u670d\u52a1\u5df2\u88ab\u4e9a\u9a6c\u900a\u8d77\u8bc9\uff0c\u5c5e\u4e8e\u64cd\u7eb5\u6392\u540d\u3002", ["AMZ-COC-04", "CN-CASE-05"]]];
const ANS = {};
function checkInit() {
  const cats = [...new Set(Q.map(q => q[0]))];
  $("#ckList").innerHTML = cats.map(c => `<div class="ckc"><h4><i></i>${c}</h4>${Q.map((q, i) => q[0] === c ? `<div class="q" id="q${i}"><div class="t">${i + 1}. ${q[1]}</div><div class="yn"><button data-i="${i}" data-v="1">\u662f</button><button data-i="${i}" data-v="0">\u5426</button></div></div>` : "").join("")}</div>`).join("");
  $$("#ckList .yn button").forEach(b => b.onclick = () => { ANS[b.dataset.i] = +b.dataset.v; $$(`#q${b.dataset.i} .yn button`).forEach(x => x.classList.toggle("on", x === b)); checkUpdate(); });
}
function checkUpdate() {
  let tot = 0, risk = 0; const per = {};
  Q.forEach((q, i) => { per[q[0]] ??= [0, 0]; per[q[0]][1] += q[3]; tot += q[3]; if (i in ANS) { const bad = ANS[i] === q[2]; $("#q" + i).className = "q " + (bad ? "risk" : "safe"); if (bad) { risk += q[3]; per[q[0]][0] += q[3]; } } });
  const n = Object.keys(ANS).length, score = Math.round(risk / tot * 100);
  $("#ckBar").style.width = n / Q.length * 100 + "%"; $("#ckDone").textContent = `\u5df2\u56de\u7b54 ${n} / ${Q.length}`;
  charts.cGauge?.setOption({series: [{data: [{value: score, name: score < 20 ? "\u4f4e\u98ce\u9669" : score < 45 ? "\u4e2d\u98ce\u9669" : score < 70 ? "\u9ad8\u98ce\u9669" : "\u6781\u9ad8\u98ce\u9669"}]}]});
  charts.cRadar?.setOption({series: [{data: [{value: Object.values(per).map(([r, t]) => Math.round(100 - r / t * 100)), name: "\u5b89\u5168\u5ea6"}]}]});
  const bad = Q.map((q, i) => [q, i]).filter(([q, i]) => i in ANS && ANS[i] === q[2]).sort((a, b) => b[0][3] - a[0][3]);
  $("#ckAdvice").innerHTML = `<div class="ch"><h3>\u6574\u6539\u5efa\u8bae</h3><span class="sub">${bad.length ? `\u53d1\u73b0 ${bad.length} \u9879\u98ce\u9669\uff0c\u6309\u4e25\u91cd\u7a0b\u5ea6\u6392\u5e8f` : "\u56de\u7b54\u95ee\u9898\u540e\uff0c\u8fd9\u91cc\u4f1a\u5217\u51fa\u9700\u8981\u6574\u6539\u7684\u4e8b\u9879"}</span></div><div class="adv">${bad.map(([q, i], k) => `<div class="ad" style="animation-delay:${k * 60}ms"><div class="h">${E(q[1].replace(/\uff1f$/, ""))}<em>${q[0]}</em></div><p>${E(q[4])}</p><div class="k">${q[5].map(id => `<span class="tag" data-kb="${id}">${id}</span>`).join("")}</div></div>`).join("")}</div>`;
  $$("#ckAdvice [data-kb]").forEach(t => { t.style.cursor = "pointer"; t.onclick = () => { go("kb"); $("#kbQ").value = t.dataset.kb; kbLoad(); }; });
}
DRAW.check = () => {
  chart("cGauge", {series: [{type: "gauge", startAngle: 210, endAngle: -30, min: 0, max: 100, radius: "92%", center: ["50%", "58%"], progress: {show: true, width: 16, roundCap: true, itemStyle: {color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{offset: 0, color: "#16A34A"}, {offset: .5, color: "#E7A23B"}, {offset: 1, color: "#B42318"}])}},
    axisLine: {roundCap: true, lineStyle: {width: 16, color: [[1, dark() ? "#1F2D47" : "#EEF1F5"]]}}, pointer: {show: false}, axisTick: {show: false}, splitLine: {show: false}, axisLabel: {show: false},
    title: {offsetCenter: [0, "34%"], fontSize: 14, color: dark() ? "#9FB3D1" : "#667085"}, detail: {offsetCenter: [0, "-4%"], fontSize: 40, fontWeight: 800, color: dark() ? "#E6ECF5" : "#0E1B33", formatter: "{value}"}, data: [{value: 0, name: "\u5c1a\u672a\u4f5c\u7b54"}]}]});
  chart("cRadar", {radar: {radius: "66%", indicator: ["\u77e5\u8bc6\u4ea7\u6743", "\u8bc4\u8bba\u64cd\u7eb5", "\u5546\u54c1\u5b89\u5168\u4e0e\u5408\u89c4", "\u8eab\u4efd\u4e0e\u4fe1\u606f", "\u7ee9\u6548\u4e0e\u7ecf\u8425"].map(n => ({name: n, max: 100})), splitArea: {show: false}, axisName: {color: dark() ? "#9FB3D1" : "#475467", fontSize: 12}, splitLine: {lineStyle: {color: dark() ? "#1F2D47" : "#E4E8EF"}}, axisLine: {lineStyle: {color: dark() ? "#1F2D47" : "#E4E8EF"}}},
    series: [{type: "radar", symbolSize: 6, areaStyle: {color: "rgba(47,91,211,.18)"}, lineStyle: {color: C.blue, width: 2}, itemStyle: {color: C.blue}, data: [{value: [100, 100, 100, 100, 100], name: "\u5b89\u5168\u5ea6"}]}]});
  checkUpdate();
};

/* ---------- \u77e5\u8bc6\u5e93 ---------- */
let kbJur = "";
function kbInit() {
  const jurs = ["", ...STATS.kb_jur.map(x => x[0])];
  $("#kbJur").innerHTML = jurs.map(j => `<button data-j="${E(j)}" class="${j ? "" : "on"}">${j ? E(j.replace("\u5e73\u53f0-", "")) + " " + STATS.kb_jur.find(x => x[0] === j)[1] : "\u5168\u90e8 " + STATS.kb_total}</button>`).join("");
  $$("#kbJur button").forEach(b => b.onclick = () => { kbJur = b.dataset.j; $$("#kbJur button").forEach(x => x.classList.toggle("on", x === b)); kbLoad(); });
  let t; $("#kbQ").oninput = () => { clearTimeout(t); t = setTimeout(kbLoad, 220); };
}
async function kbLoad() {
  const q = $("#kbQ").value.trim();
  const items = await api("/api/kb?" + new URLSearchParams({q, jur: kbJur}));
  const hl = s => { let x = E(s); if (q) q.split(/\s+/).filter(Boolean).forEach(w => { x = x.split(E(w)).join(`<mark>${E(w)}</mark>`); }); return x; };
  $("#kbMeta").textContent = `\u5171 ${STATS.kb_total} \u6761\uff0c\u5f53\u524d\u663e\u793a ${Math.min(items.length, 60)} \u6761`;
  $("#kbList").innerHTML = items.slice(0, 60).map((x, i) => `<div class="kbi" style="animation-delay:${Math.min(i, 12) * 35}ms"><div class="h"><span class="tag j">${E(x.jurisdiction.replace("\u5e73\u53f0-", ""))}</span><span class="tag">${E(x.category)}</span><span class="id">${E(x.id)}</span></div>
    <div class="src">${hl(x.source)}\u3000${hl(x.provision)}</div><div class="sum">${hl(x.summary)}</div>
    ${x.seller_guidance ? `<div class="gd">\u5356\u5bb6\u6307\u5f15\uff1a${E(x.seller_guidance)}</div>` : ""}
    <div class="ft"><span>\u751f\u6548\uff1a${E(x.effective_date)}</span><span>\u6838\u9a8c\uff1a${E(x.verified)}</span>${x.url ? `<a href="${E(x.url)}" target="_blank">\u539f\u6587 \u2197</a>` : ""}</div></div>`).join("");
}
DRAW.kb = () => kbLoad();

/* ---------- \u77e5\u8bc6\u56fe\u8c31 ---------- */
let G = null;
DRAW.graph = async () => {
  G ??= await api("/api/graph");
  const JC = {"\u5e73\u53f0-\u4e9a\u9a6c\u900a": "#0E1B33", "\u7f8e\u56fd": "#2F5BD3", "\u4e2d\u56fd": "#B42318", "\u6b27\u76df": "#16A34A", "\u901a\u7528\u65b9\u6cd5": "#98A2B3", "\u82f1\u56fd": "#7C3AED", "\u65e5\u672c": "#DB2777", "\u5e73\u53f0-eBay": "#0891B2", "\u5e73\u53f0-\u6c83\u5c14\u739b": "#CA8A04"};
  const cats = [{name: "\u8fdd\u89c4\u7c7b\u522b"}, {name: "\u6cd5\u57df"}, {name: "\u6761\u6587"}, {name: "\u6848\u4f8b"}];
  $("#gLeg").innerHTML = [["\u8fdd\u89c4\u7c7b\u522b", "#B8893B"], ["\u6cd5\u57df", "#7EA2E8"], ["\u6761\u6587\uff08\u6309\u6cd5\u57df\u7740\u8272\uff09", "#2F5BD3"], ["\u5f00\u53d1\u96c6\u6848\u4f8b", "#C27C0E"]].map(([n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join("");
  const deg = {}; G.links.forEach(l => { deg[l.source] = (deg[l.source] || 0) + 1; deg[l.target] = (deg[l.target] || 0) + 1; });
  const nodes = G.nodes.map(n => ({...n, category: {"\u7c7b\u522b": 0, "\u6cd5\u57df": 1, "\u6761\u6587": 2, "\u6848\u4f8b": 3}[n.type],
    symbolSize: n.type === "\u7c7b\u522b" ? 46 : n.type === "\u6cd5\u57df" ? 34 : n.type === "\u6848\u4f8b" ? 11 : 6 + Math.min(10, (deg[n.id] || 0) * 1.1),
    itemStyle: {color: n.type === "\u7c7b\u522b" ? "#B8893B" : n.type === "\u6cd5\u57df" ? "#7EA2E8" : n.type === "\u6848\u4f8b" ? "#C27C0E" : JC[n.jur] || "#2F5BD3", borderColor: dark() ? "#111C31" : "#fff", borderWidth: 1.5},
    label: {show: n.type === "\u7c7b\u522b" || n.type === "\u6cd5\u57df", fontWeight: 700, fontSize: n.type === "\u7c7b\u522b" ? 14 : 12, color: dark() ? "#E6ECF5" : "#0E1B33"}}));
  const c = chart("cGraph", {tooltip: {formatter: p => p.dataType === "node" ? `${E(p.data.label || p.data.name)}` : ""},
    series: [{type: "graph", layout: "force", roam: true, draggable: true, categories: cats, data: nodes, links: G.links,
      force: {repulsion: 120, edgeLength: [30, 90], gravity: .08, friction: .12}, lineStyle: {color: "source", opacity: .22, curveness: .08},
      emphasis: {focus: "adjacency", lineStyle: {width: 2, opacity: .8}}, animationDurationUpdate: 1200}]});
  c.on("click", p => { if (p.dataType === "node") gSide(p.data); });
};
function gSide(n) {
  const nb = G.links.filter(l => l.source === n.id || l.target === n.id).map(l => l.source === n.id ? l.target : l.source);
  const byId = Object.fromEntries(G.nodes.map(x => [x.id, x]));
  const rel = nb.map(i => byId[i]).filter(Boolean);
  const list = (t, arr) => arr.length ? `<div class="tt" style="margin-top:12px">${t}\uff08${arr.length}\uff09</div><ul>${arr.slice(0, 30).map(x => `<li data-id="${E(x.id)}">${E(x.type === "\u6761\u6587" ? x.id + "\u3000" + (x.label || "").slice(0, 26) : x.type === "\u6848\u4f8b" ? x.id + "\u3000" + (x.label || "").slice(0, 24) : x.name)}</li>`).join("")}</ul>` : "";
  $("#gSide").innerHTML = `<div class="tt">${E(n.type)}</div><h4>${E(n.type === "\u6761\u6587" ? n.label : n.type === "\u6848\u4f8b" ? n.id + "\u3000" + n.label : n.name)}</h4>
    ${n.summary ? `<p>${E(n.summary)}</p>` : ""}${n.url ? `<p><a href="${E(n.url)}" target="_blank">\u67e5\u770b\u539f\u6587 \u2197</a></p>` : ""}
    ${list("\u5173\u8054\u6761\u6587", rel.filter(x => x.type === "\u6761\u6587"))}${list("\u5173\u8054\u6848\u4f8b", rel.filter(x => x.type === "\u6848\u4f8b"))}${list("\u6240\u5c5e\u7c7b\u522b / \u6cd5\u57df", rel.filter(x => x.type === "\u7c7b\u522b" || x.type === "\u6cd5\u57df"))}`;
  $$("#gSide li").forEach(li => li.onclick = () => { const x = byId[li.dataset.id]; const idx = G.nodes.findIndex(y => y.id === x.id); charts.cGraph.dispatchAction({type: "focusNodeAdjacency", seriesIndex: 0, dataIndex: idx}); gSide(x); });
}

/* ---------- \u8bc4\u6d4b ---------- */
DRAW.eval = () => {
  $("#kpis2").innerHTML = kpi("\u98ce\u9669\u7b49\u7ea7\u51c6\u786e\u7387", "83.7", "%", "\u76f4\u63a5\u95ee\u5927\u6a21\u578b 39.5%", true) + kpi("\u4e3b\u8981\u8def\u5f84\u51c6\u786e\u7387", "83.7", "%", "\u76f4\u63a5\u95ee\u5927\u6a21\u578b 74.4%")
    + kpi("\u9996\u8981\u6761\u6b3e\u547d\u4e2d\u7387", "93.0", "%", "\u68c0\u7d22\u53ec\u56de 95.3%") + kpi("\u6587\u4e66\u4e13\u5bb6\u8bc4\u5206", "4.63", "/5", "8 \u4efd\u7cfb\u7edf\u6587\u4e66", true);
  const sl = {lineStyle: {color: dark() ? "#1F2D47" : "#EEF1F5"}};
  chart("cCmp", {legend: {top: 0}, grid: {left: 46, right: 16, top: 40, bottom: 28}, tooltip: {trigger: "axis"}, color: [C.gray, C.sky, C.ink],
    xAxis: {type: "category", data: ["\u8fdd\u89c4\u7c7b\u522b", "\u98ce\u9669\u7b49\u7ea7", "\u4e3b\u8981\u8def\u5f84"], axisTick: {show: false}}, yAxis: {max: 100, axisLabel: {formatter: "{value}%"}, splitLine: sl},
    series: [["\u76f4\u63a5\u95ee\u5927\u6a21\u578b", [95.3, 39.5, 74.4]], ["\u76f4\u63a5\u95ee\uff0b\u76f8\u540c\u6807\u51c6", [95.3, 93.0, 81.4]], ["\u5929\u8861", [95.3, 83.7, 83.7]]].map(([n, d]) => ({name: n, type: "bar", barGap: "18%", barWidth: 28, data: d, itemStyle: {borderRadius: [5, 5, 0, 0]}, label: {show: true, position: "top", fontSize: 11, formatter: "{c}"}}))});
  chart("cCite", {tooltip: {trigger: "item"}, legend: {right: 6, top: "middle", orient: "vertical", itemGap: 12}, color: [C.green, C.red, "#E66B52", C.gold, C.gray],
    series: [{type: "pie", radius: ["44%", "72%"], center: ["34%", "52%"], label: {formatter: "{c}", fontWeight: 700}, itemStyle: {borderColor: dark() ? "#111C31" : "#fff", borderWidth: 3, borderRadius: 4},
      data: [["\u771f\u5b9e\u4e14\u5207\u9898", 83], ["\u6761\u53f7\u6216\u5185\u5bb9\u6709\u8bef", 12], ["\u540d\u79f0\u65e0\u6cd5\u6838\u5b9e", 6], ["\u771f\u5b9e\u4f46\u4e0d\u5207\u9898", 14], ["\u4ecd\u5b58\u7591", 6]].map(([n, v]) => ({name: n, value: v}))}]});
  chart("cByCat", {legend: {top: 0}, grid: {left: 40, right: 10, top: 40, bottom: 28}, tooltip: {trigger: "axis"}, color: [C.gray, C.sky, C.ink],
    xAxis: {type: "category", data: ["\u77e5\u8bc6\u4ea7\u6743", "\u8bc4\u8bba\u64cd\u7eb5", "\u5b89\u5168\u5408\u89c4", "\u8eab\u4efd\u4fe1\u606f", "\u7ee9\u6548\u7ecf\u8425"], axisTick: {show: false}}, yAxis: {max: 100, splitLine: sl},
    series: [["\u76f4\u63a5\u95ee", [50, 44, 0, 50, 50]], ["\uff0b\u76f8\u540c\u6807\u51c6", [100, 89, 75, 100, 100]], ["\u5929\u8861", [83, 89, 63, 100, 88]]].map(([n, d]) => ({name: n, type: "bar", barWidth: 13, data: d, itemStyle: {borderRadius: [4, 4, 0, 0]}}))});
  chart("cDoc", {radar: {radius: "64%", indicator: ["\u7ed3\u6784\u5b8c\u6574", "\u6cd5\u5f8b\u4f9d\u636e", "\u8bf4\u670d\u529b", "\u53ef\u76f4\u63a5\u4f7f\u7528"].map(n => ({name: n, max: 5, min: 0})), splitArea: {show: false}, splitLine: sl, axisLine: sl, axisName: {color: dark() ? "#9FB3D1" : "#475467"}},
    series: [{type: "radar", data: [{value: [4.63, 4.88, 4.5, 4.5], name: "\u5e73\u5747\u5206", areaStyle: {color: "rgba(184,137,59,.25)"}, lineStyle: {color: C.gold, width: 2}, itemStyle: {color: C.gold}, label: {show: true, fontWeight: 700}}]}]});
  const s = STATS.summary;
  if (s) { $("#evNote").textContent = s["\u8bf4\u660e"];
    $("#evTable").innerHTML = `<table class="et"><tr>${s.cols.map((c, i) => `<th class="${i === 1 ? "us" : ""}">${E(c)}</th>`).join("")}</tr>${s.rows.map(r => `<tr>${r.map((v, i) => `<td class="${i === 1 ? "us" : ""}">${E(v)}</td>`).join("")}</tr>`).join("")}</table>`; }
};

/* ---------- \u6570\u636e\u5927\u5c4f ---------- */
let scrTimer = null;
DRAW.screen = () => {
  const T = {color: "#9FB3D1"}, L = {lineStyle: {color: "rgba(120,160,220,.15)"}}, s = STATS;
  const lv = (typeof LIVE !== "undefined" && LIVE?.items || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8);
  $("#tickerIn").innerHTML = (lv.length ? lv.map(x => `<b>${E(x.date)}</b>${E(x.zh_title || x.title)}`).join("") : "") + RULES.map(r => `<b>${r[0]}</b>${r[1]}\uff08${r[2]}\uff09`).join("") + "<b>\u7cfb\u7edf</b>\u6d4b\u8bd5\u96c6 43 \u9898 \u00b7 \u98ce\u9669\u7b49\u7ea7\u51c6\u786e\u7387 83.7% \u00b7 \u7f16\u9020\u5f15\u7528 0 \u6761 \u00b7 \u6587\u4e66\u4e13\u5bb6\u8bc4\u5206 4.63";
  $("#scrNums").innerHTML = [["\u6cd5\u89c4\u4e0e\u653f\u7b56\u6761\u76ee", s.kb_total, "\u6761"], ["\u8986\u76d6\u6cd5\u57df", nJur(), "\u4e2a"], ["\u6807\u6ce8\u6848\u4f8b", s.cases_total, "\u4e2a"], ["\u98ce\u9669\u7b49\u7ea7\u51c6\u786e\u7387", "83.7", "%"], ["\u7f16\u9020\u5f15\u7528", 0, "\u6761"], ["\u6587\u4e66\u4e13\u5bb6\u8bc4\u5206", "4.63", "\u5206"]]
    .map(([k, v, u]) => `<div class="sn"><div class="v"><span data-n="${v}">${v}</span><small>${u}</small></div><div class="k">${k}</div></div>`).join("");
  const jur = chart("sJur", {color: ["#E7C98C", "#5B8FF9", "#5AD8A6", "#9DB4E8", "#6C7A96"], tooltip: {},
    series: [{type: "pie", roseType: "radius", radius: ["22%", "76%"], label: {color: "#DCE6F5", formatter: "{b}\n{c}"}, itemStyle: {borderColor: "#0B1730", borderWidth: 2},
      data: s.kb_jur.map(([n, v]) => ({name: n.replace("\u5e73\u53f0-", ""), value: v}))}]});
  chart("sCmp", {color: ["#6C7A96", "#5B8FF9", "#E7C98C"], legend: {textStyle: T, top: 0}, grid: {left: 40, right: 10, top: 36, bottom: 24}, tooltip: {trigger: "axis"},
    xAxis: {type: "category", data: ["\u7c7b\u522b", "\u98ce\u9669", "\u8def\u5f84"], axisLabel: T, axisLine: L}, yAxis: {max: 100, axisLabel: T, splitLine: L},
    series: [["\u76f4\u63a5\u95ee", [95.3, 39.5, 74.4]], ["\u52a0\u6807\u51c6", [95.3, 93.0, 81.4]], ["\u5929\u8861", [95.3, 83.7, 83.7]]].map(([n, d]) => ({name: n, type: "bar", barWidth: 14, data: d, itemStyle: {borderRadius: [4, 4, 0, 0]}}))});
  chart("sCat", {grid: {left: 96, right: 26, top: 6, bottom: 10}, xAxis: {show: false}, yAxis: {type: "category", data: s.test_cat.map(x => x[0]).reverse(), axisLabel: T, axisLine: {show: false}, axisTick: {show: false}},
    series: [{type: "bar", barWidth: 12, data: s.test_cat.map(x => x[1]).reverse(), label: {show: true, position: "right", color: "#DCE6F5"}, showBackground: true, backgroundStyle: {color: "rgba(90,140,220,.08)", borderRadius: 6},
      itemStyle: {borderRadius: 6, color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{offset: 0, color: "#2A63C9"}, {offset: 1, color: "#5AD8F5"}])}}]});
  const risk = chart("sRisk", {color: ["#5AD8A6", "#E7C98C", "#F08A5D", "#E0524A"], tooltip: {},
    series: [{type: "pie", radius: ["45%", "66%"], label: {color: "#DCE6F5", formatter: "{b}\n{c} \u9898"}, itemStyle: {borderColor: "#0B1730", borderWidth: 3}, data: s.test_risk.map(([n, v]) => ({name: n, value: v}))}]});
  chart("sCite", {grid: {left: 10, right: 10, top: 10, bottom: 10}, xAxis: {show: false, max: 121}, yAxis: {type: "category", show: false, data: ["x"]},
    series: [["\u771f\u5b9e\u4e14\u5207\u9898", 83, "#5AD8A6"], ["\u6761\u53f7\u6709\u8bef", 12, "#F08A5D"], ["\u540d\u79f0\u65e0\u6cd5\u6838\u5b9e", 6, "#E0524A"], ["\u4e0d\u5207\u9898", 14, "#E7C98C"], ["\u5b58\u7591", 6, "#6C7A96"]]
      .map(([n, v, c]) => ({name: n, type: "bar", stack: "a", barWidth: 30, data: [v], itemStyle: {color: c}, label: {show: v >= 12, color: "#0B1730", fontWeight: 700, formatter: `${n} ${v}`}}))});
  chart("sRoute", {tooltip: {}, radar: {radius: "62%", indicator: s.test_route.map(([n]) => ({name: n.replace("\u6216\u4e0d\u4fb5\u6743\u58f0\u660e", "").replace("\u7533\u8bc9", ""), max: 16})), axisName: {color: "#9FB3D1"}, splitLine: L, splitArea: {show: false}, axisLine: L},
    series: [{type: "radar", areaStyle: {color: "rgba(231,201,140,.25)"}, lineStyle: {color: "#E7C98C"}, itemStyle: {color: "#E7C98C"}, data: [{value: s.test_route.map(x => x[1]), name: "\u6d4b\u8bd5\u96c6\u8def\u5f84\u5206\u5e03"}]}]});
  $("#sFlow").innerHTML = STEPS.map((x, i) => `<div class="sf" id="sf${i}"><b>${String(i + 1).padStart(2, "0")}</b><span>${x[0]}</span></div>`).join("<i></i>");
  clearInterval(scrTimer); let k = 0;
  scrTimer = setInterval(() => { if (cur !== "screen") return; $$(".sf").forEach((e, i) => e.classList.toggle("on", i === k % 7));
    [jur, risk].forEach((c, j) => { const n = j ? 4 : 5; c.dispatchAction({type: "downplay", seriesIndex: 0}); c.dispatchAction({type: "highlight", seriesIndex: 0, dataIndex: k % n}); c.dispatchAction({type: "showTip", seriesIndex: 0, dataIndex: k % n}); }); k++; }, 1600);
};

/* ---------- \u67b6\u6784 ---------- */
function about() {
  $("#arch").innerHTML = `<div class="arch">${STEPS.map((s, i) => `<div class="an ${[2, 3, 4].includes(i) ? "k" : ""}"><b>${String(i + 1).padStart(2, "0")}</b><div>${s[0]}</div><small>${s[1]}</small></div>`).join("")}</div>
    <div class="arch2"><div class="ab">\u5224\u65ad\u6807\u51c6<small>\u98ce\u9669\u6309\u5df2\u91c7\u53d6\u63aa\u65bd\u5b9a\u7ea7 \u00b7 \u516d\u7c7b\u5e94\u5bf9\u8def\u5f84</small></div><div class="ab">\u6cd5\u89c4\u4e0e\u5e73\u53f0\u653f\u7b56\u77e5\u8bc6\u5e93<small>${STATS.kb_total} \u6761 \u00b7 \u7f16\u53f7 \u00b7 \u6cd5\u57df \u00b7 \u751f\u6548\u65e5\u671f \u00b7 \u539f\u6587\u94fe\u63a5</small></div></div>`;
  $("#aboutCards").innerHTML = [["\u6df7\u5408\u68c0\u7d22", "BM25 \u5173\u952e\u8bcd\u68c0\u7d22\u4e0e\u5b57\u7b26\u7ea7 TF-IDF \u76f8\u4f3c\u5ea6\u52a0\u6743\u878d\u5408\uff0c\u6309\u7ad9\u70b9\u5bf9\u6cd5\u57df\u52a0\u6743\uff1b\u672a\u751f\u6548\u7684\u8349\u6848\u964d\u6743\u5e76\u63d0\u793a\u3002"],
    ["\u4e09\u6bb5\u8bba\u63a8\u7406", "\u6a21\u578b\u53ea\u80fd\u5f15\u7528\u5019\u9009\u6761\u6b3e\u7f16\u53f7\uff0c\u6309\u201c\u89c4\u5219\u2014\u4e8b\u5b9e\u2014\u7ed3\u8bba\u201d\u8f93\u51fa\u7ed3\u6784\u5316\u7ed3\u679c\uff0c\u6bcf\u6761\u89c4\u5219\u5199\u660e\u9002\u7528\u7406\u7531\u3002"],
    ["\u5f15\u7528\u6821\u9a8c\u4e0e\u5206\u6d41", "\u77e5\u8bc6\u5e93\u5916\u7684\u7f16\u53f7\u4e00\u5f8b\u5220\u9664\uff1b\u5c01\u53f7\u7ea7\u3001\u8f6c\u5f8b\u5e08\u3001\u4f4e\u7f6e\u4fe1\u5ea6\u6848\u4ef6\u63d0\u793a\u4eba\u5de5\u6216\u5f8b\u5e08\u590d\u6838\u3002"]]
    .map(([t, p], i) => `<div class="card ac"><div class="n">0${i + 1}</div><h4>${t}</h4><p>${p}</p></div>`).join("");
}

/* ---------- \u547d\u4ee4\u9762\u677f ---------- */
let cmdItems = [], cmdOn = 0;
function cmdOpen() { $("#cmd").classList.add("on"); $("#cmdQ").value = ""; cmdFill(); setTimeout(() => $("#cmdQ").focus(), 50); }
async function cmdFill() {
  const q = $("#cmdQ").value.trim();
  const pages = Object.entries(TITLES).filter(([k, v]) => !q || v.join("").includes(q)).map(([k, v]) => ({t: v[0], s: "\u9875\u9762", f: () => go(k)}));
  const ex = EX.filter(c => q && (c.id.includes(q.toUpperCase()) || c.notice.includes(q))).slice(0, 5).map(c => ({t: c.id + "\u3000" + c.notice.slice(0, 30), s: "\u793a\u4f8b\u6848\u4ef6", f: () => { go("diag"); loadEx(c.id); }}));
  const kb = q ? (await api("/api/kb?q=" + encodeURIComponent(q))).slice(0, 5).map(x => ({t: x.source + " " + x.provision, s: "\u6761\u6587 " + x.id, f: () => { go("kb"); $("#kbQ").value = q; kbLoad(); }})) : [];
  cmdItems = [...pages, ...ex, ...kb]; cmdOn = 0; cmdDraw();
}
function cmdDraw() { $("#cmdList").innerHTML = cmdItems.map((x, i) => `<div class="ci ${i === cmdOn ? "on" : ""}" data-i="${i}">${E(x.t)}<small>${E(x.s)}</small></div>`).join("") || `<div class="ci">\u6ca1\u6709\u5339\u914d\u7ed3\u679c</div>`;
  $$("#cmdList .ci[data-i]").forEach(el => el.onclick = () => { cmdItems[+el.dataset.i].f(); $("#cmd").classList.remove("on"); }); }
$("#cmdBtn").onclick = cmdOpen;
let ct; $("#cmdQ").oninput = () => { clearTimeout(ct); ct = setTimeout(cmdFill, 150); };
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); cmdOpen(); }
  if (!$("#cmd").classList.contains("on")) { if (e.key === "Escape") $$(".drawer,.modal").forEach(x => x.classList.remove("on")); return; }
  if (e.key === "Escape") $("#cmd").classList.remove("on");
  if (e.key === "ArrowDown") { cmdOn = Math.min(cmdItems.length - 1, cmdOn + 1); cmdDraw(); }
  if (e.key === "ArrowUp") { cmdOn = Math.max(0, cmdOn - 1); cmdDraw(); }
  if (e.key === "Enter" && cmdItems[cmdOn]) { cmdItems[cmdOn].f(); $("#cmd").classList.remove("on"); }
});
$("#cmd").onclick = e => { if (e.target.id === "cmd") $("#cmd").classList.remove("on"); };

/* ---------- \u8bbe\u7f6e ---------- */
$("#openSettings").onclick = () => { $("#sUrl").value = META.base_url; $("#sModel").value = META.model; $("#sMock").checked = META.mock; $("#settings").classList.add("on"); };
$("#sCancel").onclick = () => $("#settings").classList.remove("on");
$("#sSave").onclick = async () => {
  await fetch("/api/settings", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({base_url: $("#sUrl").value, model: $("#sModel").value, api_key: $("#sKey").value, mock: $("#sMock").checked})});
  $("#settings").classList.remove("on"); $("#sKey").value = ""; META = await api("/api/meta"); setMeta(); toast("\u6a21\u578b\u8bbe\u7f6e\u5df2\u4fdd\u5b58");
};
setInterval(() => { const c = $("#scrClock"); if (c) c.textContent = new Date().toLocaleString("zh-CN", {hour12: false}); }, 1000);

