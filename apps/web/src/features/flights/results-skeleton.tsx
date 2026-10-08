import { Skeleton } from '@aerotech/ui';

/** Shown until the search in the address bar has been read. */
export function ResultsSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto flex max-w-page flex-col gap-3 px-gutter py-8">
      <Skeleton className="h-10 w-2/3 md:w-1/3" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}
