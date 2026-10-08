'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Reveal } from '../shared/reveal';
import { ASSISTANT_ID, useHome } from './home-context';

type Option = {
  depart: string;
  arrive: string;
  from: string;
  to: string;
  label: 'o1' | 'o2' | 'o3';
};
type Scenario = {
  id: 'mashhad' | 'kish' | 'istanbul';
  code: string;
  pick: number;
  options: Option[];
};

/** Sample conversations. Times are illustrative; the copy says "Sample" beside them. */
const SCENARIOS: readonly Scenario[] = [
  {
    id: 'mashhad',
    code: 'THR → MHD · 2 ADT',
    pick: 1,
    options: [
      { depart: '06:40', arrive: '08:05', from: 'THR', to: 'MHD', label: 'o1' },
      { depart: '12:15', arrive: '13:40', from: 'THR', to: 'MHD', label: 'o2' },
      { depart: '19:30', arrive: '20:55', from: 'THR', to: 'MHD', label: 'o3' },
    ],
  },
  {
    id: 'kish',
    code: 'THR → KIH · 1 ADT',
    pick: 0,
    options: [
      { depart: '07:15', arrive: '09:05', from: 'THR', to: 'KIH', label: 'o1' },
      { depart: '10:40', arrive: '12:30', from: 'THR', to: 'KIH', label: 'o2' },
    ],
  },
  {
    id: 'istanbul',
    code: 'IKA ⇄ IST · 1 ADT',
    pick: 0,
    options: [
      { depart: '08:20', arrive: '11:05', from: 'IKA', to: 'IST', label: 'o1' },
      { depart: '18:10', arrive: '21:55', from: 'IST', to: 'IKA', label: 'o2' },
    ],
  },
];

type Stage = {
  typed: string;
  phase: 'typing' | 'thinking' | 'answer';
  shown: number;
  picked: boolean;
};
const IDLE: Stage = { typed: '', phase: 'typing', shown: 0, picked: false };

