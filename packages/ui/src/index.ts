/**
 * Design system entry point. Components land here in Phase 2 (see 06_design_system_components.md).
 * All components must be built with CSS logical properties and verified in both LTR and RTL.
 */

/** Tiny class-name combiner used by components. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
