import type { MediaEntityType } from "./upload";

export const MEDIA_LIMITS: Record<MediaEntityType, number> = {
  USER: 0,
  PROPERTY: 5,
  DEMAND: 2,
  PAYMENT: 2,
  ASSESSMENT: 5,
  DISPUTE: 3,
};

export function getMediaLimit(entityType: MediaEntityType): number {
  return MEDIA_LIMITS[entityType] ?? 5;
}
