export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  authorRole: string;
  category: string;
  excerpt: string;
  readingTime: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "introducing-aivo",
    title: "Introducing AIVO: AI-Native Adaptive Learning",
    date: "2025-01-15",
    author: "AIVO Team",
    authorRole: "Product",
    category: "Product",
    excerpt:
      "Today we're launching AIVO Learning — a platform built from the ground up with AI at its core, not bolted on as an afterthought.",
    readingTime: "5 min read",
    content: `
## A New Era of Personalized Education

For too long, educational technology has treated AI as a feature to bolt onto existing platforms. AIVO takes a fundamentally different approach: our platform is AI-native, meaning every interaction, every lesson, and every assessment is powered by our Brain Clone AI technology.

### What is Brain Clone AI?

Brain Clone AI creates a digital twin of each student's learning profile. This isn't a simple quiz that assigns you to "visual learner" or "auditory learner." It's a sophisticated model that understands:

- **Learning pace** — How quickly a student absorbs new concepts
- **Knowledge gaps** — Specific areas where understanding breaks down
- **Engagement patterns** — What keeps each student motivated and focused
- **Accommodation needs** — IEP goals, functioning levels, and required supports

### Five Specialized AI Tutors

Every student gets access to five AI tutors, each with a unique personality and teaching approach:

1. **Nova** — Mathematics through cosmic exploration
2. **Sage** — English Language Arts through storytelling
3. **Spark** — Science through hands-on experiments
4. **Chrono** — History through time-travel adventures
5. **Pixel** — Coding through pair-programming

### Built for Every Learner

AIVO isn't just for students who are "behind." Our platform adapts to every functioning level — from students with significant cognitive disabilities to gifted learners who need acceleration. The Brain Clone ensures that every student gets exactly the right challenge at exactly the right time.

### What's Next

We're currently in pilot programs with 150+ students across multiple districts, and the early results are remarkable: a 31% improvement in reading scores for students with IEPs. We're just getting started.

[Get started with AIVO today →](/get-started)
    `.trim(),
  },
  {
    slug: "how-brain-clone-works",
    title:
      "How the Learner Brain Works: Inside AIVO's Clone Architecture",
    date: "2025-01-22",
    author: "AIVO Engineering",
    authorRole: "Engineering",
    category: "Engineering",
    excerpt:
      "A deep dive into the technical architecture behind Brain Clone AI — how we build and maintain a unique learning profile for every student.",
    readingTime: "8 min read",
    content: `
## The Architecture Behind Personalized Learning

At the heart of AIVO is the Brain Clone — a continuously evolving model of each student's learning profile. In this post, we'll pull back the curtain on how it works.

### The Assessment Pipeline

When a new student joins AIVO, they go through a multi-stage assessment:

1. **Parent questionnaire** — Background information, learning history, and IEP details
2. **Adaptive baseline test** — A dynamic assessment that adjusts difficulty in real-time
3. **IEP document parsing** — Our AI extracts goals, accommodations, and benchmarks from uploaded IEP documents

### Building the Brain Clone

The Brain Clone is not a single model — it's a composite of multiple specialized models:

- **Knowledge Graph** — Maps what the student knows and doesn't know across every topic
- **Engagement Model** — Predicts what types of content will keep the student engaged
- **Pace Model** — Determines optimal lesson length and difficulty progression
- **Accommodation Engine** — Applies IEP accommodations automatically to all content

### Continuous Learning

The Brain Clone updates after every interaction. Completed a lesson? The knowledge graph updates. Struggled with a quiz question? The accommodation engine adjusts. Spent extra time on a topic? The pace model recalibrates.

### Privacy by Design

Every Brain Clone is encrypted at rest and in transit. Parents have full visibility into their child's data and can export or delete it at any time. We're FERPA, COPPA, and SOC 2 Type II compliant.

### The Results

In our pilot programs, Brain Clone-powered personalization has delivered:

- **31% improvement** in reading scores for students with IEPs
- **2.3x more engagement** compared to traditional adaptive platforms
- **6+ hours saved** per teacher per week in differentiation and reporting

[Learn more about AIVO's approach →](/about)
    `.trim(),
  },
  {
    slug: "no-learner-left-behind",
    title: "No Learner Left Behind: Supporting All Functioning Levels",
    date: "2025-02-05",
    author: "AIVO Education Team",
    authorRole: "Education",
    category: "Education",
    excerpt:
      "How AIVO's inclusive design ensures every student — regardless of disability, learning difference, or functioning level — gets the support they need.",
    readingTime: "6 min read",
    content: `
## Education That Adapts to Every Student

"No Learner Left Behind" isn't just our tagline — it's our engineering principle. Every feature in AIVO is designed to work for students across all functioning levels.

### What We Mean by "All Functioning Levels"

AIVO supports students across the full spectrum of learning needs:

- **Students with IEPs** — Automatic goal alignment, progress tracking, and accommodation delivery
- **Students with ADHD** — Engagement-optimized sessions, break reminders, and focus tools
- **Students with autism** — Predictable routines, visual supports, and sensory-friendly interfaces
- **Students with dyslexia** — Text-to-speech, adjustable fonts, and multi-modal content
- **Gifted students** — Accelerated paths, enrichment challenges, and depth over breadth
- **English Language Learners** — Bilingual support, vocabulary scaffolding, and cultural context

### How IEP Integration Works

1. **Upload** — Parents or teachers upload the student's IEP document
2. **Parse** — Our AI extracts goals, accommodations, and benchmarks
3. **Align** — Every lesson and assessment automatically aligns to IEP goals
4. **Track** — Progress toward each goal is tracked and reported in real-time
5. **Report** — Generate IEP-compliant progress reports for team meetings

### Accessibility First

AIVO is built to WCAG AA standards:

- Full keyboard navigation
- Screen reader compatibility
- Adjustable text size and contrast
- Reduced motion options
- Alternative text for all visual content
- Closed captions for all audio/video

### Real Results

In our pilot program at Riverside USD, students with IEPs using AIVO showed a 31% improvement in reading scores over one semester. Teachers reported saving 6+ hours per week on differentiation and IEP documentation.

[Start your child's personalized learning journey →](/get-started)
    `.trim(),
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  if (category === "All") return blogPosts;
  return blogPosts.filter((p) => p.category === category);
}

export const blogCategories = [
  "All",
  "Product",
  "Engineering",
  "Education",
  "Research",
];
