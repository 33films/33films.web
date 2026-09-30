export interface Service {
  id:
    | "film_production"
    | "commercials"
    | "music_videos"
    | "brand_content"
    | "post_production"
    | "visual_development";
  number: string;
  title: string;
  description: string;
  image: string;
}

export const services: Service[] = [
  {
    id: "film_production",
    number: "01",
    title: "FILM PRODUCTION",
    description: "From concept to final cut. Narrative films, documentaries, and cinematic content.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
  },
  {
    id: "commercials",
    number: "02",
    title: "COMMERCIALS",
    description: "Brand films and advertising with cinematic sensibility and editorial precision.",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
  },
  {
    id: "music_videos",
    number: "03",
    title: "MUSIC VIDEOS",
    description: "Visual interpretations of sound. Music videos that feel like short films.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  },
  {
    id: "brand_content",
    number: "04",
    title: "BRAND CONTENT",
    description: "Long-form visual content for brands that value craft over convention.",
    image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&q=80",
  },
  {
    id: "post_production",
    number: "05",
    title: "POST-PRODUCTION",
    description: "Color grading, editing, and finishing with a cinematic eye.",
    image: "https://images.unsplash.com/photo-1598899134739-24a46f410c6d?w=800&q=80",
  },
  {
    id: "visual_development",
    number: "06",
    title: "VISUAL DEVELOPMENT",
    description: "Creative direction, mood boards, and visual language for ambitious projects.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
];

export const processSteps = [
  {
    id: "concept" as const,
    number: "01",
    title: "CONCEPT",
    description: "Ideas take shape. We define the visual language.",
  },
  {
    id: "development" as const,
    number: "02",
    title: "DEVELOPMENT",
    description: "Scripts, treatments, and creative direction.",
  },
  {
    id: "production" as const,
    number: "03",
    title: "PRODUCTION",
    description: "On set. Capturing the image with intention.",
  },
  {
    id: "post" as const,
    number: "04",
    title: "POST",
    description: "Editing, color, sound. Crafting the final piece.",
  },
  {
    id: "delivery" as const,
    number: "05",
    title: "DELIVERY",
    description: "Final masters and formats. Ready to release.",
  },
];
