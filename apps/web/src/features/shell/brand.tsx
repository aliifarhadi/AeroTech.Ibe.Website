import Image from 'next/image';
import { Link } from '@/i18n/navigation';

/** Logo and wordmark, linking home. The image is decorative because the name is written beside it. */
export function Brand({ name, className }: { name: string; className?: string }) {
  return (
    <Link
      href="/"
      className={[
        'flex min-h-11 items-center gap-2 text-field font-bold whitespace-nowrap text-strong',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Image src="/brand/logo.png" alt="" width={28} height={28} priority />
      {name}
    </Link>
  );
}
