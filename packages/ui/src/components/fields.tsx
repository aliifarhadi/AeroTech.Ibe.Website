'use client';

import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Checkbox as AriaCheckbox,
  FieldError,
  Group,
  Input,
  Label,
  Switch as AriaSwitch,
  Text,
  TextField as AriaTextField,
  ToggleButton,
  ToggleButtonGroup,
  type ButtonProps as AriaButtonProps,
  type CheckboxProps as AriaCheckboxProps,
  type Key,
  type SwitchProps as AriaSwitchProps,
  type TextFieldProps as AriaTextFieldProps,
  type ToggleButtonProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';
import { focusRing } from './button';
import { Icon } from './icon';

/* ---------- TextField ---------- */

export type TextFieldProps = Omit<AriaTextFieldProps, 'children' | 'className'> & {
  label: string;
  description?: string;
  /** Error text, or a function of the validation result. Shown only when the field is invalid. */
  errorMessage?: string;
  placeholder?: string;
  /** For codes, numbers and emails: left-to-right content in a monospaced face, aligned to the reading start. */
  code?: boolean;
  /** Element rendered inside the field at its end (for example a show-password button). */
  suffix?: ReactNode;
  className?: string;
};

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  code,
  suffix,
  className,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      className={['flex min-w-0 flex-col gap-1', className].filter(Boolean).join(' ')}
    >
      <Label className="text-caption text-muted">{label}</Label>
      <span className="relative block">
        <Input
          placeholder={placeholder}
          dir={code ? 'ltr' : undefined}
          className={[
            'h-14 w-full rounded-control border border-strong-line bg-surface-1 px-4 text-body text-default',
            'outline-none transition-colors duration-(--duration-fast) placeholder:text-faint',
            'data-focused:border-action data-invalid:border-danger data-disabled:text-disabled',
            code ? 'font-mono tracking-wide rtl:text-end' : '',
            suffix ? 'pe-14' : '',
          ].join(' ')}
        />
        {suffix ? <span className="absolute end-2 top-2">{suffix}</span> : null}
      </span>
      {description ? (
        <Text slot="description" className="text-caption text-muted">
          {description}
        </Text>
      ) : null}
      <FieldError className="text-small text-danger-soft">{errorMessage}</FieldError>
    </AriaTextField>
  );
}

/* ---------- FieldButton: a labelled value that opens a picker (the booking form cell) ---------- */

export type FieldButtonProps = Omit<AriaButtonProps, 'children' | 'className' | 'value'> & {
  label: ReactNode;
  /** The current value. When empty, `placeholder` is shown in its place. */
  value?: ReactNode;
  placeholder?: string;
  isInvalid?: boolean;
  className?: string;
};

