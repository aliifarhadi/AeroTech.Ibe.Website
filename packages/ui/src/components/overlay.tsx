'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal as AriaModal,
  ModalOverlay,
  Popover as AriaPopover,
  type ModalOverlayProps,
  type PopoverProps as AriaPopoverProps,
} from 'react-aria-components';
import { IconButton } from './button';
import { Icon } from './icon';

export { DialogTrigger };

/** True from the `md` breakpoint up (701px). Starts as `true` so the server render matches desktop. */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 701px)');
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return desktop;
}

const panel = 'border border-strong-line bg-surface-2 shadow-overlay outline-none';

/* ---------- Popover ---------- */

export type PopoverProps = Omit<AriaPopoverProps, 'children' | 'className'> & {
  'aria-label': string;
  children: ReactNode;
  className?: string;
};

export function Popover({ children, className, 'aria-label': ariaLabel, ...props }: PopoverProps) {
  return (
    <AriaPopover
      offset={8}
      {...props}
      className={['overflow-y-auto rounded-card p-4 data-entering:animate-pop-in', panel, className]
        .filter(Boolean)
        .join(' ')}
    >
      <AriaDialog aria-label={ariaLabel} className="outline-none">
        {children}
      </AriaDialog>
    </AriaPopover>
  );
}

/* ---------- Modal: centred dialog from md up, bottom sheet below ---------- */

export type ModalProps = Omit<ModalOverlayProps, 'children' | 'className'> & {
  title: string;
  /** Hide the visible title (it is still announced). */
  hideTitle?: boolean;
  closeLabel: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  size?: 'sm' | 'md';
};

export function Modal({
  title,
  hideTitle,
  closeLabel,
  children,
  size = 'sm',
  ...props
}: ModalProps) {
  return (
    <ModalOverlay
      isDismissable
      {...props}
      className="fixed inset-0 z-(--z-sheet) flex items-end justify-center bg-scrim data-entering:animate-fade-in md:items-center md:p-4"
    >
      <AriaModal
        className={[
          'max-h-(--sheet-max) w-full overflow-auto rounded-t-card border-b-0 data-entering:animate-sheet-in',
          'md:rounded-card md:border-b md:data-entering:animate-pop-in',
          size === 'sm' ? 'md:max-w-md' : 'md:max-w-2xl',
          panel,
        ].join(' ')}
      >
        <AriaDialog className="flex flex-col gap-4 p-4 pb-6 outline-none md:p-6">
          {({ close }) => (
            <>
              <div className="flex items-center justify-between gap-3">
                <Heading
                  slot="title"
                  className={hideTitle ? 'sr-only' : 'text-title font-bold text-strong'}
                >
                  {title}
                </Heading>
                <IconButton
                  aria-label={closeLabel}
                  variant="soft"
                  onPress={close}
                  className="ms-auto"
                >
                  <Icon name="close" size={18} />
                </IconButton>
              </div>
              {typeof children === 'function' ? children(close) : children}
            </>
          )}
        </AriaDialog>
      </AriaModal>
    </ModalOverlay>
  );
}

/* ---------- ResponsiveOverlay: popover on desktop, sheet on phones ---------- */

export type ResponsiveOverlayProps = {
  title: string;
  closeLabel: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  /** Popover width class on desktop, for example `w-95`. */
  className?: string;
  placement?: AriaPopoverProps['placement'];
  /** Set to false to keep the popover on its preferred side; it then shrinks and scrolls instead of flipping. */
  shouldFlip?: boolean;
  triggerRef?: AriaPopoverProps['triggerRef'];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ResponsiveOverlay({
  title,
  closeLabel,
  children,
  className,
  placement = 'bottom start',
  ...props
}: ResponsiveOverlayProps) {
  const desktop = useIsDesktop();
  if (!desktop) {
    return (
      <Modal
        title={title}
        closeLabel={closeLabel}
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
      >
        {children}
      </Modal>
    );
  }
  return (
    <AriaPopover
      offset={8}
      placement={placement}
      {...props}
      className={['overflow-y-auto rounded-card p-4 data-entering:animate-pop-in', panel, className]
        .filter(Boolean)
        .join(' ')}
    >
      <AriaDialog aria-label={title} className="outline-none">
        {({ close }) => (typeof children === 'function' ? children(close) : children)}
      </AriaDialog>
    </AriaPopover>
  );
}
