export interface Project {
  slug: string;
  number: string;
  title: string;
  category: string;
  year: string;
  client: string;
  director: string;
  production: string;
  description: string;
  heroImage: string;
  heroVideo?: string;
  gallery: string[];
  additionalVideo?: string;
  layout: "large-left" | "large-right" | "small-left" | "small-right" | "text-only";
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "nocturnal-echo",
    number: "01",
    title: "NOCTURNAL ECHO",
    category: "COMMERCIAL",
    year: "2026",
    client: "Placeholder Brand",
    director: "Director Name",
    production: "33FILMS",
    description:
      "A visual study in light and shadow. Shot across three nights in Montevideo, this commercial explores the tension between urban silence and electric movement.",
    heroImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80",
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&q=80",
    ],
    layout: "large-left",
    featured: true,
  },
  {
    slug: "static-dreams",
    number: "02",
    title: "STATIC DREAMS",
    category: "MUSIC VIDEO",
    year: "2026",
    client: "Artist Placeholder",
    director: "Director Name",
    production: "33FILMS",
    description:
      "An intimate music video built on texture and repetition. Grain, silence, and the slow collapse of memory into image.",
    heroImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511379938545-c1f69419868d?w=1200&q=80",
      "https://images.unsplash.com/photo-1514320291840-75581a84c553?w=1200&q=80",
    ],
    layout: "small-right",
    featured: true,
  },
  {
    slug: "after-the-rain",
    number: "03",
    title: "AFTER THE RAIN",
    category: "SHORT FILM",
    year: "2026",
    client: "Independent",
    director: "Director Name",
    production: "33FILMS",
    description:
      "A short film about distance and return. Two characters, one city, and the quiet aftermath of everything unsaid.",
    heroImage: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
      "https://images.unsplash.com/photo-1446818290210-8bdda938bd5e?w=1200&q=80",
    ],
    layout: "large-right",
    featured: true,
  },
  {
    slug: "form-and-light",
    number: "04",
    title: "FORM & LIGHT",
    category: "BRAND FILM",
    year: "2025",
    client: "Placeholder Brand",
    director: "Director Name",
    production: "33FILMS",
    description:
      "A brand film focused on materiality and craft. Every frame designed to feel tactile, deliberate, and timeless.",
    heroImage: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1598899134739-24a46f410c6d?w=1200&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    ],
    layout: "small-left",
    featured: true,
  },
  {
    slug: "horizon-line",
    number: "05",
    title: "HORIZON LINE",
    category: "COMMERCIAL",
    year: "2025",
    client: "Placeholder Brand",
    director: "Director Name",
    production: "33FILMS",
    description:
      "Wide landscapes and human scale. A commercial that treats the horizon as both subject and metaphor.",
    heroImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    ],
    layout: "large-left",
  },
  {
    slug: "chamber",
    number: "06",
    title: "CHAMBER",
    category: "MUSIC VIDEO",
    year: "2025",
    client: "Artist Placeholder",
    director: "Director Name",
    production: "33FILMS",
    description:
      "Confined spaces, amplified emotion. A music video that turns architectural limitation into visual intensity.",
    heroImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1459749411175-04bf52929827?w=1200&q=80",
    ],
    layout: "small-right",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project | undefined {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return projects[0];
  return projects[(index + 1) % projects.length];
}
