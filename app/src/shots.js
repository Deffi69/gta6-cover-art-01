// Fixed scenes for screenshots: ?shot=editor shows the studio with photos
// loaded; ?shot=cover shows the cover alone, drawn at the export size named
// by `size` (square | portrait | wide). window.__shotReady is set once painted.
export async function runShot(shot, query, api) {
  const caption = query.get('caption') ?? 'Sunset Coast';
  const subtitle = query.get('subtitle') ?? 'coast city nights';
  const layout = query.get('layout') ?? 'hero3';
  const grade = query.get('grade') ?? 'sunset';
  const size = query.get('size') ?? 'square';

  await document.fonts.load('100px Anton');
  await document.fonts.load('40px Pacifico');
  await document.fonts.ready;

  api.setLayout(layout);
  api.setGrade(grade);
  api.state.title = caption;
  api.state.subtitle = subtitle;
  api.state.tagline = 'Sunset Coast • Est. 2026';
  const samples = (query.get('photos') ?? 'portrait,boulevard,pier,boulevard').split(',');
  for (let i = 0; i < samples.length; i++) {
    api.state.photos[i] = { img: await api.loadImage(`samples/${samples[i]}.jpg`), zoom: 1, ox: 0, oy: 0 };
  }
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    api.drawFull(size);
  } else {
    api.redraw();
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
