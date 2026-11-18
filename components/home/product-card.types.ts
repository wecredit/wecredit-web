import type { LucideIcon } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  imagePath?: string;
  /** When true, unauthenticated users must log in before navigating to href */
  requiresAuth?: boolean;
}
