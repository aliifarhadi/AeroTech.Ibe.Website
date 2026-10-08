import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from '@aerotech/ui/cn';

/* --------------------------------------------------------------------------
 * Field system — single source of truth for form fields.
 *
 * Two paradigms, both defined here so they never drift again:
 *   1. Cell fields  — label + borderless value, used inside a connected search row
 *                     (the booking widget, date picker). Use `fieldCell`, `fieldInput`,
 *                     `FieldCell`, `FieldValue`, `FieldRow`.
 *   2. Standalone   — bordered input with a label above (forms). Use `TextField` / `SelectField`.
 * -------------------------------------------------------------------------- */

/** Wrapper for one cell in a connected field row. Apply to a <div> or a <button>. */
export const fieldCell = 'flex min-w-0 flex-col justify-center gap-1 px-4 py-2 text-start';

/** Tiny label that sits above a cell value. */
export const fieldLabelClass = 'truncate text-[11px] font-medium text-neutral-500';

/** Borderless input used as a cell value. */
export const fieldInput =
  'w-full min-w-0 bg-transparent text-[15px] font-semibold text-black placeholder:font-normal placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

/** Connected, bordered row container that holds cells (stacks on mobile). */
export function FieldRow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200 lg:flex-row lg:divide-x lg:divide-y-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A labelled cell (div) — put an input or FieldValue inside. */
export function FieldCell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(fieldCell, className)}>
      <span className={fieldLabelClass}>{label}</span>
      {children}
    </div>
  );
}

/** Display value for a cell (e.g. a date/picker trigger). Matches input value/placeholder styling. */
export function FieldValue({
  placeholder,
  className,
  children,
}: {
  placeholder?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'block truncate text-[15px]',
        placeholder ? 'font-normal text-neutral-400' : 'font-semibold text-black',
        className,
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------------------
 * Standalone bordered fields (forms).
 * -------------------------------------------------------------------------- */

const controlBase =
  'h-14 w-full min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-[15px] font-medium ' +
  'text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 transition ' +
  'hover:border-neutral-300 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-200 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
    >
      {children}
    </label>
  );
}

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hideLabel?: boolean;
  icon?: ReactNode;
};

export function TextField({ label, hideLabel, icon, id, className, ...props }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="min-w-0 text-start">
      {hideLabel ? (
        <label htmlFor={fieldId} className="sr-only">
          {label}
        </label>
      ) : (
        <Label htmlFor={fieldId}>{label}</Label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-neutral-400">
            {icon}
          </span>
        )}
        <input id={fieldId} className={cn(controlBase, icon ? 'ps-11' : undefined, className)} {...props} />
      </div>
    </div>
  );
}

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hideLabel?: boolean;
  icon?: ReactNode;
  children: ReactNode;
};

export function SelectField({
  label,
  hideLabel,
  icon,
  id,
  className,
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="min-w-0 text-start">
      {hideLabel ? (
        <label htmlFor={fieldId} className="sr-only">
          {label}
        </label>
      ) : (
        <Label htmlFor={fieldId}>{label}</Label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-neutral-400">
            {icon}
          </span>
        )}
        <select
          id={fieldId}
          className={cn(controlBase, 'appearance-none pe-9', icon ? 'ps-11' : undefined, className)}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-neutral-400">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
