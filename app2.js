"use strict";
/* \u5929\u8861 \u00b7 \u65b0\u589e\u6a21\u5757\uff1a\u6cd5\u89c4\u52a8\u6001\uff08\u8054\u7f51\u66f4\u65b0\uff09\u3001\u5de5\u5177\u7bb1\u3001\u65b0\u624b\u5b66\u5802\u3001\u65b0\u624b\u5f15\u5bfc */
const post = (p, b) => fetch(p, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(b)}).then(r => r.json());
const SRC_C = {fr: "#2F5BD3", ftc: "#0E1B33", cpsc: "#C2410C", fda: "#0891B2", uk: "#7C3AED", cma: "#DB2777", ipo: "#CA8A04", cn: "#B42318"};
const REVIEWABLE = ["fr", "ftc", "cn", "cma", "ipo"];
let lvQ = "", lvN = 40;

let LIVE = null;

/* =========================== \u6cd5\u89c4\u52a8\u6001 =========================== */
async function liveLoad() { LIVE = await api("/api/updates"); liveBadge(); return LIVE; }
function liveBadge() {
  const n = (LIVE?.items || []).filter(x => x.status === "new").length;
  const b = $("#liveN"); if (!b) return;
  b.textContent = n ? n + " \u65b0" : "LIVE"; b.classList.toggle("has", n > 0);
}
const ago = iso => { if (!iso) return "\u2014"; const m = Math.round((Date.now() - new Date(iso)) / 60000); return m < 1 ? "\u521a\u521a" : m < 60 ? m + " \u5206\u949f\u524d" : m < 1440 ? Math.round(m / 60) + " \u5c0f\u65f6\u524d" : Math.round(m / 1440) + " \u5929\u524d"; };
const xbOf = x => x.xb_llm ?? x.xb ?? 0;

window.liveTimeline = () => {
  const it = (LIVE?.items || []).filter(x => x.status !== "ignored").sort((a, b) => xbOf(b) - xbOf(a) || (b.date || "").localeCompare(a.date || "")).slice(0, 5);
  if (!it.length) return false;
  $("#tlineSub").textContent = "\u8054\u7f51\u66f4\u65b0 \u00b7 " + ago(LIVE.meta.last);
  $("#tline").innerHTML = it.map(x => `<div class="tl" data-go="live"><div class="d">${E(x.date)}\u3000<span class="sb" style="--c:${SRC_C[x.src]}">${E(LIVE.sources[x.src].name)}</span></div><div class="t">${E(x.zh_title || x.title)}</div><div class="s">${E(x.zh || x.abstract || "").slice(0, 46)}</div></div>`).join("");
  return true;
};

