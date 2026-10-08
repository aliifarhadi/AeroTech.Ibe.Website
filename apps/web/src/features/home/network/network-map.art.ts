/**
 * The network map: a dotted relief of the region, one arc per route from Tehran, and a point of
 * light travelling along each arc. Drawn on canvas.
 *
 * Coordinates are in the map's own space (the dot grid in map-dots.json). Colours here are
 * illustration data, not UI colours (see `*.art.ts` in eslint.config.mjs).
 */
type Point = [number, number];

/** Tehran, in map space. */
const HUB: Point = [714, 290];

/** For each route: the control point and the end point of its quadratic arc from the hub. */
const ARCS: Record<string, { control: Point; end: Point }> = {
  MHD: { control: [807.4, 198.5], end: [926.8, 251.8] },
  SYZ: { control: [803.5, 372.4], end: [759.7, 485.9] },
  IFN: { control: [755.8, 330.2], end: [733.8, 383.9] },
  TBZ: { control: [673, 207.3], end: [581, 215] },
  KIH: { control: [857.7, 403.8], end: [804.7, 579.3] },
  AWZ: { control: [633.9, 340.1], end: [651, 433] },
  BND: { control: [881.4, 367], end: [871.4, 551] },
  IST: { control: [510.3, -3.4], end: [162.6, 78.1] },
};

/** Codes whose label sits before the dot so it does not collide with a neighbour. */
const LABEL_BEFORE = new Set(['SYZ', 'IFN', 'KIH']);
const SUN = '253,184,20';
const TAU = Math.PI * 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type MapDots = { dim: number[]; lit: number[] };

export type NetworkMap = {
  resize: () => void;
  setActive: (index: number) => void;
  setPointer: (x: number | null, y: number | null) => void;
  /** Index of the route whose end point is nearest to the given canvas position, or -1. */
  hit: (x: number, y: number) => number;
  /** Advances the animation by one frame and draws it. */
  frame: (elapsedMs: number) => void;
  /** Draws the settled state, for reduced motion. */
  still: () => void;
};