/** Plays a scripted exchange: the question is typed, the assistant thinks, options arrive. */
export function AssistantSection() {
  const t = useTranslations('assistant');
  const { assistantPrompt } = useHome();
  const [index, setIndex] = useState(0);
  const [custom, setCustom] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>(IDLE);
  const run = useRef(0);
  const userChose = useRef(false);
  const started = useRef(false);

  const scenario = SCENARIOS[index] ?? SCENARIOS[0]!;
  const question = (id: Scenario['id']) => t(`scenarios.${id}.q`);

  const play = useCallback(
    async (next: number, text: string, isCustom: boolean) => {
      const id = ++run.current;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const alive = () => id === run.current;
      const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, reduced ? 0 : ms));
      const item = SCENARIOS[next] ?? SCENARIOS[0]!;
      started.current = true;
      setIndex(next);
      setCustom(isCustom ? text : null);

      if (reduced) {
        setStage({ typed: text, phase: 'answer', shown: item.options.length, picked: true });
        return;
      }
      setStage(IDLE);
      const perChar = Math.min(60, 1300 / Math.max(1, text.length));
      for (let i = 1; i <= text.length; i++) {
        if (!alive()) return;
        setStage({ ...IDLE, typed: text.slice(0, i) });
        await wait(perChar);
      }
      await wait(300);
      if (!alive()) return;
      setStage({ typed: text, phase: 'thinking', shown: 0, picked: false });
      await wait(1000);
      for (let shown = 0; shown <= item.options.length; shown++) {
        if (!alive()) return;
        setStage({ typed: text, phase: 'answer', shown, picked: false });
        await wait(150);
      }
      await wait(350);
      if (!alive()) return;
      setStage({ typed: text, phase: 'answer', shown: item.options.length, picked: true });
      await wait(4200);
      if (!alive() || userChose.current) return;
      const following = (next + 1) % SCENARIOS.length;
      void play(following, question(SCENARIOS[following]!.id), false);
    },
    // `question` reads from `t`, which is stable for a locale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  useEffect(() => () => void run.current++, []);

  useEffect(() => {
    if (!assistantPrompt) return;
    userChose.current = true;
    void play(0, assistantPrompt.text, true);
  }, [assistantPrompt, play]);

  return (
    <section id={ASSISTANT_ID} className="relative py-section">
      <div className="mx-auto grid max-w-page items-center gap-8 px-gutter lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="flex items-center gap-2 text-small font-bold text-action">
            <span className="size-2 rounded-chip bg-action" />
            {t('kicker')}
          </p>
          <h2 className="mt-2 text-heading font-bold text-balance text-strong">{t('title')}</h2>
          <p className="mt-2 max-w-prose text-muted">{t('lead')}</p>
          <div role="group" aria-label={t('promptsAria')} className="mt-5 flex flex-wrap gap-2">
            {SCENARIOS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={custom === null && i === index}
                onClick={() => {
                  userChose.current = true;
                  void play(i, question(item.id), false);
                }}
                className="min-h-10 cursor-pointer rounded-chip border border-strong-line px-4 py-1 text-small text-soft transition-colors duration-(--duration-fast) hover:border-strong hover:text-strong aria-pressed:border-default aria-pressed:bg-default aria-pressed:font-bold aria-pressed:text-on-action"
              >
                {question(item.id)}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal
          delay={100}
          onReveal={() => {
            if (!started.current) void play(0, question('mashhad'), false);
          }}
        >
          <div className="overflow-hidden rounded-card border border-strong-line bg-surface-1">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3 text-small font-bold">
              <span className="flex items-center gap-2.5">
                <span className="size-2 rounded-chip bg-action" />
                {t('name')}
              </span>
              <span className="text-caption font-normal text-muted">{t('sample')}</span>
            </div>
            {/* The demo repeats by itself, so it is not announced; the copy beside it says what it shows. */}
            <div aria-hidden="true" className="flex min-h-84 flex-col gap-3 p-4">
              <div className="flex min-h-12 items-center gap-0.5 rounded-control border border-hairline bg-canvas px-4">
                <span>{stage.typed}</span>
                <span className="h-5 w-0.5 animate-caret bg-action" />
              </div>
              <div className="flex min-h-7 items-center">
                {stage.phase === 'thinking' ? (
                  <span className="flex gap-1.5">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        style={{ animationDelay: `${delay}ms` }}
                        className="size-2 animate-bob rounded-chip bg-action"
                      />
                    ))}
                  </span>
                ) : null}
                {stage.phase === 'answer' ? (
                  <p className="text-small text-soft">
                    {custom === null ? t(`scenarios.${scenario.id}.a`) : t('customAnswer')}
                  </p>
                ) : null}
              </div>
              {stage.phase === 'answer'
                ? scenario.options.map((option, i) => {
                    const picked = stage.picked && i === scenario.pick;
                    return (
                      <div
                        key={`${scenario.id}-${option.label}`}
                        data-in={i < stage.shown || undefined}
                        data-picked={picked || undefined}
                        className="relative flex translate-y-3.5 flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-control border border-hairline bg-surface-2 px-4 py-3 opacity-0 transition duration-(--duration-slow) ease-out-soft data-in:translate-y-0 data-in:opacity-100 data-picked:border-action"
                      >
                        <span dir="ltr" className="flex items-center gap-3 font-mono">
                          <span className="flex flex-col leading-tight">
                            {option.depart}
                            <span className="text-caption tracking-wide text-muted">
                              {option.from}
                            </span>
                          </span>
                          <span className="h-px w-8 bg-hover-line" />
                          <span className="flex flex-col leading-tight">
                            {option.arrive}
                            <span className="text-caption tracking-wide text-muted">
                              {option.to}
                            </span>
                          </span>
                        </span>
                        <span className="text-small text-muted">
                          {t(`scenarios.${scenario.id}.${option.label}` as 'scenarios.mashhad.o1')}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-small text-muted">
                          <span className="size-1.5 animate-beat rounded-chip bg-success" />
                          {t('liveFare')}
                        </span>
                        <span
                          className={[
                            'absolute end-3.5 -top-3 rounded-chip bg-action px-2.5 text-caption font-bold text-on-action transition-transform duration-(--duration-slow) ease-pop',
                            picked ? 'scale-100' : 'scale-0',
                          ].join(' ')}
                        >
                          {t('suggests')}
                        </span>
                      </div>
                    );
                  })
                : null}
            </div>
            <div className="flex flex-wrap justify-between gap-3 border-t border-hairline px-4 py-3 text-caption text-muted">
              <span dir="ltr" className="font-mono tracking-wide">
                {scenario.code}
              </span>
              {t('footer')}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
