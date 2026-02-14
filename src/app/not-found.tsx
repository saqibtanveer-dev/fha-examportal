import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-muted-foreground sm:text-6xl">404</h1>
      <p className="text-lg text-muted-foreground">Page not found</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go Home
      </Link>
    </div>
  );
}
