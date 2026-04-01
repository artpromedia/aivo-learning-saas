module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/pricing",
        "http://localhost:3000/for-teachers",
        "http://localhost:3000/demo",
        "http://localhost:3000/get-started",
        "http://localhost:3000/faq",
        "http://localhost:3000/about",
      ],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
      },
    },
  },
};
