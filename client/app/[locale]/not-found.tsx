import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-brand-cream px-6 text-center">
      <span className="font-display text-8xl text-brand-maroon/20">404</span>
      <h1 className="mt-4 font-display text-2xl text-brand-maroon sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 text-base text-brand-ink/50">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-brand-maroon px-6 py-3 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_10px_25px_-8px_rgba(90,31,31,0.4)] transition-all duration-300 hover:scale-[1.02]"
      >
        Back to home
      </Link>
    </main>
  );
}
