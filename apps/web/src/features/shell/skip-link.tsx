/** First focusable element on every page: jumps past the header to the content. */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-(--z-toast) focus-visible:rounded-control focus-visible:bg-action focus-visible:px-4 focus-visible:py-2 focus-visible:font-bold focus-visible:text-on-action"
    >
      {label}
    </a>
  );
}
