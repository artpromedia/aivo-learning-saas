const SITE_URL = "https://aivolearning.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AIVO Learning",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "AI-powered personalized learning platform for K-12 students.",
    sameAs: [
      "https://twitter.com/aivolearning",
      "https://linkedin.com/company/aivolearning",
      "https://facebook.com/aivolearning",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      email: "support@aivolearning.com",
      availableLanguage: ["English", "Spanish"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AIVO Learning",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AIVO Learning",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web, iOS, Android",
    description:
      "AI-powered personalized learning platform with Brain Clone™ technology, 5 specialized AI tutors, and real-time analytics for K-12 students.",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "19",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "500",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ArticleMeta {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
}

export function articleSchema(article: ArticleMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.imageUrl,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      "@type": "Person",
      name: article.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "AIVO Learning",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Returns props object suitable for rendering a <script type="application/ld+json"> tag.
 * Usage in JSX: <script {...toScriptProps(schema)} />
 */
export function toScriptProps(schema: Record<string, unknown>) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(schema) },
  };
}
