import { getPortfolioPublicUrl } from "@/lib/portfolio/urls";
import { ABOUT_PHOTO_BUCKET, type AboutMember, type AboutMemberPublic } from "./types";

export function withAboutPhotoUrl(member: AboutMember): AboutMemberPublic {
  return {
    ...member,
    photo_url: getPortfolioPublicUrl(ABOUT_PHOTO_BUCKET, member.photo_path),
  };
}
