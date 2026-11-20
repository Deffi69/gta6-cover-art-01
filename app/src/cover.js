// Sunset Coast Cover Studio — the cover renderer.
//
// Draws a multi-panel poster-style cover on any 2D canvas: the photos fill
// poster panels (white gutters, thin inked frames), a neon-sunset grade washes
// over them, and the caption is lettered in big Anton capitals with a sunset
// gradient fill, a white keyline and a hard drop shadow, plus a Pacifico
// script subtitle. Everything here is drawn by hand on canvas — no image
// assets, no Rockstar logo, artwork or fonts anywhere in the app.

export const LAYOUTS = {
  hero3: { name: 'Hero + 3', panels: 4 },
  four: { name: 'Four Square', panels: 4 },
  trio: { name: 'Trio', panels: 3 },
  bleed: { name: 'Full Bleed', panels: 1 },
  nine: { name: 'Nine Grid', panels: 9 },
};

export const GRADES = {
  sunset: { name: 'Sunset', top: '#ff9a3d', mid: '#ff2975', bottom: '#7b1fa2' },
  neon: { name: 'Neon Night', top: '#00e5ff', mid: '#ff2fb3', bottom: '#2b0a4d' },
  golden: { name: 'Golden Hour', top: '#ffd319', mid: '#ff7b00', bottom: '#7a2e00' },
  teal: { name: 'Teal Dusk', top: '#2de2c5', mid: '#1b6fd0', bottom: '#0b1035' },
  noir: { name: 'Noir', top: '#e8e8e8', mid: '#8a8a8a', bottom: '#111111' },
};

/** Panel rectangles for a layout, in fractions of the cover (x, y, w, h). */
export function layoutPanels(layout, w, h) {
  const gap = 0.012; // gutter, as a fraction of the short side
  const g = Math.min(w, h) * gap;
  const rects = [];
  const push = (x, y, ww, hh) => rects.push({ x, y, w: ww, h: hh });
  if (layout === 'hero3') {
    const heroH = h * 0.6 - g / 2;
    const rowH = h - heroH - g;
    const cellW = (w - 2 * g) / 3;
    push(0, 0, w, heroH);
    for (let i = 0; i < 3; i++) push(i * (cellW + g), heroH + g, cellW, rowH);
  } else if (layout === 'four') {
    const cw = (w - g) / 2;
    const ch = (h - g) / 2;
    push(0, 0, cw, ch); push(cw + g, 0, cw, ch);
    push(0, ch + g, cw, ch); push(cw + g, ch + g, cw, ch);
  } else if (layout === 'trio') {
    const cw = (w - 2 * g) / 3;
    for (let i = 0; i < 3; i++) push(i * (cw + g), 0, cw, h);
  } else if (layout === 'nine') {
    const cw = (w - 2 * g) / 3;
    const ch = (h - 2 * g) / 3;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) push(c * (cw + g), r * (ch + g), cw, ch);
  } else {
    push(0, 0, w, h); // bleed
  }
  return rects;
}

/** Draws one photo into a panel rect, cover-fit, with zoom and pan offsets. */
function drawPanelPhoto(ctx, img, rect, zoom, ox, oy) {
  if (!img) return false;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const pw = iw * base;
  const ph = ih * base;
  const cx = rect.x + rect.w / 2 + ox * rect.w;
  const cy = rect.y + rect.h / 2 + oy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.restore();
  return true;
}

