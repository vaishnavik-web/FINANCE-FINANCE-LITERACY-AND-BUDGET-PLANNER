import type { Announcement, FAQItem, TaxSlabConfig } from '../types/finance';

export interface GlossaryTerm {
  id: string;
  term: string;
  shortDef: string;
  category: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'g-emi',
    term: 'EMI (Equated Monthly Installment)',
    shortDef: 'Fixed monthly payment combining principal and interest made to a lender to repay a loan over a chosen tenure.',
    category: 'Loans & Credit'
  },
  {
    id: 'g-sip',
    term: 'SIP (Systematic Investment Plan)',
    shortDef: 'Method of investing a fixed sum at regular intervals (usually monthly) into a mutual fund scheme.',
    category: 'Investment'
  },
  {
    id: 'g-cagr',
    term: 'CAGR (Compound Annual Growth Rate)',
    shortDef: 'Smoothed annualized rate of return of an investment over a period longer than one year.',
    category: 'Investment'
  },
  {
    id: 'g-xirr',
    term: 'XIRR (Extended Internal Rate of Return)',
    shortDef: 'Annualized return calculation used when cash flows (investments or withdrawals) occur on irregular dates, such as SIPs.',
    category: 'Investment'
  },
  {
    id: 'g-emergency-fund',
    term: 'Emergency Fund',
    shortDef: 'Liquid cash reserve equal to 3–6 months of essential household expenses kept in a savings account or liquid fund for unexpected crises.',
    category: 'Saving & Budgeting'
  },
  {
    id: 'g-upi',
    term: 'UPI (Unified Payments Interface)',
    shortDef: 'Instant real-time payment system developed by NPCI enabling bank-to-bank transfers via mobile apps.',
    category: 'Digital Banking'
  },
  {
    id: 'g-tds',
    term: 'TDS (Tax Deducted at Source)',
    shortDef: 'Mechanism where a payer deducts income tax at the time of making specified payments (salary, FD interest, rent) and remits it to the government.',
    category: 'Taxation'
  },
  {
    id: 'g-hra',
    term: 'HRA (House Rent Allowance)',
    shortDef: 'Salary component provided by employers to meet rented accommodation costs; partially exempt under the Old Tax Regime.',
    category: 'Taxation'
  },
  {
    id: 'g-cibil',
    term: 'Credit Score (CIBIL / Experian)',
    shortDef: 'Three-digit score (300–900) summarizing credit repayment history; scores above 750 generally help secure lower loan rates.',
    category: 'Loans & Credit'
  },
  {
    id: 'g-inflation',
    term: 'Inflation',
    shortDef: 'General rise in prices over time that reduces the purchasing power of each rupee you hold.',
    category: 'Basic Finance'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Budgeting',
    question: 'What is the 50/30/20 household budgeting guideline?',
    answer: 'It suggests allocating roughly 50% of take-home income to essential Needs (rent, groceries, utilities, school fees), 30% to Wants (dining out, entertainment, discretionary shopping), and at least 20% to Savings and debt repayment.'
  },
  {
    id: 'faq-2',
    category: 'Calculators',
    question: 'Are SIP and Mutual Fund calculator results guaranteed?',
    answer: 'No. Market-linked investments do not offer fixed or guaranteed returns. Calculator outputs are mathematical illustrations based on your assumed annual rate of return.'
  },
  {
    id: 'faq-3',
    category: 'Government Schemes',
    question: 'How often should I verify government scheme eligibility and deadlines?',
    answer: 'Always check the official portal linked on each scheme card (such as myscheme.gov.in, nsiindia.gov.in, or scholarships.gov.in) before applying, as small savings interest rates and scholarship deadlines update periodically.'
  },
  {
    id: 'faq-4',
    category: 'Offline & Sync',
    question: 'Can I record expenses and use calculators without an internet connection?',
    answer: 'Yes. This Progressive Web App caches calculators, learning modules, and your dashboard locally. Transactions added offline are marked as Unsynced and automatically sync once connectivity returns.'
  },
  {
    id: 'faq-5',
    category: 'Taxation',
    question: 'What is the difference between Old and New Income Tax Regimes in India?',
    answer: 'The New Regime offers lower slab rates and a ₹75,000 standard deduction for salaried individuals but removes most Chapter VI-A deductions (80C, 80D, HRA). The Old Regime retains exemptions and deductions with higher base slab rates.'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'FY 2025-26 / AY 2026-27 Tax Estimator Rules Active',
    message: 'Tax calculators use configurable Indian Income Tax slab assumptions including ₹75,000 standard deduction under the New Regime. You can adjust tax assumptions inside the Tax Calculator settings.',
    publishedAt: '2026-10-20',
    sourceUrl: 'https://www.incometax.gov.in/'
  },
  {
    id: 'ann-2',
    title: 'Small Savings & Welfare Scheme Verification',
    message: 'Scheme records in the directory display last-verified dates and direct links to official portals including myscheme.gov.in and nsiindia.gov.in.',
    publishedAt: '2026-10-15',
    sourceUrl: 'https://www.myscheme.gov.in/'
  }
];

export const DEFAULT_TAX_CONFIG: TaxSlabConfig = {
  financialYear: 'FY 2025-26',
  assessmentYear: 'AY 2026-27',
  newRegimeStandardDeduction: 75000,
  oldRegimeStandardDeduction: 50000,
  newRegimeRebateLimit: 1200000, // Resident individual taxable income limit for 87A rebate under updated regime rules (configurable)
  oldRegimeRebateLimit: 500000,
  cessRatePercent: 4,
  newRegimeSlabs: [
    { upto: 400000, rate: 0 },
    { upto: 800000, rate: 5 },
    { upto: 1200000, rate: 10 },
    { upto: 1600000, rate: 15 },
    { upto: 2000000, rate: 20 },
    { upto: 2400000, rate: 25 },
    { upto: null, rate: 30 }
  ],
  oldRegimeSlabs: [
    { upto: 250000, rate: 0 },
    { upto: 500000, rate: 5 },
    { upto: 1000000, rate: 20 },
    { upto: null, rate: 30 }
  ]
};
