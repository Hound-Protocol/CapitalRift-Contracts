/* Capital Rift · Private Contracts: stamp workshop (left panel) */
(function () {
  var D = window.CRDoc, doc = D.doc, host = document.getElementById("studio");
  if (!D || !host) return;
  var TPL_KEY = "cr-private-contracts:tpl";
  var FONTS = {
    mono: { n: "Terminal mono", f: "'Share Tech Mono', ui-monospace, Consolas, monospace", w: 700 },
    cond: { n: "Condensed sans", f: "'Barlow Semi Condensed', 'Arial Narrow', sans-serif", w: 500 },
    impact: { n: "Heavy block", f: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", w: 400 },
    serif: { n: "Official serif", f: "Georgia, 'Times New Roman', serif", w: 700 },
    type: { n: "Typewriter", f: "'Courier New', Courier, monospace", w: 700 },
    sans: { n: "Plain sans", f: "'Trebuchet MS', Verdana, sans-serif", w: 700 },
    script: { n: "Hand script", f: "'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive", w: 400 }
  };
  var COLORS = ["#a3241b", "#2f7a45", "#a8650a", "#1d6a8a", "#6e4a96", "#1c2022"];
  var ANIMS = [["none", "None"], ["pulse", "Pulse"], ["blink", "Blink"], ["shake", "Shake"], ["glitch", "Glitch"], ["glow", "Glow"], ["wobble", "Wobble"]];
  var BORDERS = [["double", "Double frame"], ["solid", "Solid frame"], ["dashed", "Dashed frame"], ["under", "Underline"], ["none", "No frame"]];
  var PRESETS = [["APPROVED", "#2f7a45"], ["PAID", "#1d6a8a"], ["VOID", "#a3241b"], ["URGENT", "#a8650a"], ["CONFIDENTIAL", "#a3241b"], ["SIGNED", "#6e4a96"]];
  var tpl = { text: "APPROVED", color: "#2f7a45", font: "mono", size: 28, rot: -8, border: "double", anim: "none" };
  try { var st = JSON.parse(localStorage.getItem(TPL_KEY) || "null"); if (st && FONTS[st.font]) tpl = Object.assign(tpl, st); } catch (e) {}
  var sel = null, mode = false, ghost = null;

  function opt(list, v) { return list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === v ? " selected" : "") + ">" + o[1] + "</option>"; }).join(""); }
  host.innerHTML =
    "<h3>Stamp workshop</h3>" +
    '<div class="pre" id="sPre" aria-label="Stamp preview"></div>' +
    '<div class="row2"><button type="button" class="btn small primary" id="sMode">Click here to engage stamp mode</button><button type="button" class="btn small" id="sAdd">Movable stamp</button></div>' +
    '<p class="hint" id="sHint">Stamp mode: your cursor carries the stamp, click anywhere on the page to press it. Esc to put it down.</p>' +
    '<div class="selinfo" id="sSel" hidden><span>Editing selected stamp</span><button type="button" class="btn small" id="sDesel">Done</button></div>' +
    '<label for="sTxt">Text</label><input type="text" id="sTxt" maxlength="28" autocomplete="off" spellcheck="false" placeholder="Your name &amp; Company">' +
    '<p class="guide">Insert your name &amp; Company to the stamp for record</p>' +
    "<label>Color</label>" +
    '<div class="sw" id="sSw">' + COLORS.map(function (c) { return '<button type="button" data-c="' + c + '" style="background:' + c + '" aria-label="Color ' + c + '"></button>'; }).join("") +
    '<input type="color" id="sCol" aria-label="Custom color"></div>' +
    '<label for="sFont">Font</label><select id="sFont">' + Object.keys(FONTS).map(function (k) { return '<option value="' + k + '">' + FONTS[k].n + "</option>"; }).join("") + "</select>" +
    '<label for="sSize">Size <b id="sSizeV"></b></label><input type="range" id="sSize" min="14" max="72" step="1">' +
    '<label for="sRot">Tilt <b id="sRotV"></b></label><input type="range" id="sRot" min="-30" max="30" step="1">' +
    '<label for="sBorder">Frame</label><select id="sBorder">' + opt(BORDERS, tpl.border) + "</select>" +
    '<label for="sAnim">Animation</label><select id="sAnim">' + opt(ANIMS, tpl.anim) + "</select>" +
    "<label>Quick stamps</label>" +
    '<div class="pre-btns" id="sPre2">' + PRESETS.map(function (p) { return '<button type="button" class="btn small" data-t="' + p[0] + '" data-c="' + p[1] + '">' + p[0] + "</button>"; }).join("") + "</div>";

  var $ = function (id) { return document.getElementById(id); };
  var dom = { txt: $("sTxt"), col: $("sCol"), font: $("sFont"), size: $("sSize"), rot: $("sRot"), border: $("sBorder"), anim: $("sAnim"), pre: $("sPre"), mode: $("sMode") };

  function cfgOf() { return { color: tpl.color, font: tpl.font, size: tpl.size, rot: tpl.rot, border: tpl.border, anim: tpl.anim }; }
  function paint(outer, c) {
    var b = outer.querySelector(".pbody"), f = FONTS[c.font] || FONTS.mono;
    outer.style.setProperty("--c", c.color); outer.style.setProperty("--r", c.rot + "deg");
    b.style.fontFamily = f.f; b.style.fontWeight = f.w; b.style.fontSize = c.size + "px";
    b.setAttribute("data-b", c.border); b.setAttribute("data-anim", c.anim);
    outer.setAttribute("data-cfg", JSON.stringify(c));
  }
  function build(text, c, plain) {
    var s = document.createElement("div"); s.className = "pstamp";
    s.innerHTML = '<span class="pbody"><span class="st"' + (plain ? "" : ' contenteditable="true"') + "></span></span>" +
      (plain ? "" : '<span class="ctl"><button class="drag" type="button" data-s="drag" title="Drag to move">✥</button><button type="button" data-s="edit" title="Edit in workshop">✎</button><button type="button" data-s="del" title="Delete">✕</button></span>');
    s.querySelector(".st").textContent = text; paint(s, c); return s;
  }
  function sync() {
    dom.txt.value = tpl.text; dom.col.value = /^#[0-9a-f]{6}$/i.test(tpl.color) ? tpl.color : "#a3241b";
    dom.font.value = tpl.font; dom.size.value = tpl.size; dom.rot.value = tpl.rot; dom.border.value = tpl.border; dom.anim.value = tpl.anim;
    $("sSizeV").textContent = tpl.size + "px"; $("sRotV").textContent = tpl.rot + "°";
    [].forEach.call($("sSw").querySelectorAll("button"), function (b) { b.classList.toggle("on", b.getAttribute("data-c").toLowerCase() === tpl.color.toLowerCase()); });
  }
  function refresh(fromPanel) {
    sync();
    dom.pre.innerHTML = ""; dom.pre.appendChild(build(tpl.text || " ", cfgOf(), true));
    if (sel) { paint(sel, cfgOf()); if (fromPanel === "text") sel.querySelector(".st").textContent = tpl.text; D.later(); }
    if (ghost) { var g = build(tpl.text || " ", cfgOf(), true); g.className = "pstamp ghost"; g.style.left = ghost.style.left; g.style.top = ghost.style.top; g.style.display = ghost.style.display; ghost.replaceWith(g); ghost = g; }
    try { localStorage.setItem(TPL_KEY, JSON.stringify(Object.assign({ text: tpl.text }, cfgOf()))); } catch (e) {}
  }

  dom.txt.addEventListener("input", function () { tpl.text = dom.txt.value; refresh("text"); });
  dom.col.addEventListener("input", function () { tpl.color = dom.col.value; refresh(); });
  $("sSw").addEventListener("click", function (e) { var c = e.target.getAttribute && e.target.getAttribute("data-c"); if (c) { tpl.color = c; refresh(); } });
  dom.font.addEventListener("change", function () { tpl.font = dom.font.value; refresh(); });
  dom.size.addEventListener("input", function () { tpl.size = +dom.size.value; refresh(); });
  dom.rot.addEventListener("input", function () { tpl.rot = +dom.rot.value; refresh(); });
  dom.border.addEventListener("change", function () { tpl.border = dom.border.value; refresh(); });
  dom.anim.addEventListener("change", function () { tpl.anim = dom.anim.value; refresh(); });
  $("sPre2").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; tpl.text = b.getAttribute("data-t"); tpl.color = b.getAttribute("data-c"); refresh("text"); });

  function select(el) {
    if (sel) sel.classList.remove("sel");
    sel = el;
    $("sSel").hidden = !el;
    if (el) { el.classList.add("sel"); try { tpl = Object.assign(tpl, JSON.parse(el.getAttribute("data-cfg"))); } catch (e) {} tpl.text = el.querySelector(".st").textContent; refresh(); }
  }
  $("sDesel").addEventListener("click", function () { select(null); });

  function page() { return D.page(); }
  function press(x, y) {
    var pg = page(), pr = pg.getBoundingClientRect(), s = build(tpl.text || " ", cfgOf(), false);
    s.classList.add("slam"); pg.appendChild(s);
    s.style.left = Math.round(x - pr.left - s.offsetWidth / 2) + "px"; s.style.top = Math.round(y - pr.top - s.offsetHeight / 2) + "px";
    s.addEventListener("animationend", function (ev) { if (ev.target === s) s.classList.remove("slam"); });
    D.save();
  }
  function setMode(on) {
    mode = on; document.body.classList.toggle("stamping", on);
    dom.mode.textContent = on ? "Stamping · Esc to stop" : "Click here to engage stamp mode"; dom.mode.classList.toggle("sel", on);
    if (on) { select(null); ghost = build(tpl.text || " ", cfgOf(), true); ghost.className = "pstamp ghost"; ghost.style.display = "none"; document.body.appendChild(ghost); }
    else if (ghost) { ghost.remove(); ghost = null; }
  }
  dom.mode.addEventListener("click", function () { setMode(!mode); });
  $("sAdd").addEventListener("click", function () {
    var pg = page(), pr = pg.getBoundingClientRect(), vr = document.getElementById("view").getBoundingClientRect();
    var y = Math.min(Math.max(vr.top + vr.height / 2, pr.top + 120), pr.bottom - 80);
    press(pr.left + pr.width * 0.68, y);
    select(pg.lastElementChild);
  });
  window.addEventListener("pointermove", function (e) {
    if (!mode || !ghost) return;
    var over = e.target.closest && e.target.closest(".ds-page");
    ghost.style.display = over ? "" : "none";
    ghost.style.left = Math.round(e.clientX - ghost.offsetWidth / 2) + "px"; ghost.style.top = Math.round(e.clientY - ghost.offsetHeight / 2) + "px";
  });
  /* While stamping, the page ignores normal clicks and takes a stamp instead */
  ["pointerdown", "mousedown"].forEach(function (t) { doc.addEventListener(t, function (e) { if (mode && !e.target.closest(".ctl") && e.target.closest(".ds-page")) e.preventDefault(); }, true); });
  doc.addEventListener("click", function (e) {
    if (!mode || e.target.closest(".ctl") || !e.target.closest(".ds-page")) return;
    e.preventDefault(); e.stopPropagation(); press(e.clientX, e.clientY);
  }, true);
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (mode) setMode(false); else select(null); } });

  /* Controls on placed stamps */
  doc.addEventListener("click", function (e) {
    var b = e.target.closest(".ctl button"); if (!b) return;
    var s = b.closest(".pstamp");
    if (b.dataset.s === "del") { if (sel === s) select(null); s.remove(); D.save(); }
    if (b.dataset.s === "edit") { setMode(false); select(s); }
  });
  var drag = null;
  doc.addEventListener("pointerdown", function (e) {
    var h = e.target.closest(".drag"); if (!h) return;
    var s = h.closest(".pstamp"), pr = page().getBoundingClientRect();
    drag = { s: s, dx: e.clientX - pr.left - s.offsetLeft, dy: e.clientY - pr.top - s.offsetTop };
    h.setPointerCapture(e.pointerId); e.preventDefault();
  });
  doc.addEventListener("pointermove", function (e) {
    if (!drag) return; var pr = page().getBoundingClientRect();
    drag.s.style.left = Math.round(e.clientX - pr.left - drag.dx) + "px"; drag.s.style.top = Math.round(e.clientY - pr.top - drag.dy) + "px";
  });
  doc.addEventListener("pointerup", function () { if (drag) { drag = null; D.save(); } });
  /* Reset / reload leave no stale selection */
  new MutationObserver(function () { if (sel && !doc.contains(sel)) select(null); }).observe(doc, { childList: true, subtree: true });
  refresh();
})();
