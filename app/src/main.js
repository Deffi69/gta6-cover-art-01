// Sunset Coast Cover Studio — page wiring: uploads, panel editing, grades,
// lettering controls and PNG export. Photos never leave the machine: files are
// read with object URLs and drawn straight onto the canvas.
import { drawCover, layoutPanels, LAYOUTS, GRADES } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const statusEl = $('status');

const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350' },
  wide: { w: 1920, h: 1080, label: '1920 x 1080' },
};

const state = {
  layout: 'hero3',
  grade: 'sunset',
  photos: Array.from({ length: 9 }, () => ({ img: null, zoom: 1, ox: 0, oy: 0 })),
  title: 'Sunset Coast',
  subtitle: 'coast city nights',
  tagline: 'Sunset Coast • Est. 2026',
  titleSize: 1,
  frame: true,
  grain: true,
  previewSize: 'square',
};
let activePanel = 0;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  drawCover(canvas, state);
}

function fitPreview() {
  const size = SIZES[state.previewSize];
  const scale = 900 / Math.max(size.w, size.h);
  canvas.width = Math.round(size.w * scale);
  canvas.height = Math.round(size.h * scale);
  redraw();
}

/** Sizes the canvas to the exact export pixels and draws once (shot scenes). */
function drawFull(key) {
  const size = SIZES[key];
  canvas.width = size.w;
  canvas.height = size.h;
  redraw();
}

/** The panel rectangles of the current layout, in preview-canvas pixels. */
function panelRects() {
  return layoutPanels(state.layout, canvas.width, canvas.height);
}

function panelCount() {
  return { hero3: 4, four: 4, trio: 3, bleed: 1, nine: 9 }[state.layout];
}

/** Rebuilds the panel-slot cards for the current layout. */
function buildSlots() {
  const wrap = $('slots');
  wrap.innerHTML = '';
  const n = panelCount();
  if (activePanel >= n) activePanel = 0;
  for (let i = 0; i < n; i++) {
    const card = document.createElement('div');
    card.className = 'slot' + (i === activePanel ? ' active' : '');
    card.innerHTML = `
      <button type="button" class="slot-pick" data-i="${i}">Panel ${i + 1}${state.photos[i].img ? ' ✓' : ''}</button>
      <label class="slot-file">Upload photo
        <input type="file" accept="image/*" data-i="${i}" hidden>
      </label>
      <span class="slot-samples">Sample:
        <button type="button" data-sample="portrait" data-i="${i}">Person</button>
        <button type="button" data-sample="boulevard" data-i="${i}">Street</button>
        <button type="button" data-sample="pier" data-i="${i}">Pier</button>
      </span>`;
    wrap.appendChild(card);
  }
  wrap.querySelectorAll('.slot-pick').forEach((b) =>
    b.addEventListener('click', () => { activePanel = Number(b.dataset.i); buildSlots(); syncSliders(); }));
  wrap.querySelectorAll('input[type=file]').forEach((inp) =>
    inp.addEventListener('change', async () => {
      const file = inp.files[0];
      if (!file) return;
      const i = Number(inp.dataset.i);
      state.photos[i] = { img: await loadImage(URL.createObjectURL(file)), zoom: 1, ox: 0, oy: 0 };
      activePanel = i;
      buildSlots(); syncSliders(); redraw();
      statusEl.textContent = `Photo loaded into Panel ${i + 1}.`;
    }));
  wrap.querySelectorAll('[data-sample]').forEach((b) =>
    b.addEventListener('click', async () => {
      const i = Number(b.dataset.i);
      state.photos[i] = { img: await loadImage(`samples/${b.dataset.sample}.jpg`), zoom: 1, ox: 0, oy: 0 };
      activePanel = i;
      buildSlots(); syncSliders(); redraw();
      statusEl.textContent = `Sample photo loaded into Panel ${i + 1}.`;
    }));
}

