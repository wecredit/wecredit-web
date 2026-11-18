import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { MouseEvent } from 'react';
import type { NavigationLink } from '@/types/navigation';
import { useAuth } from '@/hooks/use-auth';

/** Props for MenuLink component */
interface MenuLinkProps {
    link: NavigationLink;
    onNavigate: () => void;
}

/**
 * Individual menu link with optional children expansion
 */
export const MenuLink = ({ link, onNavigate }: MenuLinkProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();
    const { isAuthenticated, openAuthModalWithAction } = useAuth();
    const hasChildren = link.children && link.children.length > 0;

    const handleCreditCardsClick = (event: MouseEvent<HTMLAnchorElement>): void => {
        event.preventDefault();
        onNavigate();
        if (!isAuthenticated) {
            openAuthModalWithAction({
                type: 'navigate_to_offer',
                href: '/credit-cards',
            });
            return;
        }
        router.push('/credit-cards');
    };

    if (hasChildren) {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex w-full items-center justify-between px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
                >
                    <span>{link.label}</span>
                    <motion.svg
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                </button>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 mt-1 space-y-1 overflow-hidden"
                        >
                            {link.children.map((child) => (
                                <li key={child.id}>
                                    <Link
                                        href={child.url}
                                        target={child.openInNewTab ? '_blank' : undefined}
                                        rel={child.openInNewTab ? 'noopener noreferrer' : undefined}
                                        className="block px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        onClick={onNavigate}
                                    >
                                        {child.label}
                                    </Link>
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    const isCreditCards = link.url === '/credit-cards';

    return (
        <Link
            href={link.url}
            target={link.openInNewTab ? '_blank' : undefined}
            rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
            className="block px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
            onClick={isCreditCards ? handleCreditCardsClick : onNavigate}
        >
            {link.label}
        </Link>
    );
};
