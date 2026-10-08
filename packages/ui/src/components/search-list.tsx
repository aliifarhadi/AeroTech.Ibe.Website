'use client';

import type { ReactNode } from 'react';
import {
  Autocomplete,
  Input,
  ListBox,
  ListBoxItem,
  SearchField,
  useFilter,
  type Key,
} from 'react-aria-components';

export type SearchListItem = {
  id: string;
  title: string;
  description?: string;
  /** Short code shown at the end of the row (for example an airport code). */
  code?: string;
  /** Extra text matched by the filter but not shown (other spellings, codes). */
  keywords?: string;
  icon?: ReactNode;
};

export type SearchListProps = {
  'aria-label': string;
  placeholder: string;
  emptyMessage: string;
  items: SearchListItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  autoFocus?: boolean;
};

/** A filter field over a list of options: the pattern behind the origin and destination pickers. */
export function SearchList({
  placeholder,
  emptyMessage,
  items,
  selectedId,
  onSelect,
  autoFocus,
  'aria-label': ariaLabel,
}: SearchListProps) {
  const { contains } = useFilter({ sensitivity: 'base' });
  return (
    <Autocomplete filter={contains}>
      <SearchField aria-label={ariaLabel} autoFocus={autoFocus} className="block">
        <Input
          placeholder={placeholder}
          className="h-12 w-full rounded-control border border-strong-line bg-canvas px-4 text-body text-default outline-none placeholder:text-faint data-focused:border-action"
        />
      </SearchField>
      <ListBox
        aria-label={ariaLabel}
        items={items}
        selectionMode="single"
        selectedKeys={selectedId ? [selectedId] : []}
        onAction={(key: Key) => onSelect(String(key))}
        renderEmptyState={() => <p className="px-3 py-5 text-small text-muted">{emptyMessage}</p>}
        className="mt-2 flex max-h-80 flex-col overflow-auto outline-none"
      >
        {(item) => (
          <ListBoxItem
            id={item.id}
            textValue={[item.title, item.code, item.keywords].filter(Boolean).join(' ')}
            className="flex min-h-14 cursor-pointer items-center gap-3 rounded-control px-3 py-1.5 outline-none data-focused:bg-surface-hover data-hovered:bg-surface-hover data-selected:bg-action-soft"
          >
            {item.icon ? (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-hover text-muted">
                {item.icon}
              </span>
            ) : null}
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-body font-bold text-default">{item.title}</span>
              {item.description ? (
                <span className="truncate text-caption text-muted">{item.description}</span>
              ) : null}
            </span>
            {item.code ? (
              <span dir="ltr" className="ms-auto shrink-0 font-mono text-caption text-muted">
                {item.code}
              </span>
            ) : null}
          </ListBoxItem>
        )}
      </ListBox>
    </Autocomplete>
  );
}
