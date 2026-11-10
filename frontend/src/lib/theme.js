/*
 * Visual settings chosen in Claude Design's "Tweaks" panel for the prototype
 * (design/binder-organizer.html). The panel itself was a design-time tool;
 * here the chosen values are applied once at startup.
 */
export const THEME = {
  fontPairing: 'neutral',      // Inter (body) + DM Sans (display / cover)
  purpleShade: '#7B5CF0',
  density: 'comfortable',
  sidebarWidth: 296,
  darkSidebar: false,
  communityLayout: 'tiles',    // tiles | binders
  statsDensity: 'lean',        // lean | standard
  scannerForm: 'popup',        // popup | modal
};

const FONTS = {
  body: "'Inter', system-ui, sans-serif",
  display: "'DM Sans', system-ui, sans-serif",
  cover: "'DM Sans', sans-serif",
};

function hexToRgb(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (a, b, t) => Math.round(a + (b - a) * t);

export function applyTheme(t = THEME) {
  const root = document.documentElement.style;
  root.setProperty('--font-body', FONTS.body);
  root.setProperty('--font-display', FONTS.display);
  root.setProperty('--font-cover', FONTS.cover);

  const [r, g, b] = hexToRgb(t.purpleShade);
  root.setProperty('--accent', t.purpleShade);
  root.setProperty('--accent-deep', `rgb(${mix(r, 0, 0.2)},${mix(g, 0, 0.2)},${mix(b, 0, 0.2)})`);
  root.setProperty('--accent-soft', `rgb(${mix(r, 255, 0.88)},${mix(g, 255, 0.88)},${mix(b, 255, 0.88)})`);
  root.setProperty('--accent-glow', `rgba(${r},${g},${b},.16)`);
  root.setProperty('--sidebar-w', `${t.sidebarWidth}px`);

  document.body.classList.toggle('dark-sidebar', !!t.darkSidebar);
  document.body.dataset.density = t.density;
}
