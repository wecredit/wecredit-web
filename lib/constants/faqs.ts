/**
 * Shared FAQ data used across all pages
 * These FAQs are consistent throughout the application
 */

export interface FaqItem {
	id: string;
	question: string;
	answer: string;
	/** Optional trailing link rendered after the answer text */
	link?: {
		href: string;
		label: string;
	};
}

/**
 * Standard FAQ items for personal loans
 * Used across home page, personal loan page, and other relevant pages
 */
export const STANDARD_FAQS: FaqItem[] = [
	{
		id: 'faq-1',
		question: 'What is a personal loan and how does it work?',
		answer:
			'A personal loan is an unsecured loan that can be used for any personal need. The approved amount is repaid in fixed monthly EMIs over a chosen tenure.',
	},
	{
		id: 'faq-2',
		question: 'What credit score is required for a personal loan?',
		answer:
			'Most lenders prefer a credit score of 720 or above, but some of our lenders may consider applications with a CIBIL score of around 700.',
	},
	{
		id: 'faq-3',
		question: 'How much personal loan amount can be availed?',
		answer:
			'The loan amount depends on income, credit profile, existing liabilities, and lender policy. On WeCredit, offers may range from ₹5,000 to ₹15 lakh.',
	},
	{
		id: 'faq-4',
		question: 'How are personal loan interest rates decided?',
		answer:
			'Interest rates are based on factors like credit score, income stability, loan amount, tenure, and the lender\'s internal policy.',
	},
	{
		id: 'faq-5',
		question: 'How long does personal loan approval and disbursal take?',
		answer:
			'Approval timelines vary by lender, but many personal loans are approved within minutes and disbursed shortly after verification.',
	},
	{
		id: 'faq-6',
		question: 'Does applying for a personal loan affect credit score?',
		answer:
			'Yes. Each application may result in a credit enquiry, which can slightly impact the credit score. Comparing offers on a single platform helps reduce multiple enquiries.',
	},
	{
		id: 'faq-7',
		question: 'Can a personal loan be repaid before tenure completion?',
		answer:
			'Yes, most lenders allow prepayment or foreclosure, but charges may apply depending on lender terms and loan duration.',
	},
	{
		id: 'faq-8',
		question: 'What happens if an EMI is missed?',
		answer:
			'Missing an EMI can attract late payment charges and negatively impact the credit score. Repeated delays may affect future loan eligibility.',
	},
];

/**
 * FAQ items for the credit cards page (Unity Bank Zero & Vibe)
 */
export const CREDIT_CARD_FAQS: FaqItem[] = [
	{
		id: 'cc-faq-1',
		question: "What's the difference between Unity Bank Zero and Vibe?",
		answer:
			'Zero starts at a ₹2,000 fixed deposit with no joining or annual fee. Vibe starts at ₹25,000 and offers lounge access, with a ₹249 joining fee plus applicable tax and no annual fee.',
	},
	{
		id: 'cc-faq-2',
		question: 'Do I need a fixed deposit for either card?',
		answer:
			'Yes. Both cards use a fixed deposit (FD) with Unity Small Finance Bank as security.',
	},
	{
		id: 'cc-faq-3',
		question: 'How is my credit limit decided?',
		answer:
			"Your credit limit can be up to 90% of the amount you deposit. Interest earned on the FD doesn't count toward the limit.",
	},
	{
		id: 'cc-faq-4',
		question: 'Can I use these RuPay cards for UPI payments?',
		answer:
			'Yes. Link your card to a supported UPI app to pay eligible merchants.',
	},
	{
		id: 'cc-faq-5',
		question: 'How do I apply for a credit card through WeCredit?',
		answer:
			"Choose a card and tap Apply Now. Follow the prompts to submit your details and complete the bank's verification.",
	},
	{
		id: 'cc-faq-6',
		question: 'Who approves my application and issues the card?',
		answer:
			'WeCredit helps you start your application. Unity Small Finance Bank decides whether to approve it and issues the card.',
	},
	{
		id: 'cc-faq-7',
		question: 'Will applying for a credit card affect my CIBIL score?',
		answer:
			'It can. If the bank makes a hard credit enquiry, it may have a small impact on your score.',
	},
	{
		id: 'cc-faq-8',
		question: 'What happens if I close my fixed deposit early?',
		answer:
			'Unity Bank can deduct unpaid card dues from the deposit before releasing the remaining amount. Closing the FD early can also reduce the interest you earn.',
	},
	{
		id: 'cc-faq-9',
		question: 'What happens if I pay only the minimum amount due?',
		answer:
			"Interest applies to the unpaid balance. You'll also lose the interest-free period on new purchases.",
	},
	{
		id: 'cc-faq-10',
		question: 'Where can I see the full fees and card terms?',
		answer:
			'Unity Bank lists fees, interest rates and payment terms in the Most Important Terms and Conditions (MITC) on its website. ',
		link: {
			href: 'https://cards.unity.bank.in/docs/credit-cards/mitc-key-fact-statement',
			label: "Read Unity Bank's MITC",
		},
	},
];
