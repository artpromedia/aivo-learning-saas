import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold text-aivo-purple-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-aivo-navy-800 mb-4">Page Not Found</h2>
      <p className="text-aivo-navy-400 mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-aivo-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
