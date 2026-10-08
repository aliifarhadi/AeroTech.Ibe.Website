/**
 * The hero sky: the view above the clouds, lit for the hour in Tehran. The brand dot is the sun
 * and sits on the top edge of the booking card. Everything is drawn on one canvas; there are no
 * image assets.
 *
 * Illustration palettes live here as data. They are not UI colours and are exempt from the
 * token-only lint rule (see `*.art.ts` in eslint.config.mjs).
 */
import type { Mood } from './scene-mood';

type Palette = {
  sky: [string, string];
  /** Warm wash nearest the sun, as "r,g,b". */
  glow: string;
  /** Wider, cooler wash. */
  haze: string;
  sun: [string, string, string];
  /** Shadowed cloud bands. */
  cloud: string;
  /** Sunlit cloud bands. */
  rim: string;
  stars: number;
};

const PALETTES: Record<Mood, Palette> = {
  dawn: {
    sky: ['#15121F', '#3B2444'],
    glow: '244,150,96',
    haze: '196,84,110',
    sun: ['#FFF0BF', '#FDB814', '#F7941D'],
    cloud: '52,32,58',
    rim: '255,176,128',
    stars: 0.15,
  },
  day: {
    sky: ['#101A2E', '#263F69'],
    glow: '252,196,110',
    haze: '150,160,200',
    sun: ['#FFF7D6', '#FDC53A', '#F9A21B'],
    cloud: '28,40,70',
    rim: '255,220,170',
    stars: 0,
  },
  dusk: {
    sky: ['#141018', '#34203A'],
    glow: '247,132,48',
    haze: '190,66,72',
    sun: ['#FFE596', '#FDB814', '#F0702A'],
    cloud: '40,22,40',
    rim: '255,146,92',
    stars: 0.3,
  },
  night: {
    sky: ['#0A0B13', '#161931'],
    glow: '226,196,128',
    haze: '74,70,130',
    sun: ['#FFF9E3', '#F6E3A1', '#DDBE66'],
    cloud: '15,17,32',
    rim: '140,146,210',
    stars: 1,
  },
};

/** Where the canvas meets the page: the booking card's top and bottom edge, in canvas pixels. */
export type SceneLayout = {
  width: number;
  height: number;
  cardTop: number;
  cardBottom: number;
  /** In RTL the headline is on the right, so the sun sits on the left; LTR mirrors that. */
  rtl: boolean;
};

export type HeroScene = {
  resize: (layout: SceneLayout) => void;
  setMood: (mood: Mood) => void;
  /** Pointer position as -0.5..0.5 of the viewport, for a few pixels of parallax. */
  setPointer: (x: number, y: number) => void;
  draw: (elapsedMs: number) => void;
};