let lvKind = "", lvStat = "";
DRAW.live = async () => {
  if (!LIVE) await liveLoad();
  const L = LIVE, src = L.sources, meta = L.meta;
  $("#srcs").innerHTML = Object.entries(src).map(([k, s], i) => {
    const m = meta.sources?.[k] || {}; const n = L.items.filter(x => x.src === k).length;
    return `<div class="src" style="--c:${SRC_C[k]};animation-delay:${i * 70}ms"><div class="h"><span class="st ${m.ok === false ? "bad" : m.ok ? "ok" : ""}"></span>${E(s.name)}<em>${E(s.kind)}</em></div>
      <div class="n"><b data-n="${n}">${n}</b><small>\u6761</small>${m.new ? `<span class="nw">+${m.new}</span>` : ""}</div><div class="o">${E(s.org)}</div>
      <div class="t">${m.ok === false ? "\u6293\u53d6\u5931\u8d25\uff1a" + E(m.error || "").slice(0, 40) : m.at ? "\u66f4\u65b0\u4e8e " + ago(m.at) + (m.ms ? ` \u00b7 ${(m.ms / 1000).toFixed(1)}s` : "") : "\u5c1a\u672a\u6293\u53d6"}</div></div>`;
  }).join("");
  $$("#srcs [data-n]").forEach(countUp);
  $("#liveLast").textContent = meta.last ? "\u4e0a\u6b21\u66f4\u65b0\uff1a" + new Date(meta.last).toLocaleString("zh-CN", {hour12: false}) : "\u5c1a\u672a\u66f4\u65b0";
  liveStatus();
  const kinds = [["", "\u5168\u90e8"], ...Object.entries(src).map(([k, s]) => [k, s.name.replace("\u4e2d\u56fd\u653f\u5e9c\u7f51\u653f\u7b56\u6587\u4ef6\u5e93", "\u4e2d\u56fd\u653f\u7b56").replace("\u82f1\u56fd\u7ade\u4e89\u4e0e\u5e02\u573a\u7ba1\u7406\u5c40", "\u82f1\u56fd CMA").replace("\u82f1\u56fd\u77e5\u8bc6\u4ea7\u6743\u5c40", "\u82f1\u56fd IPO").replace("\u82f1\u56fd\u4ea7\u54c1\u5b89\u5168\u62a5\u544a", "\u82f1\u56fd\u53ec\u56de").replace("FTC \u6d88\u8d39\u8005\u4fdd\u62a4\u65b0\u95fb", "FTC \u6267\u6cd5").replace("CPSC \u4ea7\u54c1\u53ec\u56de", "CPSC \u53ec\u56de").replace("FDA \u53ec\u56de\u6267\u6cd5", "FDA \u53ec\u56de")])];
  $("#lvKind").innerHTML = kinds.map(([k, n]) => `<button data-k="${k}" class="${k === lvKind ? "on" : ""}">${n}</button>`).join("");
  const stats = [["", "\u5168\u90e8\u72b6\u6001"], ["new", "\u5f85\u5ba1\u6838"], ["approved", "\u5df2\u5165\u5e93"], ["watch", "\u5173\u6ce8"], ["ignored", "\u5df2\u5ffd\u7565"]];
  $("#lvStat").innerHTML = stats.map(([k, n]) => `<button data-s="${k}" class="${k === lvStat ? "on" : ""}">${n}</button>`).join("");
  $$("#lvKind button").forEach(b => b.onclick = () => { lvKind = b.dataset.k; DRAW.live(); });
  $$("#lvStat button").forEach(b => b.onclick = () => { lvStat = b.dataset.s; DRAW.live(); });
  $("#lvXb").onchange = liveList;
  let qt; $("#lvQ").oninput = () => { clearTimeout(qt); qt = setTimeout(() => { lvQ = $("#lvQ").value.trim(); lvN = 40; liveList(); }, 220); };
  livePoll();
  liveList(); liveSide();
};
function liveList() {
  const xbOnly = $("#lvXb").checked;
  const q = lvQ.toLowerCase();
  const it = LIVE.items.filter(x => (!lvKind || x.src === lvKind) && (!lvStat || x.status === lvStat) && (!xbOnly || xbOf(x) >= .5) && (!q || `${x.title} ${x.zh_title || ""} ${x.zh || ""} ${x.abstract || ""} ${x.product || ""}`.toLowerCase().includes(q)));
  it.sort((a, b) => (xbOf(b) >= .7) - (xbOf(a) >= .7) || (b.date || "").localeCompare(a.date || "") || xbOf(b) - xbOf(a));
  $("#lvCount").textContent = `${it.length} \u6761 \u00b7 \u9ad8\u5173\u8054\u4f18\u5148`;
  const ST = {new: ["\u5f85\u5ba1\u6838", "n"], approved: ["\u5df2\u5165\u5e93", "a"], ignored: ["\u5df2\u5ffd\u7565", "i"], watch: ["\u5173\u6ce8", "w"]};
  $("#lvList").innerHTML = it.length ? it.slice(0, lvN).map((x, i) => `<div class="lv ${x.status}" style="--c:${SRC_C[x.src]};animation-delay:${Math.min(i, 10) * 40}ms" data-uid="${x.uid}">
    <div class="lvh"><span class="sb" style="--c:${SRC_C[x.src]}">${E(LIVE.sources[x.src].name)}</span><span class="ty">${E(x.type)}</span><span class="dt">${E(x.date)}</span>
      <span class="cat">${E(x.cat)}</span><span class="xb" title="\u4e0e\u8de8\u5883\u5356\u5bb6\u7684\u5173\u8054\u5ea6"><i style="width:${xbOf(x) * 100}%"></i></span><span class="ss ${ST[x.status][1]}">${ST[x.status][0]}</span></div>
    <div class="lvt">${E(x.zh_title || x.title)}</div>${x.zh_title ? `<div class="lvo">${E(x.title)}</div>` : ""}
    <div class="lvs">${E(x.zh || x.abstract || "")}</div>
    ${x.product ? `<div class="lvm"><span>\u4ea7\u54c1\uff1a${E(x.product)}</span>${x.made ? `<span>\u4ea7\u5730\uff1a${E(x.made)}</span>` : ""}</div>` : ""}
    ${x.advice ? `<div class="lva">\u5356\u5bb6\u5efa\u8bae\uff1a${E(x.advice)}</div>` : ""}
    <div class="lvb">${x.ai ? `<span class="aim">\u6458\u8981\u7531\u5927\u6a21\u578b\u751f\u6210\uff0c\u4ee5\u539f\u6587\u4e3a\u51c6</span>` : ""}<a href="${E(x.url)}" target="_blank">\u539f\u6587 \u2197</a>
      ${x.kb_id ? `<span class="kbid">\u5df2\u5165\u5e93 ${E(x.kb_id)}</span>` : ""}
      ${x.status === "new" || x.status === "watch" ? `${REVIEWABLE.includes(x.src) ? `<button class="btn2 ok" data-a="approve">\u5ba1\u6838\u5165\u5e93</button>` : ""}${x.status === "new" ? `<button class="btn2" data-a="watch">\u5173\u6ce8</button>` : ""}<button class="btn2" data-a="ignore">\u5ffd\u7565</button>` : `<button class="btn2" data-a="reset">\u64a4\u56de</button>`}</div></div>`).join("")
    + (it.length > lvN ? `<button class="btn2 more" id="lvMore">\u518d\u663e\u793a 40 \u6761\uff08\u8fd8\u6709 ${it.length - lvN} \u6761\uff09</button>` : "")
    : `<div class="empty sm"><div class="em-t">${LIVE.items.length ? "\u6ca1\u6709\u7b26\u5408\u7b5b\u9009\u6761\u4ef6\u7684\u52a8\u6001" : "\u6b63\u5728\u81ea\u52a8\u6293\u53d6\u2026"}</div><div class="em-s">${LIVE.items.length ? "\u6362\u4e2a\u7b5b\u9009\u6761\u4ef6\u8bd5\u8bd5" : "\u7cfb\u7edf\u542f\u52a8\u540e\u4f1a\u81ea\u52a8\u4ece\u5b98\u65b9\u63a5\u53e3\u6293\u53d6\uff0c\u65e0\u9700\u64cd\u4f5c"}</div></div>`;
  $("#lvMore") && ($("#lvMore").onclick = () => { lvN += 40; liveList(); });
  $$("#lvList [data-a]").forEach(b => b.onclick = async () => {
    const card = b.closest(".lv"), uid = card.dataset.uid, a = b.dataset.a;
    const r = await post("/api/updates/review", {uid, action: a});
    if (!r.ok) return toast(r.error || "\u64cd\u4f5c\u5931\u8d25");
    toast({approve: `\u5df2\u5ba1\u6838\u5165\u5e93\uff1a${r.kb_id}\uff0c\u77e5\u8bc6\u5e93\u73b0\u6709 ${r.kb_total} \u6761`, ignore: "\u5df2\u5ffd\u7565", watch: "\u5df2\u52a0\u5165\u5173\u6ce8", reset: "\u5df2\u64a4\u56de"}[a]);
    if (r.kb_total) { STATS.kb_total = r.kb_total; }
    card.classList.add("fly"); await sleep(260); await liveLoad(); liveList(); liveSide(); liveBadge();
  });
}
function liveSide() {
  const by = {}; LIVE.items.forEach(x => { by[x.src] = (by[x.src] || 0) + 1; });
  $("#lvTot").textContent = `\u5171 ${LIVE.items.length} \u6761`;
  const st = {}; LIVE.items.forEach(x => { st[x.status] = (st[x.status] || 0) + 1; });
  chart("cLive", {tooltip: {trigger: "item"}, color: Object.keys(LIVE.sources).map(k => SRC_C[k]),
    title: {text: String(LIVE.items.length), subtext: `\u5df2\u5165\u5e93 ${st.approved || 0}`, left: "center", top: "36%", textStyle: {fontSize: 26, fontWeight: 800, color: dark() ? "#E6ECF5" : "#0E1B33"}, subtextStyle: {color: "#98A2B3"}},
    series: [{type: "pie", radius: ["58%", "80%"], label: {show: false}, itemStyle: {borderColor: dark() ? "#111C31" : "#fff", borderWidth: 3},
      data: Object.entries(LIVE.sources).map(([k, s]) => ({name: s.name, value: by[k] || 0}))}]});
  const lk = LIVE.links || {}, vals = Object.values(lk);
  if (!vals.length) { $("#lkSum").innerHTML = `<p class="muted">\u70b9\u51fb\u201c\u6761\u6587\u94fe\u63a5\u5de1\u68c0\u201d\uff0c\u9010\u6761\u8bbf\u95ee\u77e5\u8bc6\u5e93\u539f\u6587\u94fe\u63a5\uff0c\u68c0\u67e5\u662f\u5426\u5931\u6548\u6216\u5185\u5bb9\u53d8\u52a8\u3002</p>`; $("#lkAt").textContent = ""; }
  else {
    const c = {}; vals.forEach(v => c[v.state] = (c[v.state] || 0) + 1);
    const N = {ok: ["\u6b63\u5e38", "#16A34A"], changed: ["\u5185\u5bb9\u6709\u53d8\u52a8", "#C27C0E"], login: ["\u9700\u767b\u5f55\uff08\u5e73\u53f0\u9875\uff09", "#98A2B3"], blocked: ["\u62d2\u7edd\u81ea\u52a8\u8bbf\u95ee", "#98A2B3"], error: ["\u65e0\u6cd5\u8bbf\u95ee", "#B42318"]};
    $("#lkAt").textContent = vals.length + " \u4e2a\u94fe\u63a5 \u00b7 " + ago(vals[0].at);
    $("#lkSum").innerHTML = `<div class="lkbar">${Object.entries(N).map(([k, [n, col]]) => c[k] ? `<i style="flex:${c[k]};background:${col}" title="${n}"></i>` : "").join("")}</div>
      <div class="lkleg">${Object.entries(N).map(([k, [n, col]]) => c[k] ? `<span><i style="background:${col}"></i>${n} <b>${c[k]}</b></span>` : "").join("")}</div>
      ${Object.entries(lk).filter(([, v]) => v.state === "changed" || v.state === "error").slice(0, 6).map(([u, v]) => `<div class="lki ${v.state}"><b>${E(v.ids.join("\u3001"))}</b><span>${v.state === "changed" ? "\u539f\u6587\u6709\u53d8\u52a8\uff0c\u8bf7\u590d\u6838" : "\u65e0\u6cd5\u8bbf\u95ee"}</span></div>`).join("")}`;
  }
}
function liveStatus() {
  const L = LIVE, meta = L.meta, st = L.state || {};
  const nx = st.next ? new Date(st.next).toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit", hour12: false}) : "\u2014";
  $("#liveLast").innerHTML = st.running ? `<span class="autodot run"></span>\u6b63\u5728\u81ea\u52a8\u66f4\u65b0\u2026` : `<span class="autodot"></span>\u81ea\u52a8\u66f4\u65b0\u5df2\u5f00\u542f`;
  $("#liveInfo").textContent = (meta.last ? `\u4e0a\u6b21\u66f4\u65b0 ${new Date(meta.last).toLocaleString("zh-CN", {hour12: false})} \u00b7 ` : "") + `\u6bcf 2 \u5c0f\u65f6\u81ea\u52a8\u6293\u53d6 ${Object.keys(L.sources).length} \u4e2a\u5b98\u65b9\u6570\u636e\u6e90 \u00b7 \u4e0b\u6b21 ${nx} \u00b7 \u539f\u6587\u94fe\u63a5\u6bcf\u5929\u81ea\u52a8\u5de1\u68c0 \u00b7 \u52a8\u6001\u5e93\u5171 ${L.items.length} \u6761\uff0c\u5f85\u5ba1\u6838 ${L.items.filter(x => x.status === "new").length} \u6761`;
}
let lvPoll = null;
function livePoll() {
  clearInterval(lvPoll);
  lvPoll = setInterval(async () => {
    if (cur !== "live") return;
    const before = LIVE?.items.length, wasRun = LIVE?.state?.running;
    await liveLoad().catch(() => null);
    liveStatus();
    if (LIVE.items.length !== before || (wasRun && !LIVE.state.running)) { DRAW.live(); if (LIVE.items.length > before) toast(`\u81ea\u52a8\u66f4\u65b0\uff1a\u65b0\u589e ${LIVE.items.length - before} \u6761\u5b98\u65b9\u52a8\u6001`); }
  }, 15000);
}
function sseRun(url, onEv) {
  return new Promise(res => {
    const es = new EventSource(url);
    ["source", "summary_start", "summary", "summary_fail", "done", "link", "links_done"].forEach(ev => es.addEventListener(ev, e => onEv(ev, JSON.parse(e.data))));
    es.addEventListener("end", e => { es.close(); res(JSON.parse(e.data)); });
    es.addEventListener("fail", e => { es.close(); toast(JSON.parse(e.data)); res(null); });
    es.onerror = () => { es.close(); res(null); };
  });
}
$("#liveRun").onclick = async () => {
  const b = $("#liveRun"); if (b.disabled) return; b.disabled = true; b.classList.add("run"); b.firstChild.textContent = "\u6b63\u5728\u6293\u53d6\u2026";
  const P = $("#liveProg"); P.innerHTML = Object.entries(LIVE?.sources || {fr: {name: "\u7f8e\u56fd\u8054\u90a6\u516c\u62a5"}, ftc: {name: "FTC"}, cpsc: {name: "CPSC"}, uk: {name: "\u82f1\u56fd OPSS"}}).map(([k, s]) => `<div class="lp" id="lp-${k}"><span class="sp"></span>${E(s.name)}<em>\u7b49\u5f85</em></div>`).join("") + `<div class="lp" id="lp-ai"><span class="sp"></span>\u4e2d\u6587\u6458\u8981<em>\u7b49\u5f85</em></div>`;
  P.classList.add("on");
  const set = (k, cls, t) => { const el = $("#lp-" + k); if (el) { el.className = "lp " + cls; $("em", el).textContent = t; } };
  const r = await sseRun("/api/update/run", (ev, d) => {
    if (ev === "source") set(d.key, d.state === "running" ? "run" : d.state, d.state === "running" ? "\u6293\u53d6\u4e2d" : d.state === "ok" ? `${d.count} \u6761 \u00b7 \u65b0\u589e ${d.new}` : "\u5931\u8d25");
    if (ev === "summary_start") set("ai", "run", `\u751f\u6210\u4e2d 0/${d}`);
    if (ev === "summary") set("ai", "run", `\u5df2\u5b8c\u6210 ${d}`);
    if (ev === "summary_fail") set("ai", "fail", "\u5931\u8d25");
  });
  if ($("#lp-ai").className === "lp") set("ai", "skip", META.has_key ? "\u65e0\u9700\u66f4\u65b0" : "\u672a\u8bbe\u7f6e API Key\uff0c\u663e\u793a\u82f1\u6587\u539f\u6587");
  else if ($("#lp-ai").classList.contains("run")) set("ai", "ok", $("#lp-ai em").textContent);
  b.disabled = false; b.classList.remove("run"); b.firstChild.textContent = "\u7acb\u5373\u5237\u65b0";
  if (r) toast(`\u66f4\u65b0\u5b8c\u6210\uff1a\u65b0\u589e ${r.new} \u6761\uff0c\u5171 ${r.total} \u6761`);
  await liveLoad(); DRAW.live(); setTimeout(() => P.classList.remove("on"), 4000);
};
$("#linkRun").onclick = async () => {
  const b = $("#linkRun"); if (b.disabled) return; b.disabled = true; b.textContent = "\u5de1\u68c0\u4e2d\u2026";
  await sseRun("/api/links/run", (ev, d) => { if (ev === "link") b.textContent = `\u5de1\u68c0\u4e2d ${d.done}/${d.total}`; });
  b.disabled = false; b.textContent = "\u6761\u6587\u94fe\u63a5\u5de1\u68c0"; await liveLoad(); liveSide(); toast("\u94fe\u63a5\u5de1\u68c0\u5b8c\u6210");
};
let rct; $("#rcQ").oninput = () => { clearTimeout(rct); rct = setTimeout(recall, 200); };
const ZH_EN = {"\u7761\u8863": "pajama", "\u513f\u7ae5": "child", "\u52a0\u70ed": "heater", "\u53d6\u6696": "heater", "\u7535\u6c60": "batter", "\u5145\u7535": "charg", "\u73a9\u5177": "toy", "\u5a74\u513f": "infant", "\u5e8a": "bed", "\u5934\u76d4": "helmet", "\u5496\u5561": "coffee", "\u53f0\u706f": "lamp", "\u706f": "light", "\u63d2\u5934": "plug", "\u7535\u6e90": "power", "\u9002\u914d\u5668": "adapter", "\u81ea\u884c\u8f66": "bike", "\u7535\u52a8": "electric", "\u6ed1\u677f": "scooter", "\u5bb6\u5177": "furniture", "\u67dc": "dresser", "\u78c1": "magnet", "\u73e0": "bead", "\u5976\u5634": "pacifier", "\u63a8\u8f66": "stroller", "\u5ea7\u6905": "seat", "\u53a8\u623f": "kitchen", "\u5200": "knife", "\u5316\u5986": "cosmetic", "\u9999\u85b0": "diffuser", "\u8721\u70db": "candle", "\u98ce\u6247": "fan", "\u5439\u98ce": "dryer", "\u71a8\u6597": "iron", "\u978b": "shoe", "\u8863": "garment"};
function recall() {
  const q = $("#rcQ").value.trim().toLowerCase(); const box = $("#rcRes");
  if (!q) { box.innerHTML = ""; return; }
  const terms = q.split(/[\s,\uff0c\u3001]+/).filter(Boolean).flatMap(t => [t, ...Object.entries(ZH_EN).filter(([z]) => t.includes(z)).map(([, e]) => e)]);
  const hit = (LIVE?.items || []).filter(x => x.src === "cpsc" || x.src === "uk").filter(x => terms.some(t => `${x.title} ${x.product || ""} ${x.zh_title || ""} ${x.zh || ""}`.toLowerCase().includes(t)));
  box.innerHTML = hit.length ? `<div class="rch">\u547d\u4e2d ${hit.length} \u6761\u53ec\u56de\u6216\u5b89\u5168\u62a5\u544a</div>` + hit.slice(0, 8).map(x => `<a class="rc" href="${E(x.url)}" target="_blank"><span>${E(x.date)}${x.made ? " \u00b7 " + E(x.made) : ""}</span>${E(x.zh_title || x.title)}</a>`).join("")
    : `<div class="rch ok">\u8fd1\u671f\u53ec\u56de\u4e2d\u672a\u53d1\u73b0\u5339\u914d\u9879</div>`;
}

