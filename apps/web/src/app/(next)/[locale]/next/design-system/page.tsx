import type { ReactNode } from 'react';

/**
 * Living reference for the design tokens in packages/ui/src/styles/tokens.css.
 * Internal page (English only, not indexed). Every class below is a token utility; if a token
 * is renamed or removed, this page shows it immediately.
 */

const SURFACES = [
  { name: 'canvas', cls: 'bg-canvas' },
  { name: 'canvas-deep', cls: 'bg-canvas-deep' },
  { name: 'surface-1', cls: 'bg-surface-1' },
  { name: 'surface-2', cls: 'bg-surface-2' },
  { name: 'surface-3', cls: 'bg-surface-3' },
];

const ACTION = [
  { name: 'action', cls: 'bg-action' },
  { name: 'action-hover', cls: 'bg-action-hover' },
  { name: 'action-pressed', cls: 'bg-action-pressed' },
  { name: 'action-soft', cls: 'bg-action-soft' },
  { name: 'success', cls: 'bg-success' },
  { name: 'danger', cls: 'bg-danger' },
  { name: 'info', cls: 'bg-info' },
];

const TEXT = [
  { name: 'strong', cls: 'text-strong' },
  { name: 'default', cls: 'text-default' },
  { name: 'soft', cls: 'text-soft' },
  { name: 'muted', cls: 'text-muted' },
  { name: 'faint', cls: 'text-faint' },
  { name: 'disabled', cls: 'text-disabled' },
];

const TYPE = [
  { name: 'display', cls: 'text-display font-bold' },
  { name: 'heading', cls: 'text-heading font-bold' },
  { name: 'title', cls: 'text-title font-bold' },
  { name: 'field', cls: 'text-field font-bold' },
  { name: 'body', cls: 'text-body' },
  { name: 'small', cls: 'text-small' },
  { name: 'caption', cls: 'text-caption' },
];

const RADII = [
  { name: 'small', cls: 'rounded-small' },
  { name: 'control', cls: 'rounded-control' },
  { name: 'group', cls: 'rounded-group' },
  { name: 'card', cls: 'rounded-card' },
  { name: 'chip', cls: 'rounded-chip' },
];

const SHADOWS = [
  { name: 'raised', cls: 'shadow-raised' },
  { name: 'overlay', cls: 'shadow-overlay' },
  { name: 'action', cls: 'shadow-action' },
];

const MOTION = [
  { name: '--duration-fast', value: '150ms', use: 'hover, press' },
  { name: '--duration-base', value: '250ms', use: 'state change' },
  { name: '--duration-slow', value: '450ms', use: 'enter, layout' },
  { name: 'ease-out-soft', value: 'cubic-bezier(0.16, 1, 0.3, 1)', use: 'default easing' },
  { name: 'ease-pop', value: 'cubic-bezier(0.3, 1.4, 0.5, 1)', use: 'small confirmations' },
];

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="border-t border-hairline py-10">
      <h2 className="text-title font-bold text-strong">{title}</h2>
      {note ? <p className="mt-1 max-w-2xl text-small text-muted">{note}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="font-mono text-caption text-muted">{children}</span>;
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-page px-gutter pb-section pt-10" dir="ltr" lang="en">
      <p className="text-small font-bold text-action">dot air design system</p>
      <h1 className="mt-2 text-heading font-bold text-strong">Design tokens</h1>
      <p className="mt-2 max-w-2xl text-body text-muted">
        The single source of truth is packages/ui/src/styles/tokens.css. Components use these
        utilities only; the default Tailwind palette, radii, shadows and type sizes are switched off
        for the redesigned routes.
      </p>

      <div className="mt-10">
        <Section
          title="Surfaces"
          note="Ground, raised steps and the footer. Sections alternate canvas and surface-1."
        >
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {SURFACES.map((s) => (
              <li key={s.name} className="flex flex-col gap-2">
                <span className={`h-20 rounded-control border border-strong-line ${s.cls}`} />
                <Label>{s.cls}</Label>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Action and status"
          note="Yellow marks the primary action and the selected state, nothing else."
        >
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
            {ACTION.map((s) => (
              <li key={s.name} className="flex flex-col gap-2">
                <span className={`h-20 rounded-control border border-hairline ${s.cls}`} />
                <Label>{s.cls}</Label>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="inline-flex h-12 items-center rounded-control bg-action px-6 text-body font-bold text-on-action shadow-action">
              text-on-action
            </span>
            <span className="inline-flex h-12 items-center rounded-control border border-action-line bg-action-soft px-6 text-body font-bold text-action">
              border-action-line
            </span>
          </div>
        </Section>

        <Section
          title="Text"
          note="muted passes 4.5:1 on every surface; faint is for canvas and surface-1 only."
        >
          <ul className="grid gap-4 md:grid-cols-2">
            {TEXT.map((s) => (
              <li
                key={s.name}
                className="flex items-baseline justify-between gap-4 rounded-group border border-hairline bg-surface-2 px-5 py-4"
              >
                <span className={`text-title font-bold ${s.cls}`}>
                  Tehran to Shiraz{' '}
                  <span lang="fa" dir="rtl">
                    تهران به شیراز
                  </span>
                </span>
                <Label>{s.cls}</Label>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Type scale"
          note="Seven sizes. Line heights are set for Persian and tighten for Latin locales."
        >
          <ul className="flex flex-col gap-5">
            {TYPE.map((s) => (
              <li key={s.name} className="flex flex-col gap-1 border-b border-hairline pb-5">
                <Label>{s.cls}</Label>
                <span className={`${s.cls} text-strong`}>
                  Full stop. New line{' '}
                  <span lang="fa" dir="rtl">
                    نقطه، سر خط
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Radius">
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {RADII.map((s) => (
              <li key={s.name} className="flex flex-col gap-2">
                <span className={`h-20 border border-strong-line bg-surface-2 ${s.cls}`} />
                <Label>{s.cls}</Label>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Elevation"
          note="Flat by default. Shadows are for the booking card, overlays and the primary button on hover."
        >
          <ul className="grid gap-8 md:grid-cols-3">
            {SHADOWS.map((s) => (
              <li key={s.name} className="flex flex-col gap-3">
                <span
                  className={`h-24 rounded-card border border-hairline bg-surface-2 ${s.cls}`}
                />
                <Label>{s.cls}</Label>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Layout"
          note="Page gutter, section rhythm and the content width have names: px-gutter, py-section, max-w-page."
        >
          <div className="rounded-card border border-hairline bg-surface-1 px-gutter py-section">
            <div className="rounded-group border border-action-line bg-action-softer p-4 text-small text-soft">
              content inside px-gutter / py-section
            </div>
          </div>
        </Section>

        <Section title="Motion" note="Everything stops under prefers-reduced-motion.">
          <dl className="grid gap-3 md:grid-cols-2">
            {MOTION.map((m) => (
              <div
                key={m.name}
                className="rounded-group border border-hairline bg-surface-2 px-5 py-4"
              >
                <dt className="font-mono text-small text-strong">{m.name}</dt>
                <dd className="mt-1 text-small text-muted">
                  {m.value} · {m.use}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </main>
  );
}
