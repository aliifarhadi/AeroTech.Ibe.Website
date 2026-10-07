import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-neutral-600">This page could not be found.</p>
      <Link href="/" className="mt-4 inline-block text-sm underline">
        Go home
      </Link>
    </main>
  );
}
