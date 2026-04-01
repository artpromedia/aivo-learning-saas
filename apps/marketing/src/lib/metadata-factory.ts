import type { Metadata } from "next";

const SITE_URL = "https://aivolearning.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface PageMetadataConfig {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function createPageMetadata(config: PageMetadataConfig): Metadata {
  const canonicalUrl = `${SITE_URL}${config.path}`;

  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-US": canonicalUrl,
        "es-ES": `${SITE_URL}/es${config.path}`,
      },
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonicalUrl,
      siteName: "AIVO Learning",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: config.ogImage ?? DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [config.ogImage ?? DEFAULT_OG_IMAGE],
    },
    robots: config.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
