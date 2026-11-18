'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { NavigationLink } from '@/types/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { NavDropdown } from './nav-dropdown';

interface DesktopNavLinksProps {
  headerLinks: NavigationLink[];
}

export const DesktopNavLinks = ({ headerLinks }: DesktopNavLinksProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, openAuthModalWithAction } = useAuth();
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const isActive = (url: string): boolean => {
    if (url === '/') return pathname === '/';
    return pathname.startsWith(url.replace(/\/$/, ''));
  };

  const handleCreditCardsClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    if (!isAuthenticated) {
      openAuthModalWithAction({
        type: 'navigate_to_offer',
        href: '/credit-cards',
      });
      return;
    }
    router.push('/credit-cards');
  };

  const renderLink = (link: NavigationLink) => {
    if (link.children && link.children.length > 0) {
      return (
        <NavDropdown
          key={link.id}
          link={link}
          isOpen={openDropdownId === link.id}
          onOpen={() => setOpenDropdownId(link.id)}
          onClose={() => {
            setOpenDropdownId((currentId) => (currentId === link.id ? null : currentId));
          }}
        />
      );
    }

    const isCreditCards = link.url === '/credit-cards';

    return (
      <Link
        key={link.id}
        href={link.url}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        onClick={isCreditCards ? handleCreditCardsClick : undefined}
        className={cn(
          'text-sm font-medium transition-colors duration-200',
          isActive(link.url) ? 'text-wc-blue-600' : 'text-gray-700 hover:text-wc-blue-600'
        )}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <nav className="hidden lg:flex items-center justify-center gap-8" aria-label="Main navigation">
      {headerLinks.map(renderLink)}
    </nav>
  );
};