/* =========================== \u5de5\u5177\u7bb1 =========================== */
function toolTabs() {
  const T = $("#toolTabs"); moveInk(T);
  $$("button[data-tool]", T).forEach(b => b.onclick = () => { $$("button[data-tool]", T).forEach(x => x.classList.toggle("on", x === b)); $$(".tool").forEach(p => p.classList.toggle("on", p.id === "tool-" + b.dataset.tool)); moveInk(T); if (b.dataset.tool === "poa") poaCheck(); if (b.dataset.tool === "jur") jurRun(); });
}
DRAW.tools = () => { toolTabs(); dlCalc(); };
/* \u65f6\u9650\u5012\u8ba1\u65f6 */
(() => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); $("#dlStart").value = d.toISOString().slice(0, 16); })();
$$("#dlDays button").forEach(b => b.onclick = () => { $$("#dlDays button").forEach(x => x.classList.toggle("on", x === b)); $("#dlCustom").value = b.dataset.d; dlCalc(); });
["#dlStart", "#dlCustom", "#dlName"].forEach(s => $(s).oninput = dlCalc);
let dlT;
function dlCalc() {
  const st = new Date($("#dlStart").value), days = Math.max(1, +$("#dlCustom").value || 1), end = new Date(+st + days * 864e5);
  const left = end - Date.now(), tot = end - st, frac = Math.max(0, Math.min(1, left / tot));
  const arc = $("#dlArc"), L = 2 * Math.PI * 86; arc.style.strokeDasharray = L; arc.style.strokeDashoffset = L * (1 - frac);
  arc.style.stroke = frac > .5 ? "var(--brand)" : frac > .2 ? "#C27C0E" : "#B42318";
  const dd = Math.floor(left / 864e5), hh = Math.floor(left % 864e5 / 36e5);
  $("#dlLeft").textContent = left <= 0 ? "\u5df2\u5230\u671f" : dd ? `${dd}\u5929${hh}\u65f6` : `${hh}\u5c0f\u65f6`;
  $("#dlUnit").textContent = left <= 0 ? "\u8bf7\u7acb\u5373\u5904\u7406" : "\u5269\u4f59\u65f6\u95f4";
  $("#dlEnd").textContent = "\u622a\u6b62 " + end.toLocaleString("zh-CN", {hour12: false, month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"});
  const plan = [[0, "\u4fdd\u5b58\u8bc1\u636e", "\u622a\u56fe\u901a\u77e5\u5168\u6587\u3001\u8d26\u6237\u72b6\u51b5\u9875\uff0c\u5bfc\u51fa\u8ba2\u5355\u4e0e\u6c9f\u901a\u8bb0\u5f55"], [.1, "\u5b9a\u6027", "\u7528\u5929\u8861\u8bca\u65ad\u786e\u5b9a\u8fdd\u89c4\u7c7b\u522b\u3001\u98ce\u9669\u548c\u8def\u5f84"], [.3, "\u53d6\u8bc1", "\u6309\u8bc1\u636e\u6e05\u5355\u51c6\u5907\u53d1\u7968\u3001\u6388\u6743\u3001\u68c0\u6d4b\u62a5\u544a"], [.55, "\u8d77\u8349", "\u5199\u6839\u672c\u539f\u56e0\u3001\u7ea0\u6b63\u63aa\u65bd\u3001\u9884\u9632\u63aa\u65bd"], [.75, "\u590d\u6838", "\u7528\u201c\u7533\u8bc9\u4e66\u4f53\u68c0\u201d\u68c0\u67e5\uff0c\u5fc5\u8981\u65f6\u8bf7\u5f8b\u5e08\u770b"], [.85, "\u63d0\u4ea4", "\u7559\u51fa\u7f13\u51b2\u65f6\u95f4\uff0c\u8bb0\u5f55\u6848\u4ef6\u7f16\u53f7"]];
  $("#dlPlan").innerHTML = plan.map(([p, t, s]) => { const d = new Date(+st + p * days * 864e5), past = d < Date.now();
    return `<div class="pl ${past ? "past" : ""}"><b>${d.toLocaleDateString("zh-CN", {month: "numeric", day: "numeric"})}</b><div><span>${t}</span><small>${s}</small></div></div>`; }).join("");
  clearTimeout(dlT); dlT = setTimeout(() => cur === "tools" && dlCalc(), 30000);
}
$("#dlIcs").onclick = () => {
  const st = new Date($("#dlStart").value), end = new Date(+st + (+$("#dlCustom").value || 1) * 864e5);
  const f = d => d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ev = (t, d, desc) => `BEGIN:VEVENT\r\nUID:${+d}-${Math.random().toString(36).slice(2)}@tianheng\r\nDTSTAMP:${f(new Date())}\r\nDTSTART:${f(d)}\r\nDTEND:${f(new Date(+d + 36e5))}\r\nSUMMARY:${t}\r\nDESCRIPTION:${desc}\r\nBEGIN:VALARM\r\nTRIGGER:-PT2H\r\nACTION:DISPLAY\r\nDESCRIPTION:${t}\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
  const name = $("#dlName").value || "\u7533\u8bc9";
  const ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Tianheng//CN\r\n" + ev(`\u3010\u622a\u6b62\u3011${name}`, end, "\u671f\u9650\u4ee5\u5e73\u53f0\u901a\u77e5\u539f\u6587\u4e3a\u51c6") + ev(`\u3010\u5efa\u8bae\u63d0\u4ea4\u3011${name}`, new Date(+st + .85 * (end - st)), "\u7559\u51fa\u7f13\u51b2\u65f6\u95f4") + "END:VCALENDAR\r\n";
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], {type: "text/calendar"})); a.download = name + ".ics"; a.click(); toast("\u5df2\u5bfc\u51fa\u65e5\u5386\u6587\u4ef6");
};
/* \u7533\u8bc9\u4e66\u4f53\u68c0 */
const POA_SAMPLE = `Dear Seller Performance Team,

Root cause: Our listing for ASIN B0XXXXXXX used the term "compatible with [Brand]" in the title in a way that could suggest an affiliation. We did not have a review step for brand terms before publishing.

Actions we have taken: We removed the brand term from the title and images on [date]. We reviewed all 46 active listings and corrected 3 others with similar wording. Attached are screenshots of the revised listings.

Preventive measures: All new listings now go through a two-person check against a brand-term list. Our listing staff completed training on Amazon's Intellectual Property Policy. We will audit listings monthly.

We guarantee this will 100% never happen again. Please reinstate our listing as soon as possible.

Sincerely,
[Store name]`;
$("#poaSample").onclick = () => { $("#poaIn").value = POA_SAMPLE; poaCheck(); };
let pt; $("#poaIn").oninput = () => { clearTimeout(pt); pt = setTimeout(poaCheck, 250); };
function poaCheck() {
  const t = $("#poaIn").value; const lo = t.toLowerCase();
  const words = (t.match(/[A-Za-z]+/g) || []).length + (t.match(/[\u4e00-\u9fa5]/g) || []).length / 1.6;
  const has = re => re.test(lo);
  const checks = [
    ["\u6839\u672c\u539f\u56e0", has(/root cause|\u6839\u672c\u539f\u56e0|\u539f\u56e0\u5206\u6790|why (this|it) happened/), 22, "\u5199\u660e\u95ee\u9898\u4e3a\u4ec0\u4e48\u53d1\u751f\uff0c\u5177\u4f53\u5230\u6d41\u7a0b\u6f0f\u6d1e"],
    ["\u5df2\u91c7\u53d6\u7684\u7ea0\u6b63\u63aa\u65bd", has(/corrective|actions? (we have )?taken|we (have )?(removed|corrected|replaced|refunded)|\u5df2\u91c7\u53d6|\u7ea0\u6b63\u63aa\u65bd|\u5df2\u7ecf(\u5220\u9664|\u4e0b\u67b6|\u66f4\u6b63)/), 22, "\u5199\u6e05\u5df2\u7ecf\u505a\u4e86\u4ec0\u4e48\u3001\u4f55\u65f6\u505a\u7684"],
    ["\u9884\u9632\u63aa\u65bd", has(/prevent|preventive|going forward|to ensure|\u9884\u9632|\u4eca\u540e|\u9632\u6b62\u518d\u6b21/), 22, "\u8bf4\u660e\u4eca\u540e\u5982\u4f55\u9632\u6b62\u518d\u6b21\u53d1\u751f"],
    ["\u8bc1\u636e\u6216\u9644\u4ef6", has(/attach|screenshot|invoice|\u9644\u4ef6|\u622a\u56fe|\u53d1\u7968|\u8bc1\u660e|order id|\d{3}-\d{7}-\d{7}/), 14, "\u5f15\u7528\u53d1\u7968\u3001\u622a\u56fe\u3001\u68c0\u6d4b\u62a5\u544a\u7b49\u53ef\u6838\u5bf9\u7684\u6750\u6599"],
    ["\u6ca1\u6709\u6307\u8d23\u4ed6\u4eba", !has(/competitor|unfair|your (mistake|fault)|amazon('s)? (mistake|fault)|\u7ade\u4e89\u5bf9\u624b|\u4e0d\u516c\u5e73|\u5e73\u53f0\u7684\u9519|\u6076\u610f\u9677\u5bb3/), 8, "\u4e0d\u8981\u628a\u8d23\u4efb\u63a8\u7ed9\u7ade\u4e89\u5bf9\u624b\u6216\u5e73\u53f0"],
    ["\u6ca1\u6709\u5938\u5927\u627f\u8bfa", !has(/100%|guarantee|\u7edd\u5bf9|\u4fdd\u8bc1\u518d\u4e5f|never ever/), 6, "\u907f\u514d\u201c\u4fdd\u8bc1\u767e\u5206\u4e4b\u767e\u201d\u4e4b\u7c7b\u65e0\u6cd5\u5151\u73b0\u7684\u627f\u8bfa"],
    ["\u5360\u4f4d\u7b26\u5df2\u586b\u5199", !/\[[^\]\n]{1,30}\]/.test(t), 6, "\u6587\u4e2d\u4ecd\u6709 [ ] \u5360\u4f4d\u7b26\uff0c\u63d0\u4ea4\u524d\u8865\u5168"]];
  const L = words < 80 ? ["\u7bc7\u5e45\u504f\u77ed", "\u5185\u5bb9\u53ef\u80fd\u4e0d\u8db3\u4ee5\u8bf4\u660e\u95ee\u9898"] : words > 900 ? ["\u7bc7\u5e45\u504f\u957f", "\u5ba1\u6838\u4eba\u5458\u53ef\u80fd\u6293\u4e0d\u4f4f\u91cd\u70b9\uff0c\u5efa\u8bae\u7cbe\u7b80"] : null;
  const score = t.trim() ? Math.round(checks.reduce((s, c) => s + (c[1] ? c[2] : 0), 0) - (L ? 8 : 0)) : 0;
  $("#poaWc").textContent = t.trim() ? `\u7ea6 ${Math.round(words)} \u8bcd` : "";
  $("#poaList").innerHTML = t.trim() ? checks.map(c => `<div class="pc ${c[1] ? "ok" : "bad"}"><i>${c[1] ? "\u2713" : "!"}</i><div><b>${c[0]}</b>${c[1] ? "" : `<small>${c[3]}</small>`}</div></div>`).join("") + (L ? `<div class="pc bad"><i>!</i><div><b>${L[0]}</b><small>${L[1]}</small></div></div>` : "") : `<p class="muted">\u7c98\u8d34\u7533\u8bc9\u4e66\uff0c\u6216\u70b9\u201c\u8f7d\u5165\u793a\u4f8b\u201d\u3002</p>`;
  let h = E(t);
  h = h.replace(/(root cause|actions we have taken|corrective actions?|preventive measures?|\u6839\u672c\u539f\u56e0|\u7ea0\u6b63\u63aa\u65bd|\u9884\u9632\u63aa\u65bd)/gi, '<mark class="g">$1</mark>');
  h = h.replace(/(100%|guarantee|competitor|unfair|\u4fdd\u8bc1|\u7ade\u4e89\u5bf9\u624b|\u7edd\u5bf9)/gi, '<mark class="r">$1</mark>');
  h = h.replace(/(\[[^\]\n]{1,30}\])/g, '<mark class="y">$1</mark>');
  $("#poaMark").innerHTML = t.trim() ? h : "";
  chart("cPoa", {series: [{type: "gauge", startAngle: 220, endAngle: -40, min: 0, max: 100, radius: "96%", center: ["50%", "56%"], progress: {show: true, width: 12, roundCap: true, itemStyle: {color: score >= 80 ? "#16A34A" : score >= 60 ? "#C27C0E" : "#B42318"}},
    axisLine: {roundCap: true, lineStyle: {width: 12, color: [[1, dark() ? "#1F2D47" : "#EEF1F5"]]}}, pointer: {show: false}, axisTick: {show: false}, splitLine: {show: false}, axisLabel: {show: false},
    title: {offsetCenter: [0, "38%"], fontSize: 12, color: "#98A2B3"}, detail: {offsetCenter: [0, "0%"], fontSize: 34, fontWeight: 800, color: dark() ? "#E6ECF5" : "#0E1B33"}, data: [{value: score, name: t.trim() ? (score >= 80 ? "\u7ed3\u6784\u5b8c\u6574" : score >= 60 ? "\u9700\u8981\u8865\u5f3a" : "\u95ee\u9898\u8f83\u591a") : "\u7b49\u5f85\u8f93\u5165"}]}]});
}
/* \u6cd5\u57df\u901f\u67e5 */
const PLAT_J = {"\u4e9a\u9a6c\u900a": "\u5e73\u53f0-\u4e9a\u9a6c\u900a", "eBay": "\u5e73\u53f0-eBay", "\u6c83\u5c14\u739b": "\u5e73\u53f0-\u6c83\u5c14\u739b", "\u72ec\u7acb\u7ad9": ""};
const SITE_J = {"\u7f8e\u56fd": ["\u7f8e\u56fd"], "\u82f1\u56fd": ["\u82f1\u56fd", "\u6b27\u76df"], "\u5fb7\u56fd": ["\u6b27\u76df"], "\u6cd5\u56fd": ["\u6b27\u76df"], "\u65e5\u672c": ["\u65e5\u672c"], "\u4e2d\u56fd": ["\u4e2d\u56fd"]};
["#jPlat", "#jSite"].forEach(s => $$(s + " button").forEach(b => b.onclick = () => { $$(s + " button").forEach(x => x.classList.toggle("on", x === b)); jurRun(); }));
let KBALL = null;
async function jurRun() {
  KBALL ??= await api("/api/kb");
  const p = $("#jPlat button.on").textContent, s = $("#jSite button.on").textContent;
  const js = [PLAT_J[p], ...SITE_J[s], "\u4e2d\u56fd", "\u901a\u7528\u65b9\u6cd5"].filter(Boolean);
  const W = j => j === "\u4e2d\u56fd" && s !== "\u4e2d\u56fd" ? "\u964d\u6743\u53c2\u8003" : j === "\u901a\u7528\u65b9\u6cd5" ? "\u5199\u4f5c\u89c4\u8303" : "\u4f18\u5148\u9002\u7528";
  $("#jRes").innerHTML = `<div class="jflow">${js.map((j, i) => `<div class="jn" style="animation-delay:${i * 80}ms"><b>${E(j.replace("\u5e73\u53f0-", ""))}</b><span>${W(j)}</span><em>${KBALL.filter(x => x.jurisdiction === j).length} \u6761</em></div>`).join('<i class="ar"></i>')}</div>
    <div class="jcols">${js.filter(j => j !== "\u901a\u7528\u65b9\u6cd5").map(j => `<div class="jc"><h4>${E(j.replace("\u5e73\u53f0-", ""))}<small>${W(j)}</small></h4>${Object.entries(KBALL.filter(x => x.jurisdiction === j).reduce((m, x) => ((m[x.category] ??= []).push(x), m), {})).map(([c, xs]) => `<div class="jcat">${E(c)}</div>${xs.slice(0, 5).map(x => `<div class="ji" data-kb="${E(x.id)}"><span>${E(x.id)}</span>${E(x.source.replace(/\uff08.*?\uff09/g, ""))} ${E(x.provision)}</div>`).join("")}`).join("")}</div>`).join("")}</div>`;
  $$("#jRes [data-kb]").forEach(t => t.onclick = () => { go("kb"); $("#kbQ").value = t.dataset.kb; kbLoad(); });
}

/* =========================== \u65b0\u624b\u5b66\u5802 =========================== */
const ROAD = [
  ["\u7a33\u4f4f", "0\u20132 \u5c0f\u65f6", ["\u5b8c\u6574\u622a\u56fe\u901a\u77e5\u3001\u8d26\u6237\u72b6\u51b5\u9875\u548c\u7ee9\u6548\u9875", "\u5bfc\u51fa\u76f8\u5173\u8ba2\u5355\u3001\u6c9f\u901a\u8bb0\u5f55\u548c\u5546\u54c1\u9875\u9762", "\u8bb0\u4e0b\u901a\u77e5\u65f6\u95f4\u4e0e\u5e73\u53f0\u7ed9\u51fa\u7684\u671f\u9650"], ["\u4e0d\u8981\u7acb\u523b\u8349\u7387\u63d0\u4ea4\u7533\u8bc9", "\u4e0d\u8981\u5220\u9664\u5546\u54c1\u6216\u6539\u8d44\u6599\u6765\u201c\u63a9\u76d6\u201d\u95ee\u9898", "\u4e0d\u8981\u7528\u65b0\u8d26\u53f7\u7ee7\u7eed\u9500\u552e"]],
  ["\u770b\u6e05", "2\u20136 \u5c0f\u65f6", ["\u627e\u51fa\u5904\u7f5a\u63aa\u65bd\uff1a\u4e0b\u67b6\u3001\u6682\u505c\u3001\u8d44\u91d1\u6263\u7559\u8fd8\u662f\u8bc9\u8bbc", "\u627e\u51fa\u901a\u77e5\u5f15\u7528\u7684\u653f\u7b56\u6761\u6b3e", "\u6709\u6295\u8bc9\u4eba\u7684\uff0c\u8bb0\u4e0b\u6295\u8bc9\u4eba\u548c\u6295\u8bc9\u7f16\u53f7"], ["\u4e0d\u8981\u53ea\u770b\u90ae\u4ef6\u6807\u9898\u5c31\u4e0b\u7ed3\u8bba", "\u4e0d\u8981\u5ffd\u89c6\u82f1\u6587\u901a\u77e5\u91cc\u7684\u671f\u9650"]],
  ["\u5b9a\u6027", "6\u201312 \u5c0f\u65f6", ["\u7528\u5929\u8861\u201c\u6848\u4ef6\u8bca\u65ad\u201d\u5f97\u5230\u7c7b\u522b\u3001\u98ce\u9669\u548c\u8def\u5f84", "\u770b\u4f9d\u636e\uff1a\u6bcf\u6761\u7ed3\u8bba\u5bf9\u5e94\u54ea\u6761\u89c4\u5219", "\u5c01\u53f7\u7ea7\u3001\u8d44\u91d1\u51bb\u7ed3\u3001\u6cd5\u9662\u6587\u4e66\uff1a\u7acb\u5373\u8054\u7cfb\u5f8b\u5e08"], ["\u4e0d\u8981\u628a\u201c\u88ab\u6295\u8bc9\u201d\u7b49\u540c\u4e8e\u201c\u786e\u5b9e\u4fb5\u6743\u201d", "\u4e0d\u8981\u53ea\u51ed\u7f51\u4e0a\u6a21\u677f\u5224\u65ad"]],
  ["\u53d6\u8bc1", "12\u201336 \u5c0f\u65f6", ["\u6309\u8bc1\u636e\u6e05\u5355\u51c6\u5907\u53d1\u7968\u3001\u6388\u6743\u94fe\u3001\u68c0\u6d4b\u62a5\u544a", "\u6574\u6539\u8981\u7559\u75d5\uff1a\u622a\u56fe\u3001\u8bb0\u5f55\u3001\u65e5\u671f", "\u5fc5\u8981\u65f6\u8054\u7cfb\u6743\u5229\u4eba\u6c9f\u901a\u64a4\u8bc9"], ["\u4e0d\u8981\u4f2a\u9020\u6216\u8865\u9020\u53d1\u7968\u3001\u6388\u6743\u4e66", "\u4e0d\u8981\u63d0\u4ea4\u4e0e\u95ee\u9898\u65e0\u5173\u7684\u5927\u91cf\u6750\u6599"]],
  ["\u7533\u8bc9", "36\u201360 \u5c0f\u65f6", ["\u6309\u201c\u6839\u672c\u539f\u56e0\u2014\u7ea0\u6b63\u63aa\u65bd\u2014\u9884\u9632\u63aa\u65bd\u201d\u4e09\u6bb5\u5199", "\u7528\u201c\u7533\u8bc9\u4e66\u4f53\u68c0\u201d\u68c0\u67e5\u7ed3\u6784\u548c\u63aa\u8f9e", "\u9644\u4ef6\u547d\u540d\u6e05\u695a\uff0c\u4e0e\u6b63\u6587\u4e00\u4e00\u5bf9\u5e94"], ["\u4e0d\u8981\u6307\u8d23\u5e73\u53f0\u6216\u7ade\u4e89\u5bf9\u624b", "\u4e0d\u8981\u4f5c\u201c\u767e\u5206\u4e4b\u767e\u4e0d\u518d\u53d1\u751f\u201d\u4e4b\u7c7b\u7a7a\u6cdb\u627f\u8bfa"]],
  ["\u8ddf\u8fdb", "60 \u5c0f\u65f6\u4ee5\u540e", ["\u8bb0\u5f55\u63d0\u4ea4\u65f6\u95f4\u548c\u6848\u4ef6\u7f16\u53f7", "\u88ab\u9a73\u56de\u65f6\u770b\u9a73\u56de\u7406\u7531\uff0c\u9488\u5bf9\u6027\u8865\u5145", "\u6b27\u6d32\u7ad9\u53ef\u4f7f\u7528\u5185\u90e8\u6295\u8bc9\u548c\u5ead\u5916\u8c03\u89e3\u673a\u5236"], ["\u4e0d\u8981\u53cd\u590d\u63d0\u4ea4\u5185\u5bb9\u76f8\u540c\u7684\u7533\u8bc9", "\u4e0d\u8981\u9519\u8fc7\u6cd5\u9662\u7b54\u8fa9\u671f\u9650"]]];
const GLOSS = [
  ["AHR", "\u8d26\u6237\u72b6\u51b5\u8bc4\u7ea7", "\u4e9a\u9a6c\u900a\u5bf9\u5356\u5bb6\u653f\u7b56\u5408\u89c4\u60c5\u51b5\u7684\u8bc4\u5206\uff0c\u8fdd\u89c4\u4f1a\u6263\u5206\uff0c\u5206\u6570\u8fc7\u4f4e\u53ef\u80fd\u5bfc\u81f4\u505c\u7528\u3002", "AMZ-AHR-01"],
  ["ODR", "\u8ba2\u5355\u7f3a\u9677\u7387", "\u5dee\u8bc4\u3001\u4e9a\u9a6c\u900a\u5546\u57ce\u4ea4\u6613\u4fdd\u969c\u7d22\u8d54\u548c\u4fe1\u7528\u5361\u62d2\u4ed8\u5360\u8ba2\u5355\u7684\u6bd4\u4f8b\uff0c\u76ee\u6807\u4f4e\u4e8e 1%\u3002", "AMZ-OPP-01"],
  ["POA", "\u884c\u52a8\u8ba1\u5212", "Plan of Action\uff0c\u7533\u8bc9\u7684\u6838\u5fc3\u6587\u4ef6\uff0c\u4e00\u822c\u5305\u62ec\u6839\u672c\u539f\u56e0\u3001\u7ea0\u6b63\u63aa\u65bd\u3001\u9884\u9632\u63aa\u65bd\u3002", "AMZ-POA-01"],
  ["Retraction", "\u6743\u5229\u4eba\u64a4\u8bc9", "\u77e5\u8bc6\u4ea7\u6743\u6295\u8bc9\u4eba\u4e3b\u52a8\u64a4\u56de\u6295\u8bc9\uff0c\u901a\u5e38\u662f\u6700\u5feb\u6062\u590d\u5546\u54c1\u7684\u65b9\u5f0f\u3002", "AMZ-IP-02"],
  ["DMCA", "\u6570\u5b57\u5343\u5e74\u7248\u6743\u6cd5\u5220\u9664\u901a\u77e5", "\u7f8e\u56fd\u7248\u6743\u6cd5\u4e0b\u7684\u901a\u77e5\u2014\u5220\u9664\u673a\u5236\uff0c\u89c4\u5b9a\u6709\u6548\u901a\u77e5\u5fc5\u987b\u5305\u542b\u7684\u8981\u7d20\u3002", "US-CR-01"],
  ["Counter-notice", "\u53cd\u901a\u77e5", "\u88ab\u7248\u6743\u6295\u8bc9\u5220\u9664\u5185\u5bb9\u540e\uff0c\u5356\u5bb6\u4f9d DMCA \u7b2c 512(g) \u6761\u63d0\u51fa\u7684\u6062\u590d\u8bf7\u6c42\u3002", "US-CR-02"],
  ["\u4e0d\u4fb5\u6743\u58f0\u660e", "\u4e0d\u4fb5\u6743\u58f0\u660e", "\u4f9d\u4e2d\u56fd\u300a\u7535\u5b50\u5546\u52a1\u6cd5\u300b\u7b2c\u56db\u5341\u4e09\u6761\uff0c\u7ecf\u8425\u8005\u6536\u5230\u8f6c\u9001\u7684\u901a\u77e5\u540e\u53ef\u63d0\u4ea4\u7684\u58f0\u660e\u3002", "CN-ECL-03"],
  ["TRO", "\u4e34\u65f6\u9650\u5236\u4ee4", "\u7f8e\u56fd\u6cd5\u9662\u53ef\u5728\u4e0d\u901a\u77e5\u88ab\u544a\u7684\u60c5\u51b5\u4e0b\u53d1\u51fa\uff0c\u5e38\u7528\u4e8e\u51bb\u7ed3\u8de8\u5883\u5356\u5bb6\u7684\u5e97\u94fa\u8d44\u91d1\u3002", "US-PROC-01"],
  ["Answer", "\u7b54\u8fa9\u671f\u9650", "\u7f8e\u56fd\u8054\u90a6\u8bc9\u8bbc\u4e2d\u88ab\u544a\u6536\u5230\u4f20\u7968\u540e\u4e00\u822c\u987b\u5728 21 \u5929\u5185\u7b54\u8fa9\uff0c\u5426\u5219\u53ef\u80fd\u88ab\u7f3a\u5e2d\u5224\u51b3\u3002", "US-PROC-02"],
  ["Reserve", "\u8d44\u91d1\u9884\u7559\uff0f\u6263\u7559", "\u5e73\u53f0\u4f9d\u534f\u8bae\u6682\u65f6\u6263\u7559\u5356\u5bb6\u8d44\u91d1\uff0c\u4e25\u91cd\u8fdd\u89c4\u65f6\u53ef\u80fd\u6c38\u4e45\u6263\u7559\u3002", "AMZ-BSA-02"],
  ["\u591a\u8d26\u6237", "\u591a\u4e2a\u9500\u552e\u8d26\u6237", "\u65e0\u5408\u7406\u4e1a\u52a1\u9700\u6c42\u4e0d\u5f97\u7ecf\u8425\u591a\u4e2a\u8d26\u6237\uff0c\u5173\u8054\u8d26\u6237\u53ef\u80fd\u4e00\u5e76\u53d7\u5904\u7f5a\u3002", "AMZ-COC-07"],
  ["INFORM", "INFORM \u6d88\u8d39\u8005\u6cd5\u6848", "\u7f8e\u56fd\u6cd5\u5f8b\uff0c\u8981\u6c42\u5e73\u53f0\u6536\u96c6\u5e76\u6838\u9a8c\u9ad8\u9500\u91cf\u7b2c\u4e09\u65b9\u5356\u5bb6\u7684\u8eab\u4efd\u3001\u94f6\u884c\u548c\u7a0e\u52a1\u4fe1\u606f\u3002", "US-INFORM-02"],
  ["GPSR", "\u901a\u7528\u4ea7\u54c1\u5b89\u5168\u6cd5\u89c4", "\u6b27\u76df\u6cd5\u89c4\uff0c2024 \u5e74 12 \u6708 13 \u65e5\u8d77\u9002\u7528\uff0c\u8981\u6c42\u6709\u6b27\u76df\u5883\u5185\u8d1f\u8d23\u7684\u7ecf\u8425\u8005\u3002", "EU-GPSR-02"],
  ["CPC", "\u513f\u7ae5\u4ea7\u54c1\u8bc1\u4e66", "\u7f8e\u56fd\u5bf9 12 \u5c81\u53ca\u4ee5\u4e0b\u513f\u7ae5\u4ea7\u54c1\u8981\u6c42\u7684\u5408\u89c4\u8bc1\u4e66\uff0c\u987b\u57fa\u4e8e\u8ba4\u53ef\u5b9e\u9a8c\u5ba4\u68c0\u6d4b\u3002", "US-CPSIA-01"],
  ["LUCID", "\u5fb7\u56fd\u5305\u88c5\u6ce8\u518c", "\u5411\u5fb7\u56fd\u9500\u552e\u5e26\u5305\u88c5\u5546\u54c1\u987b\u5728 LUCID \u7cfb\u7edf\u6ce8\u518c\uff0c\u5e73\u53f0\u4f1a\u6838\u67e5\u6ce8\u518c\u53f7\u3002", "DE-VERPACKG-01"],
  ["P2B", "\u5e73\u53f0\u5bf9\u5546\u5bb6\u6761\u4f8b", "\u6b27\u76df\u6cd5\u89c4\uff0c\u5e73\u53f0\u9650\u5236\u3001\u6682\u505c\u6216\u7ec8\u6b62\u5546\u5bb6\u670d\u52a1\u65f6\u987b\u8bf4\u660e\u7406\u7531\u5e76\u63d0\u4f9b\u6295\u8bc9\u6e20\u9053\u3002", "EU-P2B-02"],
  ["DSA", "\u6570\u5b57\u670d\u52a1\u6cd5", "\u6b27\u76df\u6cd5\u89c4\uff0c\u89c4\u5b9a\u901a\u77e5\u4e0e\u884c\u52a8\u673a\u5236\u3001\u7406\u7531\u8bf4\u660e\u3001\u5185\u90e8\u6295\u8bc9\u548c\u5ead\u5916\u4e89\u8bae\u89e3\u51b3\u3002", "EU-DSA-02"],
  ["\u9996\u6b21\u9500\u552e", "\u5546\u6807\u6743\u7528\u5c3d", "\u5408\u6cd5\u552e\u51fa\u7684\u6b63\u54c1\u518d\u8f6c\u552e\uff0c\u4e00\u822c\u4e0d\u6784\u6210\u5546\u6807\u4fb5\u6743\uff1b\u7f8e\u56fd\u4e3a\u56fd\u9645\u7528\u5c3d\uff0c\u6b27\u76df\u4e3a\u533a\u57df\u7528\u5c3d\u3002", "US-TM-03"],
  ["\u5916\u89c2\u8bbe\u8ba1\u4e13\u5229", "Design Patent", "\u4fdd\u62a4\u4ea7\u54c1\u5916\u89c2\uff1b\u516c\u6a21\u4ea7\u54c1\u4e5f\u53ef\u80fd\u843d\u5165\u4ed6\u4eba\u5916\u89c2\u4e13\u5229\u8303\u56f4\u3002", "US-PAT-02"],
  ["\u63cf\u8ff0\u6027\u4f7f\u7528", "\u5408\u7406\u4f7f\u7528", "\u4e3a\u8bf4\u660e\u517c\u5bb9\u6027\u7b49\u76ee\u7684\u3001\u4ee5\u63cf\u8ff0\u65b9\u5f0f\u4f7f\u7528\u4ed6\u4eba\u5546\u6807\uff0c\u53ef\u80fd\u6784\u6210\u5408\u7406\u4f7f\u7528\u3002", "US-TM-02"],
  ["\u6fc0\u52b1\u8bc4\u8bba", "Incentivized review", "\u4ee5\u62a5\u916c\u3001\u6298\u6263\u3001\u8d60\u54c1\u6362\u53d6\u8bc4\u8bba\uff0c\u8fdd\u53cd\u4e9a\u9a6c\u900a\u653f\u7b56\u548c FTC \u89c4\u5219\u3002", "US-FTC-03"],
  ["\u5237\u5355", "\u865a\u5047\u4ea4\u6613", "\u7ec4\u7ec7\u6216\u5e2e\u52a9\u865a\u6784\u4ea4\u6613\u3001\u7f16\u9020\u8bc4\u4ef7\uff0c\u4e2d\u56fd\u6cd5\u4e0b\u6784\u6210\u865a\u5047\u5ba3\u4f20\u3002", "CN-AUCL-01"],
  ["VeRO", "eBay \u8ba4\u8bc1\u6743\u5229\u4eba\u8ba1\u5212", "eBay \u7684\u77e5\u8bc6\u4ea7\u6743\u4e3e\u62a5\u673a\u5236\uff0c\u53ea\u6709\u6743\u5229\u4eba\u6216\u5176\u4ee3\u8868\u53ef\u4ee5\u4e3e\u62a5\u3002", "EBAY-VERO-01"],
  ["Below Standard", "eBay \u4f4e\u4e8e\u6807\u51c6", "eBay \u5356\u5bb6\u7ee9\u6548\u6700\u4f4e\u4e00\u6863\uff0c\u53ef\u80fd\u5bfc\u81f4\u6392\u540d\u4e0b\u964d\u3001\u8d44\u91d1\u6263\u7559\u548c\u8d39\u7528\u4e0a\u8c03\u3002", "EBAY-SPS-01"],
  ["Prop 65", "\u52a0\u5dde\u7b2c 65 \u53f7\u63d0\u6848", "\u542b\u52a0\u5dde\u5217\u540d\u5316\u5b66\u7269\u8d28\u7684\u5546\u54c1\u987b\u63d0\u4f9b\u6e05\u6670\u5408\u7406\u7684\u8b66\u793a\u3002", "US-P65-01"],
  ["UFLPA", "\u7ef4\u543e\u5c14\u5f3a\u8feb\u52b3\u52a8\u9884\u9632\u6cd5", "\u76f8\u5173\u5546\u54c1\u88ab\u63a8\u5b9a\u4e3a\u5f3a\u8feb\u52b3\u52a8\u4ea7\u54c1\uff0c\u8fdb\u53e3\u65f6\u53ef\u80fd\u88ab\u6d77\u5173\u6263\u7559\u3002", "US-UFLPA-01"],
  ["\u53ec\u56de", "\u4ea7\u54c1\u53ec\u56de", "\u76d1\u7ba1\u673a\u6784\u6216\u4f01\u4e1a\u5bf9\u6709\u5b89\u5168\u9690\u60a3\u7684\u4ea7\u54c1\u53d1\u8d77\u7684\u56de\u6536\u3001\u9000\u6b3e\u6216\u7ef4\u4fee\u3002", "US-CPSA-02"],
  ["\u30b9\u30c6\u30de", "\u65e5\u672c\u9690\u6027\u8425\u9500\u89c4\u5236", "\u4e8b\u4e1a\u8005\u59d4\u6258\u7684\u63a8\u5e7f\u5185\u5bb9\u82e5\u96be\u4ee5\u8bc6\u522b\u4e3a\u5e7f\u544a\uff0c\u5373\u5c5e\u4e0d\u5f53\u8868\u793a\u3002", "JP-STEMA-01"]];
const MYTHS = [
  ["\u7533\u8bc9\u5199\u5f97\u8d8a\u957f\u8d8a\u597d", "\u5ba1\u6838\u4eba\u5458\u770b\u7684\u662f\u7ed3\u6784\u548c\u8bc1\u636e\u3002\u6309\u6839\u672c\u539f\u56e0\u3001\u7ea0\u6b63\u63aa\u65bd\u3001\u9884\u9632\u63aa\u65bd\u5199\u6e05\u695a\uff0c\u6bd4\u5806\u780c\u7bc7\u5e45\u6709\u6548\u3002", "M-POA-01"],
  ["\u6362\u4e2a\u8d26\u53f7\u91cd\u65b0\u5f00\u5e97\u5c31\u884c", "\u65e0\u5408\u7406\u4e1a\u52a1\u9700\u6c42\u7ecf\u8425\u591a\u4e2a\u8d26\u6237\u8fdd\u53cd\u5356\u5bb6\u884c\u4e3a\u51c6\u5219\uff0c\u65b0\u8d26\u53f7\u53ef\u80fd\u88ab\u5173\u8054\u5e76\u4e00\u5e76\u505c\u7528\u3002", "AMZ-COC-07"],
  ["\u88ab\u6295\u8bc9\u5c31\u8bf4\u660e\u6211\u4fb5\u6743\u4e86", "\u6295\u8bc9\u4e0d\u7b49\u4e8e\u4fb5\u6743\u6210\u7acb\u3002\u6838\u5bf9\u6743\u5229\u8303\u56f4\uff0c\u53ef\u4ee5\u8054\u7cfb\u6743\u5229\u4eba\u64a4\u8bc9\uff0c\u6216\u4f9d\u6cd5\u63d0\u51fa\u53cd\u901a\u77e5\u3001\u4e0d\u4fb5\u6743\u58f0\u660e\u3002", "M-ROUTE-01"],
  ["\u8fd4\u73b0\u6362\u597d\u8bc4\uff0c\u4e0d\u660e\u8bf4\u5c31\u6ca1\u4e8b", "\u4ee5\u4efb\u4f55\u62a5\u916c\u6362\u53d6\u8bc4\u8bba\u90fd\u8fdd\u53cd\u5e73\u53f0\u653f\u7b56\uff1b\u7f8e\u56fd FTC \u89c4\u5219\u5bf9\u865a\u5047\u548c\u6709\u507f\u8bc4\u8bba\u53ef\u5904\u6c11\u4e8b\u7f5a\u6b3e\u3002", "US-FTC-03"],
  ["\u7f8e\u56fd\u6cd5\u9662\u7684 TRO \u4e0d\u7528\u7406", "\u4e0d\u7b54\u8fa9\u53ef\u80fd\u88ab\u7f3a\u5e2d\u5224\u51b3\uff0c\u88ab\u51bb\u7ed3\u7684\u8d44\u91d1\u53ef\u80fd\u88ab\u5212\u8f6c\u3002\u6536\u5230\u6cd5\u9662\u6587\u4e66\u5e94\u5c3d\u5feb\u8054\u7cfb\u5f8b\u5e08\u3002", "US-PROC-02"],
  ["\u5e73\u53f0\u5904\u7f5a\u6ca1\u6709\u9053\u7406\u53ef\u8bb2", "\u5728\u6b27\u76df\uff0c\u5e73\u53f0\u9650\u5236\u6216\u6682\u505c\u5546\u5bb6\u987b\u8bf4\u660e\u7406\u7531\uff0c\u5e76\u63d0\u4f9b\u5185\u90e8\u6295\u8bc9\u548c\u8c03\u89e3\u6e20\u9053\u3002", "EU-P2B-02"]];
let roadOn = 0;
DRAW.learn = () => {
  $("#road").innerHTML = `<svg class="rl" viewBox="0 0 600 120" preserveAspectRatio="none"><path d="M20 90 C 120 10, 200 110, 300 60 S 480 10, 580 40" /></svg>` + ROAD.map((r, i) => `<button class="rn ${i === roadOn ? "on" : ""}" data-i="${i}" style="--i:${i}"><b>${i + 1}</b><span>${r[0]}</span><small>${r[1]}</small></button>`).join("");
  $$("#road .rn").forEach(b => b.onclick = () => { roadOn = +b.dataset.i; $$("#road .rn").forEach(x => x.classList.toggle("on", x === b)); roadD(); });
  roadD(); glRender(); mythRender();
};
function roadD() {
  const r = ROAD[roadOn];
  $("#roadD").innerHTML = `<div class="rd"><div class="rdh"><span>\u7b2c ${roadOn + 1} \u6b65</span><h3>${r[0]}</h3><em>${r[1]}</em></div><div class="rdc"><div class="do"><h4>\u8981\u505a</h4>${r[2].map(x => `<div>${E(x)}</div>`).join("")}</div><div class="dont"><h4>\u4e0d\u8981\u505a</h4>${r[3].map(x => `<div>${E(x)}</div>`).join("")}</div></div>
    <div class="rdn">${roadOn > 0 ? `<button class="btn2" id="rPrev">\u2190 \u4e0a\u4e00\u6b65</button>` : ""}${roadOn < 5 ? `<button class="primary" id="rNext">\u4e0b\u4e00\u6b65 \u2192</button>` : `<button class="primary" data-go="diag">\u53bb\u8bca\u65ad\u6211\u7684\u6848\u4ef6 \u2192</button>`}</div></div>`;
  $("#rPrev") && ($("#rPrev").onclick = () => { roadOn--; DRAW.learn(); });
  $("#rNext") && ($("#rNext").onclick = () => { roadOn++; DRAW.learn(); });
}
function glRender() {
  const q = ($("#glQ").value || "").trim().toLowerCase();
  const it = GLOSS.filter(g => !q || g.join(" ").toLowerCase().includes(q));
  $("#glN").textContent = `${it.length} / ${GLOSS.length} \u4e2a\u672f\u8bed`;
  $("#glList").innerHTML = it.map((g, i) => `<div class="gi" style="animation-delay:${Math.min(i, 12) * 30}ms"><div class="gh"><b>${E(g[0])}</b>${g[1] !== g[0] ? `<span>${E(g[1])}</span>` : ""}<em data-kb="${g[3]}">${g[3]}</em></div><p>${E(g[2])}</p></div>`).join("");
  $$("#glList [data-kb]").forEach(t => t.onclick = () => { go("kb"); $("#kbQ").value = t.dataset.kb; kbLoad(); });
}
$("#glQ").oninput = glRender;
function mythRender() {
  $("#myths").innerHTML = MYTHS.map((m, i) => `<div class="my" style="animation-delay:${i * 60}ms"><div class="mi"><div class="mf"><span>\u8bef\u533a</span><b>\u201c${E(m[0])}\u201d</b><small>\u70b9\u51fb\u67e5\u770b\u4e8b\u5b9e</small></div><div class="mb"><span>\u4e8b\u5b9e</span><p>${E(m[1])}</p><em>\u4f9d\u636e ${m[2]}</em></div></div></div>`).join("");
  $$("#myths .my").forEach(c => c.onclick = () => c.classList.toggle("flip"));
}

/* =========================== \u65b0\u624b\u5f15\u5bfc =========================== */
const TOUR = [
  [".side nav a[data-page=diag]", "\u6848\u4ef6\u8bca\u65ad", "\u628a\u5e73\u53f0\u901a\u77e5\u548c\u4f60\u7684\u9648\u8ff0\u7c98\u8d34\u8fdb\u6765\uff0c\u4e03\u6b65\u63a8\u7406\u540e\u7ed9\u51fa\u8fdd\u89c4\u7c7b\u522b\u3001\u98ce\u9669\u7b49\u7ea7\u3001\u5e94\u5bf9\u8def\u5f84\u548c\u7533\u8bc9\u6587\u4e66\u3002"],
  [".side nav a[data-page=live]", "\u6cd5\u89c4\u52a8\u6001", "\u8054\u7f51\u6293\u53d6\u7f8e\u56fd\u8054\u90a6\u516c\u62a5\u3001FTC\u3001CPSC \u548c\u82f1\u56fd OPSS \u7684\u5b98\u65b9\u52a8\u6001\uff0c\u5ba1\u6838\u540e\u624d\u8fdb\u5165\u77e5\u8bc6\u5e93\u3002"],
  [".side nav a[data-page=learn]", "\u65b0\u624b\u5b66\u5802", "\u7b2c\u4e00\u6b21\u9047\u5230\u5c01\u53f7\u6216\u6295\u8bc9\uff1f\u4ece\u201c72 \u5c0f\u65f6\u884c\u52a8\u8def\u7ebf\u201d\u5f00\u59cb\uff0c\u672f\u8bed\u770b\u4e0d\u61c2\u5c31\u67e5\u8bcd\u5178\u3002"],
  [".side nav a[data-page=tools]", "\u5de5\u5177\u7bb1", "\u7533\u8bc9\u65f6\u9650\u5012\u8ba1\u65f6\u3001\u7533\u8bc9\u4e66\u4f53\u68c0\u3001\u7ad9\u70b9\u6cd5\u57df\u901f\u67e5\uff0c\u90fd\u5728\u8fd9\u91cc\u3002"],
  ["#cmdBtn", "\u5168\u5c40\u641c\u7d22", "\u6309 Ctrl + K\uff0c\u968f\u65f6\u641c\u7d22\u9875\u9762\u3001\u793a\u4f8b\u6848\u4ef6\u548c\u6cd5\u89c4\u6761\u6587\u3002"],
  ["#openSettings", "\u6a21\u578b\u8bbe\u7f6e", "\u586b\u5165 DeepSeek \u7b49\u517c\u5bb9\u63a5\u53e3\u7684 API Key \u5373\u53ef\u5728\u7ebf\u8bca\u65ad\uff1b\u5bc6\u94a5\u53ea\u4fdd\u5b58\u5728\u672c\u673a\u3002"]];
let tourI = 0;
function tourShow() {
  const [sel, t, p] = TOUR[tourI], el = $(sel); if (!el) return tourEnd();
  const r = el.getBoundingClientRect(), pad = 6;
  Object.assign($("#spot").style, {left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px"});
  const tip = $("#tip"), right = r.left < 300;
  tip.style.left = (right ? r.right + 22 : Math.max(16, r.left + r.width / 2 - 170)) + "px";
  tip.style.top = (right ? Math.max(16, Math.min(innerHeight - 220, r.top - 20)) : r.bottom + 18) + "px";
  if (!right && r.left + 180 > innerWidth) tip.style.left = innerWidth - 360 + "px";
  $("#tipN").textContent = `${tourI + 1} / ${TOUR.length}`; $("#tipT").textContent = t; $("#tipP").textContent = p;
  $("#tipD").innerHTML = TOUR.map((_, i) => `<i class="${i === tourI ? "on" : ""}"></i>`).join("");
  $("#tipNext").textContent = tourI === TOUR.length - 1 ? "\u5f00\u59cb\u4f7f\u7528" : "\u4e0b\u4e00\u6b65";
  tip.classList.remove("in"); void tip.offsetWidth; tip.classList.add("in");
}
function tourStart() { tourI = 0; $("#tour").classList.add("on"); tourShow(); }
function tourEnd() { $("#tour").classList.remove("on"); try { localStorage.setItem("th-tour", "1"); } catch (e) {} }
$("#tipNext").onclick = () => { if (++tourI >= TOUR.length) tourEnd(); else tourShow(); };
$("#tipSkip").onclick = tourEnd;
$("#tourBtn").onclick = () => $("#welcome").classList.add("on");
window.addEventListener("resize", () => $("#tour").classList.contains("on") && tourShow());
$$("#welcome .roles button").forEach(b => b.onclick = () => { $$("#welcome .roles button").forEach(x => x.classList.toggle("on", x === b)); });
$("#welSkip").onclick = () => { welGo(); tourEnd(); };
$("#welTour").onclick = () => { welGo(true); setTimeout(tourStart, 350); };
function welGo(stay) {
  $("#welcome").classList.remove("on");
  const r = $("#welcome .roles button.on")?.dataset.role;
  if (!stay || r) go({new: "learn", pro: "diag", judge: "screen"}[r] || cur);
}

/* =========================== \u542f\u52a8 =========================== */
(async () => {
  await liveLoad().catch(() => null);
  await init();
  const q = new URLSearchParams(location.search);
  let seen = false; try { seen = !!localStorage.getItem("th-tour"); } catch (e) {}
  if (!seen && !q.has("demo")) setTimeout(() => $("#welcome").classList.add("on"), 1500);
  setInterval(async () => { await liveLoad().catch(() => null); if (cur === "home") window.liveTimeline(); }, 5 * 60 * 1000);
})();
