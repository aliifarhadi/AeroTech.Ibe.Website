'use client';

import { useTranslations } from 'next-intl';
import { FARE_ROWS, familiesOf, type FareFamilyId, type Inclusion } from '@aerotech/domain';
import { Badge, Button, Icon, type IconName } from '@aerotech/ui';
import { FARE_COPY, fareOf, type Selection } from './model';
import { useMoney } from './use-money';

const MARK: Record<Inclusion, { icon: IconName; tone: string }> = {
  yes: { icon: 'check', tone: 'text-success' },
  fee: { icon: 'info', tone: 'text-action' },
  no: { icon: 'close', tone: 'text-faint' },
};

/** The fare families of the chosen cabin, side by side, with what each includes. */
export function FareFamilies({
  selection,
  onChoose,
}: {
  selection: Selection;
  onChoose: (family: FareFamilyId) => void;
}) {
  const t = useTranslations('flights');
  const money = useMoney();
  const families = familiesOf(selection.cabin);

  return (
    <div
      role="group"
      aria-label={t('fareAria')}
      style={{ '--fare-count': families.length } as React.CSSProperties}
      className="fl-fares"
    >
      {families.map((family) => {
        const chosen = family.id === selection.family;
        const name = t(`families.${family.id}`);
        return (
          <div
            key={family.id}
            data-chosen={chosen || undefined}
            className="relative flex flex-col gap-3 rounded-group border border-hairline bg-surface-1 p-4 transition-colors duration-(--duration-base) data-chosen:border-action data-chosen:bg-action-softer"
          >
            {family.recommended ? (
              <Badge tone="action" className="absolute end-3 -top-3">
                {t('suggests')}
              </Badge>
            ) : null}
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h4 className="text-title font-bold text-strong">{name}</h4>
              <span className="text-field font-bold whitespace-nowrap">
                {money.format(fareOf(selection.flight, selection.cabin, family.id, money.currency))}
              </span>
            </div>
            <ul className="flex flex-col gap-1.5 text-small">
              {FARE_ROWS.map((row, i) => {
                const state = family.rows[i] ?? 'no';
                const [key, values] = FARE_COPY[family.id][i] ?? ['cabinBag'];
                return (
                  <li
                    key={row}
                    className={`flex items-start gap-2 ${state === 'no' ? 'text-muted' : ''}`}
                  >
                    <Icon
                      name={MARK[state].icon}
                      size={14}
                      className={`mt-1.5 ${MARK[state].tone}`}
                    />
                    <span>
                      <span className="sr-only">{t(`inclusion.${state}`)}: </span>
                      {t(`rows.${key}`, values)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <Button
              variant={chosen ? 'primary' : 'secondary'}
              size="sm"
              aria-pressed={chosen}
              onPress={() => onChoose(family.id)}
              className="mt-auto"
            >
              {chosen ? t('selected') : t('choose', { name })}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
