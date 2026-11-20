'use client';

/**
 * Shared FAQ Section Component
 * Displays frequently asked questions using accordion UI
 * Used across multiple pages (home, personal loan, etc.)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { STANDARD_FAQS, type FaqItem } from '@/lib/constants/faqs';
import { cn } from '@/lib/utils';

/** Props for FaqAccordionItem component */
interface FaqAccordionItemProps {
	item: FaqItem;
	isExpanded: boolean;
	onToggle: () => void;
	index: number;
}

interface FaqSectionProps {
	items?: FaqItem[];
	showTitle?: boolean;
	className?: string;
	listClassName?: string;
}

/**
 * Single FAQ accordion item with expand/collapse animation
 */
const FaqAccordionItem = ({
	item,
	isExpanded,
	onToggle,
	index,
}: FaqAccordionItemProps): React.ReactNode => {
	return (
		<motion.div
			className="overflow-hidden bg-blue-200/20 rounded-sm"
			initial={{ opacity: 0, y: 10 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
		>
			<button
				type="button"
				onClick={onToggle}
				className="w-full px-4 sm:px-5 py-2 flex items-center justify-between text-left hover:bg-blue-50 transition-colors"
				aria-expanded={isExpanded}
			>
				<span className="text-sm sm:text-[14px] pr-4 text-black-500">
					{item.question}
				</span>
				<ChevronDown
					className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
						}`}
				/>
			</button>
			{/* Answer stays mounted (crawlable) and animates open/closed via height */}
			<motion.div
				initial={false}
				animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
				transition={{ duration: 0.3, ease: 'easeInOut' }}
				className="overflow-hidden"
				aria-hidden={!isExpanded}
			>
				<div className="px-4 sm:px-5 pb-4 pt-1">
					<p className="text-sm text-black-600 leading-relaxed whitespace-pre-line">
						{item.answer}
						{item.link && (
							<a
								href={item.link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 underline"
							>
								{item.link.label}
							</a>
						)}
					</p>
				</div>
			</motion.div>
		</motion.div>
	);
};

/**
 * Frequently Asked Questions section with accordion
 * Displays common questions about personal loans
 */
const FaqSection = ({
	items = STANDARD_FAQS,
	showTitle = true,
	className,
	listClassName,
}: FaqSectionProps): React.ReactNode => {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const handleToggle = (id: string): void => {
		setExpandedId((prev) => (prev === id ? null : id));
	};

	return (
		<section className={cn('bg-white wc-section-gap px-4', className)}>
			{/* Section Title */}
			{showTitle && (
				<motion.h2
					className="wc-section-heading text-gray-900"
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
				>
					Frequently Asked Questions
				</motion.h2>
			)}

			{/* FAQ Accordion */}
			<div className={cn('max-w-6xl mx-auto space-y-1', listClassName)}>
				{items.map((item, index) => (
					<FaqAccordionItem
						key={item.id}
						item={item}
						isExpanded={expandedId === item.id}
						onToggle={() => handleToggle(item.id)}
						index={index}
					/>
				))}
			</div>
		</section>
	);
};

export default FaqSection;
