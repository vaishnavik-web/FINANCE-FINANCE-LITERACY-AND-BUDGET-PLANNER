export type CalculatorCategory =
  | 'Basic Financial'
  | 'Savings'
  | 'Investment Education'
  | 'Loan'
  | 'Tax & Government'
  | 'Household & Daily Finance';

export interface CalculatorField {
  key: string;
  label: string;
  type: 'number' | 'select' | 'text';
  defaultValue: number | string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string }[];
  helperText?: string;
}

export interface CalculatorDefinition {
  id: string;
  number: number;
  name: string;
  category: CalculatorCategory;
  shortDescription: string;
  formulaText: string;
  exampleText: string;
  isInvestmentEstimate?: boolean;
  isTaxConfigurable?: boolean;
  fields: CalculatorField[];
}

export const CALCULATOR_CATEGORIES: CalculatorCategory[] = [
  'Basic Financial',
  'Savings',
  'Investment Education',
  'Loan',
  'Tax & Government',
  'Household & Daily Finance'
];

export const CALCULATORS: CalculatorDefinition[] = [
  // A. BASIC FINANCIAL (1-10)
  {
    id: 'percentage',
    number: 1,
    name: 'Percentage Calculator',
    category: 'Basic Financial',
    shortDescription: 'Calculate X% of a base value, percentage share, or percentage change between two amounts.',
    formulaText: 'Value = (Base × Rate) / 100  |  % Change = ((New − Old) / Old) × 100',
    exampleText: '15% of ₹20,000 = (20,000 × 15) / 100 = ₹3,000.',
    fields: [
      { key: 'base', label: 'Base Amount (₹ or Value)', type: 'number', defaultValue: 20000, min: 0, unit: '₹' },
      { key: 'rate', label: 'Percentage (%)', type: 'number', defaultValue: 15, min: 0, max: 1000, step: 0.1, unit: '%' },
      { key: 'compareValue', label: 'Comparison / New Value (optional)', type: 'number', defaultValue: 23000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'simple-interest',
    number: 2,
    name: 'Simple Interest Calculator',
    category: 'Basic Financial',
    shortDescription: 'Compute simple interest and total maturity value over a fixed annual rate and tenure.',
    formulaText: 'SI = (P × R × T) / 100  |  Total Amount = P + SI',
    exampleText: 'For ₹50,000 at 8% p.a. for 3 years: SI = (50,000 × 8 × 3)/100 = ₹12,000; Total = ₹62,000.',
    fields: [
      { key: 'principal', label: 'Principal Amount (P)', type: 'number', defaultValue: 50000, min: 1, unit: '₹' },
      { key: 'rate', label: 'Annual Interest Rate (R)', type: 'number', defaultValue: 8, min: 0, max: 100, step: 0.1, unit: '%' },
      { key: 'years', label: 'Time Period (T in Years)', type: 'number', defaultValue: 3, min: 0.1, max: 100, step: 0.5, unit: 'yrs' }
    ]
  },
  {
    id: 'compound-interest',
    number: 3,
    name: 'Compound Interest Calculator',
    category: 'Basic Financial',
    shortDescription: 'Calculate compounded growth with annual, half-yearly, quarterly, or monthly compounding.',
    formulaText: 'A = P × (1 + r/n)^(n×t)  |  CI = A − P',
    exampleText: '₹1,00,000 at 8% compounded quarterly for 5 years grows to ₹1,48,595 (CI: ₹48,595).',
    fields: [
      { key: 'principal', label: 'Principal Amount (P)', type: 'number', defaultValue: 100000, min: 1, unit: '₹' },
      { key: 'rate', label: 'Annual Interest Rate (R)', type: 'number', defaultValue: 8, min: 0, max: 100, step: 0.1, unit: '%' },
      { key: 'years', label: 'Time Period (Years)', type: 'number', defaultValue: 5, min: 1, max: 60, unit: 'yrs' },
      {
        key: 'frequency',
        label: 'Compounding Frequency (n)',
        type: 'select',
        defaultValue: '4',
        options: [
          { label: 'Annually (1x)', value: '1' },
          { label: 'Half-Yearly (2x)', value: '2' },
          { label: 'Quarterly (4x)', value: '4' },
          { label: 'Monthly (12x)', value: '12' }
        ]
      }
    ]
  },
  {
    id: 'profit-loss',
    number: 4,
    name: 'Profit and Loss Calculator',
    category: 'Basic Financial',
    shortDescription: 'Find net profit or loss amount and margin percentage from cost price and selling price.',
    formulaText: 'Profit/Loss = SP − CP  |  Margin % = ((SP − CP) / CP) × 100',
    exampleText: 'Cost Price ₹8,000 and Selling Price ₹9,600 yields ₹1,600 profit (20% gain).',
    fields: [
      { key: 'costPrice', label: 'Cost Price (CP)', type: 'number', defaultValue: 8000, min: 1, unit: '₹' },
      { key: 'sellingPrice', label: 'Selling Price (SP)', type: 'number', defaultValue: 9600, min: 0, unit: '₹' },
      { key: 'quantity', label: 'Units / Quantity', type: 'number', defaultValue: 1, min: 1 }
    ]
  },
  {
    id: 'discount',
    number: 5,
    name: 'Discount Calculator',
    category: 'Basic Financial',
    shortDescription: 'Calculate sale price and savings after percentage discount and optional extra coupon.',
    formulaText: 'Discount = MRP × (d₁/100); After Extra Coupon = Price₁ × (1 − d₂/100)',
    exampleText: 'On ₹2,500 MRP with 20% off + 10% extra coupon: ₹2,500 → ₹2,000 → ₹1,800 final price.',
    fields: [
      { key: 'mrp', label: 'Marked Price (MRP)', type: 'number', defaultValue: 2500, min: 1, unit: '₹' },
      { key: 'discount1', label: 'Primary Discount (%)', type: 'number', defaultValue: 20, min: 0, max: 100, unit: '%' },
      { key: 'discount2', label: 'Extra Coupon Discount (%)', type: 'number', defaultValue: 10, min: 0, max: 100, unit: '%' }
    ]
  },
  {
    id: 'gst-basic',
    number: 6,
    name: 'GST Calculator',
    category: 'Basic Financial',
    shortDescription: 'Compute CGST, SGST, IGST, and final invoice total from taxable amount or GST-inclusive price.',
    formulaText: 'Exclusive: GST = Amount × Rate/100  |  Inclusive: Base = Total / (1 + Rate/100)',
    exampleText: '₹10,000 + 18% GST = ₹1,800 GST (₹900 CGST + ₹900 SGST), Total ₹11,800.',
    fields: [
      { key: 'amount', label: 'Amount (₹)', type: 'number', defaultValue: 10000, min: 1, unit: '₹' },
      {
        key: 'gstRate',
        label: 'GST Slab Rate (%)',
        type: 'select',
        defaultValue: '18',
        options: [
          { label: '5% (Essentials)', value: '5' },
          { label: '12% (Standard)', value: '12' },
          { label: '18% (Most Services/Goods)', value: '18' },
          { label: '28% (Luxury)', value: '28' }
        ]
      },
      {
        key: 'mode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'exclusive',
        options: [
          { label: 'Add GST (Exclusive)', value: 'exclusive' },
          { label: 'Extract GST (Inclusive)', value: 'inclusive' }
        ]
      }
    ]
  },
  {
    id: 'tax-percentage',
    number: 7,
    name: 'Tax Percentage Calculator',
    category: 'Basic Financial',
    shortDescription: 'Determine effective tax percentage and net after-tax amount on any income or bill.',
    formulaText: 'Effective Tax % = (Tax Paid / Gross Amount) × 100',
    exampleText: 'Paying ₹42,000 tax on ₹7,00,000 gross income equals a 6.00% effective tax rate.',
    fields: [
      { key: 'grossAmount', label: 'Gross Income / Base Amount', type: 'number', defaultValue: 700000, min: 1, unit: '₹' },
      { key: 'taxPaid', label: 'Total Tax Paid', type: 'number', defaultValue: 42000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'emi-basic',
    number: 8,
    name: 'EMI Calculator',
    category: 'Basic Financial',
    shortDescription: 'Standard monthly installment calculator for any loan principal, interest rate, and tenure.',
    formulaText: 'EMI = P × r × (1+r)^n / ((1+r)^n − 1), where r = R / (12 × 100)',
    exampleText: '₹3,00,000 at 10.5% p.a. for 36 months gives EMI ₹9,751/month (Total Interest ₹51,036).',
    fields: [
      { key: 'principal', label: 'Loan Amount (P)', type: 'number', defaultValue: 300000, min: 1000, unit: '₹' },
      { key: 'rate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 10.5, min: 0.1, max: 50, step: 0.1, unit: '%' },
      { key: 'months', label: 'Tenure (Months)', type: 'number', defaultValue: 36, min: 1, max: 480, unit: 'mo' }
    ]
  },
  {
    id: 'loan-repayment',
    number: 9,
    name: 'Loan Repayment Calculator',
    category: 'Basic Financial',
    shortDescription: 'Estimate how many months it takes to pay off a loan given your affordable monthly payment.',
    formulaText: 'n = −ln(1 − (P × r) / Payment) / ln(1 + r)',
    exampleText: 'Paying ₹8,000/month toward a ₹2,00,000 debt at 12% p.a. clears it in 29 months.',
    fields: [
      { key: 'balance', label: 'Current Loan Balance', type: 'number', defaultValue: 200000, min: 100, unit: '₹' },
      { key: 'rate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 12, min: 0, max: 60, step: 0.1, unit: '%' },
      { key: 'monthlyPayment', label: 'Monthly Payment You Can Afford', type: 'number', defaultValue: 8000, min: 100, unit: '₹' }
    ]
  },
  {
    id: 'inflation',
    number: 10,
    name: 'Inflation Calculator',
    category: 'Basic Financial',
    shortDescription: 'Calculate future cost of living and real purchasing power erosion due to inflation.',
    formulaText: 'Future Cost = Present Cost × (1 + i/100)^t  |  Purchasing Power = Cost / (1 + i/100)^t',
    exampleText: 'At 6% annual inflation, ₹50,000 monthly expenses require ₹89,542/month after 10 years.',
    fields: [
      { key: 'currentCost', label: 'Current Expense / Amount', type: 'number', defaultValue: 50000, min: 1, unit: '₹' },
      { key: 'inflationRate', label: 'Expected Annual Inflation (%)', type: 'number', defaultValue: 6, min: 0, max: 30, step: 0.1, unit: '%' },
      { key: 'years', label: 'Number of Years', type: 'number', defaultValue: 10, min: 1, max: 60, unit: 'yrs' }
    ]
  },

  // B. SAVINGS CALCULATORS (11-20)
  {
    id: 'monthly-savings',
    number: 11,
    name: 'Monthly Savings Calculator',
    category: 'Savings',
    shortDescription: 'Compute monthly surplus, savings rate %, and annual accumulation from income and expenses.',
    formulaText: 'Monthly Savings = Monthly Income − Monthly Expenses  |  Rate = (Savings / Income) × 100',
    exampleText: 'Income ₹45,000 minus expenses ₹32,000 yields ₹13,000 monthly savings (28.9% rate).',
    fields: [
      { key: 'income', label: 'Total Monthly Income', type: 'number', defaultValue: 45000, min: 1, unit: '₹' },
      { key: 'expenses', label: 'Total Monthly Expenses', type: 'number', defaultValue: 32000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'annual-savings',
    number: 12,
    name: 'Annual Savings Calculator',
    category: 'Savings',
    shortDescription: 'Project yearly net savings including annual bonuses and irregular yearly costs.',
    formulaText: 'Annual Savings = (Monthly Surplus × 12) + Annual Bonus − Annual Lump-Sum Expenses',
    exampleText: 'Saving ₹10,000/month + ₹25,000 bonus − ₹15,000 annual insurance = ₹1,30,000/year.',
    fields: [
      { key: 'monthlyIncome', label: 'Monthly Income', type: 'number', defaultValue: 40000, min: 0, unit: '₹' },
      { key: 'monthlyExpense', label: 'Monthly Regular Expenses', type: 'number', defaultValue: 30000, min: 0, unit: '₹' },
      { key: 'annualBonus', label: 'Annual Bonus / Extra Income', type: 'number', defaultValue: 25000, min: 0, unit: '₹' },
      { key: 'annualExpenses', label: 'Annual Irregular Expenses (Insurance/Fees)', type: 'number', defaultValue: 15000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'savings-goal',
    number: 13,
    name: 'Savings Goal Calculator',
    category: 'Savings',
    shortDescription: 'Find the monthly contribution required to reach a target goal by a chosen timeline.',
    formulaText: 'PMT = (Goal − Current × (1+r)^n) × r / ((1+r)^n − 1)',
    exampleText: 'To reach ₹1,50,000 in 24 months starting with ₹30,000 at 6% p.a., save ₹4,536/month.',
    fields: [
      { key: 'targetAmount', label: 'Goal Target Amount', type: 'number', defaultValue: 150000, min: 100, unit: '₹' },
      { key: 'currentSaved', label: 'Already Saved', type: 'number', defaultValue: 30000, min: 0, unit: '₹' },
      { key: 'months', label: 'Target Timeline (Months)', type: 'number', defaultValue: 24, min: 1, max: 600, unit: 'mo' },
      { key: 'annualRate', label: 'Expected Annual Interest (%)', type: 'number', defaultValue: 6, min: 0, max: 30, step: 0.1, unit: '%' }
    ]
  },
  {
    id: 'rd-calculator',
    number: 14,
    name: 'Recurring Deposit (RD) Calculator',
    category: 'Savings',
    shortDescription: 'Calculate bank/post office RD maturity value using standard quarterly compounding.',
    formulaText: 'M = Σ Monthly Deposit × (1 + R/400)^(4 × remaining_months / 12)',
    exampleText: '₹3,000/month RD at 7.0% p.a. for 36 months deposits ₹1,08,000 and earns ~₹12,265 interest.',
    fields: [
      { key: 'monthlyDeposit', label: 'Monthly RD Deposit', type: 'number', defaultValue: 3000, min: 100, unit: '₹' },
      { key: 'rate', label: 'Annual RD Rate (%)', type: 'number', defaultValue: 7.0, min: 0.1, max: 20, step: 0.1, unit: '%' },
      { key: 'months', label: 'Tenure (Months)', type: 'number', defaultValue: 36, min: 3, max: 120, unit: 'mo' }
    ]
  },
  {
    id: 'fd-calculator',
    number: 15,
    name: 'Fixed Deposit (FD) Calculator',
    category: 'Savings',
    shortDescription: 'Compute FD maturity amount and interest earned across bank compounding options.',
    formulaText: 'Maturity = P × (1 + R/(100×n))^(n×T)',
    exampleText: '₹1,00,000 FD at 7.25% p.a. compounded quarterly for 3 years matures at ₹1,24,055.',
    fields: [
      { key: 'principal', label: 'FD Deposit Amount', type: 'number', defaultValue: 100000, min: 500, unit: '₹' },
      { key: 'rate', label: 'Annual FD Interest Rate (%)', type: 'number', defaultValue: 7.25, min: 0.1, max: 20, step: 0.05, unit: '%' },
      { key: 'years', label: 'Tenure (Years)', type: 'number', defaultValue: 3, min: 0.25, max: 25, step: 0.25, unit: 'yrs' },
      {
        key: 'compounding',
        label: 'Compounding Frequency',
        type: 'select',
        defaultValue: '4',
        options: [
          { label: 'Quarterly (Standard Bank FD)', value: '4' },
          { label: 'Monthly', value: '12' },
          { label: 'Half-Yearly', value: '2' },
          { label: 'Annually', value: '1' }
        ]
      }
    ]
  },
  {
    id: 'emergency-fund',
    number: 16,
    name: 'Emergency Fund Calculator',
    category: 'Savings',
    shortDescription: 'Determine recommended 3–6+ month emergency reserve and time needed to build it.',
    formulaText: 'Target Fund = Essential Monthly Expenses × Coverage Months; Shortfall = Target − Current',
    exampleText: 'Essential expenses ₹22,000 × 6 months = ₹1,32,000 target reserve.',
    fields: [
      { key: 'essentialMonthly', label: 'Monthly Essential Expenses', type: 'number', defaultValue: 22000, min: 500, unit: '₹' },
      { key: 'coverageMonths', label: 'Recommended Months Buffer', type: 'number', defaultValue: 6, min: 1, max: 24, unit: 'mo' },
      { key: 'existingReserve', label: 'Current Emergency Cash', type: 'number', defaultValue: 40000, min: 0, unit: '₹' },
      { key: 'monthlyAddition', label: 'Monthly Contribution', type: 'number', defaultValue: 5000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'future-value',
    number: 17,
    name: 'Future Value Calculator',
    category: 'Savings',
    shortDescription: 'Project the future value of an initial amount plus regular monthly contributions.',
    formulaText: 'FV = PV(1+r)^n + PMT × [((1+r)^n − 1) / r]',
    exampleText: '₹50,000 today + ₹2,000/month at 8% p.a. for 10 years grows to ₹4,76,812.',
    fields: [
      { key: 'presentValue', label: 'Starting Amount (PV)', type: 'number', defaultValue: 50000, min: 0, unit: '₹' },
      { key: 'monthlyContribution', label: 'Monthly Deposit (PMT)', type: 'number', defaultValue: 2000, min: 0, unit: '₹' },
      { key: 'annualRate', label: 'Annual Rate (%)', type: 'number', defaultValue: 8, min: 0, max: 40, step: 0.1, unit: '%' },
      { key: 'years', label: 'Duration (Years)', type: 'number', defaultValue: 10, min: 1, max: 60, unit: 'yrs' }
    ]
  },
  {
    id: 'present-value',
    number: 18,
    name: 'Present Value Calculator',
    category: 'Savings',
    shortDescription: 'Find what a future lump sum is worth in today’s rupees given a discount/inflation rate.',
    formulaText: 'PV = FV / (1 + r/100)^t',
    exampleText: '₹10,00,000 received 10 years from now at 7% discount rate equals ₹5,08,349 today.',
    fields: [
      { key: 'futureValue', label: 'Future Target Amount (FV)', type: 'number', defaultValue: 1000000, min: 1, unit: '₹' },
      { key: 'discountRate', label: 'Annual Discount / Inflation Rate (%)', type: 'number', defaultValue: 7, min: 0, max: 40, step: 0.1, unit: '%' },
      { key: 'years', label: 'Years from Today (t)', type: 'number', defaultValue: 10, min: 1, max: 60, unit: 'yrs' }
    ]
  },
  {
    id: 'savings-growth',
    number: 19,
    name: 'Savings Growth Calculator',
    category: 'Savings',
    shortDescription: 'Year-by-year growth schedule for recurring household savings with interest.',
    formulaText: 'Annual balance compounds monthly with step-by-step principal vs interest tracking.',
    exampleText: 'Saving ₹4,000/month at 6.5% p.a. over 8 years reaches ₹5,00,722 (₹3,84,000 principal).',
    fields: [
      { key: 'initial', label: 'Initial Savings', type: 'number', defaultValue: 10000, min: 0, unit: '₹' },
      { key: 'monthly', label: 'Monthly Addition', type: 'number', defaultValue: 4000, min: 100, unit: '₹' },
      { key: 'rate', label: 'Annual Interest (%)', type: 'number', defaultValue: 6.5, min: 0, max: 25, step: 0.1, unit: '%' },
      { key: 'years', label: 'Time Horizon (Years)', type: 'number', defaultValue: 8, min: 1, max: 40, unit: 'yrs' }
    ]
  },
  {
    id: 'monthly-deposit',
    number: 20,
    name: 'Monthly Deposit Calculator',
    category: 'Savings',
    shortDescription: 'Calculate exact monthly deposit required to build a target corpus with zero starting capital.',
    formulaText: 'PMT = Target × r / ((1+r)^n − 1)',
    exampleText: 'Building ₹5,00,000 in 5 years at 7% p.a. requires ₹6,984/month.',
    fields: [
      { key: 'target', label: 'Target Corpus', type: 'number', defaultValue: 500000, min: 1000, unit: '₹' },
      { key: 'rate', label: 'Annual Rate (%)', type: 'number', defaultValue: 7, min: 0, max: 30, step: 0.1, unit: '%' },
      { key: 'years', label: 'Years to Goal', type: 'number', defaultValue: 5, min: 1, max: 50, unit: 'yrs' }
    ]
  },

  // C. INVESTMENT EDUCATION CALCULATORS (21-30)
  {
    id: 'sip',
    number: 21,
    name: 'SIP Calculator',
    category: 'Investment Education',
    shortDescription: 'Estimate future value of monthly Systematic Investment Plan contributions.',
    formulaText: 'FV = P × [((1+i)^n − 1) / i] × (1+i), where i = R/(12×100)',
    exampleText: '₹5,000/month SIP for 10 years at an illustrative 12% p.a.: Invested ₹6,00,000, Est. Value ₹11,61,695.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'monthlyAmount', label: 'Monthly SIP Amount', type: 'number', defaultValue: 5000, min: 100, unit: '₹' },
      { key: 'expectedReturn', label: 'Expected Annual Return (%)', type: 'number', defaultValue: 12, min: 1, max: 35, step: 0.5, unit: '%' },
      { key: 'years', label: 'Investment Duration (Years)', type: 'number', defaultValue: 10, min: 1, max: 45, unit: 'yrs' }
    ]
  },
  {
    id: 'lumpsum',
    number: 22,
    name: 'Lump Sum Investment Calculator',
    category: 'Investment Education',
    shortDescription: 'Estimate compounded value of a one-time investment over your selected horizon.',
    formulaText: 'FV = P × (1 + R/100)^T',
    exampleText: '₹1,00,000 lump sum for 10 years at 11% illustrative CAGR grows to ₹2,83,942.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'amount', label: 'One-Time Investment', type: 'number', defaultValue: 100000, min: 500, unit: '₹' },
      { key: 'expectedReturn', label: 'Expected Annual Return (%)', type: 'number', defaultValue: 11, min: 1, max: 35, step: 0.5, unit: '%' },
      { key: 'years', label: 'Investment Horizon (Years)', type: 'number', defaultValue: 10, min: 1, max: 45, unit: 'yrs' }
    ]
  },
  {
    id: 'mutual-fund-return',
    number: 23,
    name: 'Mutual Fund Return Calculator',
    category: 'Investment Education',
    shortDescription: 'Estimate mutual fund wealth accounting for annual expense ratio deduction.',
    formulaText: 'Net Return ≈ Gross Return − Expense Ratio  |  FV = SIP/Lumpsum at Net Return',
    exampleText: '12% gross return minus 0.5% Direct Plan expense ratio gives 11.5% net estimated CAGR.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'lumpsum', label: 'Initial Lump Sum (₹)', type: 'number', defaultValue: 50000, min: 0, unit: '₹' },
      { key: 'monthlySip', label: 'Monthly SIP (₹)', type: 'number', defaultValue: 3000, min: 0, unit: '₹' },
      { key: 'grossReturn', label: 'Illustrative Gross Return (%)', type: 'number', defaultValue: 12, min: 1, max: 35, step: 0.5, unit: '%' },
      { key: 'expenseRatio', label: 'Fund Expense Ratio (%)', type: 'number', defaultValue: 0.5, min: 0, max: 3, step: 0.05, unit: '%' },
      { key: 'years', label: 'Horizon (Years)', type: 'number', defaultValue: 10, min: 1, max: 40, unit: 'yrs' }
    ]
  },
  {
    id: 'cagr',
    number: 24,
    name: 'CAGR Calculator',
    category: 'Investment Education',
    shortDescription: 'Calculate Compound Annual Growth Rate between starting value and ending value.',
    formulaText: 'CAGR = ((Ending Value / Beginning Value)^(1 / Years) − 1) × 100',
    exampleText: 'Growing ₹1,00,000 to ₹2,00,000 in 6 years equals 12.25% CAGR.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'initialValue', label: 'Initial Investment Value', type: 'number', defaultValue: 100000, min: 1, unit: '₹' },
      { key: 'finalValue', label: 'Final Value', type: 'number', defaultValue: 200000, min: 1, unit: '₹' },
      { key: 'years', label: 'Holding Period (Years)', type: 'number', defaultValue: 6, min: 0.1, max: 60, step: 0.5, unit: 'yrs' }
    ]
  },
  {
    id: 'xirr',
    number: 25,
    name: 'XIRR Calculator',
    category: 'Investment Education',
    shortDescription: 'Solve annualized return (XIRR) for irregular cash flows using Newton-Raphson iteration.',
    formulaText: 'Σ CFᵢ / (1 + XIRR)^((dᵢ − d₀)/365) = 0',
    exampleText: 'Investing ₹50,000 (Day 0) + ₹30,000 (Month 6) + ₹20,000 (Month 12) worth ₹1,18,000 at Month 24 gives XIRR.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'cf1', label: 'Cash Flow 1 (Day 0 Outflow ₹)', type: 'number', defaultValue: 50000, min: 1, unit: '₹' },
      { key: 'cf2', label: 'Cash Flow 2 (Month 6 Outflow ₹)', type: 'number', defaultValue: 30000, min: 0, unit: '₹' },
      { key: 'cf3', label: 'Cash Flow 3 (Month 12 Outflow ₹)', type: 'number', defaultValue: 20000, min: 0, unit: '₹' },
      { key: 'finalValue', label: 'Current / Redemption Value', type: 'number', defaultValue: 122000, min: 1, unit: '₹' },
      { key: 'totalMonths', label: 'Total Holding Months', type: 'number', defaultValue: 24, min: 13, max: 240, unit: 'mo' }
    ]
  },
  {
    id: 'investment-return',
    number: 26,
    name: 'Investment Return Calculator',
    category: 'Investment Education',
    shortDescription: 'Calculate absolute return %, net gain, and inflation-adjusted real gain.',
    formulaText: 'Absolute Return % = ((Final − Invested) / Invested) × 100',
    exampleText: '₹80,000 growing to ₹1,12,000 is ₹32,000 gain (40% absolute return).',
    isInvestmentEstimate: true,
    fields: [
      { key: 'invested', label: 'Total Amount Invested', type: 'number', defaultValue: 80000, min: 1, unit: '₹' },
      { key: 'currentValue', label: 'Current / Final Value', type: 'number', defaultValue: 112000, min: 0, unit: '₹' },
      { key: 'years', label: 'Holding Years', type: 'number', defaultValue: 3, min: 0.5, max: 50, step: 0.5, unit: 'yrs' },
      { key: 'inflation', label: 'Inflation Rate for Real Check (%)', type: 'number', defaultValue: 6, min: 0, max: 20, step: 0.5, unit: '%' }
    ]
  },
  {
    id: 'stepup-sip',
    number: 27,
    name: 'Step-up SIP Calculator',
    category: 'Investment Education',
    shortDescription: 'Model wealth creation when increasing your monthly SIP by a fixed % every year.',
    formulaText: 'Each year monthly SIP multiplies by (1 + stepUp/100) and compounds monthly.',
    exampleText: 'Starting ₹5,000/month with 10% annual step-up for 10 years at 12% grows far faster than flat SIP.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'monthlySip', label: 'Starting Monthly SIP', type: 'number', defaultValue: 5000, min: 100, unit: '₹' },
      { key: 'stepUpPercent', label: 'Annual SIP Step-Up (%)', type: 'number', defaultValue: 10, min: 0, max: 50, step: 1, unit: '%' },
      { key: 'expectedReturn', label: 'Expected Annual Return (%)', type: 'number', defaultValue: 12, min: 1, max: 35, step: 0.5, unit: '%' },
      { key: 'years', label: 'Duration (Years)', type: 'number', defaultValue: 10, min: 1, max: 40, unit: 'yrs' }
    ]
  },
  {
    id: 'annualized-return',
    number: 28,
    name: 'Annualized Return Calculator',
    category: 'Investment Education',
    shortDescription: 'Convert short-term or multi-day returns into an equivalent annual rate.',
    formulaText: 'Annualized Return = ((1 + Total Return)^(365 / Days) − 1) × 100',
    exampleText: 'A 6% gain achieved over 180 days corresponds to 12.54% annualized.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'invested', label: 'Initial Amount', type: 'number', defaultValue: 100000, min: 1, unit: '₹' },
      { key: 'ending', label: 'Ending Amount', type: 'number', defaultValue: 106000, min: 1, unit: '₹' },
      { key: 'days', label: 'Holding Period (Days)', type: 'number', defaultValue: 180, min: 1, max: 18250, unit: 'days' }
    ]
  },
  {
    id: 'ppf-calculator',
    number: 29,
    name: 'PPF Calculator',
    category: 'Investment Education',
    shortDescription: 'Estimate 15-year Public Provident Fund maturity using annual compounding (verify latest govt rate on nsiindia.gov.in).',
    formulaText: 'F = P × [((1+i)^n − 1) / i] × (1+i) (annual compounding at notified PPF rate)',
    exampleText: 'Depositing ₹60,000/year for 15 years at 7.1% builds ~₹16,27,284 tax-free.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'annualDeposit', label: 'Yearly PPF Contribution (₹500–₹1,50,000)', type: 'number', defaultValue: 60000, min: 500, max: 150000, unit: '₹' },
      { key: 'rate', label: 'PPF Interest Rate (% — check nsiindia.gov.in)', type: 'number', defaultValue: 7.1, min: 1, max: 15, step: 0.1, unit: '%' },
      { key: 'years', label: 'Tenure (15+ Years)', type: 'number', defaultValue: 15, min: 15, max: 50, step: 5, unit: 'yrs' }
    ]
  },
  {
    id: 'nps-calculator',
    number: 30,
    name: 'NPS Calculator',
    category: 'Investment Education',
    shortDescription: 'Estimate retirement corpus, 60% lump sum, and 40% monthly annuity pension under NPS.',
    formulaText: 'Corpus compounds monthly until age 60; 40% minimum allocated to annuity plan.',
    exampleText: '₹5,000/month from age 30 to 60 at 10% illustrative return builds ~₹1.14 Cr corpus.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'monthlyContribution', label: 'Monthly NPS Contribution', type: 'number', defaultValue: 5000, min: 500, unit: '₹' },
      { key: 'currentAge', label: 'Current Age', type: 'number', defaultValue: 30, min: 18, max: 59, unit: 'yrs' },
      { key: 'expectedReturn', label: 'Illustrative Annual Return (%)', type: 'number', defaultValue: 10, min: 4, max: 18, step: 0.5, unit: '%' },
      { key: 'annuityPercent', label: 'Annuity Purchase Share (min 40%)', type: 'number', defaultValue: 40, min: 40, max: 100, unit: '%' },
      { key: 'annuityRate', label: 'Estimated Annuity Rate (%)', type: 'number', defaultValue: 6.5, min: 3, max: 12, step: 0.5, unit: '%' }
    ]
  },

  // D. LOAN CALCULATORS (31-40)
  {
    id: 'home-loan-emi',
    number: 31,
    name: 'Home Loan EMI Calculator',
    category: 'Loan',
    shortDescription: 'Calculate long-tenure housing loan EMI, total interest payable, and principal ratio.',
    formulaText: 'EMI = P × r × (1+r)^n / ((1+r)^n − 1)',
    exampleText: '₹30,00,000 home loan at 8.5% for 20 years = EMI ₹26,035/month.',
    fields: [
      { key: 'principal', label: 'Home Loan Amount', type: 'number', defaultValue: 3000000, min: 50000, unit: '₹' },
      { key: 'rate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 8.5, min: 1, max: 25, step: 0.05, unit: '%' },
      { key: 'years', label: 'Tenure (Years)', type: 'number', defaultValue: 20, min: 1, max: 35, unit: 'yrs' }
    ]
  },
  {
    id: 'personal-loan-emi',
    number: 32,
    name: 'Personal Loan EMI Calculator',
    category: 'Loan',
    shortDescription: 'Evaluate unsecured personal loan EMI and effective total cost including processing fee.',
    formulaText: 'EMI = P × r × (1+r)^n / ((1+r)^n − 1) + Processing Fee impact',
    exampleText: '₹2,50,000 at 13.5% for 3 years = EMI ₹8,484/month.',
    fields: [
      { key: 'principal', label: 'Personal Loan Amount', type: 'number', defaultValue: 250000, min: 5000, unit: '₹' },
      { key: 'rate', label: 'Interest Rate (% p.a.)', type: 'number', defaultValue: 13.5, min: 1, max: 40, step: 0.25, unit: '%' },
      { key: 'years', label: 'Tenure (Years)', type: 'number', defaultValue: 3, min: 1, max: 7, unit: 'yrs' },
      { key: 'processingFeePercent', label: 'Processing Fee (%)', type: 'number', defaultValue: 2, min: 0, max: 10, step: 0.25, unit: '%' }
    ]
  },
  {
    id: 'education-loan-emi',
    number: 33,
    name: 'Education Loan EMI Calculator',
    category: 'Loan',
    shortDescription: 'Calculate student loan EMI factoring in optional moratorium period simple interest.',
    formulaText: 'Moratorium Interest = P × R × (Moratorium Months/12)/100; EMI computed on revised principal.',
    exampleText: '₹6,00,000 at 9.5% with 12-month study moratorium and 7-year repayment.',
    fields: [
      { key: 'principal', label: 'Education Loan Amount', type: 'number', defaultValue: 600000, min: 10000, unit: '₹' },
      { key: 'rate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 9.5, min: 1, max: 25, step: 0.1, unit: '%' },
      { key: 'moratoriumMonths', label: 'Moratorium Period (Months)', type: 'number', defaultValue: 12, min: 0, max: 60, unit: 'mo' },
      { key: 'repaymentYears', label: 'Repayment Tenure (Years)', type: 'number', defaultValue: 7, min: 1, max: 15, unit: 'yrs' }
    ]
  },
  {
    id: 'car-loan-emi',
    number: 34,
    name: 'Car Loan EMI Calculator',
    category: 'Loan',
    shortDescription: 'Plan vehicle financing with on-road price, down payment, and loan EMI.',
    formulaText: 'Loan Principal = Vehicle Price − Down Payment; EMI = P × r × (1+r)^n / ((1+r)^n − 1)',
    exampleText: '₹9,00,000 car minus ₹2,00,000 down payment → ₹7,00,000 loan at 9% for 5 years = EMI ₹14,531.',
    fields: [
      { key: 'carPrice', label: 'Car On-Road Price', type: 'number', defaultValue: 900000, min: 50000, unit: '₹' },
      { key: 'downPayment', label: 'Down Payment', type: 'number', defaultValue: 200000, min: 0, unit: '₹' },
      { key: 'rate', label: 'Interest Rate (% p.a.)', type: 'number', defaultValue: 9.0, min: 1, max: 25, step: 0.1, unit: '%' },
      { key: 'years', label: 'Loan Tenure (Years)', type: 'number', defaultValue: 5, min: 1, max: 8, unit: 'yrs' }
    ]
  },
  {
    id: 'two-wheeler-loan-emi',
    number: 35,
    name: 'Two-Wheeler Loan EMI Calculator',
    category: 'Loan',
    shortDescription: 'Calculate scooter or motorcycle loan EMI and interest cost over 12–48 months.',
    formulaText: 'Loan = On-Road Price − Down Payment; Monthly EMI formula applied.',
    exampleText: '₹1,10,000 scooter with ₹25,000 down payment → ₹85,000 loan at 11.5% for 24 months.',
    fields: [
      { key: 'bikePrice', label: 'Two-Wheeler Price', type: 'number', defaultValue: 110000, min: 10000, unit: '₹' },
      { key: 'downPayment', label: 'Down Payment', type: 'number', defaultValue: 25000, min: 0, unit: '₹' },
      { key: 'rate', label: 'Interest Rate (% p.a.)', type: 'number', defaultValue: 11.5, min: 1, max: 35, step: 0.25, unit: '%' },
      { key: 'months', label: 'Tenure (Months)', type: 'number', defaultValue: 24, min: 6, max: 60, unit: 'mo' }
    ]
  },
  {
    id: 'loan-interest',
    number: 36,
    name: 'Loan Interest Calculator',
    category: 'Loan',
    shortDescription: 'Break down total interest paid and effective interest-to-principal burden on any loan.',
    formulaText: 'Total Interest = (EMI × n) − P  |  Interest Burden % = (Interest / P) × 100',
    exampleText: 'Borrowing ₹5,00,000 at 10% for 5 years incurs ₹1,37,411 interest (27.5% of principal).',
    fields: [
      { key: 'principal', label: 'Loan Principal', type: 'number', defaultValue: 500000, min: 1000, unit: '₹' },
      { key: 'rate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 10, min: 0.1, max: 40, step: 0.1, unit: '%' },
      { key: 'years', label: 'Tenure (Years)', type: 'number', defaultValue: 5, min: 1, max: 35, unit: 'yrs' }
    ]
  },
  {
    id: 'loan-eligibility',
    number: 37,
    name: 'Loan Eligibility Estimator',
    category: 'Loan',
    shortDescription: 'Estimate maximum loan amount lenders may approve based on monthly income and FOIR.',
    formulaText: 'Max Affordable EMI = (Monthly Income × FOIR%) − Existing EMIs; Principal solved via PV of EMI.',
    exampleText: 'With ₹60,000 monthly income, 50% FOIR, and ₹5,000 existing EMI → ₹25,000 max new EMI.',
    fields: [
      { key: 'monthlyIncome', label: 'Net Monthly Income', type: 'number', defaultValue: 60000, min: 1000, unit: '₹' },
      { key: 'existingEmi', label: 'Existing Monthly EMIs', type: 'number', defaultValue: 5000, min: 0, unit: '₹' },
      { key: 'foirPercent', label: 'Max EMI-to-Income Ratio (FOIR %)', type: 'number', defaultValue: 50, min: 20, max: 65, unit: '%' },
      { key: 'rate', label: 'Expected Loan Rate (%)', type: 'number', defaultValue: 8.75, min: 1, max: 25, step: 0.25, unit: '%' },
      { key: 'years', label: 'Tenure (Years)', type: 'number', defaultValue: 20, min: 1, max: 30, unit: 'yrs' }
    ]
  },
  {
    id: 'loan-prepayment',
    number: 38,
    name: 'Loan Prepayment Calculator',
    category: 'Loan',
    shortDescription: 'Measure interest saved and months shaved off when making extra annual or lump-sum prepayments.',
    formulaText: 'Simulates month-by-month reducing balance with extra prepayment reducing principal directly.',
    exampleText: 'Paying ₹50,000 extra each year on a ₹25L home loan saves lakhs in interest and years of tenure.',
    fields: [
      { key: 'principal', label: 'Outstanding Loan Balance', type: 'number', defaultValue: 2500000, min: 10000, unit: '₹' },
      { key: 'rate', label: 'Interest Rate (% p.a.)', type: 'number', defaultValue: 8.5, min: 1, max: 25, step: 0.1, unit: '%' },
      { key: 'years', label: 'Remaining Tenure (Years)', type: 'number', defaultValue: 15, min: 1, max: 30, unit: 'yrs' },
      { key: 'annualPrepayment', label: 'Extra Annual Prepayment', type: 'number', defaultValue: 50000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'loan-amortization',
    number: 39,
    name: 'Loan Amortization Schedule',
    category: 'Loan',
    shortDescription: 'Generate a full year-by-year principal, interest, and closing balance amortization schedule.',
    formulaText: 'Monthly Interest = Balance × r; Principal Repaid = EMI − Interest; New Balance = Balance − Principal Repaid',
    exampleText: 'Inspect how Year 1 payments are mostly interest while later years rapidly reduce loan balance.',
    fields: [
      { key: 'principal', label: 'Loan Principal', type: 'number', defaultValue: 1000000, min: 1000, unit: '₹' },
      { key: 'rate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 9.0, min: 0.1, max: 30, step: 0.1, unit: '%' },
      { key: 'years', label: 'Tenure (Years)', type: 'number', defaultValue: 10, min: 1, max: 30, unit: 'yrs' }
    ]
  },
  {
    id: 'total-loan-cost',
    number: 40,
    name: 'Total Loan Cost Calculator',
    category: 'Loan',
    shortDescription: 'Compute all-in loan cost combining principal, total interest, processing fees, and insurance.',
    formulaText: 'Total Cost = (EMI × n) + Processing Fee + Loan Insurance / Documentation Charges',
    exampleText: 'Factoring upfront fees reveals the true cost of borrowing beyond the headline rate.',
    fields: [
      { key: 'principal', label: 'Loan Amount', type: 'number', defaultValue: 400000, min: 1000, unit: '₹' },
      { key: 'rate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 11.0, min: 0.1, max: 40, step: 0.1, unit: '%' },
      { key: 'years', label: 'Tenure (Years)', type: 'number', defaultValue: 4, min: 1, max: 30, unit: 'yrs' },
      { key: 'upfrontFees', label: 'Processing + Stamp + Other Fees', type: 'number', defaultValue: 8500, min: 0, unit: '₹' }
    ]
  },

  // E. TAX AND GOVERNMENT-RELATED CALCULATORS (41-46)
  {
    id: 'income-tax-estimator',
    number: 41,
    name: 'Income Tax Estimator',
    category: 'Tax & Government',
    shortDescription: 'Estimate Indian Income Tax liability under configurable New or Old Regime slab assumptions.',
    formulaText: 'Taxable Income = Gross Income − Standard Deduction − Eligible Deductions; Slabs + 4% Health & Education Cess',
    exampleText: 'Salaried income ₹12,50,000 under New Regime with ₹75,000 standard deduction → ₹11,75,000 taxable.',
    isTaxConfigurable: true,
    fields: [
      { key: 'grossIncome', label: 'Annual Gross Income', type: 'number', defaultValue: 1250000, min: 0, unit: '₹' },
      {
        key: 'regime',
        label: 'Tax Regime',
        type: 'select',
        defaultValue: 'new',
        options: [
          { label: 'New Tax Regime (Default)', value: 'new' },
          { label: 'Old Tax Regime', value: 'old' }
        ]
      },
      {
        key: 'salaried',
        label: 'Salaried / Pensioner',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes (Standard Deduction Applies)', value: 'yes' },
          { label: 'No (Self-Employed / Business)', value: 'no' }
        ]
      },
      { key: 'oldDeductions', label: 'Chapter VI-A + HRA Deductions (Old Regime)', type: 'number', defaultValue: 150000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'tax-regime-comparison',
    number: 42,
    name: 'Old vs New Tax Regime Comparison',
    category: 'Tax & Government',
    shortDescription: 'Compare net tax payable side by side between India’s Old and New Tax Regimes.',
    formulaText: 'Evaluates both slab structures with configurable Standard Deduction, 87A Rebate, and 4% Cess.',
    exampleText: 'Compare whether ₹2,50,000 of 80C/80D/HRA deductions makes Old Regime cheaper than New Regime.',
    isTaxConfigurable: true,
    fields: [
      { key: 'grossIncome', label: 'Annual Gross Salary / Income', type: 'number', defaultValue: 1400000, min: 0, unit: '₹' },
      { key: 'deduction80C', label: 'Section 80C (PPF/ELSS/LIC max ₹1.5L)', type: 'number', defaultValue: 150000, min: 0, max: 150000, unit: '₹' },
      { key: 'deduction80D', label: 'Section 80D Health Insurance', type: 'number', defaultValue: 25000, min: 0, max: 100000, unit: '₹' },
      { key: 'hraAndOther', label: 'HRA + Home Loan Interest + 80CCD(1B)', type: 'number', defaultValue: 120000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'gst-tax-calc',
    number: 43,
    name: 'GST Split & Invoice Calculator',
    category: 'Tax & Government',
    shortDescription: 'Calculate Intra-State (CGST + SGST) vs Inter-State (IGST) tax breakdown for invoices.',
    formulaText: 'Intra-State: CGST = GST/2, SGST = GST/2  |  Inter-State: IGST = GST',
    exampleText: '₹25,000 service at 18% Intra-State = ₹2,250 CGST + ₹2,250 SGST = ₹29,500 Total.',
    fields: [
      { key: 'baseAmount', label: 'Taxable Invoice Value', type: 'number', defaultValue: 25000, min: 1, unit: '₹' },
      {
        key: 'rate',
        label: 'GST Rate (%)',
        type: 'select',
        defaultValue: '18',
        options: [
          { label: '0% (Exempt)', value: '0' },
          { label: '5%', value: '5' },
          { label: '12%', value: '12' },
          { label: '18%', value: '18' },
          { label: '28%', value: '28' }
        ]
      },
      {
        key: 'supplyType',
        label: 'Supply Type',
        type: 'select',
        defaultValue: 'intra',
        options: [
          { label: 'Intra-State (CGST + SGST)', value: 'intra' },
          { label: 'Inter-State (IGST)', value: 'inter' }
        ]
      }
    ]
  },
  {
    id: 'hra-exemption',
    number: 44,
    name: 'HRA Exemption Estimator',
    category: 'Tax & Government',
    shortDescription: 'Compute House Rent Allowance tax exemption under Section 10(13A) (Old Tax Regime).',
    formulaText: 'Exempt HRA = Minimum of: (1) Actual HRA, (2) Rent Paid − 10% Basic+DA, (3) 50% Metro / 40% Non-Metro Basic+DA',
    exampleText: 'Basic ₹4,80,000, HRA ₹1,92,000, Rent ₹1,80,000 in Metro → Exempt HRA ₹1,32,000.',
    isTaxConfigurable: true,
    fields: [
      { key: 'basicAnnual', label: 'Annual Basic Salary + DA', type: 'number', defaultValue: 480000, min: 1, unit: '₹' },
      { key: 'hraReceived', label: 'Annual HRA Received', type: 'number', defaultValue: 192000, min: 0, unit: '₹' },
      { key: 'rentPaid', label: 'Total Annual Rent Paid', type: 'number', defaultValue: 180000, min: 0, unit: '₹' },
      {
        key: 'cityType',
        label: 'City Category',
        type: 'select',
        defaultValue: 'metro',
        options: [
          { label: 'Metro (Delhi, Mumbai, Kolkata, Chennai)', value: 'metro' },
          { label: 'Non-Metro (Bengaluru, Pune, Mysuru, etc.)', value: 'non-metro' }
        ]
      }
    ]
  },
  {
    id: 'tax-deduction-calc',
    number: 45,
    name: 'Basic Tax Deduction Calculator',
    category: 'Tax & Government',
    shortDescription: 'Sum eligible Old-Regime tax deductions across 80C, 80D, 80CCD(1B) NPS, and 80TTA.',
    formulaText: 'Total Deductions = min(80C, 1.5L) + 80D + min(NPS_1B, 50K) + min(SavingsInt, 10K)',
    exampleText: 'Full ₹1.5L in 80C + ₹25k 80D + ₹50k NPS 80CCD(1B) = ₹2,25,000 deduction.',
    isTaxConfigurable: true,
    fields: [
      { key: 'sec80C', label: 'Section 80C (EPF/PPF/SSY/ELSS/Tuition)', type: 'number', defaultValue: 150000, min: 0, unit: '₹' },
      { key: 'sec80D', label: 'Section 80D (Health Insurance)', type: 'number', defaultValue: 25000, min: 0, unit: '₹' },
      { key: 'sec80CCD1B', label: 'Section 80CCD(1B) (NPS Self)', type: 'number', defaultValue: 50000, min: 0, unit: '₹' },
      { key: 'sec80TTA', label: 'Savings Interest (80TTA/80TTB)', type: 'number', defaultValue: 10000, min: 0, unit: '₹' },
      { key: 'marginalRate', label: 'Your Marginal Tax Slab (%)', type: 'number', defaultValue: 20, min: 0, max: 30, unit: '%' }
    ]
  },
  {
    id: 'tds-estimator',
    number: 46,
    name: 'TDS Estimator',
    category: 'Tax & Government',
    shortDescription: 'Estimate Tax Deducted at Source on FD interest, rent, or professional fees with/without PAN.',
    formulaText: 'TDS = Payment × Applicable Section Rate (20% if PAN missing under Sec 206AA)',
    exampleText: '₹1,20,000 professional fee under Sec 194J at 10% → ₹12,000 TDS, ₹1,08,000 net payout.',
    isTaxConfigurable: true,
    fields: [
      { key: 'paymentAmount', label: 'Gross Payment / Interest Amount', type: 'number', defaultValue: 120000, min: 0, unit: '₹' },
      {
        key: 'sectionRate',
        label: 'Payment Nature & Standard Rate',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'Bank/Post Office Interest (Sec 194A — 10%)', value: '10' },
          { label: 'Professional / Technical Fee (Sec 194J — 10%)', value: '10' },
          { label: 'Contractor Payment Individual (Sec 194C — 1%)', value: '1' },
          { label: 'Contractor Company (Sec 194C — 2%)', value: '2' },
          { label: 'Commission / Brokerage (Sec 194H — 2%)', value: '2' },
          { label: 'High-Value Rent > ₹50k/mo (Sec 194IB — 2%)', value: '2' }
        ]
      },
      {
        key: 'hasPan',
        label: 'PAN Furnished?',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes (Standard TDS Rate)', value: 'yes' },
          { label: 'No (20% Higher TDS under Sec 206AA)', value: 'no' }
        ]
      }
    ]
  },

  // F. HOUSEHOLD AND DAILY FINANCE CALCULATORS (47-60)
  {
    id: 'household-monthly-expense',
    number: 47,
    name: 'Household Monthly Expense Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Aggregate core household categories into total monthly and annualized living costs.',
    formulaText: 'Monthly Total = Rent + Groceries + Utilities + Transport + Education + Medical + Other',
    exampleText: 'Sum core family bills to see exact monthly baseline required before discretionary spending.',
    fields: [
      { key: 'rent', label: 'House Rent / Maintenance', type: 'number', defaultValue: 9000, min: 0, unit: '₹' },
      { key: 'groceries', label: 'Groceries & Food', type: 'number', defaultValue: 7500, min: 0, unit: '₹' },
      { key: 'utilities', label: 'Electricity, Water, Gas, Internet', type: 'number', defaultValue: 2800, min: 0, unit: '₹' },
      { key: 'transport', label: 'Fuel / Bus / Metro Commute', type: 'number', defaultValue: 2500, min: 0, unit: '₹' },
      { key: 'educationMedical', label: 'Education & Healthcare', type: 'number', defaultValue: 4000, min: 0, unit: '₹' },
      { key: 'other', label: 'Other Household Expenses', type: 'number', defaultValue: 2200, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'electricity-bill',
    number: 48,
    name: 'Electricity Bill Estimator',
    category: 'Household & Daily Finance',
    shortDescription: 'Estimate monthly electricity consumption (kWh units) and bill based on appliance usage.',
    formulaText: 'kWh = (Watts × Hours/Day × 30) / 1000; Estimated Bill = (kWh × Tariff) + Fixed Charge',
    exampleText: '220 units at ₹6.20/unit + ₹120 fixed meter charge = ₹1,484 estimated monthly bill.',
    fields: [
      { key: 'units', label: 'Estimated Monthly Units (kWh)', type: 'number', defaultValue: 220, min: 0, unit: 'kWh' },
      { key: 'ratePerUnit', label: 'Average Tariff Rate per Unit', type: 'number', defaultValue: 6.2, min: 0, max: 30, step: 0.1, unit: '₹' },
      { key: 'fixedCharge', label: 'Monthly Fixed / Meter Charge', type: 'number', defaultValue: 120, min: 0, unit: '₹' },
      { key: 'subsidyFreeUnits', label: 'Free / Subsidized Units (if applicable)', type: 'number', defaultValue: 0, min: 0, unit: 'kWh' }
    ]
  },
  {
    id: 'water-bill',
    number: 49,
    name: 'Water Bill Estimator',
    category: 'Household & Daily Finance',
    shortDescription: 'Estimate monthly household water usage in kilolitres and expected municipal water charges.',
    formulaText: 'Monthly Litres = Members × Litres/Day × 30  |  Bill = (kL × Rate/kL) + Maintenance',
    exampleText: '4 family members using 135L/day = 16.2 kL/month.',
    fields: [
      { key: 'members', label: 'Household Members', type: 'number', defaultValue: 4, min: 1, max: 30 },
      { key: 'litersPerPerson', label: 'Daily Use per Person (Litres)', type: 'number', defaultValue: 135, min: 20, max: 500, unit: 'L' },
      { key: 'ratePerKl', label: 'Charge per 1,000 Litres (1 kL)', type: 'number', defaultValue: 18, min: 0, unit: '₹' },
      { key: 'fixedFee', label: 'Fixed Meter / Sanitary Charge', type: 'number', defaultValue: 100, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'grocery-budget',
    number: 50,
    name: 'Grocery Budget Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Plan weekly and monthly grocery budgets based on household size and dietary allowance.',
    formulaText: 'Monthly Budget = (Adult Count × Adult Cost) + (Child Count × Child Cost) + Staples Buffer',
    exampleText: '2 adults + 2 children with staple buffer helps control mid-month grocery overspending.',
    fields: [
      { key: 'adults', label: 'Adults in Household', type: 'number', defaultValue: 2, min: 1, max: 20 },
      { key: 'children', label: 'Children in Household', type: 'number', defaultValue: 2, min: 0, max: 20 },
      { key: 'perAdultMonthly', label: 'Monthly Allocation per Adult', type: 'number', defaultValue: 2800, min: 500, unit: '₹' },
      { key: 'perChildMonthly', label: 'Monthly Allocation per Child', type: 'number', defaultValue: 1800, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'travel-budget',
    number: 51,
    name: 'Travel Budget Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Estimate total trip expense across transport, stay, meals, activities, and buffer.',
    formulaText: 'Trip Cost = Transport + (Nights × Stay/Night) + (Days × Travellers × Food/Day) + Buffer',
    exampleText: '4-day family trip with ₹8,000 travel + 3 nights stay + meals + 10% buffer.',
    fields: [
      { key: 'travellers', label: 'Number of Travellers', type: 'number', defaultValue: 3, min: 1, max: 50 },
      { key: 'days', label: 'Trip Duration (Days)', type: 'number', defaultValue: 4, min: 1, max: 90, unit: 'days' },
      { key: 'transport', label: 'Total Tickets / Fuel Cost', type: 'number', defaultValue: 8000, min: 0, unit: '₹' },
      { key: 'stayPerNight', label: 'Accommodation Cost per Night', type: 'number', defaultValue: 2500, min: 0, unit: '₹' },
      { key: 'dailySpendPerPerson', label: 'Food & Local Activities / Person / Day', type: 'number', defaultValue: 900, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'education-cost',
    number: 52,
    name: 'Education Cost Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Project inflation-adjusted future school or college fee requirements and monthly SIP/RD needed.',
    formulaText: 'Future Cost = Current Cost × (1 + Education Inflation)^Years',
    exampleText: '₹4,00,000 college degree today at 8% education inflation costs ₹8,63,570 in 10 years.',
    fields: [
      { key: 'currentCost', label: 'Current Course / Annual Fee Cost', type: 'number', defaultValue: 400000, min: 1000, unit: '₹' },
      { key: 'yearsUntilNeeded', label: 'Years Until Required', type: 'number', defaultValue: 10, min: 1, max: 30, unit: 'yrs' },
      { key: 'eduInflation', label: 'Education Inflation (% p.a.)', type: 'number', defaultValue: 8, min: 0, max: 25, step: 0.5, unit: '%' },
      { key: 'expectedReturn', label: 'Expected Savings Return (%)', type: 'number', defaultValue: 9, min: 0, max: 25, step: 0.5, unit: '%' }
    ]
  },
  {
    id: 'medical-expense-budget',
    number: 53,
    name: 'Medical Expense Budget Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Plan annual healthcare sinking fund covering routine checkups, medicines, and insurance deductible.',
    formulaText: 'Annual Medical Budget = (Monthly Medicines × 12) + Annual Checkups + Insurance + Buffer',
    exampleText: 'Helps families avoid dipping into emergency savings for predictable yearly medical costs.',
    fields: [
      { key: 'monthlyMeds', label: 'Monthly Regular Medicines / Consultations', type: 'number', defaultValue: 1200, min: 0, unit: '₹' },
      { key: 'annualCheckups', label: 'Annual Preventive Tests & Dental', type: 'number', defaultValue: 6000, min: 0, unit: '₹' },
      { key: 'insurancePremium', label: 'Annual Health Insurance Premium', type: 'number', defaultValue: 15000, min: 0, unit: '₹' },
      { key: 'outOfPocketBuffer', label: 'Out-of-Pocket Contingency Buffer', type: 'number', defaultValue: 10000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'family-budget',
    number: 54,
    name: 'Family Budget Calculator (50/30/20)',
    category: 'Household & Daily Finance',
    shortDescription: 'Automatically split household take-home income into Needs, Wants, and Savings targets.',
    formulaText: 'Needs = Income × Needs%  |  Wants = Income × Wants%  |  Savings = Income × Savings%',
    exampleText: 'On ₹50,000 household income: ₹25,000 Needs, ₹15,000 Wants, ₹10,000 Savings.',
    fields: [
      { key: 'monthlyIncome', label: 'Combined Family Monthly Income', type: 'number', defaultValue: 50000, min: 1000, unit: '₹' },
      { key: 'needsPercent', label: 'Needs Allocation (%)', type: 'number', defaultValue: 50, min: 10, max: 90, unit: '%' },
      { key: 'wantsPercent', label: 'Wants Allocation (%)', type: 'number', defaultValue: 30, min: 0, max: 80, unit: '%' },
      { key: 'savingsPercent', label: 'Savings Allocation (%)', type: 'number', defaultValue: 20, min: 0, max: 80, unit: '%' }
    ]
  },
  {
    id: 'debt-to-income',
    number: 55,
    name: 'Debt-to-Income Ratio Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Measure financial stress by comparing total monthly debt EMIs against gross monthly income.',
    formulaText: 'DTI Ratio (%) = (Total Monthly Debt Payments / Monthly Income) × 100',
    exampleText: '₹14,000 total EMIs on ₹50,000 monthly income = 28% DTI (Healthy < 35%).',
    fields: [
      { key: 'monthlyIncome', label: 'Monthly Net Income', type: 'number', defaultValue: 50000, min: 1, unit: '₹' },
      { key: 'homeRentOrLoan', label: 'Home Loan EMI (if any)', type: 'number', defaultValue: 10000, min: 0, unit: '₹' },
      { key: 'otherEmis', label: 'Vehicle / Personal / Credit Card EMIs', type: 'number', defaultValue: 4000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'net-worth',
    number: 56,
    name: 'Net Worth Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Calculate personal or household net worth by subtracting liabilities from total assets.',
    formulaText: 'Net Worth = Total Assets (Cash + Savings + Investments + Property) − Total Liabilities (Loans)',
    exampleText: '₹12,50,000 total assets minus ₹4,00,000 remaining loans = ₹8,50,000 Net Worth.',
    fields: [
      { key: 'bankSavings', label: 'Bank Balance, FD, RD, PPF', type: 'number', defaultValue: 350000, min: 0, unit: '₹' },
      { key: 'investments', label: 'Mutual Funds, Stocks, Gold', type: 'number', defaultValue: 400000, min: 0, unit: '₹' },
      { key: 'propertyAssets', label: 'Real Estate / Vehicle Value', type: 'number', defaultValue: 500000, min: 0, unit: '₹' },
      { key: 'loansDebt', label: 'All Loans & Credit Card Dues', type: 'number', defaultValue: 400000, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'financial-independence',
    number: 57,
    name: 'Financial Independence Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Estimate your Financial Independence (FI) target corpus and years needed at your savings rate.',
    formulaText: 'FI Corpus = Annual Expenses × Multiplier (e.g., 25× for 4% safe withdrawal rate)',
    exampleText: '₹4,80,000 annual expenses × 25 = ₹1,20,00,000 FI target corpus.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'monthlyExpenses', label: 'Current Monthly Living Expenses', type: 'number', defaultValue: 40000, min: 1000, unit: '₹' },
      { key: 'currentCorpus', label: 'Current Invested Corpus', type: 'number', defaultValue: 500000, min: 0, unit: '₹' },
      { key: 'monthlyInvest', label: 'Monthly Investment Addition', type: 'number', defaultValue: 20000, min: 500, unit: '₹' },
      { key: 'expectedReturn', label: 'Expected Annual Return (%)', type: 'number', defaultValue: 10, min: 2, max: 25, step: 0.5, unit: '%' },
      { key: 'multiplier', label: 'Corpus Multiplier (25× to 33×)', type: 'number', defaultValue: 25, min: 15, max: 40 }
    ]
  },
  {
    id: 'retirement-planning',
    number: 58,
    name: 'Retirement Planning Estimator',
    category: 'Household & Daily Finance',
    shortDescription: 'Calculate inflation-adjusted monthly expenses at retirement and required retirement corpus.',
    formulaText: 'Retirement Expense = Current × (1+i)^years; Corpus sized for post-retirement lifespan.',
    exampleText: 'Age 30 retiring at 60 with ₹35,000 today expenses at 6% inflation.',
    isInvestmentEstimate: true,
    fields: [
      { key: 'currentAge', label: 'Current Age', type: 'number', defaultValue: 30, min: 18, max: 70, unit: 'yrs' },
      { key: 'retireAge', label: 'Planned Retirement Age', type: 'number', defaultValue: 60, min: 35, max: 80, unit: 'yrs' },
      { key: 'monthlyExpenseNow', label: 'Monthly Expenses Today', type: 'number', defaultValue: 35000, min: 1000, unit: '₹' },
      { key: 'inflation', label: 'Expected Inflation (%)', type: 'number', defaultValue: 6, min: 1, max: 15, step: 0.5, unit: '%' },
      { key: 'preRetireReturn', label: 'Pre-Retirement Return (%)', type: 'number', defaultValue: 10, min: 2, max: 20, step: 0.5, unit: '%' }
    ]
  },
  {
    id: 'break-even',
    number: 59,
    name: 'Break-even Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Find how many units or sales rupees a small business needs to cover all fixed and variable costs.',
    formulaText: 'Break-Even Units = Fixed Costs / (Selling Price per Unit − Variable Cost per Unit)',
    exampleText: 'Fixed rent/salaries ₹40,000, unit price ₹500, variable cost ₹300 → 200 units to break even.',
    fields: [
      { key: 'fixedCosts', label: 'Monthly Fixed Costs (Rent/Salaries)', type: 'number', defaultValue: 40000, min: 0, unit: '₹' },
      { key: 'sellingPricePerUnit', label: 'Selling Price per Unit', type: 'number', defaultValue: 500, min: 1, unit: '₹' },
      { key: 'variableCostPerUnit', label: 'Variable Cost per Unit', type: 'number', defaultValue: 300, min: 0, unit: '₹' }
    ]
  },
  {
    id: 'currency-conversion',
    number: 60,
    name: 'Currency Conversion Calculator',
    category: 'Household & Daily Finance',
    shortDescription: 'Convert between INR (₹) and major global currencies using editable reference exchange rates.',
    formulaText: 'Converted Value = Amount × (Target Rate / Source Rate)  [Reference Rates Editable]',
    exampleText: '₹1,00,000 at reference rate ₹84.50/USD converts to ~$1,183.43 (confirm live bank FX rate).',
    fields: [
      { key: 'amount', label: 'Amount to Convert', type: 'number', defaultValue: 100000, min: 0 },
      {
        key: 'fromCurrency',
        label: 'From Currency',
        type: 'select',
        defaultValue: 'INR',
        options: [
          { label: 'INR (₹ Indian Rupee)', value: 'INR' },
          { label: 'USD ($ US Dollar)', value: 'USD' },
          { label: 'EUR (€ Euro)', value: 'EUR' },
          { label: 'GBP (£ British Pound)', value: 'GBP' },
          { label: 'AED (د.إ UAE Dirham)', value: 'AED' },
          { label: 'SGD (S$ Singapore Dollar)', value: 'SGD' }
        ]
      },
      {
        key: 'toCurrency',
        label: 'To Currency',
        type: 'select',
        defaultValue: 'USD',
        options: [
          { label: 'USD ($ US Dollar)', value: 'USD' },
          { label: 'INR (₹ Indian Rupee)', value: 'INR' },
          { label: 'EUR (€ Euro)', value: 'EUR' },
          { label: 'GBP (£ British Pound)', value: 'GBP' },
          { label: 'AED (د.إ UAE Dirham)', value: 'AED' },
          { label: 'SGD (S$ Singapore Dollar)', value: 'SGD' }
        ]
      },
      { key: 'customUsdToInr', label: 'Reference USD to INR Rate (Editable)', type: 'number', defaultValue: 84.5, min: 1, step: 0.1, unit: '₹' }
    ]
  }
];