export function FieldButton({
  label,
  value,
  placeholder,
  isInvalid,
  className,
  ...props
}: FieldButtonProps) {
  return (
    <AriaButton
      {...props}
      data-invalid={isInvalid || undefined}
      className={[
        'flex min-h-18 min-w-0 flex-1 cursor-pointer flex-col items-start justify-center rounded-group px-4 py-2 text-start',
        'transition-colors duration-(--duration-fast) data-hovered:bg-surface-hover',
        'aria-expanded:bg-action-softer aria-expanded:inset-ring-2 aria-expanded:inset-ring-action',
        'data-invalid:inset-ring-2 data-invalid:inset-ring-danger',
        focusRing,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="text-caption text-muted">{label}</span>
      {value ? (
        <span className="flex max-w-full items-baseline gap-2 truncate text-field font-bold text-default">
          {value}
        </span>
      ) : (
        <span className="max-w-full truncate text-field text-faint">{placeholder}</span>
      )}
    </AriaButton>
  );
}

/* ---------- SegmentedControl ---------- */

export type SegmentedOption<K extends string> = { id: K; label: string };

export type SegmentedControlProps<K extends string> = {
  'aria-label': string;
  options: ReadonlyArray<SegmentedOption<K>>;
  value: K;
  onChange: (value: K) => void;
  size?: 'sm' | 'md';
  /** Stretch options to share the full width. */
  fill?: boolean;
  /** Use on a card that is itself a raised surface, so the track stays visible. */
  className?: string;
};

export function SegmentedControl<K extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fill,
  className,
  ...props
}: SegmentedControlProps<K>) {
  return (
    <ToggleButtonGroup
      {...props}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys: Set<Key>) => {
        const next = [...keys][0];
        if (typeof next === 'string') onChange(next as K);
      }}
      className={[
        'inline-flex gap-0.5 rounded-chip bg-canvas p-1',
        fill ? 'flex w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {options.map((o) => (
        <ToggleButton
          key={o.id}
          id={o.id}
          className={[
            'cursor-pointer whitespace-nowrap rounded-chip px-4 text-small text-muted transition-colors duration-(--duration-base)',
            'data-hovered:text-default data-selected:bg-default data-selected:font-bold data-selected:text-on-action',
            size === 'sm' ? 'h-8' : 'h-10',
            fill ? 'flex-1' : '',
            focusRing,
          ].join(' ')}
        >
          {o.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

/* ---------- ToggleChip ---------- */

export type ToggleChipProps = Omit<ToggleButtonProps, 'className' | 'children'> & {
  children: ReactNode;
  className?: string;
};

export function ToggleChip({ className, children, ...props }: ToggleChipProps) {
  return (
    <ToggleButton
      {...props}
      className={[
        'inline-flex h-10 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-chip border border-hairline px-3.5 text-small text-muted',
        'transition-colors duration-(--duration-fast) data-hovered:border-hover-line data-hovered:text-default',
        'data-selected:border-action-line data-selected:bg-action-soft data-selected:text-action',
        focusRing,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </ToggleButton>
  );
}

/* ---------- Stepper ---------- */

export type StepperProps = {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  decrementLabel: string;
  incrementLabel: string;
  /** Formats the number for display (locale digits). Defaults to String. */
  format?: (value: number) => string;
};

const stepButton = [
  'inline-flex size-10 cursor-pointer items-center justify-center rounded-chip border border-strong-line text-default',
  'transition-colors duration-(--duration-fast) data-hovered:border-action data-hovered:text-action',
  'data-disabled:cursor-not-allowed data-disabled:border-hairline data-disabled:text-disabled',
  focusRing,
].join(' ');

export function Stepper({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 9,
  decrementLabel,
  incrementLabel,
  format = String,
}: StepperProps) {
  return (
    <Group
      aria-label={label}
      className="flex items-center justify-between gap-4 border-t border-hairline py-3 first:border-t-0"
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-body font-bold text-default">{label}</span>
        {description ? <span className="text-caption text-muted">{description}</span> : null}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <AriaButton
          aria-label={decrementLabel}
          isDisabled={value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
          className={stepButton}
        >
          <Icon name="minus" size={18} />
        </AriaButton>
        <output aria-live="polite" className="w-8 text-center text-field font-bold text-default">
          {format(value)}
        </output>
        <AriaButton
          aria-label={incrementLabel}
          isDisabled={value >= max}
          onPress={() => onChange(Math.min(max, value + 1))}
          className={stepButton}
        >
          <Icon name="plus" size={18} />
        </AriaButton>
      </span>
    </Group>
  );
}

/* ---------- Switch and Checkbox ---------- */

const track = tv({
  base: [
    'relative h-8 w-13 shrink-0 rounded-chip bg-surface-3 transition-colors duration-(--duration-base)',
    'group-data-selected:bg-action group-data-focus-visible:outline-2 group-data-focus-visible:outline-offset-2 group-data-focus-visible:outline-focus',
  ],
});

export type SwitchProps = Omit<AriaSwitchProps, 'children' | 'className'> & {
  children?: ReactNode;
  className?: string;
};

export function Switch({ children, className, ...props }: SwitchProps) {
  return (
    <AriaSwitch
      {...props}
      className={[
        'group inline-flex min-h-10 cursor-pointer items-center gap-3 text-body text-default',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={track()}>
        <span className="absolute start-1 top-1 size-6 rounded-chip bg-strong transition-transform duration-(--duration-base) ease-out-soft group-data-selected:translate-x-5 group-data-selected:bg-on-action rtl:group-data-selected:-translate-x-5" />
      </span>
      {children}
    </AriaSwitch>
  );
}

export type CheckboxProps = Omit<AriaCheckboxProps, 'children' | 'className'> & {
  children: ReactNode;
  className?: string;
};

export function Checkbox({ children, className, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      className={[
        'group flex min-h-10 cursor-pointer items-start gap-3 py-2 text-small text-soft',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-small border border-strong-line text-on-action transition-colors duration-(--duration-fast) group-data-selected:border-action group-data-selected:bg-action group-data-invalid:border-danger group-data-focus-visible:outline-2 group-data-focus-visible:outline-offset-2 group-data-focus-visible:outline-focus">
        <Icon
          name="check"
          size={14}
          className="opacity-0 group-data-selected:opacity-100"
          strokeWidth={3}
        />
      </span>
      <span>{children}</span>
    </AriaCheckbox>
  );
}
