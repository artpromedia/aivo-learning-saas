import Link from "next/link";

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-aivo-navy-100 bg-white">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <img
              src="/logos/aivo-logo-horizontal-purple.svg"
              alt="AIVO Learning"
              width={120}
              height={48}
              className="h-10 w-auto"
            />
          </Link>
          <p className="text-sm text-aivo-navy-500">
            Questions?{" "}
            <a href="tel:+17639005372" className="font-medium text-aivo-purple-600 hover:underline">
              +1 (763) 900-5372
            </a>
          </p>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-aivo-navy-100 bg-white py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-6 px-4 text-xs text-aivo-navy-400">
          <Link href="/legal/privacy" className="hover:text-aivo-navy-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/legal/terms" className="hover:text-aivo-navy-600 transition-colors">
            Terms of Service
          </Link>
          <span>&copy; {new Date().getFullYear()} AIVO Learning</span>
        </div>
      </footer>
    </div>
  );
}