/** A tiny deterministic PRNG so the grain looks the same on every export. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draws the whole cover.
 * `state`: { layout, grade, photos: [{img, zoom, ox, oy}...], title, subtitle,
 *            tagline, titleSize (0.5..1.5), frame (bool), grain (bool) }
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const s = Math.min(w, h);

  // Deep dusk backdrop behind the panels.
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1a0b2e');
  bg.addColorStop(0.55, '#3d1157');
  bg.addColorStop(1, '#12041f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const rects = layoutPanels(state.layout, w, h);
  const photos = state.photos ?? [];
  const emptyFill = ['#ff9a3d', '#ff2975', '#00e5ff', '#ffd319', '#7b1fa2', '#2de2c5', '#ff7b00', '#1b6fd0', '#e8e8e8'];

  rects.forEach((rect, i) => {
    const p = photos[i];
    const filled = p && p.img ? drawPanelPhoto(ctx, p.img, rect, p.zoom ?? 1, p.ox ?? 0, p.oy ?? 0) : false;
    if (!filled) {
      // Empty panel: a warm gradient placeholder with a sun disc, drawn by hand.
      const g2 = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      g2.addColorStop(0, emptyFill[(i * 2) % emptyFill.length]);
      g2.addColorStop(1, emptyFill[(i * 2 + 3) % emptyFill.length]);
      ctx.fillStyle = g2;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(rect.x + rect.w * 0.72, rect.y + rect.h * 0.3, Math.min(rect.w, rect.h) * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = `bold ${Math.max(12, s * 0.028)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 6;
      ctx.fillText(`PANEL ${i + 1}`, rect.x + rect.w / 2, rect.y + rect.h * 0.82);
      ctx.shadowBlur = 0;
    }
    // Sunset grade wash over the photo, stronger toward the bottom.
    const wash = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    wash.addColorStop(0, 'rgba(255,154,61,0.06)');
    wash.addColorStop(0.55, 'rgba(255,41,117,0.10)');
    wash.addColorStop(1, 'rgba(123,31,162,0.28)');
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grade.mid + '22';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    // Thin inked frame around the panel, poster style.
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(2, s * 0.004);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  // Lettering band: a dusk gradient rising from the foot so the title reads.
  const bandH = h * 0.34;
  const band = ctx.createLinearGradient(0, h - bandH, 0, h);
  band.addColorStop(0, 'rgba(18,4,31,0)');
  band.addColorStop(0.55, 'rgba(18,4,31,0.55)');
  band.addColorStop(1, 'rgba(18,4,31,0.88)');
  ctx.fillStyle = band;
  ctx.fillRect(0, h - bandH, w, bandH);

  const title = (state.title ?? '').trim().toUpperCase();
  const subtitle = (state.subtitle ?? '').trim();
  const tagline = (state.tagline ?? '').trim().toUpperCase();

  if (title) {
    const maxW = w * 0.9;
    let size = h * 0.115 * (state.titleSize ?? 1);
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    while (ctx.measureText(title).width > maxW && size > 14) {
      size -= 2;
      ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    }
    const tx = w / 2;
    const ty = h - h * 0.085 - (subtitle ? size * 0.42 : 0);
    // Sunset gradient fill.
    const fill = ctx.createLinearGradient(0, ty - size, 0, ty + size * 0.2);
    fill.addColorStop(0, grade.top);
    fill.addColorStop(0.55, grade.mid);
    fill.addColorStop(1, grade.bottom);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = size * 0.16;
    ctx.shadowOffsetY = size * 0.06;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.strokeText(title, tx, ty);
    ctx.fillStyle = fill;
    ctx.fillText(title, tx, ty);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    if (subtitle) {
      const subSize = size * 0.42;
      ctx.font = `${subSize}px Pacifico, cursive`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = subSize * 0.2;
      ctx.fillText(subtitle, tx, ty + subSize * 1.15);
      ctx.shadowBlur = 0;
    }
  }

  if (tagline) {
    ctx.font = `600 ${Math.max(11, s * 0.022)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    // Letterspaced tagline, drawn letter by letter.
    const spaced = tagline.split('').join('  ');
    ctx.fillText(spaced, w / 2, h - h * 0.032);
  }

  // Halftone sun badge, top-right: a small hand-drawn mark of the studio.
  const bx = w - s * 0.085;
  const by = s * 0.075;
  const br = s * 0.052;
  ctx.save();
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.clip();
  const sun = ctx.createLinearGradient(bx, by - br, bx, by + br);
  sun.addColorStop(0, grade.top);
  sun.addColorStop(1, grade.mid);
  ctx.fillStyle = sun;
  ctx.fillRect(bx - br, by - br, br * 2, br * 2);
  ctx.fillStyle = 'rgba(18,4,31,0.35)';
  for (let i = 0; i < 3; i++) ctx.fillRect(bx - br, by - br * 0.1 + i * br * 0.32, br * 2, br * 0.1);
  ctx.restore();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, s * 0.003);
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.stroke();

  if (state.grain) {
    const rnd = mulberry32(20261120);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    const n = Math.floor((w * h) / 9000);
    for (let i = 0; i < n; i++) ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let i = 0; i < n; i++) ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
  }

  // Vignette: darkened corners, poster-print feel.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,0,20,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  if (state.frame) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(6, s * 0.018);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
  }
}
