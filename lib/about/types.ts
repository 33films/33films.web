export type AboutMember = {
  id: string;
  name: string;
  role: string;
  photo_path: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AboutMemberPublic = AboutMember & {
  photo_url: string;
};

export type AboutSettings = {
  id: number;
  enabled: boolean;
  updated_at: string;
};

export const ABOUT_PHOTO_BUCKET = "about-photos";
