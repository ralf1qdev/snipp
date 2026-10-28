// Snipp live demo: a browser port of the Snipp editor. Everything runs locally; nothing is uploaded.
(function () {
  'use strict';

  // ---------- icons (24px, stroke = currentColor) ----------
  var I = {
    select: '<path d="M7 3v16l4-4 3 6 2.5-1.2-3-6H19z"/>',
    crop: '<path d="M7 2v15h15M2 7h15v15"/>',
    pen: '<path d="M4 20l1.5-5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18z"/><path d="M14 6.5l3 3"/>',
    highlighter: '<path d="M6 16l2-5 8-8 4 4-8 8-5 2z"/><path d="M3 21h18" stroke-width="3" opacity=".5"/>',
    line: '<path d="M5 19L19 5"/>',
    arrow: '<path d="M5 19L19 5M19 5h-8M19 5v8"/>',
    rect: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/>',
    ellipse: '<ellipse cx="12" cy="12" rx="9" ry="7"/>',
    text: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
    callout: '<path d="M4 5h16v10H10l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
    blur: '<circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/><circle cx="12" cy="12" r="4" fill="currentColor" opacity=".55" stroke="none"/>',
    pixelate: '<rect x="4" y="4" width="5" height="5" fill="currentColor" stroke="none"/><rect x="9.5" y="9.5" width="5" height="5" fill="currentColor" stroke="none"/><rect x="15" y="15" width="5" height="5" fill="currentColor" stroke="none"/><rect x="15" y="4" width="5" height="5" fill="currentColor" stroke="none" opacity=".45"/><rect x="4" y="15" width="5" height="5" fill="currentColor" stroke="none" opacity=".45"/>',
    spot: '<path d="M2 5h20v14H2z" fill="currentColor" opacity=".3" stroke="none"/><circle cx="12" cy="12" r="4.5"/>',
    step: '<circle cx="12" cy="12" r="9"/><path d="M10.5 9l2-1.5V16"/>',
    eyedropper: '<path d="M4 20l1-4 8.5-8.5 3 3L8 19z"/><path d="M13 6l2-2a2.1 2.1 0 0 1 3 3l-2 2z" fill="currentColor"/>',
    eraser: '<path d="M8 20l-5-5 10-10 7 7-8 8z"/><path d="M8 20h12M6 12l6 6"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    frame: '<rect x="3" y="4" width="18" height="16" rx="3"/><rect x="7" y="8" width="10" height="8" rx="1.5" fill="currentColor" opacity=".5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    download: '<path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16"/>',
    shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    trash: '<path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/>',
    fill: '<rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + I[name] + '</svg>'; }

  var TOOLS = [
    { id: 'select', key: 'v', name: 'Select & move' }, { id: 'crop', key: 'c', name: 'Crop' }, null,
    { id: 'pen', key: 'p', name: 'Pen' }, { id: 'highlighter', key: 'h', name: 'Highlighter' }, { id: 'line', key: 'l', name: 'Line' },
    { id: 'arrow', key: 'a', name: 'Arrow' }, { id: 'rect', key: 'r', name: 'Rectangle' }, { id: 'ellipse', key: 'e', name: 'Ellipse' },
    { id: 'text', key: 't', name: 'Text' }, { id: 'callout', key: 'k', name: 'Callout bubble' }, null,
    { id: 'blur', key: 'b', name: 'Blur' }, { id: 'pixelate', key: 'x', name: 'Pixelate' }, { id: 'spot', key: 's', name: 'Spotlight' },
    { id: 'step', key: 'n', name: 'Numbered step' }, null,
    { id: 'eyedropper', key: 'i', name: 'Pick color from image' }, { id: 'eraser', key: 'd', name: 'Eraser' }
  ];
  var PALETTE = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#0a84ff', '#af52de', '#111111', '#ffffff'];
  var SIZES = [2, 4, 7, 12];
  var FONT_SIZES = [[18, 'S'], [26, 'M'], [38, 'L'], [56, 'XL']];
  var FONT = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';

  // ---------- state ----------
  var $ = function (s) { return document.querySelector(s); };
  var root = $('#editor'), stage = $('#stage'), cv = $('#canvas'), ctx = cv.getContext('2d');
  var toolbar = $('#toolbar'), props = $('#props'), status = $('#status'), toast = $('#toast');

  var base, sampleName = '', items = [], sel = null, live = null, tool = 'select', prevTool = 'select';
  var undoStack = [], redoStack = [];
  var st = { color: PALETTE[0], size: 4, fill: false, font: 26, textBg: false, strength: 2 };
  var toolColors = { highlighter: PALETTE[2] };
  var drag = null, crop = null, editing = null, textarea = null, baseId = 0;

  // ---------- geometry helpers ----------
  function norm(it) { return { x: Math.min(it.x1, it.x2), y: Math.min(it.y1, it.y2), w: Math.abs(it.x2 - it.x1), h: Math.abs(it.y2 - it.y1) }; }
  function distSeg(p, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy;
    var t = l ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l)) : 0;
    return Math.hypot(a.x + t * dx - p.x, a.y + t * dy - p.y);
  }
  function inRect(p, r, pad) { pad = pad || 0; return p.x >= r.x - pad && p.x <= r.x + r.w + pad && p.y >= r.y - pad && p.y <= r.y + r.h + pad; }
  function contrast(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#141414' : '#ffffff';
  }
  function rrPath(c, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  var isBox = function (t) { return t === 'rect' || t === 'ellipse' || t === 'blur' || t === 'pixelate' || t === 'spot'; };
  var isLine = function (t) { return t === 'line' || t === 'arrow'; };

  // ---------- text layout ----------
  function textLayout(it) {
    ctx.save();
    ctx.font = '700 ' + it.size + 'px ' + FONT;
    var lines = (it.text || ' ').split('\n'), w = 0;
    lines.forEach(function (l) { w = Math.max(w, ctx.measureText(l || ' ').width); });
    ctx.restore();
    var lh = it.size * 1.25, pad = it.bg ? it.size * 0.35 : it.size * 0.1;
    return { lines: lines, lh: lh, pad: pad, w: w + pad * 2, h: lines.length * lh + pad * 2 };
  }
  function bounds(it) {
    switch (it.type) {
      case 'stroke':
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, w = it.hl ? it.size * 4 : it.size;
        it.pts.forEach(function (p) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        return { x: x0 - w / 2, y: y0 - w / 2, w: x1 - x0 + w, h: y1 - y0 + w };
      case 'text': var L = textLayout(it); return { x: it.x, y: it.y, w: L.w, h: L.h };
      case 'step': var r = stepR(it); return { x: it.x - r, y: it.y - r, w: r * 2, h: r * 2 };
      default: var b = norm(it), p = isLine(it.type) || it.type === 'rect' || it.type === 'ellipse' ? it.size : 0;
        return { x: b.x - p, y: b.y - p, w: b.w + p * 2, h: b.h + p * 2 };
    }
  }
  function stepR(it) { return 11 + it.size * 2.2; }

  // ---------- drawing ----------
  function drawItem(c, it) {
    c.save();
    c.lineCap = 'round'; c.lineJoin = 'round';
    switch (it.type) {
      case 'stroke': drawStroke(c, it); break;
      case 'line': c.strokeStyle = it.color; c.lineWidth = it.size; c.beginPath(); c.moveTo(it.x1, it.y1); c.lineTo(it.x2, it.y2); c.stroke(); break;
      case 'arrow': drawArrow(c, it); break;
      case 'rect':
        var r = norm(it);
        if (it.fill) { c.fillStyle = it.color; c.fillRect(r.x, r.y, r.w, r.h); }
        else { c.strokeStyle = it.color; c.lineWidth = it.size; c.strokeRect(r.x, r.y, r.w, r.h); }
        break;
      case 'ellipse':
        var e = norm(it);
        c.beginPath(); c.ellipse(e.x + e.w / 2, e.y + e.h / 2, Math.max(.5, e.w / 2), Math.max(.5, e.h / 2), 0, 0, Math.PI * 2);
        if (it.fill) { c.fillStyle = it.color; c.fill(); } else { c.strokeStyle = it.color; c.lineWidth = it.size; c.stroke(); }
        break;
      case 'blur': case 'pixelate': drawEffect(c, it); break;
      case 'text': drawText(c, it); break;
      case 'step': drawStep(c, it); break;
    }
    c.restore();
  }
  function drawStroke(c, it) {
    var p = it.pts;
    c.strokeStyle = it.color; c.fillStyle = it.color;
    c.lineWidth = it.hl ? it.size * 4 : it.size;
    if (it.hl) { c.globalAlpha = 0.42; c.lineCap = 'butt'; }
    if (p.length === 1) { c.beginPath(); c.arc(p[0].x, p[0].y, c.lineWidth / 2, 0, 7); c.fill(); return; }
    c.beginPath(); c.moveTo(p[0].x, p[0].y);
    for (var i = 1; i < p.length - 1; i++) c.quadraticCurveTo(p[i].x, p[i].y, (p[i].x + p[i + 1].x) / 2, (p[i].y + p[i + 1].y) / 2);
    c.lineTo(p[p.length - 1].x, p[p.length - 1].y);
    c.stroke();
  }
  function drawArrow(c, it) {
    var dx = it.x2 - it.x1, dy = it.y2 - it.y1, len = Math.hypot(dx, dy);
    if (len < 1) return;
    var ux = dx / len, uy = dy / len, head = Math.min(len * .6, Math.max(14, it.size * 4.2)), half = head * .5;
    var bx = it.x2 - ux * head, by = it.y2 - uy * head;
    c.strokeStyle = it.color; c.fillStyle = it.color; c.lineWidth = it.size;
    c.beginPath(); c.moveTo(it.x1, it.y1); c.lineTo(it.x2 - ux * head * .8, it.y2 - uy * head * .8); c.stroke();
    c.beginPath(); c.moveTo(it.x2, it.y2); c.lineTo(bx - uy * half, by + ux * half); c.lineTo(bx + uy * half, by - ux * half); c.closePath();
    c.lineWidth = Math.max(1, it.size * .4); c.fill(); c.stroke();
  }
  function drawEffect(c, it) {
    var r = norm(it);
    r = { x: Math.max(0, Math.round(r.x)), y: Math.max(0, Math.round(r.y)), w: Math.round(r.w), h: Math.round(r.h) };
    r.w = Math.min(r.w, base.width - r.x); r.h = Math.min(r.h, base.height - r.y);
    if (r.w < 1 || r.h < 1) return;
    var key = [r.x, r.y, r.w, r.h, it.strength, it.type, baseId].join(',');
    if (it._key !== key) {
      var f = it.type === 'blur' ? [0, 5, 10, 18][it.strength] : [0, 7, 12, 20][it.strength];
      var sw = Math.max(1, Math.ceil(r.w / f)), sh = Math.max(1, Math.ceil(r.h / f));
      var small = document.createElement('canvas'); small.width = sw; small.height = sh;
      var sc = small.getContext('2d'); sc.imageSmoothingQuality = 'high';
      sc.drawImage(base, r.x, r.y, r.w, r.h, 0, 0, sw, sh);
      var out = document.createElement('canvas'); out.width = r.w; out.height = r.h;
      var oc = out.getContext('2d');
      if (it.type === 'blur') { oc.imageSmoothingEnabled = true; oc.imageSmoothingQuality = 'high'; oc.drawImage(small, 0, 0, sw, sh, 0, 0, r.w, r.h); }
      else { oc.imageSmoothingEnabled = false; oc.drawImage(small, 0, 0, sw, sh, 0, 0, sw * f, sh * f); }
      it._cache = out; it._key = key;
    }
    c.drawImage(it._cache, r.x, r.y);
  }
  function drawText(c, it) {
    var L = textLayout(it);
    c.font = '700 ' + it.size + 'px ' + FONT;
    c.textBaseline = 'top';
    if (it.bg || it.tail) {
      if (it.tail) drawTail(c, it, L);
      rrPath(c, it.x, it.y, L.w, L.h, it.size * .25); c.fillStyle = it.color; c.fill();
      c.fillStyle = contrast(it.color);
      L.lines.forEach(function (l, i) { c.fillText(l, it.x + L.pad, it.y + L.pad + i * L.lh + it.size * .08); });
    } else {
      c.lineWidth = Math.max(2, it.size / 7); c.strokeStyle = contrast(it.color); c.globalAlpha = .85;
      L.lines.forEach(function (l, i) { c.strokeText(l, it.x + L.pad, it.y + L.pad + i * L.lh + it.size * .08); });
      c.globalAlpha = 1; c.fillStyle = it.color;
      L.lines.forEach(function (l, i) { c.fillText(l, it.x + L.pad, it.y + L.pad + i * L.lh + it.size * .08); });
    }
  }
  function drawTail(c, it, L) {
    var cx = it.x + L.w / 2, cy = it.y + L.h / 2, t = it.tail;
    if (inRect(t, { x: it.x, y: it.y, w: L.w, h: L.h })) return;
    var dx = t.x - cx, dy = t.y - cy, len = Math.hypot(dx, dy), hw = Math.min(L.w, L.h) * .24;
    var nx = -dy / len * hw, ny = dx / len * hw;
    c.beginPath(); c.moveTo(cx + nx, cy + ny); c.lineTo(cx - nx, cy - ny); c.lineTo(t.x, t.y); c.closePath();
    c.fillStyle = it.color; c.fill();
  }
  function drawStep(c, it) {
    var r = stepR(it);
    c.fillStyle = 'rgba(0,0,0,.24)'; c.beginPath(); c.arc(it.x + r * .08, it.y + r * .12, r, 0, 7); c.fill();
    c.fillStyle = it.color; c.beginPath(); c.arc(it.x, it.y, r, 0, 7); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = Math.max(1.5, r * .12); c.stroke();
    var s = String(it.n);
    c.fillStyle = contrast(it.color); c.font = '700 ' + Math.round(r * (s.length > 1 ? .95 : 1.15)) + 'px ' + FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, it.x, it.y + r * .06);
  }
  var spotCv = document.createElement('canvas');
  function drawSpots(c, spots) {
    if (!spots.length) return;
    spotCv.width = base.width; spotCv.height = base.height;
    var s = spotCv.getContext('2d');
    s.fillStyle = 'rgba(0,0,0,.58)'; s.fillRect(0, 0, base.width, base.height);
    s.globalCompositeOperation = 'destination-out';
    spots.forEach(function (it) { var r = norm(it); rrPath(s, r.x, r.y, r.w, r.h, Math.min(10, r.w / 4, r.h / 4)); s.fill(); });
    c.drawImage(spotCv, 0, 0);
  }

  function renderTo(c, clean) {
    c.clearRect(0, 0, base.width, base.height);
    c.drawImage(base, 0, 0);
    var all = items.concat(live ? [live] : []);
    all.forEach(function (it) { if (it.type !== 'spot' && it !== editing) drawItem(c, it); });
    drawSpots(c, all.filter(function (it) { return it.type === 'spot'; }));
    if (editing && editing.tail) { c.save(); drawTail(c, editing, textLayout(editing)); c.restore(); }
    if (clean) return;
    if (crop) drawCrop(c);
    if (sel && tool === 'select') drawSelection(c, sel);
  }
  function render() { renderTo(ctx, false); }

  function px() { return cv.width / cv.getBoundingClientRect().width; } // image px per screen px
  function drawSelection(c, it) {
    var b = bounds(it), k = px();
    c.save();
    c.strokeStyle = '#4f8cff'; c.lineWidth = 1.5 * k; c.setLineDash([5 * k, 4 * k]);
    c.strokeRect(b.x - 4 * k, b.y - 4 * k, b.w + 8 * k, b.h + 8 * k);
    c.setLineDash([]);
    handles(it).forEach(function (h) { drawHandle(c, h, k); });
    c.restore();
  }
  function drawHandle(c, h, k) {
    c.beginPath(); c.arc(h.x, h.y, 5.5 * k, 0, 7);
    c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2 * k; c.strokeStyle = '#4f8cff'; c.stroke();
  }
  function drawCrop(c) {
    var r = norm(crop), k = px();
    c.save();
    c.fillStyle = 'rgba(0,0,0,.6)';
    c.beginPath(); c.rect(0, 0, base.width, base.height); c.rect(r.x, r.y, r.w, r.h); c.fill('evenodd');
    c.strokeStyle = '#fff'; c.lineWidth = 1.5 * k; c.strokeRect(r.x, r.y, r.w, r.h);
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = k;
    for (var i = 1; i < 3; i++) {
      c.beginPath(); c.moveTo(r.x + r.w * i / 3, r.y); c.lineTo(r.x + r.w * i / 3, r.y + r.h);
      c.moveTo(r.x, r.y + r.h * i / 3); c.lineTo(r.x + r.w, r.y + r.h * i / 3); c.stroke();
    }
    [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]].forEach(function (p) { drawHandle(c, { x: p[0], y: p[1] }, k); });
    c.restore();
  }

  // ---------- handles & hit testing ----------
  function handles(it) {
    if (isBox(it.type)) return [{ x: it.x1, y: it.y1 }, { x: it.x2, y: it.y1 }, { x: it.x2, y: it.y2 }, { x: it.x1, y: it.y2 }];
    if (isLine(it.type)) return [{ x: it.x1, y: it.y1 }, { x: it.x2, y: it.y2 }];
    if (it.type === 'text' && it.tail) return [it.tail];
    return [];
  }
  function setHandle(it, i, p) {
    if (isLine(it.type)) { if (i === 0) { it.x1 = p.x; it.y1 = p.y; } else { it.x2 = p.x; it.y2 = p.y; } return; }
    if (it.type === 'text') { it.tail = { x: p.x, y: p.y }; return; }
    if (i === 0) { it.x1 = p.x; it.y1 = p.y; } else if (i === 1) { it.x2 = p.x; it.y1 = p.y; }
    else if (i === 2) { it.x2 = p.x; it.y2 = p.y; } else { it.x1 = p.x; it.y2 = p.y; }
  }
  function hitHandle(list, p) {
    var tol = 9 * px();
    for (var i = 0; i < list.length; i++) if (Math.hypot(list[i].x - p.x, list[i].y - p.y) <= tol) return i;
    return -1;
  }
  function hit(it, p, tol) {
    switch (it.type) {
      case 'stroke':
        var w = (it.hl ? it.size * 4 : it.size) / 2 + tol;
        if (it.pts.length === 1) return Math.hypot(it.pts[0].x - p.x, it.pts[0].y - p.y) <= w;
        for (var i = 1; i < it.pts.length; i++) if (distSeg(p, it.pts[i - 1], it.pts[i]) <= w) return true;
        return false;
      case 'line': case 'arrow':
        return distSeg(p, { x: it.x1, y: it.y1 }, { x: it.x2, y: it.y2 }) <= it.size / 2 + tol + (it.type === 'arrow' ? it.size : 0);
      case 'rect':
        var r = norm(it), lim = it.size / 2 + tol;
        if (!inRect(p, r, lim)) return false;
        return it.fill || !inRect(p, { x: r.x + lim, y: r.y + lim, w: r.w - lim * 2, h: r.h - lim * 2 });
      case 'ellipse':
        var e = norm(it), rx = e.w / 2, ry = e.h / 2, dx = p.x - e.x - rx, dy = p.y - e.y - ry;
        var d = Math.sqrt(dx * dx / (rx * rx || 1) + dy * dy / (ry * ry || 1));
        return it.fill ? d <= 1 + tol / Math.min(rx, ry) : Math.abs(d - 1) * Math.min(rx, ry) <= it.size / 2 + tol;
      case 'text':
        var b = bounds(it);
        if (inRect(p, b, tol)) return true;
        return !!it.tail && distSeg(p, { x: b.x + b.w / 2, y: b.y + b.h / 2 }, it.tail) <= tol + 4;
      default: return inRect(p, bounds(it), tol);
    }
  }
  function hitItem(p) {
    var tol = 7 * px();
    for (var i = items.length - 1; i >= 0; i--) if (hit(items[i], p, tol)) return items[i];
    return null;
  }
  function move(it, dx, dy) {
    if (it.pts) it.pts.forEach(function (q) { q.x += dx; q.y += dy; });
    if (it.x1 != null) { it.x1 += dx; it.x2 += dx; it.y1 += dy; it.y2 += dy; }
    if (it.type === 'text' || it.type === 'step') { it.x += dx; it.y += dy; }
    if (it.tail) { it.tail.x += dx; it.tail.y += dy; }
  }

  // ---------- undo ----------
  function clone(it) {
    var c = {};
    for (var k in it) if (k !== '_cache' && k !== '_key') c[k] = it[k];
    if (it.pts) c.pts = it.pts.map(function (p) { return { x: p.x, y: p.y }; });
    if (it.tail) c.tail = { x: it.tail.x, y: it.tail.y };
    return c;
  }
  function snapshot() { return { base: base, baseId: baseId, items: items.map(clone) }; }
  function pushUndo() { undoStack.push(snapshot()); if (undoStack.length > 100) undoStack.shift(); redoStack = []; }
  function restore(s) {
    var resized = s.base !== base;
    base = s.base; baseId = s.baseId; items = s.items; sel = null; crop = null;
    if (resized) { cv.width = base.width; cv.height = base.height; fit(); }
    changed();
  }
  function undo() { commitText(); if (!undoStack.length) return; redoStack.push(snapshot()); restore(undoStack.pop()); }
  function redo() { commitText(); if (!redoStack.length) return; undoStack.push(snapshot()); restore(redoStack.pop()); }
  function changed() { render(); buildActions(); buildProps(); buildStatus(); }

  // ---------- pointer input ----------
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
  function clampP(p) { return { x: Math.max(0, Math.min(base.width, p.x)), y: Math.max(0, Math.min(base.height, p.y)) }; }
  function constrain(a, b, angle) {
    var dx = b.x - a.x, dy = b.y - a.y;
    if (angle) {
      var ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * Math.PI / 4, l = Math.hypot(dx, dy);
      return { x: a.x + Math.cos(ang) * l, y: a.y + Math.sin(ang) * l };
    }
    var m = Math.max(Math.abs(dx), Math.abs(dy));
    return { x: a.x + Math.sign(dx) * m, y: a.y + Math.sign(dy) * m };
  }
  function nextStep() { var n = 0; items.forEach(function (it) { if (it.type === 'step') n = Math.max(n, it.n); }); return n + 1; }

  cv.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    // Keep the browser from moving focus to <body>, which would instantly blur a new text box.
    e.preventDefault();
    var wasEditing = !!editing;
    commitText();
    if (wasEditing && (tool === 'text' || tool === 'callout')) return;
    var p = pos(e);
    cv.setPointerCapture(e.pointerId);
    drag = { start: p, last: p, pending: true };

    switch (tool) {
      case 'select':
        if (sel) { var h = hitHandle(handles(sel), p); if (h >= 0) { drag.mode = 'handle'; drag.h = h; return; } }
        var it = hitItem(p);
        sel = it;
        if (it && e.detail === 2 && it.type === 'text') { beginText(it, false); drag = null; return; }
        drag.mode = it ? 'move' : null;
        changed();
        break;
      case 'crop':
        if (crop) {
          if (e.detail === 2) { applyCrop(); drag = null; return; }
          var r = norm(crop), corners = [{ x: r.x, y: r.y }, { x: r.x + r.w, y: r.y }, { x: r.x + r.w, y: r.y + r.h }, { x: r.x, y: r.y + r.h }];
          var ch = hitHandle(corners, p);
          if (ch >= 0) { var o = corners[(ch + 2) % 4]; crop = { x1: o.x, y1: o.y, x2: p.x, y2: p.y }; drag.mode = 'crop'; return; }
        }
        var cp = clampP(p); crop = { x1: cp.x, y1: cp.y, x2: cp.x, y2: cp.y }; drag.mode = 'crop';
        buildProps();
        break;
      case 'text':
        var t = hitItem(p);
        if (t && t.type === 'text') beginText(t, false);
        else beginText({ type: 'text', x: p.x, y: p.y - st.font * .7, text: '', color: st.color, size: st.font, bg: st.textBg }, true);
        drag = null;
        break;
      case 'callout':
        live = { type: 'text', text: 'Text', tail: { x: p.x, y: p.y }, x: p.x, y: p.y, color: st.color, size: st.font, bg: true };
        drag.mode = 'callout';
        break;
      case 'step':
        pushUndo(); items.push({ type: 'step', x: p.x, y: p.y, n: nextStep(), color: st.color, size: st.size }); changed(); drag = null;
        break;
      case 'eyedropper':
        renderTo(ctx, true);
        var d = ctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data;
        var hex = '#' + [d[0], d[1], d[2]].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
        setTool(prevTool); setColor(hex); showToast('Picked ' + hex.toUpperCase());
        drag = null;
        break;
      case 'eraser':
        drag.mode = 'erase'; erase(p);
        break;
      default:
        if (tool === 'pen' || tool === 'highlighter') live = { type: 'stroke', hl: tool === 'highlighter', pts: [p], color: st.color, size: st.size };
        else live = { type: tool, x1: p.x, y1: p.y, x2: p.x, y2: p.y, color: st.color, size: st.size, fill: st.fill && (tool === 'rect' || tool === 'ellipse'), strength: st.strength };
        drag.mode = 'draw';
    }
  });

  cv.addEventListener('pointermove', function (e) {
    var p = pos(e);
    buildStatus(p);
    if (!drag || !drag.mode) { updateCursor(p); return; }
    var dx = p.x - drag.last.x, dy = p.y - drag.last.y;
    switch (drag.mode) {
      case 'draw':
        if (live.type === 'stroke') {
          if (e.shiftKey) live.pts = [live.pts[0], constrain(live.pts[0], p, true)];
          else { var q = live.pts[live.pts.length - 1]; if (Math.hypot(p.x - q.x, p.y - q.y) >= 1.5 * px()) live.pts.push(p); }
        } else {
          var t = e.shiftKey ? constrain({ x: live.x1, y: live.y1 }, p, isLine(live.type)) : p;
          live.x2 = t.x; live.y2 = t.y;
        }
        break;
      case 'move':
        if (drag.pending) { pushUndo(); drag.pending = false; }
        move(sel, dx, dy);
        break;
      case 'handle':
        if (drag.pending) { pushUndo(); drag.pending = false; }
        var hp = p;
        if (e.shiftKey && isLine(sel.type)) hp = constrain(handles(sel)[1 - drag.h], p, true);
        setHandle(sel, drag.h, hp);
        break;
      case 'crop':
        var cp = clampP(e.shiftKey ? constrain({ x: crop.x1, y: crop.y1 }, p, false) : p);
        crop.x2 = cp.x; crop.y2 = cp.y;
        break;
      case 'callout':
        placeBubble(live, p);
        break;
      case 'erase': erase(p); break;
    }
    drag.last = p;
    render();
  });

  function endDrag(e) {
    if (!drag) return;
    var mode = drag.mode, d = drag;
    drag = null;
    if (mode === 'draw') {
      var ok = live.type === 'stroke' || Math.abs(live.x2 - live.x1) >= 3 || Math.abs(live.y2 - live.y1) >= 3;
      if (ok) { pushUndo(); items.push(live); }
      live = null; changed();
    } else if (mode === 'move' || mode === 'handle') {
      if (!d.pending) changed();
    } else if (mode === 'crop') {
      var r = norm(crop);
      if (r.w < 4 || r.h < 4) crop = null;
      changed();
    } else if (mode === 'callout') {
      var c = live; live = null;
      var p = pos(e);
      if (Math.hypot(p.x - c.tail.x, p.y - c.tail.y) < 8 * px()) p = { x: c.tail.x + c.size * 1.5, y: c.tail.y - c.size * 3 };
      c.text = '';
      placeBubble(c, p);
      beginText(c, true);
    }
  }
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('pointerleave', function () { if (!drag) buildStatus(); });

  function placeBubble(c, p) {
    var L = textLayout(c);
    var x = p.x < c.tail.x ? p.x - L.w : p.x;
    c.x = Math.max(0, Math.min(base.width - L.w, x));
    c.y = Math.max(0, Math.min(base.height - L.h, p.y - L.h / 2));
  }
  function erase(p) {
    var it = hitItem(p);
    if (!it) return;
    if (drag && drag.pending) { pushUndo(); drag.pending = false; } else if (!drag) pushUndo();
    items.splice(items.indexOf(it), 1);
    if (sel === it) sel = null;
    changed();
  }
  function updateCursor(p) {
    var c = 'crosshair';
    if (tool === 'select') c = (sel && hitHandle(handles(sel), p) >= 0) || hitItem(p) ? 'move' : 'default';
    else if (tool === 'text') c = (function (h) { return h && h.type === 'text' ? 'pointer' : 'text'; })(hitItem(p));
    else if (tool === 'eraser') c = hitItem(p) ? 'pointer' : 'crosshair';
    cv.style.cursor = c;
  }

  // ---------- inline text editing ----------
  function beginText(it, isNew) {
    commitText();
    sel = null; editing = it;
    textarea = document.createElement('textarea');
    textarea.className = 'ed-text';
    textarea.value = it.text || '';
    textarea.spellcheck = false;
    textarea._isNew = isNew;
    stage.appendChild(textarea);
    positionText();
    textarea.addEventListener('input', function () { positionText(); render(); });
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); commitText(); }
      e.stopPropagation();
    });
    textarea.addEventListener('blur', function () { setTimeout(commitText, 0); });
    render();
    textarea.focus();
    buildProps();
  }
  function positionText() {
    if (!textarea) return;
    var it = editing, k = 1 / px();
    var cr = cv.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    var L = textLayout({ text: textarea.value || ' ', size: it.size, bg: it.bg || !!it.tail });
    var s = textarea.style;
    s.left = (cr.left - sr.left + stage.scrollLeft + (it.x + L.pad) * k) + 'px';
    s.top = (cr.top - sr.top + stage.scrollTop + (it.y + L.pad) * k) + 'px';
    s.font = '700 ' + it.size * k + 'px ' + FONT;
    s.lineHeight = (L.lh * k) + 'px';
    s.width = (Math.max(L.w - L.pad * 2, it.size) * k + 24) + 'px';
    s.height = (L.lines.length * L.lh * k + 6) + 'px';
    var bg = it.bg || it.tail;
    s.color = bg ? contrast(it.color) : it.color;
    s.background = bg ? it.color : (contrast(it.color) === '#ffffff' ? 'rgba(250,250,250,.92)' : 'rgba(28,28,32,.92)');
  }
  function commitText() {
    if (!textarea) return;
    var ta = textarea, it = editing, text = ta.value.replace(/\s+$/, '');
    textarea = null; editing = null;
    ta.remove();
    if (!text) {
      if (!ta._isNew) { pushUndo(); items.splice(items.indexOf(it), 1); }
      it = null;
    } else if (ta._isNew) { pushUndo(); it.text = text; items.push(it); }
    else if (it.text !== text) { pushUndo(); it.text = text; }
    sel = it;
    changed();
  }

  // ---------- commands ----------
  function applyCrop() {
    if (!crop) return;
    var r = norm(crop); crop = null;
    r = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) };
    if (r.w < 4 || r.h < 4) { changed(); return; }
    pushUndo();
    var nb = document.createElement('canvas'); nb.width = r.w; nb.height = r.h;
    nb.getContext('2d').drawImage(base, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    items.forEach(function (it) { move(it, -r.x, -r.y); });
    setBase(nb);
    sel = null; changed();
  }
  function applyFrame() {
    commitText();
    pushUndo();
    var flat = exportCanvas();
    var pad = Math.round(Math.max(32, Math.min(96, Math.min(flat.width, flat.height) * .08)));
    var rad = Math.max(6, Math.min(16, Math.min(flat.width, flat.height) * .03));
    var nb = document.createElement('canvas'); nb.width = flat.width + pad * 2; nb.height = flat.height + pad * 2;
    var c = nb.getContext('2d');
    var g = c.createLinearGradient(0, 0, nb.width, nb.height);
    g.addColorStop(0, '#5b8cff'); g.addColorStop(1, '#a064f6');
    c.fillStyle = g; c.fillRect(0, 0, nb.width, nb.height);
    c.save(); c.shadowColor = 'rgba(10,10,40,.45)'; c.shadowBlur = pad * .6; c.shadowOffsetY = pad * .2;
    rrPath(c, pad, pad, flat.width, flat.height, rad); c.fillStyle = '#000'; c.fill(); c.restore();
    c.save(); rrPath(c, pad, pad, flat.width, flat.height, rad); c.clip(); c.drawImage(flat, pad, pad); c.restore();
    items = []; sel = null;
    setBase(nb);
    changed();
    showToast('Frame added — press Ctrl+Z to undo');
  }
  function exportCanvas() {
    var out = document.createElement('canvas'); out.width = base.width; out.height = base.height;
    renderTo(out.getContext('2d'), true);
    return out;
  }
  function download() {
    commitText();
    var a = document.createElement('a');
    a.download = 'snipp-' + sampleName.toLowerCase().replace(/\s+/g, '-') + '.png';
    a.href = exportCanvas().toDataURL('image/png');
    a.click();
  }
  function copyImage() {
    commitText();
    if (!navigator.clipboard || !window.ClipboardItem) { showToast('Copying images isn\'t supported in this browser — use Download'); return; }
    exportCanvas().toBlob(function (blob) {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .then(function () { showToast('Copied to clipboard'); })
        .catch(function () { showToast('Your browser blocked clipboard access — use Download'); });
    });
  }
  function deleteSelected() {
    if (!sel) return;
    pushUndo(); items.splice(items.indexOf(sel), 1); sel = null; changed();
  }
  function clearAll() {
    commitText();
    if (!items.length) return;
    pushUndo(); items = []; sel = null; changed();
  }
  function setBase(c) {
    base = c; baseId++;
    cv.width = base.width; cv.height = base.height;
    fit();
  }
  function newImage() {
    commitText();
    var s = SnippSamples.generate();
    sampleName = s.name;
    items = []; sel = null; crop = null; undoStack = []; redoStack = [];
    setBase(s.canvas);
    changed();
  }
  function fit() {
    var sw = stage.clientWidth - 40, sh = stage.clientHeight - 40;
    var k = Math.min(1, sw / base.width, sh / base.height);
    cv.style.width = Math.floor(base.width * k) + 'px';
    cv.style.height = Math.floor(base.height * k) + 'px';
    positionText();
    render();
  }

  // ---------- tool & property changes ----------
  function setTool(t) {
    commitText();
    if (t === 'eyedropper' && tool !== 'eyedropper') prevTool = tool;
    tool = t;
    if (t !== 'crop') crop = null;
    if (t !== 'select') sel = null;
    st.color = toolColors[t] || toolColors._default || PALETTE[0];
    cv.style.cursor = t === 'select' ? 'default' : t === 'text' ? 'text' : 'crosshair';
    changed();
  }
  function target() { return editing || sel; }
  function modify(fn) {
    var t = target();
    if (!t) return;
    if (editing) { fn(editing); positionText(); render(); return; }
    pushUndo(); fn(t); changed();
  }
  function setColor(c) {
    st.color = c; toolColors[tool] = c; if (tool !== 'highlighter') toolColors._default = c;
    modify(function (t) { t.color = c; }); buildProps();
  }
  function setSize(v) { st.size = v; modify(function (t) { if (t.type !== 'text') t.size = v; }); buildProps(); }
  function setFill(v) { st.fill = v; modify(function (t) { if (t.type === 'rect' || t.type === 'ellipse') t.fill = v; }); buildProps(); }
  function setFont(v) { st.font = v; modify(function (t) { if (t.type === 'text') t.size = v; }); buildProps(); }
  function setTextBg(v) { st.textBg = v; modify(function (t) { if (t.type === 'text' && !t.tail) t.bg = v; }); buildProps(); }
  function setStrength(v) { st.strength = v; modify(function (t) { if (t.type === 'blur' || t.type === 'pixelate') t.strength = v; }); buildProps(); }

  // ---------- UI building ----------
  function btn(opts) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ed-btn' + (opts.on ? ' on' : '') + (opts.cls ? ' ' + opts.cls : '');
    if (opts.icon) b.innerHTML = icon(opts.icon);
    if (opts.text) b.insertAdjacentHTML('beforeend', '<span>' + opts.text + '</span>');
    if (opts.tip) { b.title = opts.tip; b.setAttribute('aria-label', opts.tip); }
    if (opts.disabled) b.disabled = true;
    b.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep focus in the text box
    b.addEventListener('click', opts.click);
    return b;
  }
  function sep() { var s = document.createElement('span'); s.className = 'ed-sep'; return s; }
  function label(t) { var s = document.createElement('span'); s.className = 'ed-label'; s.textContent = t; return s; }
  function group(cls) { var d = document.createElement('div'); d.className = cls; return d; }

  function buildToolbar() {
    var left = group('ed-group');
    TOOLS.forEach(function (t) {
      if (!t) { left.appendChild(sep()); return; }
      left.appendChild(btn({ icon: t.id, tip: t.name + ' (' + t.key.toUpperCase() + ')', on: tool === t.id, click: function () { setTool(t.id); } }));
    });
    var right = group('ed-group ed-actions');
    right.id = 'actions';
    toolbar.innerHTML = '';
    toolbar.appendChild(left); toolbar.appendChild(right);
  }
  function buildActions() {
    // tool highlight
    var btns = toolbar.querySelectorAll('.ed-group:first-child .ed-btn'), i = 0;
    TOOLS.forEach(function (t) { if (t) { btns[i].classList.toggle('on', tool === t.id); i++; } });
    var a = $('#actions');
    a.innerHTML = '';
    a.appendChild(btn({ icon: 'undo', tip: 'Undo (Ctrl+Z)', disabled: !undoStack.length, click: undo }));
    a.appendChild(btn({ icon: 'redo', tip: 'Redo (Ctrl+Y)', disabled: !redoStack.length, click: redo }));
    a.appendChild(sep());
    a.appendChild(btn({ icon: 'frame', tip: 'Add frame & shadow (Ctrl+F)', click: applyFrame }));
    a.appendChild(btn({ icon: 'copy', tip: 'Copy image (Ctrl+C)', click: copyImage }));
    a.appendChild(btn({ icon: 'download', tip: 'Download PNG (Ctrl+S)', click: download }));
    a.appendChild(sep());
    a.appendChild(btn({ icon: 'shuffle', text: 'New image', tip: 'Random sample image (Ctrl+N)', cls: 'accent', click: newImage }));
  }
  function buildProps() {
    props.innerHTML = '';
    var t = target();
    var add = function (el) { props.appendChild(el); };
    function colors(cur) {
      add(label('Color'));
      var matched = false;
      PALETTE.forEach(function (c) {
        var on = c.toLowerCase() === (cur || '').toLowerCase(); matched = matched || on;
        var b = btn({ tip: c, on: on, cls: 'ed-swatch', click: function () { setColor(c); } });
        b.style.setProperty('--c', c); add(b);
      });
      var custom = document.createElement('label');
      custom.className = 'ed-btn ed-swatch ed-custom' + (matched ? '' : ' on');
      custom.title = 'Custom color';
      if (!matched) custom.style.setProperty('--c', cur);
      var input = document.createElement('input'); input.type = 'color'; input.value = cur && cur.length === 7 ? cur : '#ff3b30';
      input.addEventListener('input', function () { setColor(input.value); });
      custom.appendChild(input); add(custom);
      add(sep());
    }
    function sizes(cur) {
      add(label('Size'));
      SIZES.forEach(function (v, i) {
        var b = btn({ tip: v + ' px', on: cur === v, cls: 'ed-size', click: function () { setSize(v); } });
        b.innerHTML = '<i style="width:' + (5 + i * 3.5) + 'px;height:' + (5 + i * 3.5) + 'px"></i>'; add(b);
      });
    }
    function fonts(cur) {
      add(label('Size'));
      FONT_SIZES.forEach(function (f) { add(btn({ text: f[1], tip: f[0] + ' px', on: cur === f[0], click: function () { setFont(f[0]); } })); });
    }
    function strength(cur) {
      add(label('Strength'));
      ['Low', 'Medium', 'High'].forEach(function (n, i) { add(btn({ text: n, on: cur === i + 1, click: function () { setStrength(i + 1); } })); });
    }
    function hint(s) { var l = label(s); l.className = 'ed-label ed-hint'; add(l); }

    if (tool === 'crop') {
      if (crop) {
        add(btn({ text: 'Apply crop', tip: 'Enter', cls: 'accent', click: applyCrop }));
        add(btn({ text: 'Cancel', tip: 'Esc', click: function () { crop = null; changed(); } }));
        add(sep());
      }
      hint('Drag to choose the area to keep. Shift = square. Double-click or Enter to apply.');
    } else if (t) {
      if (t.type === 'spot') hint('Spotlight — drag the corners to resize.');
      else if (t.type === 'blur' || t.type === 'pixelate') {
        add(btn({ icon: 'blur', text: 'Blur', on: t.type === 'blur', click: function () { modify(function (x) { x.type = 'blur'; }); } }));
        add(btn({ icon: 'pixelate', text: 'Pixelate', on: t.type === 'pixelate', click: function () { modify(function (x) { x.type = 'pixelate'; }); } }));
        add(sep()); strength(t.strength);
      } else if (t.type === 'text') {
        colors(t.color); fonts(t.size);
        if (!t.tail) { add(sep()); add(btn({ icon: 'fill', text: 'Background', on: t.bg, click: function () { setTextBg(!t.bg); } })); }
      } else {
        colors(t.color); sizes(t.size);
        if (t.type === 'rect' || t.type === 'ellipse') { add(sep()); add(btn({ icon: 'fill', text: 'Fill', on: t.fill, click: function () { setFill(!t.fill); } })); }
      }
      if (!editing) {
        var del = btn({ icon: 'trash', tip: 'Delete (Del)', cls: 'push', click: deleteSelected });
        add(del);
      }
    } else {
      switch (tool) {
        case 'select': hint('Click an annotation to select it. Drag to move, drag handles to resize, Del to delete, double-click text to edit.'); break;
        case 'eraser': hint('Click or drag over annotations to erase them.'); break;
        case 'eyedropper': hint('Click anywhere on the image to use its color.'); break;
        case 'spot': hint('Drag over what matters — everything else is dimmed. Add several to highlight more areas.'); break;
        case 'blur': case 'pixelate': strength(st.strength); add(sep()); hint('Drag over sensitive information to hide it.'); break;
        case 'text': colors(st.color); fonts(st.font); add(sep()); add(btn({ icon: 'fill', text: 'Background', on: st.textBg, click: function () { setTextBg(!st.textBg); } })); break;
        case 'callout': colors(st.color); fonts(st.font); add(sep()); hint('Press on what to point at, drag to place the bubble, then type.'); break;
        case 'rect': case 'ellipse': colors(st.color); sizes(st.size); add(sep()); add(btn({ icon: 'fill', text: 'Fill', on: st.fill, click: function () { setFill(!st.fill); } })); break;
        default: colors(st.color); sizes(st.size); if (tool !== 'step') { add(sep()); hint('Hold Shift for straight lines.'); }
      }
    }
    if (items.length && !t && tool === 'select') add(btn({ icon: 'trash', text: 'Clear all', cls: 'push', click: clearAll }));
  }
  function buildStatus(p) {
    var parts = ['<b>' + sampleName + '</b>', base.width + ' × ' + base.height + ' px', items.length + ' annotation' + (items.length === 1 ? '' : 's')];
    if (p && p.x >= 0 && p.y >= 0 && p.x < base.width && p.y < base.height) parts.push(Math.floor(p.x) + ', ' + Math.floor(p.y));
    status.innerHTML = parts.join('<span class="ed-dot">·</span>');
  }
  var toastTimer;
  function showToast(msg) {
    toast.textContent = '✓ ' + msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }

  // ---------- keyboard ----------
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    if (!root.contains(document.activeElement) && document.activeElement !== document.body) return;
    var k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod) {
      if (k === 'z' && !e.shiftKey) { undo(); e.preventDefault(); }
      else if (k === 'y' || (k === 'z' && e.shiftKey)) { redo(); e.preventDefault(); }
      else if (k === 'c' && !String(window.getSelection())) { copyImage(); e.preventDefault(); }
      else if (k === 's') { download(); e.preventDefault(); }
      else if (k === 'f') { applyFrame(); e.preventDefault(); }
      else if (k === 'n') { newImage(); e.preventDefault(); }
      return;
    }
    if (e.altKey) return;
    if (k === 'delete' || k === 'backspace') { if (sel) { deleteSelected(); e.preventDefault(); } return; }
    if (k === 'escape') { if (crop) { crop = null; changed(); } else if (sel) { sel = null; changed(); } else if (tool !== 'select') setTool('select'); return; }
    if (k === 'enter' && crop) { applyCrop(); e.preventDefault(); return; }
    if (sel && k.indexOf('arrow') === 0) {
      var n = e.shiftKey ? 10 : 1;
      pushUndo();
      move(sel, k === 'arrowleft' ? -n : k === 'arrowright' ? n : 0, k === 'arrowup' ? -n : k === 'arrowdown' ? n : 0);
      changed(); e.preventDefault(); return;
    }
    for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i] && TOOLS[i].key === k) { setTool(TOOLS[i].id); e.preventDefault(); return; }
  });

  window.addEventListener('resize', function () { if (base) fit(); });
  if (window.ResizeObserver) new ResizeObserver(function () { if (base) fit(); }).observe(stage);

  // ---------- start ----------
  buildToolbar();
  newImage();
  window.SnippDemo = { newImage: newImage, items: function () { return items; }, setTool: setTool, tool: function () { return tool; } }; // handy for debugging
})();