function syncSliders() {
  const p = state.photos[activePanel];
  $('zoom').value = p.zoom;
  $('panx').value = p.ox;
  $('pany').value = p.oy;
  $('zoom-val').textContent = `${Math.round(p.zoom * 100)}%`;
}

function buildPickers() {
  const lw = $('layouts');
  lw.innerHTML = '';
  Object.entries(LAYOUTS).forEach(([key, l]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l.name;
    b.className = key === state.layout ? 'on' : '';
    b.addEventListener('click', () => {
      state.layout = key;
      buildSlots(); buildPickers(); redraw();
    });
    lw.appendChild(b);
  });
  const gw = $('grades');
  gw.innerHTML = '';
  Object.entries(GRADES).forEach(([key, g]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = g.name;
    b.className = key === state.grade ? 'on' : '';
    b.style.background = `linear-gradient(135deg, ${g.top}, ${g.mid}, ${g.bottom})`;
    b.addEventListener('click', () => {
      state.grade = key;
      buildPickers(); redraw();
    });
    gw.appendChild(b);
  });
}

function exportPNG(key) {
  const size = SIZES[key];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) { statusEl.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sunset-coast-cover-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved sunset-coast-cover-${size.w}x${size.h}.png (${(blob.size / 1024).toFixed(0)} KB)`;
  }, 'image/png');
}

// --- Controls -------------------------------------------------------------
$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
$('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
$('title-size').addEventListener('input', (e) => {
  state.titleSize = Number(e.target.value);
  $('title-size-val').textContent = `${Math.round(state.titleSize * 100)}%`;
  redraw();
});
$('frame').addEventListener('change', (e) => { state.frame = e.target.checked; redraw(); });
$('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
$('preview-size').addEventListener('change', (e) => { state.previewSize = e.target.value; fitPreview(); });
$('zoom').addEventListener('input', (e) => { state.photos[activePanel].zoom = Number(e.target.value); syncSliders(); redraw(); });
$('panx').addEventListener('input', (e) => { state.photos[activePanel].ox = Number(e.target.value); redraw(); });
$('pany').addEventListener('input', (e) => { state.photos[activePanel].oy = Number(e.target.value); redraw(); });
$('reset-panel').addEventListener('click', () => {
  state.photos[activePanel] = { img: state.photos[activePanel].img, zoom: 1, ox: 0, oy: 0 };
  syncSliders(); redraw();
});
Object.keys(SIZES).forEach((key) => {
  $(`export-${key}`).addEventListener('click', () => exportPNG(key));
});
$('export-all').addEventListener('click', () => {
  Object.keys(SIZES).forEach((key, i) => setTimeout(() => exportPNG(key), i * 350));
  statusEl.textContent = 'Exporting all three sizes…';
});

// Drag on the preview to pan the active panel; click a panel to select it.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width);
  const y = (e.clientY - r.top) * (canvas.height / r.height);
  const hit = panelRects().findIndex((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
  if (hit >= 0) { activePanel = hit; buildSlots(); syncSliders(); }
  drag = { x, y, ox: state.photos[activePanel].ox, oy: state.photos[activePanel].oy };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width);
  const y = (e.clientY - r.top) * (canvas.height / r.height);
  const rect = panelRects()[activePanel];
  const p = state.photos[activePanel];
  p.ox = drag.ox + (x - drag.x) / rect.w;
  p.oy = drag.oy + (y - drag.y) / rect.h;
  syncSliders();
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });

// --- Boot -----------------------------------------------------------------
buildPickers();
buildSlots();
syncSliders();
fitPreview();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    state,
    loadImage,
    redraw: fitPreview,
    setLayout: (layout) => { state.layout = layout; buildSlots(); buildPickers(); },
    setGrade: (grade) => { state.grade = grade; buildPickers(); },
    setPreviewSize: (key) => { state.previewSize = key; },
    drawFull,
  });
} else {
  // Fonts first, so the first paint already uses Anton + Pacifico.
  Promise.all([
    document.fonts.load('100px Anton'),
    document.fonts.load('40px Pacifico'),
  ]).catch(() => {}).finally(() => redraw());
}
