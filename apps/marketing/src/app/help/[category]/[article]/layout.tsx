import Link from "next/link";

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word, i) => (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export default async function ArticleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ category: string; article: string }>;
}>) {
  const { category, article } = await params;
  const categoryName = formatSlug(category);
  const articleName = formatSlug(article);

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="border-b border-aivo-navy-100 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-3">
          <ol className="flex items-center gap-1.5 text-sm">
            <li>
              <Link
                href="/help"
                className="text-aivo-navy-600 transition-colors hover:text-aivo-purple-600"
              >
                Help Center
              </Link>
            </li>
            <li aria-hidden="true" className="text-aivo-navy-400">
              ›
            </li>
            <li>
              <Link
                href={`/help#${category}`}
                className="text-aivo-navy-600 transition-colors hover:text-aivo-purple-600"
              >
                {categoryName}
              </Link>
            </li>
            <li aria-hidden="true" className="text-aivo-navy-400">
              ›
            </li>
            <li>
              <span className="font-medium text-aivo-navy-800">
                {articleName}
              </span>
            </li>
          </ol>
        </div>
      </nav>
      {children}
    </>
  );
}