/** Small seeded generator so the sky is the same on every visit. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Band = {
  layer: 0 | 1 | 2;
  x: number;
  y: number;
  w: number;
  h: number;
  v: number;
  lit: boolean;
};

export function createHeroScene(canvas: HTMLCanvasElement): HeroScene | null {
  const cx = canvas.getContext('2d');
  if (!cx) return null;

  const random = seeded(20261008);
  const bands = (layer: Band['layer'], count: number): Band[] =>
    Array.from({ length: count }, () => ({
      layer,
      x: random(),
      y: random(),
      w: 0.32 + random() * 0.4,
      h: 14 + random() * 26,
      v: (0.5 + random()) * [0.003, 0.006, 0.009][layer]!,
      lit: random() < 0.45,
    }));
  // Strata: a few long, very soft bands of light and shadow. No drawn clouds.
  const strata = [...bands(0, 6), ...bands(1, 5), ...bands(2, 4)];
  const stars = Array.from({ length: 90 }, () => ({
    x: random(),
    y: random() * 0.6,
    r: 0.5 + random() * 1.1,
    phase: random() * TAU,
  }));

  let mood: Mood = 'dusk';
  let layout: SceneLayout = { width: 0, height: 0, cardTop: 240, cardBottom: 520, rtl: true };
  let ratio = 1;
  let sunX = 0;
  let sunY = 0;
  let sunR = 60;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let shade: HTMLCanvasElement | null = null;
  let light: HTMLCanvasElement | null = null;

  const sprite = (rgb: string) => {
    const el = document.createElement('canvas');
    el.width = el.height = 128;
    const g = el.getContext('2d');
    if (!g) return el;
    const fill = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    fill.addColorStop(0, `rgba(${rgb},1)`);
    fill.addColorStop(0.45, `rgba(${rgb},.8)`);
    fill.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = fill;
    g.fillRect(0, 0, 128, 128);
    return el;
  };
  const paint = () => {
    shade = sprite(PALETTES[mood].cloud);
    light = sprite(PALETTES[mood].rim);
  };

  return {
    resize(next) {
      layout = next;
      ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(next.width * ratio);
      canvas.height = Math.round(next.height * ratio);
      sunR = Math.max(30, Math.min(74, next.width * 0.05));
      const side = Math.max(sunR + 30, next.width * 0.17);
      sunX = next.rtl ? side : next.width - side;
      sunY = next.cardTop - sunR * 0.42;
    },
    setMood(next) {
      mood = next;
      paint();
    },
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    draw(elapsedMs) {
      const { width: W, height: H, cardTop, cardBottom, rtl } = layout;
      if (!W) return;
      if (!shade || !light) paint();
      const p = PALETTES[mood];
      const k = elapsedMs / 1000;
      pointer.x = lerp(pointer.x, pointer.tx, 0.05);
      pointer.y = lerp(pointer.y, pointer.ty, 0.05);

      cx.setTransform(ratio, 0, 0, ratio, 0, 0);
      cx.globalAlpha = 1;
      const sky = cx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, p.sky[0]);
      sky.addColorStop(Math.min(0.9, cardTop / H), p.sky[1]);
      sky.addColorStop(Math.min(0.97, (cardBottom + 40) / H), '#181415');
      sky.addColorStop(1, '#131112');
      cx.fillStyle = sky;
      cx.fillRect(0, 0, W, H);

      if (p.stars) {
        cx.fillStyle = '#fff';
        for (const star of stars) {
          cx.globalAlpha = p.stars * (0.35 + 0.35 * Math.sin(k * 1.3 + star.phase));
          cx.beginPath();
          cx.arc(star.x * W, star.y * cardTop, star.r, 0, TAU);
          cx.fill();
        }
        cx.globalAlpha = 1;
      }

      // Afterglow: two wide washes centred on the sun, so the headline side stays dark.
      const sx = sunX + pointer.x * 6;
      const sy = sunY + pointer.y * 4;
      const wash = (rgb: string, radius: number, alpha: number) => {
        const fill = cx.createRadialGradient(sx, sy, 0, sx, sy, radius);
        fill.addColorStop(0, `rgba(${rgb},${alpha})`);
        fill.addColorStop(0.5, `rgba(${rgb},${alpha * 0.35})`);
        fill.addColorStop(1, `rgba(${rgb},0)`);
        cx.fillStyle = fill;
        cx.fillRect(0, 0, W, H);
      };
      const small = W < 700;
      wash(p.haze, small ? W * 0.8 : Math.max(360, W * 0.62), small ? 0.4 : 0.5);
      wash(p.glow, small ? W * 0.5 : Math.max(240, W * 0.36), small ? 0.6 : 0.7);

      // Shade on the headline side keeps the copy readable in every mood.
      const from = rtl ? W : 0;
      const to = rtl ? W * (small ? 0 : 0.4) : W * (small ? 1 : 0.6);
      const veil = cx.createLinearGradient(from, 0, to, 0);
      veil.addColorStop(0, `rgba(12,10,14,${small ? 0.78 : 0.62})`);
      veil.addColorStop(1, 'rgba(12,10,14,0)');
      cx.fillStyle = veil;
      cx.fillRect(0, 0, W, cardTop + 10);

      const band = (b: Band, top: number, span: number, parallax: number, alpha: number) => {
        if (!shade || !light) return;
        const w = b.w * Math.max(W, 700);
        const x = (((b.x + k * b.v) % 1.5) - 0.4) * W + pointer.x * parallax;
        const y = top + b.y * span + pointer.y * parallax * 0.4;
        if (b.lit) {
          // Only bands near the sun catch light.
          const near = Math.max(0, 1 - Math.abs(x + w / 2 - sunX) / (W * 0.5));
          if (near > 0.03) {
            cx.globalAlpha = alpha * 0.5 * near;
            cx.drawImage(light, x, y, w, b.h);
          }
        } else {
          cx.globalAlpha = alpha * 0.8;
          cx.drawImage(shade, x, y, w, b.h * 1.4);
        }
      };
      for (const b of strata) if (b.layer === 0) band(b, cardTop - 180, 130, 5, 0.7);
      for (const b of strata) if (b.layer === 1) band(b, cardTop - 64, 56, 10, 0.9);

      // The sun is drawn in front of the bands so the dot is always whole.
      const breathe = 1 + Math.sin(k * 0.8) * 0.015;
      const halo = cx.createRadialGradient(sx, sy, sunR * 0.6, sx, sy, sunR * 3.2);
      halo.addColorStop(0, `rgba(${p.glow},.55)`);
      halo.addColorStop(1, `rgba(${p.glow},0)`);
      cx.globalAlpha = 1;
      cx.fillStyle = halo;
      cx.fillRect(sx - sunR * 4, sy - sunR * 4, sunR * 8, sunR * 8);
      const disc = cx.createRadialGradient(
        sx - sunR * 0.2,
        sy - sunR * 0.25,
        0,
        sx,
        sy,
        sunR * breathe,
      );
      disc.addColorStop(0, p.sun[0]);
      disc.addColorStop(0.55, p.sun[1]);
      disc.addColorStop(1, p.sun[2]);
      cx.fillStyle = disc;
      cx.beginPath();
      cx.arc(sx, sy, sunR * breathe, 0, TAU);
      cx.fill();
      cx.strokeStyle = `rgba(${p.glow},.28)`;
      cx.lineWidth = 1;
      cx.beginPath();
      cx.arc(sx, sy, sunR * (1.7 + Math.sin(k * 0.5) * 0.04), 0, TAU);
      cx.stroke();

      // An aircraft crosses the top band in the reading direction, with a fading contrail.
      const loop = (k % 46) / 30;
      if (loop < 1.25) {
        const x0 = rtl ? -40 : W + 40;
        const x1 = rtl ? W + 40 : -40;
        const y0 = cardTop * 0.62;
        const y1 = Math.max(74, cardTop * 0.34);
        const at = (t: number): [number, number] => [
          lerp(x0, x1, t),
          lerp(y0, y1, t) - Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) * 18,
        ];
        const t = loop * 0.92;
        const [ax, ay] = at(t);
        const [bx, by] = at(Math.max(0, t - 0.22));
        const trail = cx.createLinearGradient(bx, by, ax, ay);
        trail.addColorStop(0, 'rgba(255,255,255,0)');
        trail.addColorStop(1, 'rgba(255,244,224,.7)');
        cx.strokeStyle = trail;
        cx.lineWidth = 1.4;
        cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(bx, by);
        cx.lineTo(ax, ay);
        cx.stroke();
        const [nx, ny] = at(t + 0.01);
        cx.save();
        cx.translate(ax, ay);
        cx.rotate(Math.atan2(ny - ay, nx - ax));
        cx.fillStyle = '#FFF6E4';
        cx.beginPath();
        cx.moveTo(9, 0);
        cx.lineTo(-7, -2.2);
        cx.lineTo(-7, 2.2);
        cx.closePath();
        cx.fill();
        cx.beginPath();
        cx.moveTo(1, 0);
        cx.lineTo(-4, -8);
        cx.lineTo(-6, -8);
        cx.lineTo(-3, 0);
        cx.lineTo(-6, 8);
        cx.lineTo(-4, 8);
        cx.closePath();
        cx.fill();
        cx.restore();
      }

      // Low deck under the card.
      for (const b of strata) if (b.layer === 2) band(b, cardBottom + 4, 70, 16, 0.7);
      cx.globalAlpha = 1;
      const top = cx.createLinearGradient(0, 0, 0, 110);
      top.addColorStop(0, 'rgba(0,0,0,.35)');
      top.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = top;
      cx.fillRect(0, 0, W, 110);
    },
  };
}
