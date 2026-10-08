import Image from 'next/image';

/** Logo and wordmark. The image is decorative because the name is written beside it. */
export function Brand({
  name,
  href,
  className,
}: {
  name: string;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={[
        'flex min-h-11 items-center gap-2 text-field font-bold whitespace-nowrap text-strong',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Image src="/brand/logo.png" alt="" width={28} height={28} priority />
      {name}
    </a>
  );
}
