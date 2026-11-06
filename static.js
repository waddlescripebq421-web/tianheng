/* \u5728\u7ebf\u6f14\u793a\u7248\uff1a\u7528\u5185\u7f6e\u7684\u771f\u5b9e\u6570\u636e\u5feb\u7167\u66ff\u4ee3\u672c\u5730\u670d\u52a1\u63a5\u53e3 */
(() => {
  const D = window.__DATA, KB = D.kb.slice();
  const J = o => Promise.resolve(new Response(JSON.stringify(o), {headers: {"Content-Type": "application/json"}}));
  const search = (q, jur) => {
    let it = KB;
    if (q) { const ws = q.toLowerCase().split(/\s+/).filter(Boolean);
      it = KB.map(x => { const t = `${x.id} ${x.source} ${x.provision} ${x.summary} ${x.keywords} ${x.category}`.toLowerCase(); return [x, ws.reduce((s, w) => s + (t.split(w).length - 1), 0)]; }).filter(a => a[1] > 0).sort((a, b) => b[1] - a[1]).map(a => a[0]); }
    return jur ? it.filter(x => x.jurisdiction === jur) : it;
  };
  const real = window.fetch.bind(window);
  window.fetch = (u, opt = {}) => {
    const url = new URL(u, location.href), p = url.pathname, q = Object.fromEntries(url.searchParams);
    if (!p.includes("/api/")) return real(u, opt);
    if (p.endsWith("/api/meta")) return J(D.meta);
    if (p.endsWith("/api/stats")) return J(Object.assign({}, D.stats, {kb_total: KB.length}));
    if (p.endsWith("/api/examples")) return J(D.examples);
    if (p.endsWith("/api/graph")) return J(D.graph);
    if (p.endsWith("/api/updates")) return J(D.updates);
    if (p.endsWith("/api/kb")) return J(search(q.q || "", q.jur || ""));
    if (p.endsWith("/api/kbids")) { const ids = (q.ids || "").split(","); return J(KB.filter(x => ids.includes(x.id))); }
    if (p.endsWith("/api/settings")) { toast("\u5728\u7ebf\u6f14\u793a\u7248\u4e0d\u8fde\u63a5\u5927\u6a21\u578b\uff1b\u5b8c\u6574\u529f\u80fd\u8bf7\u5728\u672c\u5730\u8fd0\u884c"); return J({ok: true, has_key: false, model: "deepseek-chat", mock: false}); }
    if (p.endsWith("/api/updates/review")) {
      const b = JSON.parse(opt.body || "{}"), x = D.updates.items.find(i => i.uid === b.uid);
      if (!x) return J({ok: false, error: "\u6761\u76ee\u4e0d\u5b58\u5728"});
      x.status = {approve: "approved", ignore: "ignored", watch: "watch", reset: "new"}[b.action];
      let kb_id = null;
      if (b.action === "approve") { kb_id = "ONL-" + x.uid.toUpperCase(); x.kb_id = kb_id; KB.push({id: kb_id, jurisdiction: D.updates.sources[x.src].jur, category: x.cat, source: x.title, provision: "\u5728\u7ebf\u589e\u8865", summary: x.zh || x.abstract || "", effective_date: x.date, url: x.url, verified: "B", origin: "\u5728\u7ebf\u66f4\u65b0", keywords: ""}); }
      return J({ok: true, status: x.status, kb_id, kb_total: KB.length});
    }
    return J({});
  };
  class FakeES {
    constructor(u) {
      this.L = {}; const url = new URL(u, location.href), q = Object.fromEntries(url.searchParams);
      setTimeout(async () => {
        if (url.pathname.endsWith("/api/diagnose")) {
          const r = D.replay[(q.notice || "").trim()];
          if (!r) return this.emit("fail", "\u5728\u7ebf\u6f14\u793a\u7248\u53ea\u80fd\u56de\u653e\u793a\u4f8b\u6848\u4ef6\u7684\u771f\u5b9e\u8fd0\u884c\u7ed3\u679c\u3002\u8bf7\u5728\u5de6\u4fa7\u201c\u8f7d\u5165\u793a\u4f8b\u201d\u4e2d\u9009\u62e9\u6848\u4ef6\uff1b\u8f93\u5165\u81ea\u5df1\u7684\u901a\u77e5\u9700\u8981\u5728\u672c\u5730\u8fd0\u884c\u5b8c\u6574\u7248\u3002");
          for (let i = 1; i <= 7; i++) { this.emit("step", i); await new Promise(s => setTimeout(s, 650)); }
          const out = JSON.parse(JSON.stringify(r)); if (q.draft !== "1") out.document = null;
          this.emit("step", 8); this.emit("result", out);
        } else {
          this.emit("end", null); toast("\u5728\u7ebf\u6f14\u793a\u7248\u5c55\u793a\u7684\u662f\u8054\u7f51\u6293\u53d6\u7684\u771f\u5b9e\u6570\u636e\u5feb\u7167\uff1b\u672c\u5730\u8fd0\u884c\u65f6\u6bcf 2 \u5c0f\u65f6\u81ea\u52a8\u66f4\u65b0");
        }
      }, 50);
    }
    addEventListener(e, f) { this.L[e] = f; }
    emit(e, d) { this.L[e]?.({data: JSON.stringify(d)}); }
    close() {}
  }
  window.EventSource = FakeES;
  const blockDl = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (this.download) { toast("\u5728\u7ebf\u6f14\u793a\u7248\u4e0d\u652f\u6301\u4e0b\u8f7d\u6587\u4ef6\uff0c\u5bfc\u51fa\u529f\u80fd\u8bf7\u5728\u672c\u5730\u7248\u4f7f\u7528"); return; } return blockDl.call(this); };
})();
document.addEventListener("DOMContentLoaded", () => { const r = document.createElement("div"); r.className = "demo-ribbon"; r.textContent = "\u5728\u7ebf\u6f14\u793a\u7248 \u00b7 \u793a\u4f8b\u6848\u4ef6\u4e3a\u771f\u5b9e\u8fd0\u884c\u7ed3\u679c\u56de\u653e \u00b7 \u6cd5\u89c4\u52a8\u6001\u4e3a\u8054\u7f51\u6293\u53d6\u7684\u771f\u5b9e\u5feb\u7167"; document.body.appendChild(r); });
