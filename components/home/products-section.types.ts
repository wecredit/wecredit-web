import type { LucideIcon } from 'lucide-react';

export interface HomeProduct {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  imagePath?: string;
  requiresAuth?: boolean;
}
