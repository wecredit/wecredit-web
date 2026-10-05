import type { MEDIA_OUTLETS } from '@/lib/constants/media';

export interface MediaLogoProps {
  outlet: (typeof MEDIA_OUTLETS)[number];
}