export function createNetworkMap(
  canvas: HTMLCanvasElement,
  dots: MapDots,
  codes: readonly string[],
  /** Route lengths, used to keep the travelling lights at a believable relative speed. */
  distances: readonly number[],
  fontFamily: string,
): NetworkMap | null {
  const cx = canvas.getContext('2d');
  if (!cx) return null;

  const arcs = codes.map((code) => ARCS[code]).filter((arc) => arc !== undefined);
  const lights = arcs.map((_, i) => ({
    t: (i * 0.37) % 1,
    v: (0.00009 + ((i * 7) % 5) * 0.00001) * (700 / Math.max(300, distances[i] ?? 700)) + 0.00005,
  }));
  const glow = arcs.map(() => 0);
  let active = 0;
  let W = 0;
  let H = 0;
  let ratio = 1;
  let scale = 1;
  let ox = 0;
  let oy = 0;
  let pointer: Point | null = null;

  const project = (x: number, y: number): Point => [ox + x * scale, oy + y * scale];
  const along = (arc: { control: Point; end: Point }, t: number): Point => {
    const u = 1 - t;
    return [
      u * u * HUB[0] + 2 * u * t * arc.control[0] + t * t * arc.end[0],
      u * u * HUB[1] + 2 * u * t * arc.control[1] + t * t * arc.end[1],
    ];
  };

  const relief = (points: number[], base: number, radius: number) => {
    for (let i = 0; i < points.length; i += 2) {
      const x = ox + points[i]! * scale;
      const y = oy + points[i + 1]! * scale;
      if (x < -5 || x > W + 5 || y < -5 || y > H + 5) continue;
      let alpha = base;
      let r = radius;
      if (pointer) {
        // Dots near the pointer lift, like a torch over a relief map.
        const d2 = (x - pointer[0]) ** 2 + (y - pointer[1]) ** 2;
        if (d2 < 12100) {
          const k = 1 - Math.sqrt(d2) / 110;
          alpha = base + k * 0.6;
          r = radius + k * 1.3;
        }
      }
      cx.globalAlpha = alpha;
      cx.beginPath();
      cx.arc(x, y, r, 0, TAU);
      cx.fill();
    }
  };

  const draw = (T: number) => {
    if (!W) return;
    const intro = Math.min(1, T / 1800);
    cx.setTransform(ratio, 0, 0, ratio, 0, 0);
    cx.clearRect(0, 0, W, H);
    const [hx, hy] = project(HUB[0], HUB[1]);

    const halo = cx.createRadialGradient(hx, hy, 0, hx, hy, 170 * scale + 40);
    halo.addColorStop(0, `rgba(${SUN},.16)`);
    halo.addColorStop(1, `rgba(${SUN},0)`);
    cx.globalAlpha = intro;
    cx.fillStyle = halo;
    cx.fillRect(hx - 260, hy - 260, 520, 520);

    cx.fillStyle = '#fff';
    const radius = Math.max(0.7, 1.2 * scale + 0.2);
    relief(dots.dim, 0.13 * intro, radius);
    relief(dots.lit, 0.5 * intro, radius + 0.2);

    arcs.forEach((arc, i) => {
      const g = glow[i] ?? 0;
      const k = Math.max(0, Math.min(1, (T - 300 - i * 90) / 1100));
      const eased = 1 - Math.pow(1 - k, 3);
      const [ex, ey] = project(arc.end[0], arc.end[1]);

      cx.globalAlpha = 1;
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(hx, hy);
      for (let s = 1; s <= 28; s++) {
        const [px, py] = along(arc, (eased * s) / 28);
        const [qx, qy] = project(px, py);
        cx.lineTo(qx, qy);
      }
      cx.strokeStyle = `rgba(233,233,228,${0.28 + g * 0.1})`;
      cx.lineWidth = 1.2;
      cx.stroke();
      if (g > 0.02) {
        cx.strokeStyle = `rgba(${SUN},${g * 0.95})`;
        cx.lineWidth = 1 + g * 1.6;
        cx.stroke();
      }
      if (eased < 1) return;

      cx.fillStyle = i === active ? '#FDB814' : '#E9E9E4';
      cx.beginPath();
      cx.arc(ex, ey, 3.5 + g * 2, 0, TAU);
      cx.fill();
      if (g > 0.05) {
        cx.strokeStyle = `rgba(${SUN},${g * 0.5})`;
        cx.lineWidth = 1;
        cx.beginPath();
        cx.arc(ex, ey, 9 + g * 6 + Math.sin(T / 300) * 2, 0, TAU);
        cx.stroke();
      }
      const code = codes[i] ?? '';
      if (W > 520 || i === active) {
        cx.font = `${i === active ? 700 : 400} 12px ${fontFamily}`;
        cx.fillStyle = i === active ? '#fff' : 'rgba(207,207,201,.9)';
        const before = arc.end[0] < HUB[0] || LABEL_BEFORE.has(code);
        cx.textAlign = before ? 'right' : 'left';
        cx.fillText(code, ex + (before ? -12 : 12), ey + (code === 'IST' ? 20 : 4));
      }

      const light = lights[i];
      if (!light) return;
      for (let s = 0; s < 9; s++) {
        const t = light.t - s * 0.012;
        if (t < 0 || t > 1) continue;
        const [px, py] = along(arc, t);
        const [qx, qy] = project(px, py);
        cx.globalAlpha = (1 - s / 9) * (i === active ? 1 : 0.8);
        cx.fillStyle = '#FDB814';
        cx.beginPath();
        cx.arc(qx, qy, (i === active ? 3.1 : 2.2) * (1 - s / 12), 0, TAU);
        cx.fill();
      }
      cx.globalAlpha = 1;
    });

    const pulse = (T % 2600) / 2600;
    cx.strokeStyle = `rgba(${SUN},${(1 - pulse) * 0.7})`;
    cx.lineWidth = 1;
    cx.beginPath();
    cx.arc(hx, hy, 6 + pulse * 20, 0, TAU);
    cx.stroke();
    cx.fillStyle = '#FDB814';
    cx.beginPath();
    cx.arc(hx, hy, 5.5, 0, TAU);
    cx.fill();
    cx.font = `700 12px ${fontFamily}`;
    cx.fillStyle = '#fff';
    cx.textAlign = 'center';
    cx.fillText('THR', hx, hy - 15);
  };

  return {
    resize() {
      const box = canvas.getBoundingClientRect();
      W = box.width;
      H = box.height;
      ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * ratio);
      canvas.height = Math.round(H * ratio);
      scale = Math.min(W / (W < 520 ? 1010 : 900), H / 610);
      ox = W / 2 - 545 * scale;
      oy = H / 2 - 318 * scale + 12;
    },
    setActive(index) {
      active = index;
    },
    setPointer(x, y) {
      pointer = x === null || y === null ? null : [x, y];
    },
    hit(x, y) {
      let best = -1;
      let nearest = 34 * 34;
      arcs.forEach((arc, i) => {
        const [px, py] = project(arc.end[0], arc.end[1]);
        const d2 = (px - x) ** 2 + (py - y) ** 2;
        if (d2 < nearest) {
          nearest = d2;
          best = i;
        }
      });
      return best;
    },
    frame(elapsedMs) {
      arcs.forEach((_, i) => {
        glow[i] = lerp(glow[i] ?? 0, i === active ? 1 : 0, 0.08);
        const light = lights[i];
        if (!light) return;
        light.t += light.v * 16 * (i === active ? 1.5 : 1);
        if (light.t > 1.15) light.t = -0.1;
      });
      draw(elapsedMs);
    },
    still() {
      arcs.forEach((_, i) => {
        glow[i] = i === active ? 1 : 0;
      });
      draw(9000);
    },
  };
}
