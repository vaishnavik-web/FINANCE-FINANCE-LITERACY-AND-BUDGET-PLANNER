import type { TaxSlabConfig } from '../types/finance';
import { DEFAULT_TAX_CONFIG } from '../data/glossaryAndFaqs';

export interface CalcSummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface CalcResult {
  valid: boolean;
  error?: string;
  primaryLabel: string;
  primaryValue: string;
  summaryItems: CalcSummaryItem[];
  intermediateSteps: string[];
  chartData?: { name: string; primary: number; secondary?: number }[];
  chartLabels?: { primary: string; secondary?: string };
  tableHeaders?: string[];
  tableRows?: string[][];
  disclaimer?: string;
}

export function formatINR(val: number): string {
  if (!Number.isFinite(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val);
}

function num(inputs: Record<string, string | number>, key: string, fallback = 0): number {
  const raw = inputs[key];
  if (raw === '' || raw === undefined || raw === null) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function calcEmi(p: number, annualRate: number, months: number) {
  if (p <= 0 || months <= 0) return { emi: 0, totalPayment: 0, totalInterest: 0 };
  if (annualRate <= 0) {
    const emi = p / months;
    return { emi, totalPayment: p, totalInterest: 0 };
  }
  const r = annualRate / (12 * 100);
  const factor = Math.pow(1 + r, months);
  const emi = (p * r * factor) / (factor - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - p;
  return { emi, totalPayment, totalInterest };
}

function computeProgressiveTax(taxableIncome: number, slabs: { upto: number | null; rate: number }[]): number {
  let remaining = Math.max(0, taxableIncome);
  let prevLimit = 0;
  let tax = 0;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    if (slab.upto === null) {
      tax += remaining * (slab.rate / 100);
      remaining = 0;
    } else {
      const width = Math.max(0, slab.upto - prevLimit);
      const chunk = Math.min(remaining, width);
      tax += chunk * (slab.rate / 100);
      remaining -= chunk;
      prevLimit = slab.upto;
    }
  }
  return tax;
}

export function computeIncomeTax(
  grossIncome: number,
  regime: 'new' | 'old',
  salaried: boolean,
  oldDeductions: number,
  taxConfig: TaxSlabConfig = DEFAULT_TAX_CONFIG
) {
  const stdDed = salaried
    ? regime === 'new'
      ? taxConfig.newRegimeStandardDeduction
      : taxConfig.oldRegimeStandardDeduction
    : 0;
  const extraDed = regime === 'old' ? Math.max(0, oldDeductions) : 0;
  const taxable = Math.max(0, grossIncome - stdDed - extraDed);
  const slabs = regime === 'new' ? taxConfig.newRegimeSlabs : taxConfig.oldRegimeSlabs;
  const rebateLimit = regime === 'new' ? taxConfig.newRegimeRebateLimit : taxConfig.oldRegimeRebateLimit;

  let baseTax = computeProgressiveTax(taxable, slabs);
  let rebate87A = 0;
  if (taxable <= rebateLimit) {
    rebate87A = baseTax;
    baseTax = 0;
  } else if (regime === 'new' && taxable > rebateLimit) {
    // Marginal relief check so tax doesn't exceed income above rebate limit
    const excessIncome = taxable - rebateLimit;
    if (baseTax > excessIncome) {
      baseTax = excessIncome;
    }
  }
  const cess = baseTax * (taxConfig.cessRatePercent / 100);
  const totalTax = baseTax + cess;
  return { stdDed, extraDed, taxable, rebate87A, baseTax, cess, totalTax };
}

export function runCalculator(
  id: string,
  inputs: Record<string, string | number>,
  taxConfig: TaxSlabConfig = DEFAULT_TAX_CONFIG
): CalcResult {
  // General negative input guard
  for (const [k, v] of Object.entries(inputs)) {
    if (typeof v === 'number' && v < 0) {
      return {
        valid: false,
        error: `Input "${k}" cannot be negative.`,
        primaryLabel: 'Invalid Input',
        primaryValue: '—',
        summaryItems: [],
        intermediateSteps: []
      };
    }
  }

  switch (id) {
    case 'percentage': {
      const base = num(inputs, 'base');
      const rate = num(inputs, 'rate');
      const cmp = num(inputs, 'compareValue');
      if (base <= 0) return { valid: false, error: 'Base amount must be greater than 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const pctVal = (base * rate) / 100;
      const pctChange = ((cmp - base) / base) * 100;
      return {
        valid: true,
        primaryLabel: `${rate}% of ${formatINR(base)}`,
        primaryValue: formatINR(pctVal),
        summaryItems: [
          { label: 'Base + Percentage', value: formatINR(base + pctVal) },
          { label: 'Base − Percentage', value: formatINR(Math.max(0, base - pctVal)) },
          { label: '% Change to Comparison', value: `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`, highlight: true }
        ],
        intermediateSteps: [
          `(${base} × ${rate}) / 100 = ${pctVal.toFixed(2)}`,
          `Change = ((${cmp} − ${base}) / ${base}) × 100 = ${pctChange.toFixed(2)}%`
        ]
      };
    }

    case 'simple-interest': {
      const p = num(inputs, 'principal');
      const r = num(inputs, 'rate');
      const t = num(inputs, 'years');
      if (p <= 0 || t <= 0) return { valid: false, error: 'Principal and time must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const si = (p * r * t) / 100;
      const total = p + si;
      const chartData = Array.from({ length: Math.min(25, Math.ceil(t)) }, (_, i) => {
        const yr = i + 1;
        return { name: `Yr ${yr}`, primary: Math.round(p), secondary: Math.round((p * r * yr) / 100) };
      });
      return {
        valid: true,
        primaryLabel: 'Total Maturity Amount',
        primaryValue: formatINR(total),
        summaryItems: [
          { label: 'Principal Invested', value: formatINR(p) },
          { label: 'Simple Interest Earned', value: formatINR(si), highlight: true },
          { label: 'Yearly Interest', value: formatINR((p * r) / 100) }
        ],
        intermediateSteps: [`SI = (${p} × ${r} × ${t}) / 100 = ${formatINR(si)}`, `Total = ${formatINR(p)} + ${formatINR(si)} = ${formatINR(total)}`],
        chartData,
        chartLabels: { primary: 'Principal', secondary: 'Cumulative Interest' }
      };
    }

    case 'compound-interest': {
      const p = num(inputs, 'principal');
      const r = num(inputs, 'rate');
      const t = num(inputs, 'years');
      const n = Number(inputs.frequency || 4);
      if (p <= 0 || t <= 0) return { valid: false, error: 'Principal and years must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const amount = p * Math.pow(1 + r / (100 * n), n * t);
      const ci = amount - p;
      const chartData = Array.from({ length: Math.min(30, Math.ceil(t)) }, (_, i) => {
        const yr = i + 1;
        const val = p * Math.pow(1 + r / (100 * n), n * yr);
        return { name: `Yr ${yr}`, primary: Math.round(p), secondary: Math.round(val - p) };
      });
      return {
        valid: true,
        primaryLabel: 'Compounded Maturity Value',
        primaryValue: formatINR(amount),
        summaryItems: [
          { label: 'Principal Amount', value: formatINR(p) },
          { label: 'Compound Interest Earned', value: formatINR(ci), highlight: true },
          { label: 'Effective Annual Yield', value: `${((Math.pow(1 + r / (100 * n), n) - 1) * 100).toFixed(2)}%` }
        ],
        intermediateSteps: [
          `Compounding periods n = ${n}/year`,
          `A = ${p} × (1 + ${r}/(100×${n}))^(${n}×${t}) = ${formatINR(amount)}`
        ],
        chartData,
        chartLabels: { primary: 'Principal', secondary: 'Compound Interest' }
      };
    }

    case 'profit-loss': {
      const cp = num(inputs, 'costPrice');
      const sp = num(inputs, 'sellingPrice');
      const qty = Math.max(1, num(inputs, 'quantity', 1));
      if (cp <= 0) return { valid: false, error: 'Cost Price must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const diff = (sp - cp) * qty;
      const pct = ((sp - cp) / cp) * 100;
      const isProfit = diff >= 0;
      return {
        valid: true,
        primaryLabel: isProfit ? 'Net Profit' : 'Net Loss',
        primaryValue: formatINR(Math.abs(diff)),
        summaryItems: [
          { label: isProfit ? 'Profit Percentage' : 'Loss Percentage', value: `${Math.abs(pct).toFixed(2)}%`, highlight: true },
          { label: 'Total Cost Price', value: formatINR(cp * qty) },
          { label: 'Total Selling Price', value: formatINR(sp * qty) }
        ],
        intermediateSteps: [`Per Unit Difference = ${sp} − ${cp} = ${sp - cp}`, `Total across ${qty} units = ${formatINR(diff)} (${pct.toFixed(2)}%)`]
      };
    }

    case 'discount': {
      const mrp = num(inputs, 'mrp');
      const d1 = num(inputs, 'discount1');
      const d2 = num(inputs, 'discount2');
      if (mrp <= 0) return { valid: false, error: 'MRP must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const after1 = mrp * (1 - d1 / 100);
      const finalPrice = after1 * (1 - d2 / 100);
      const saved = mrp - finalPrice;
      return {
        valid: true,
        primaryLabel: 'Final Payable Price',
        primaryValue: formatINR(finalPrice),
        summaryItems: [
          { label: 'Total Savings', value: formatINR(saved), highlight: true },
          { label: 'Effective Total Discount', value: `${((saved / mrp) * 100).toFixed(2)}%` },
          { label: 'Price After Primary Discount', value: formatINR(after1) }
        ],
        intermediateSteps: [`Step 1: ${formatINR(mrp)} × (1 − ${d1}%) = ${formatINR(after1)}`, `Step 2: ${formatINR(after1)} × (1 − ${d2}%) = ${formatINR(finalPrice)}`]
      };
    }

    case 'gst-basic':
    case 'gst-tax-calc': {
      const amount = num(inputs, id === 'gst-basic' ? 'amount' : 'baseAmount');
      const rate = Number(inputs.gstRate ?? inputs.rate ?? 18);
      const mode = String(inputs.mode || 'exclusive');
      const supply = String(inputs.supplyType || 'intra');
      if (amount <= 0) return { valid: false, error: 'Amount must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      let base = amount;
      let gst = (amount * rate) / 100;
      let total = amount + gst;
      if (mode === 'inclusive') {
        base = amount / (1 + rate / 100);
        gst = amount - base;
        total = amount;
      }
      return {
        valid: true,
        primaryLabel: mode === 'inclusive' ? 'Net Base Amount (Excl. GST)' : 'Total Invoice Amount (Incl. GST)',
        primaryValue: formatINR(mode === 'inclusive' ? base : total),
        summaryItems: [
          { label: `Total GST (${rate}%)`, value: formatINR(gst), highlight: true },
          ...(supply === 'intra'
            ? [
                { label: `CGST (${rate / 2}%)`, value: formatINR(gst / 2) },
                { label: `SGST (${rate / 2}%)`, value: formatINR(gst / 2) }
              ]
            : [{ label: `IGST (${rate}%)`, value: formatINR(gst) }]),
          { label: 'Taxable Base Value', value: formatINR(base) }
        ],
        intermediateSteps: [
          mode === 'exclusive'
            ? `GST = ${formatINR(base)} × ${rate}% = ${formatINR(gst)}`
            : `Base = ${formatINR(total)} / (1 + ${rate}/100) = ${formatINR(base)}`
        ]
      };
    }

    case 'tax-percentage': {
      const gross = num(inputs, 'grossAmount');
      const tax = num(inputs, 'taxPaid');
      if (gross <= 0) return { valid: false, error: 'Gross amount must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const pct = (tax / gross) * 100;
      return {
        valid: true,
        primaryLabel: 'Effective Tax Percentage',
        primaryValue: `${pct.toFixed(2)}%`,
        summaryItems: [
          { label: 'Net After-Tax Income', value: formatINR(Math.max(0, gross - tax)), highlight: true },
          { label: 'Tax Paid', value: formatINR(tax) }
        ],
        intermediateSteps: [`(${tax} / ${gross}) × 100 = ${pct.toFixed(2)}%`]
      };
    }

    case 'emi-basic':
    case 'home-loan-emi':
    case 'personal-loan-emi':
    case 'car-loan-emi':
    case 'two-wheeler-loan-emi':
    case 'loan-interest':
    case 'total-loan-cost': {
      let p = num(inputs, 'principal');
      if (id === 'car-loan-emi') p = Math.max(0, num(inputs, 'carPrice') - num(inputs, 'downPayment'));
      if (id === 'two-wheeler-loan-emi') p = Math.max(0, num(inputs, 'bikePrice') - num(inputs, 'downPayment'));
      const rate = num(inputs, 'rate');
      const months = inputs.months !== undefined ? num(inputs, 'months') : num(inputs, 'years') * 12;
      if (p <= 0 || months <= 0) return { valid: false, error: 'Loan amount and tenure must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const { emi, totalPayment, totalInterest } = calcEmi(p, rate, months);
      const processingFee =
        id === 'personal-loan-emi'
          ? (p * num(inputs, 'processingFeePercent')) / 100
          : id === 'total-loan-cost'
            ? num(inputs, 'upfrontFees')
            : 0;
      const chartData = [
        { name: 'Principal', primary: Math.round(p) },
        { name: 'Total Interest', primary: Math.round(totalInterest) },
        ...(processingFee > 0 ? [{ name: 'Fees', primary: Math.round(processingFee) }] : [])
      ];
      return {
        valid: true,
        primaryLabel: id === 'loan-interest' ? 'Total Interest Payable' : id === 'total-loan-cost' ? 'All-In Total Loan Cost' : 'Monthly EMI',
        primaryValue: formatINR(id === 'loan-interest' ? totalInterest : id === 'total-loan-cost' ? totalPayment + processingFee : emi),
        summaryItems: [
          { label: 'Monthly EMI', value: formatINR(emi), highlight: true },
          { label: 'Principal Loan Amount', value: formatINR(p) },
          { label: 'Total Interest Cost', value: formatINR(totalInterest) },
          { label: 'Total Repayment + Fees', value: formatINR(totalPayment + processingFee) }
        ],
        intermediateSteps: [
          `Monthly Rate r = ${rate}% / 12 = ${(rate / 12).toFixed(4)}%, Months n = ${months}`,
          `EMI = ${formatINR(emi)} | Interest Burden = ${((totalInterest / p) * 100).toFixed(1)}% of principal`
        ],
        chartData,
        chartLabels: { primary: 'Amount (₹)' }
      };
    }

    case 'education-loan-emi': {
      const p = num(inputs, 'principal');
      const rate = num(inputs, 'rate');
      const moratorium = num(inputs, 'moratoriumMonths');
      const years = num(inputs, 'repaymentYears');
      if (p <= 0 || years <= 0) return { valid: false, error: 'Loan amount and tenure must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const moratoriumInterest = (p * rate * (moratorium / 12)) / 100;
      const capitalizedPrincipal = p + moratoriumInterest;
      const { emi, totalPayment, totalInterest } = calcEmi(capitalizedPrincipal, rate, years * 12);
      return {
        valid: true,
        primaryLabel: 'Post-Moratorium Monthly EMI',
        primaryValue: formatINR(emi),
        summaryItems: [
          { label: 'Moratorium Simple Interest', value: formatINR(moratoriumInterest) },
          { label: 'Revised Principal at Repayment', value: formatINR(capitalizedPrincipal) },
          { label: 'Total Repayment', value: formatINR(totalPayment), highlight: true },
          { label: 'Total Interest (incl. Moratorium)', value: formatINR(moratoriumInterest + totalInterest) }
        ],
        intermediateSteps: [
          `Moratorium Interest = ${formatINR(p)} × ${rate}% × (${moratorium}/12) = ${formatINR(moratoriumInterest)}`,
          `EMI on ${formatINR(capitalizedPrincipal)} over ${years * 12} months = ${formatINR(emi)}`
        ]
      };
    }

    case 'loan-repayment': {
      const bal = num(inputs, 'balance');
      const rate = num(inputs, 'rate');
      const pay = num(inputs, 'monthlyPayment');
      const r = rate / 1200;
      if (bal <= 0 || pay <= 0) return { valid: false, error: 'Balance and monthly payment must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      if (r > 0 && pay <= bal * r) {
        return { valid: false, error: `Monthly payment must exceed monthly interest (${formatINR(bal * r)}).`, primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      }
      const months = r === 0 ? Math.ceil(bal / pay) : Math.ceil(-Math.log(1 - (bal * r) / pay) / Math.log(1 + r));
      const totalPaid = pay * months;
      return {
        valid: true,
        primaryLabel: 'Estimated Payoff Time',
        primaryValue: `${months} months (${(months / 12).toFixed(1)} yrs)`,
        summaryItems: [
          { label: 'Total Interest Paid', value: formatINR(Math.max(0, totalPaid - bal)), highlight: true },
          { label: 'Total Outflow', value: formatINR(totalPaid) }
        ],
        intermediateSteps: [`Monthly interest starts at ${formatINR(bal * r)}; clearing principal takes ${months} monthly payments.`]
      };
    }

    case 'inflation': {
      const cost = num(inputs, 'currentCost');
      const rate = num(inputs, 'inflationRate');
      const yrs = num(inputs, 'years');
      if (cost <= 0 || yrs <= 0) return { valid: false, error: 'Cost and years must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const futureCost = cost * Math.pow(1 + rate / 100, yrs);
      const purchasingPower = cost / Math.pow(1 + rate / 100, yrs);
      const chartData = Array.from({ length: Math.min(25, Math.ceil(yrs)) }, (_, i) => ({
        name: `Yr ${i + 1}`,
        primary: Math.round(cost * Math.pow(1 + rate / 100, i + 1))
      }));
      return {
        valid: true,
        primaryLabel: `Future Cost After ${yrs} Years`,
        primaryValue: formatINR(futureCost),
        summaryItems: [
          { label: `Today's ${formatINR(cost)} Value in ${yrs} Yrs`, value: formatINR(purchasingPower), highlight: true },
          { label: 'Cumulative Price Rise', value: `${(((futureCost - cost) / cost) * 100).toFixed(1)}%` }
        ],
        intermediateSteps: [`${formatINR(cost)} × (1 + ${rate}%)^${yrs} = ${formatINR(futureCost)}`],
        chartData,
        chartLabels: { primary: 'Inflation-Adjusted Cost' }
      };
    }

    case 'monthly-savings': {
      const inc = num(inputs, 'income');
      const exp = num(inputs, 'expenses');
      if (inc <= 0) return { valid: false, error: 'Monthly income must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const sav = inc - exp;
      const rate = (sav / inc) * 100;
      return {
        valid: true,
        primaryLabel: 'Monthly Net Savings',
        primaryValue: formatINR(sav),
        summaryItems: [
          { label: 'Savings Rate', value: `${rate.toFixed(1)}%`, highlight: true },
          { label: 'Projected Annual Savings', value: formatINR(sav * 12) },
          { label: 'Expense Ratio', value: `${((exp / inc) * 100).toFixed(1)}%` }
        ],
        intermediateSteps: [`${formatINR(inc)} − ${formatINR(exp)} = ${formatINR(sav)} (${rate.toFixed(1)}%)`]
      };
    }

    case 'annual-savings': {
      const mi = num(inputs, 'monthlyIncome');
      const me = num(inputs, 'monthlyExpense');
      const bonus = num(inputs, 'annualBonus');
      const annExp = num(inputs, 'annualExpenses');
      const net = (mi - me) * 12 + bonus - annExp;
      const totalIn = mi * 12 + bonus;
      return {
        valid: true,
        primaryLabel: 'Net Annual Savings',
        primaryValue: formatINR(net),
        summaryItems: [
          { label: 'Total Annual Income', value: formatINR(totalIn) },
          { label: 'Total Annual Outflow', value: formatINR(me * 12 + annExp) },
          { label: 'Annual Savings Rate', value: totalIn > 0 ? `${((net / totalIn) * 100).toFixed(1)}%` : '0%', highlight: true }
        ],
        intermediateSteps: [`(${formatINR(mi - me)} × 12) + ${formatINR(bonus)} − ${formatINR(annExp)} = ${formatINR(net)}`]
      };
    }

    case 'savings-goal':
    case 'monthly-deposit': {
      const target = num(inputs, id === 'savings-goal' ? 'targetAmount' : 'target');
      const current = id === 'savings-goal' ? num(inputs, 'currentSaved') : 0;
      const months = id === 'savings-goal' ? num(inputs, 'months') : num(inputs, 'years') * 12;
      const annualRate = num(inputs, id === 'savings-goal' ? 'annualRate' : 'rate');
      if (target <= 0 || months <= 0) return { valid: false, error: 'Target and timeline must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const r = annualRate / 1200;
      const futureOfCurrent = current * Math.pow(1 + r, months);
      const remaining = Math.max(0, target - futureOfCurrent);
      const pmt = r === 0 ? remaining / months : (remaining * r) / (Math.pow(1 + r, months) - 1);
      return {
        valid: true,
        primaryLabel: 'Required Monthly Saving',
        primaryValue: formatINR(pmt),
        summaryItems: [
          { label: 'Total Contributions Needed', value: formatINR(pmt * months) },
          { label: 'Interest / Growth Earned', value: formatINR(Math.max(0, target - current - pmt * months)), highlight: true },
          { label: 'Target Amount', value: formatINR(target) }
        ],
        intermediateSteps: [`Existing savings grow to ${formatINR(futureOfCurrent)}; monthly deposit ${formatINR(pmt)} bridges remaining ${formatINR(remaining)}.`]
      };
    }

    case 'rd-calculator': {
      const mDep = num(inputs, 'monthlyDeposit');
      const rate = num(inputs, 'rate');
      const months = num(inputs, 'months');
      if (mDep <= 0 || months <= 0) return { valid: false, error: 'Deposit and months must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      let maturity = 0;
      for (let i = 0; i < months; i++) {
        const remMonths = months - i;
        maturity += mDep * Math.pow(1 + rate / 400, (4 * remMonths) / 12);
      }
      const invested = mDep * months;
      return {
        valid: true,
        primaryLabel: 'RD Maturity Value',
        primaryValue: formatINR(maturity),
        summaryItems: [
          { label: 'Total Deposited', value: formatINR(invested) },
          { label: 'Interest Earned', value: formatINR(maturity - invested), highlight: true }
        ],
        intermediateSteps: [`Quarterly compounded across ${months} monthly installments at ${rate}% p.a.`],
        chartData: [
          { name: 'Deposited', primary: Math.round(invested) },
          { name: 'Interest', primary: Math.round(maturity - invested) }
        ],
        chartLabels: { primary: 'Amount (₹)' }
      };
    }

    case 'fd-calculator': {
      const p = num(inputs, 'principal');
      const r = num(inputs, 'rate');
      const t = num(inputs, 'years');
      const n = Number(inputs.compounding || 4);
      if (p <= 0 || t <= 0) return { valid: false, error: 'Principal and tenure must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const maturity = p * Math.pow(1 + r / (100 * n), n * t);
      return {
        valid: true,
        primaryLabel: 'FD Maturity Value',
        primaryValue: formatINR(maturity),
        summaryItems: [
          { label: 'Principal Deposited', value: formatINR(p) },
          { label: 'Total Interest Earned', value: formatINR(maturity - p), highlight: true }
        ],
        intermediateSteps: [`A = ${formatINR(p)} × (1 + ${r}/(100×${n}))^(${n}×${t}) = ${formatINR(maturity)}`]
      };
    }

    case 'emergency-fund': {
      const ess = num(inputs, 'essentialMonthly');
      const mo = num(inputs, 'coverageMonths');
      const cur = num(inputs, 'existingReserve');
      const add = num(inputs, 'monthlyAddition');
      const target = ess * mo;
      const gap = Math.max(0, target - cur);
      const monthsNeeded = add > 0 ? Math.ceil(gap / add) : 0;
      return {
        valid: true,
        primaryLabel: 'Recommended Emergency Fund',
        primaryValue: formatINR(target),
        summaryItems: [
          { label: 'Current Shortfall', value: formatINR(gap), highlight: true },
          { label: 'Completion Coverage', value: `${Math.min(100, (cur / Math.max(1, target)) * 100).toFixed(1)}%` },
          { label: 'Time to Fill Gap', value: gap === 0 ? 'Funded' : add > 0 ? `${monthsNeeded} months` : 'Set monthly addition' }
        ],
        intermediateSteps: [`${formatINR(ess)} × ${mo} months = ${formatINR(target)}`]
      };
    }

    case 'future-value':
    case 'savings-growth': {
      const pv = num(inputs, id === 'future-value' ? 'presentValue' : 'initial');
      const pmt = num(inputs, id === 'future-value' ? 'monthlyContribution' : 'monthly');
      const rate = num(inputs, id === 'future-value' ? 'annualRate' : 'rate');
      const years = num(inputs, 'years');
      if (years <= 0) return { valid: false, error: 'Years must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const r = rate / 1200;
      let bal = pv;
      let contributed = pv;
      const chartData: { name: string; primary: number; secondary: number }[] = [];
      for (let yr = 1; yr <= Math.min(40, years); yr++) {
        for (let m = 0; m < 12; m++) {
          bal = bal * (1 + r) + pmt;
          contributed += pmt;
        }
        chartData.push({ name: `Yr ${yr}`, primary: Math.round(contributed), secondary: Math.round(bal - contributed) });
      }
      return {
        valid: true,
        primaryLabel: 'Projected Future Value',
        primaryValue: formatINR(bal),
        summaryItems: [
          { label: 'Total Principal Contributed', value: formatINR(contributed) },
          { label: 'Total Interest / Growth', value: formatINR(Math.max(0, bal - contributed)), highlight: true }
        ],
        intermediateSteps: [`Starting ${formatINR(pv)} + ${formatINR(pmt)}/mo compounded monthly for ${years} years.`],
        chartData,
        chartLabels: { primary: 'Principal', secondary: 'Interest Growth' }
      };
    }

    case 'present-value': {
      const fv = num(inputs, 'futureValue');
      const rate = num(inputs, 'discountRate');
      const yrs = num(inputs, 'years');
      const pv = fv / Math.pow(1 + rate / 100, yrs);
      return {
        valid: true,
        primaryLabel: "Today's Present Value",
        primaryValue: formatINR(pv),
        summaryItems: [
          { label: 'Future Value Entered', value: formatINR(fv) },
          { label: 'Discount Factor', value: `${((pv / Math.max(1, fv)) * 100).toFixed(2)}%`, highlight: true }
        ],
        intermediateSteps: [`PV = ${formatINR(fv)} / (1 + ${rate}%)^${yrs} = ${formatINR(pv)}`]
      };
    }

    case 'sip':
    case 'mutual-fund-return': {
      const lumpsum = id === 'mutual-fund-return' ? num(inputs, 'lumpsum') : 0;
      const monthly = num(inputs, id === 'sip' ? 'monthlyAmount' : 'monthlySip');
      const gross = num(inputs, id === 'sip' ? 'expectedReturn' : 'grossReturn');
      const expRatio = id === 'mutual-fund-return' ? num(inputs, 'expenseRatio') : 0;
      const netRate = Math.max(0, gross - expRatio);
      const years = num(inputs, 'years');
      if (years <= 0) return { valid: false, error: 'Duration must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const i = netRate / 1200;
      const chartData: { name: string; primary: number; secondary: number }[] = [];
      let bal = lumpsum;
      let invested = lumpsum;
      for (let yr = 1; yr <= Math.min(45, years); yr++) {
        for (let m = 0; m < 12; m++) {
          bal = (bal + monthly) * (1 + i);
          invested += monthly;
        }
        chartData.push({ name: `Yr ${yr}`, primary: Math.round(invested), secondary: Math.round(Math.max(0, bal - invested)) });
      }
      return {
        valid: true,
        primaryLabel: 'Estimated Maturity Value',
        primaryValue: formatINR(bal),
        summaryItems: [
          { label: 'Total Amount Invested', value: formatINR(invested) },
          { label: 'Estimated Wealth Gain', value: formatINR(Math.max(0, bal - invested)), highlight: true },
          { label: 'Net Return Assumed', value: `${netRate.toFixed(2)}% p.a.` }
        ],
        intermediateSteps: [`Monthly compounding at ${netRate.toFixed(2)}% p.a. over ${years * 12} months.`],
        chartData,
        chartLabels: { primary: 'Invested', secondary: 'Est. Gain' },
        disclaimer: 'Estimated illustration only. Mutual fund and market-linked returns are not guaranteed and actual outcomes will vary.'
      };
    }

    case 'lumpsum': {
      const p = num(inputs, 'amount');
      const r = num(inputs, 'expectedReturn');
      const t = num(inputs, 'years');
      const fv = p * Math.pow(1 + r / 100, t);
      const chartData = Array.from({ length: Math.min(40, Math.ceil(t)) }, (_, idx) => {
        const yr = idx + 1;
        const v = p * Math.pow(1 + r / 100, yr);
        return { name: `Yr ${yr}`, primary: Math.round(p), secondary: Math.round(v - p) };
      });
      return {
        valid: true,
        primaryLabel: 'Estimated Future Value',
        primaryValue: formatINR(fv),
        summaryItems: [
          { label: 'Initial Investment', value: formatINR(p) },
          { label: 'Estimated Gain', value: formatINR(fv - p), highlight: true }
        ],
        intermediateSteps: [`${formatINR(p)} × (1 + ${r}%)^${t} = ${formatINR(fv)}`],
        chartData,
        chartLabels: { primary: 'Principal', secondary: 'Est. Gain' },
        disclaimer: 'Estimated results only. Market-linked returns are not guaranteed.'
      };
    }

    case 'cagr': {
      const init = num(inputs, 'initialValue');
      const fin = num(inputs, 'finalValue');
      const yrs = num(inputs, 'years');
      if (init <= 0 || fin <= 0 || yrs <= 0) return { valid: false, error: 'All inputs must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const cagr = (Math.pow(fin / init, 1 / yrs) - 1) * 100;
      const abs = ((fin - init) / init) * 100;
      return {
        valid: true,
        primaryLabel: 'CAGR (Annualized)',
        primaryValue: `${cagr.toFixed(2)}%`,
        summaryItems: [
          { label: 'Absolute Total Growth', value: `${abs.toFixed(2)}%`, highlight: true },
          { label: 'Net Gain', value: formatINR(fin - init) }
        ],
        intermediateSteps: [`((${fin} / ${init})^(1/${yrs}) − 1) × 100 = ${cagr.toFixed(2)}%`],
        disclaimer: 'Historical or projected CAGR does not guarantee future performance.'
      };
    }

    case 'xirr': {
      const cf1 = -Math.abs(num(inputs, 'cf1'));
      const cf2 = -Math.abs(num(inputs, 'cf2'));
      const cf3 = -Math.abs(num(inputs, 'cf3'));
      const fin = Math.abs(num(inputs, 'finalValue'));
      const months = num(inputs, 'totalMonths');
      const flows = [
        { amount: cf1, years: 0 },
        ...(cf2 !== 0 ? [{ amount: cf2, years: 0.5 }] : []),
        ...(cf3 !== 0 ? [{ amount: cf3, years: 1.0 }] : []),
        { amount: fin, years: months / 12 }
      ];
      // Newton-Raphson solver for XIRR
      let rate = 0.12;
      for (let iter = 0; iter < 50; iter++) {
        let f = 0;
        let df = 0;
        for (const fl of flows) {
          const denom = Math.pow(1 + rate, fl.years);
          f += fl.amount / denom;
          df -= (fl.years * fl.amount) / Math.pow(1 + rate, fl.years + 1);
        }
        if (Math.abs(df) < 1e-9) break;
        const next = rate - f / df;
        if (Math.abs(next - rate) < 1e-6) {
          rate = next;
          break;
        }
        rate = Math.max(-0.95, Math.min(5, next));
      }
      const totalOut = Math.abs(cf1 + cf2 + cf3);
      return {
        valid: true,
        primaryLabel: 'Estimated XIRR',
        primaryValue: `${(rate * 100).toFixed(2)}% p.a.`,
        summaryItems: [
          { label: 'Total Cash Invested', value: formatINR(totalOut) },
          { label: 'Net Profit / Loss', value: formatINR(fin - totalOut), highlight: true }
        ],
        intermediateSteps: [`Solved NPV = 0 across ${flows.length} dated cash flows over ${months} months.`],
        disclaimer: 'Estimated metric only; irregular cash-flow returns are not guaranteed.'
      };
    }

    case 'investment-return': {
      const inv = num(inputs, 'invested');
      const cur = num(inputs, 'currentValue');
      const yrs = num(inputs, 'years');
      const inf = num(inputs, 'inflation');
      if (inv <= 0 || yrs <= 0) return { valid: false, error: 'Invested amount and years must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const absPct = ((cur - inv) / inv) * 100;
      const cagr = (Math.pow(Math.max(0.01, cur) / inv, 1 / yrs) - 1) * 100;
      const realRate = (((1 + cagr / 100) / (1 + inf / 100)) - 1) * 100;
      return {
        valid: true,
        primaryLabel: 'Net Return Amount',
        primaryValue: formatINR(cur - inv),
        summaryItems: [
          { label: 'Absolute Return', value: `${absPct.toFixed(2)}%` },
          { label: 'Annualized (CAGR)', value: `${cagr.toFixed(2)}%`, highlight: true },
          { label: 'Inflation-Adjusted Real CAGR', value: `${realRate.toFixed(2)}%` }
        ],
        intermediateSteps: [`Fisher equation real return = ((1 + ${cagr.toFixed(2)}%) / (1 + ${inf}%)) − 1 = ${realRate.toFixed(2)}%`],
        disclaimer: 'Estimated figures only; market returns are subject to market risks.'
      };
    }

    case 'stepup-sip': {
      let sip = num(inputs, 'monthlySip');
      const step = num(inputs, 'stepUpPercent');
      const ret = num(inputs, 'expectedReturn');
      const yrs = num(inputs, 'years');
      const i = ret / 1200;
      let bal = 0;
      let invested = 0;
      const chartData: { name: string; primary: number; secondary: number }[] = [];
      for (let yr = 1; yr <= Math.min(40, yrs); yr++) {
        for (let m = 0; m < 12; m++) {
          bal = (bal + sip) * (1 + i);
          invested += sip;
        }
        chartData.push({ name: `Yr ${yr}`, primary: Math.round(invested), secondary: Math.round(bal - invested) });
        sip = sip * (1 + step / 100);
      }
      return {
        valid: true,
        primaryLabel: 'Step-Up SIP Estimated Value',
        primaryValue: formatINR(bal),
        summaryItems: [
          { label: 'Total Invested', value: formatINR(invested) },
          { label: 'Estimated Wealth Gain', value: formatINR(bal - invested), highlight: true },
          { label: 'Final Year Monthly SIP', value: formatINR(sip / (1 + step / 100)) }
        ],
        intermediateSteps: [`Monthly SIP stepped up by ${step}% every year for ${yrs} years.`],
        chartData,
        chartLabels: { primary: 'Invested', secondary: 'Est. Gain' },
        disclaimer: 'Estimated results only. Actual market returns vary.'
      };
    }

    case 'annualized-return': {
      const inv = num(inputs, 'invested');
      const end = num(inputs, 'ending');
      const days = num(inputs, 'days');
      if (inv <= 0 || days <= 0) return { valid: false, error: 'Amounts and days must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const totRet = (end - inv) / inv;
      const ann = (Math.pow(1 + totRet, 365 / days) - 1) * 100;
      return {
        valid: true,
        primaryLabel: 'Annualized Return',
        primaryValue: `${ann.toFixed(2)}% p.a.`,
        summaryItems: [
          { label: 'Period Return', value: `${(totRet * 100).toFixed(2)}%` },
          { label: 'Net Gain', value: formatINR(end - inv), highlight: true }
        ],
        intermediateSteps: [`((1 + ${(totRet * 100).toFixed(2)}%)^(365/${days}) − 1) = ${ann.toFixed(2)}%`],
        disclaimer: 'Annualizing short holding periods extrapolates past velocity; returns are not guaranteed.'
      };
    }

    case 'ppf-calculator': {
      const annualDep = Math.min(150000, num(inputs, 'annualDeposit'));
      const rate = num(inputs, 'rate');
      const years = num(inputs, 'years');
      let bal = 0;
      const chartData: { name: string; primary: number; secondary: number }[] = [];
      for (let yr = 1; yr <= years; yr++) {
        bal = (bal + annualDep) * (1 + rate / 100);
        chartData.push({ name: `Yr ${yr}`, primary: Math.round(annualDep * yr), secondary: Math.round(bal - annualDep * yr) });
      }
      const invested = annualDep * years;
      return {
        valid: true,
        primaryLabel: `Estimated ${years}-Year PPF Maturity`,
        primaryValue: formatINR(bal),
        summaryItems: [
          { label: 'Total Deposited', value: formatINR(invested) },
          { label: 'Compounded Interest', value: formatINR(bal - invested), highlight: true }
        ],
        intermediateSteps: [`Assumes ₹${annualDep.toLocaleString('en-IN')}/year deposited before April 5 at ${rate}% p.a.`],
        chartData,
        chartLabels: { primary: 'Deposited', secondary: 'Interest' },
        disclaimer: 'PPF rates are notified quarterly by the Ministry of Finance (check nsiindia.gov.in).'
      };
    }

    case 'nps-calculator': {
      const m = num(inputs, 'monthlyContribution');
      const age = num(inputs, 'currentAge');
      const ret = num(inputs, 'expectedReturn');
      const annPct = Math.max(40, Math.min(100, num(inputs, 'annuityPercent')));
      const annRate = num(inputs, 'annuityRate');
      const yrs = Math.max(1, 60 - age);
      const i = ret / 1200;
      const n = yrs * 12;
      const corpus = m * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const annuityCorpus = (corpus * annPct) / 100;
      const lumpSum = corpus - annuityCorpus;
      const monthlyPension = (annuityCorpus * (annRate / 100)) / 12;
      return {
        valid: true,
        primaryLabel: 'Estimated NPS Corpus at Age 60',
        primaryValue: formatINR(corpus),
        summaryItems: [
          { label: `Lump Sum Withdrawal (${100 - annPct}%)`, value: formatINR(lumpSum) },
          { label: `Estimated Monthly Pension`, value: formatINR(monthlyPension), highlight: true },
          { label: 'Total Contributions Made', value: formatINR(m * n) }
        ],
        intermediateSteps: [`${yrs} years (${n} months) at ${ret}% illustrative return; ${annPct}% allocated to annuity at ${annRate}%.`],
        disclaimer: 'Estimated NPS illustration only. Market-linked pension corpus and annuity rates vary.'
      };
    }

    case 'loan-eligibility': {
      const inc = num(inputs, 'monthlyIncome');
      const existing = num(inputs, 'existingEmi');
      const foir = num(inputs, 'foirPercent');
      const rate = num(inputs, 'rate');
      const yrs = num(inputs, 'years');
      const maxEmi = Math.max(0, (inc * foir) / 100 - existing);
      const r = rate / 1200;
      const n = yrs * 12;
      const eligiblePrincipal = r === 0 ? maxEmi * n : maxEmi * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
      return {
        valid: true,
        primaryLabel: 'Estimated Eligible Loan Amount',
        primaryValue: formatINR(eligiblePrincipal),
        summaryItems: [
          { label: 'Max Affordable New EMI', value: formatINR(maxEmi), highlight: true },
          { label: 'FOIR Ceiling Used', value: `${foir}% of income` }
        ],
        intermediateSteps: [`Max EMI = (${formatINR(inc)} × ${foir}%) − ${formatINR(existing)} = ${formatINR(maxEmi)}`]
      };
    }

    case 'loan-prepayment': {
      const p = num(inputs, 'principal');
      const rate = num(inputs, 'rate');
      const yrs = num(inputs, 'years');
      const annualPre = num(inputs, 'annualPrepayment');
      const { emi, totalInterest: baseInterest } = calcEmi(p, rate, yrs * 12);
      const r = rate / 1200;
      let bal = p;
      let monthsWithPre = 0;
      let interestWithPre = 0;
      while (bal > 0.5 && monthsWithPre < yrs * 12) {
        monthsWithPre++;
        const intPart = bal * r;
        interestWithPre += intPart;
        const prinPart = Math.min(bal, emi - intPart);
        bal -= prinPart;
        if (monthsWithPre % 12 === 0 && bal > 0 && annualPre > 0) {
          bal = Math.max(0, bal - annualPre);
        }
      }
      const monthsSaved = Math.max(0, yrs * 12 - monthsWithPre);
      const interestSaved = Math.max(0, baseInterest - interestWithPre);
      return {
        valid: true,
        primaryLabel: 'Total Interest Saved',
        primaryValue: formatINR(interestSaved),
        summaryItems: [
          { label: 'Tenure Reduced By', value: `${monthsSaved} months`, highlight: true },
          { label: 'Original Total Interest', value: formatINR(baseInterest) },
          { label: 'New Total Interest', value: formatINR(interestWithPre) }
        ],
        intermediateSteps: [`Regular EMI ${formatINR(emi)} + ${formatINR(annualPre)} annual principal prepayment finishes in ${monthsWithPre} months.`]
      };
    }

    case 'loan-amortization': {
      const p = num(inputs, 'principal');
      const rate = num(inputs, 'rate');
      const yrs = Math.min(30, Math.max(1, Math.round(num(inputs, 'years'))));
      const { emi, totalInterest, totalPayment } = calcEmi(p, rate, yrs * 12);
      const r = rate / 1200;
      let bal = p;
      const tableRows: string[][] = [];
      const chartData: { name: string; primary: number; secondary: number }[] = [];
      for (let yr = 1; yr <= yrs; yr++) {
        let yrPrin = 0;
        let yrInt = 0;
        for (let m = 0; m < 12; m++) {
          if (bal <= 0) break;
          const intPart = bal * r;
          const prinPart = Math.min(bal, emi - intPart);
          yrInt += intPart;
          yrPrin += prinPart;
          bal = Math.max(0, bal - prinPart);
        }
        tableRows.push([`Year ${yr}`, formatINR(yrPrin), formatINR(yrInt), formatINR(bal)]);
        chartData.push({ name: `Yr ${yr}`, primary: Math.round(yrPrin), secondary: Math.round(yrInt) });
      }
      return {
        valid: true,
        primaryLabel: 'Monthly EMI',
        primaryValue: formatINR(emi),
        summaryItems: [
          { label: 'Total Principal', value: formatINR(p) },
          { label: 'Total Interest', value: formatINR(totalInterest), highlight: true },
          { label: 'Total Payable', value: formatINR(totalPayment) }
        ],
        intermediateSteps: [`Year-by-year amortization breakdown for ${yrs} years at ${rate}% p.a.`],
        chartData,
        chartLabels: { primary: 'Principal Paid', secondary: 'Interest Paid' },
        tableHeaders: ['Year', 'Principal Repaid', 'Interest Paid', 'Closing Balance'],
        tableRows
      };
    }

    case 'income-tax-estimator': {
      const gross = num(inputs, 'grossIncome');
      const regime = String(inputs.regime || 'new') as 'new' | 'old';
      const salaried = String(inputs.salaried || 'yes') === 'yes';
      const oldDed = num(inputs, 'oldDeductions');
      const res = computeIncomeTax(gross, regime, salaried, oldDed, taxConfig);
      return {
        valid: true,
        primaryLabel: `Estimated Tax (${regime === 'new' ? 'New' : 'Old'} Regime)`,
        primaryValue: formatINR(res.totalTax),
        summaryItems: [
          { label: 'Net Taxable Income', value: formatINR(res.taxable) },
          { label: 'Base Slab Tax (after 87A)', value: formatINR(res.baseTax) },
          { label: `Health & Edu Cess (${taxConfig.cessRatePercent}%)`, value: formatINR(res.cess) },
          { label: 'Effective Tax Rate', value: gross > 0 ? `${((res.totalTax / gross) * 100).toFixed(2)}%` : '0%', highlight: true }
        ],
        intermediateSteps: [
          `Rules Applied: ${taxConfig.financialYear} (${taxConfig.assessmentYear}) — configurable in Tax Rules panel.`,
          `Gross ${formatINR(gross)} − Std Ded ${formatINR(res.stdDed)} − Extra Ded ${formatINR(res.extraDed)} = Taxable ${formatINR(res.taxable)}`
        ],
        disclaimer: `Educational estimate using ${taxConfig.financialYear} configurable rules. Verify final filing on incometax.gov.in.`
      };
    }

    case 'tax-regime-comparison': {
      const gross = num(inputs, 'grossIncome');
      const d80c = Math.min(150000, num(inputs, 'deduction80C'));
      const d80d = num(inputs, 'deduction80D');
      const hra = num(inputs, 'hraAndOther');
      const oldTotalDed = d80c + d80d + hra;
      const newRes = computeIncomeTax(gross, 'new', true, 0, taxConfig);
      const oldRes = computeIncomeTax(gross, 'old', true, oldTotalDed, taxConfig);
      const savings = Math.abs(newRes.totalTax - oldRes.totalTax);
      const better = newRes.totalTax <= oldRes.totalTax ? 'New Regime' : 'Old Regime';
      return {
        valid: true,
        primaryLabel: `Lower Tax Option: ${better}`,
        primaryValue: `Saves ${formatINR(savings)}`,
        summaryItems: [
          { label: 'New Regime Total Tax', value: formatINR(newRes.totalTax), highlight: better === 'New Regime' },
          { label: 'Old Regime Total Tax', value: formatINR(oldRes.totalTax), highlight: better === 'Old Regime' },
          { label: 'Old Regime Deductions Used', value: formatINR(oldTotalDed + oldRes.stdDed) }
        ],
        intermediateSteps: [
          `Using ${taxConfig.financialYear} assumptions: New Std Ded ${formatINR(taxConfig.newRegimeStandardDeduction)}, Old Std Ded ${formatINR(taxConfig.oldRegimeStandardDeduction)}.`
        ],
        chartData: [
          { name: 'New Regime', primary: Math.round(newRes.totalTax) },
          { name: 'Old Regime', primary: Math.round(oldRes.totalTax) }
        ],
        chartLabels: { primary: 'Total Tax (₹)' },
        disclaimer: 'Educational comparison based on configurable slab rules; consult a CA or incometax.gov.in for filing.'
      };
    }

    case 'hra-exemption': {
      const basic = num(inputs, 'basicAnnual');
      const hra = num(inputs, 'hraReceived');
      const rent = num(inputs, 'rentPaid');
      const isMetro = String(inputs.cityType || 'metro') === 'metro';
      const cond1 = hra;
      const cond2 = Math.max(0, rent - 0.1 * basic);
      const cond3 = (isMetro ? 0.5 : 0.4) * basic;
      const exempt = Math.min(cond1, cond2, cond3);
      return {
        valid: true,
        primaryLabel: 'Exempt HRA Amount (Old Regime)',
        primaryValue: formatINR(exempt),
        summaryItems: [
          { label: 'Taxable HRA Portion', value: formatINR(Math.max(0, hra - exempt)), highlight: true },
          { label: '1. Actual HRA Received', value: formatINR(cond1) },
          { label: '2. Rent − 10% Basic', value: formatINR(cond2) },
          { label: `3. ${isMetro ? '50%' : '40%'} of Basic`, value: formatINR(cond3) }
        ],
        intermediateSteps: [`Minimum of (${formatINR(cond1)}, ${formatINR(cond2)}, ${formatINR(cond3)}) = ${formatINR(exempt)}`]
      };
    }

    case 'tax-deduction-calc': {
      const c80 = Math.min(150000, num(inputs, 'sec80C'));
      const d80 = num(inputs, 'sec80D');
      const nps = Math.min(50000, num(inputs, 'sec80CCD1B'));
      const tta = num(inputs, 'sec80TTA');
      const slab = num(inputs, 'marginalRate');
      const totalDed = c80 + d80 + nps + tta;
      const estTaxSaved = totalDed * (slab / 100) * 1.04;
      return {
        valid: true,
        primaryLabel: 'Total Eligible Deductions (Old Regime)',
        primaryValue: formatINR(totalDed),
        summaryItems: [
          { label: 'Estimated Tax Saved (incl. 4% Cess)', value: formatINR(estTaxSaved), highlight: true },
          { label: '80C Capped (Max ₹1.5L)', value: formatINR(c80) },
          { label: 'NPS 80CCD(1B) (Max ₹50k)', value: formatINR(nps) }
        ],
        intermediateSteps: [`${formatINR(totalDed)} × ${slab}% × 1.04 = ${formatINR(estTaxSaved)} estimated tax reduction.`]
      };
    }

    case 'tds-estimator': {
      const amt = num(inputs, 'paymentAmount');
      const stdRate = Number(inputs.sectionRate || 10);
      const hasPan = String(inputs.hasPan || 'yes') === 'yes';
      const appliedRate = hasPan ? stdRate : Math.max(20, stdRate);
      const tds = (amt * appliedRate) / 100;
      return {
        valid: true,
        primaryLabel: `Estimated TDS (${appliedRate}%)`,
        primaryValue: formatINR(tds),
        summaryItems: [
          { label: 'Net Amount Receivable', value: formatINR(amt - tds), highlight: true },
          { label: 'Gross Amount', value: formatINR(amt) }
        ],
        intermediateSteps: [`${formatINR(amt)} × ${appliedRate}% = ${formatINR(tds)} (PAN ${hasPan ? 'provided' : 'missing → Sec 206AA 20%'})`]
      };
    }

    case 'household-monthly-expense': {
      const rent = num(inputs, 'rent');
      const groceries = num(inputs, 'groceries');
      const utilities = num(inputs, 'utilities');
      const transport = num(inputs, 'transport');
      const eduMed = num(inputs, 'educationMedical');
      const other = num(inputs, 'other');
      const total = rent + groceries + utilities + transport + eduMed + other;
      return {
        valid: true,
        primaryLabel: 'Total Monthly Household Cost',
        primaryValue: formatINR(total),
        summaryItems: [
          { label: 'Annualized Household Cost', value: formatINR(total * 12), highlight: true },
          { label: 'Daily Average Spend', value: formatINR(total / 30) }
        ],
        intermediateSteps: [`Sum of all 6 monthly categories = ${formatINR(total)}`],
        chartData: [
          { name: 'Rent', primary: rent },
          { name: 'Groceries', primary: groceries },
          { name: 'Utilities', primary: utilities },
          { name: 'Transport', primary: transport },
          { name: 'Edu/Med', primary: eduMed },
          { name: 'Other', primary: other }
        ],
        chartLabels: { primary: 'Monthly Cost (₹)' }
      };
    }

    case 'electricity-bill': {
      const units = num(inputs, 'units');
      const rate = num(inputs, 'ratePerUnit');
      const fixed = num(inputs, 'fixedCharge');
      const free = num(inputs, 'subsidyFreeUnits');
      const billableUnits = Math.max(0, units - free);
      const energyCharge = billableUnits * rate;
      const total = energyCharge + fixed;
      return {
        valid: true,
        primaryLabel: 'Estimated Monthly Electricity Bill',
        primaryValue: formatINR(total),
        summaryItems: [
          { label: 'Billable Units', value: `${billableUnits} kWh` },
          { label: 'Energy Charges', value: formatINR(energyCharge) },
          { label: 'Annual Projected Electricity', value: formatINR(total * 12), highlight: true }
        ],
        intermediateSteps: [`(${billableUnits} kWh × ₹${rate}) + ₹${fixed} fixed charge = ${formatINR(total)}`]
      };
    }

    case 'water-bill': {
      const members = Math.max(1, num(inputs, 'members'));
      const lpd = num(inputs, 'litersPerPerson');
      const rateKl = num(inputs, 'ratePerKl');
      const fixed = num(inputs, 'fixedFee');
      const kl = (members * lpd * 30) / 1000;
      const total = kl * rateKl + fixed;
      return {
        valid: true,
        primaryLabel: 'Estimated Monthly Water Bill',
        primaryValue: formatINR(total),
        summaryItems: [
          { label: 'Estimated Monthly Consumption', value: `${kl.toFixed(1)} kL (${Math.round(kl * 1000).toLocaleString('en-IN')} L)`, highlight: true },
          { label: 'Usage Charge', value: formatINR(kl * rateKl) }
        ],
        intermediateSteps: [`${members} members × ${lpd}L × 30 days = ${kl.toFixed(2)} kL`]
      };
    }

    case 'grocery-budget': {
      const adults = num(inputs, 'adults');
      const children = num(inputs, 'children');
      const pa = num(inputs, 'perAdultMonthly');
      const pc = num(inputs, 'perChildMonthly');
      const monthly = adults * pa + children * pc;
      return {
        valid: true,
        primaryLabel: 'Monthly Grocery Budget',
        primaryValue: formatINR(monthly),
        summaryItems: [
          { label: 'Weekly Grocery Limit', value: formatINR(monthly / 4.33), highlight: true },
          { label: 'Annual Grocery Spend', value: formatINR(monthly * 12) }
        ],
        intermediateSteps: [`(${adults} × ${formatINR(pa)}) + (${children} × ${formatINR(pc)}) = ${formatINR(monthly)}`]
      };
    }

    case 'travel-budget': {
      const tr = num(inputs, 'travellers');
      const days = num(inputs, 'days');
      const transport = num(inputs, 'transport');
      const stay = num(inputs, 'stayPerNight');
      const daily = num(inputs, 'dailySpendPerPerson');
      const nights = Math.max(0, days - 1);
      const stayTotal = nights * stay;
      const foodAct = days * tr * daily;
      const subtotal = transport + stayTotal + foodAct;
      const buffer = subtotal * 0.1;
      return {
        valid: true,
        primaryLabel: 'Total Trip Budget (incl. 10% Buffer)',
        primaryValue: formatINR(subtotal + buffer),
        summaryItems: [
          { label: 'Cost per Traveller', value: formatINR((subtotal + buffer) / Math.max(1, tr)), highlight: true },
          { label: `Accommodation (${nights} nights)`, value: formatINR(stayTotal) },
          { label: 'Food & Local Activities', value: formatINR(foodAct) }
        ],
        intermediateSteps: [`Transport ${formatINR(transport)} + Stay ${formatINR(stayTotal)} + Daily ${formatINR(foodAct)} + 10% buffer.`]
      };
    }

    case 'education-cost': {
      const cur = num(inputs, 'currentCost');
      const yrs = num(inputs, 'yearsUntilNeeded');
      const inf = num(inputs, 'eduInflation');
      const ret = num(inputs, 'expectedReturn');
      const futureCost = cur * Math.pow(1 + inf / 100, yrs);
      const i = ret / 1200;
      const n = yrs * 12;
      const monthlySave = i === 0 ? futureCost / n : (futureCost * i) / (Math.pow(1 + i, n) - 1);
      return {
        valid: true,
        primaryLabel: `Projected Education Cost in ${yrs} Yrs`,
        primaryValue: formatINR(futureCost),
        summaryItems: [
          { label: 'Monthly Saving Needed Today', value: formatINR(monthlySave), highlight: true },
          { label: 'Inflation Multiplier', value: `${(futureCost / Math.max(1, cur)).toFixed(2)}×` }
        ],
        intermediateSteps: [`${formatINR(cur)} compounded at ${inf}% for ${yrs} years = ${formatINR(futureCost)}`]
      };
    }

    case 'medical-expense-budget': {
      const mm = num(inputs, 'monthlyMeds');
      const chk = num(inputs, 'annualCheckups');
      const prem = num(inputs, 'insurancePremium');
      const buf = num(inputs, 'outOfPocketBuffer');
      const annual = mm * 12 + chk + prem + buf;
      return {
        valid: true,
        primaryLabel: 'Annual Healthcare Budget',
        primaryValue: formatINR(annual),
        summaryItems: [
          { label: 'Recommended Monthly Set-Aside', value: formatINR(annual / 12), highlight: true },
          { label: 'Annual Medicines Total', value: formatINR(mm * 12) }
        ],
        intermediateSteps: [`Monthly sinking fund ${formatINR(annual / 12)} prepares for premiums, tests, and medical emergencies.`]
      };
    }

    case 'family-budget': {
      const inc = num(inputs, 'monthlyIncome');
      const n = num(inputs, 'needsPercent');
      const w = num(inputs, 'wantsPercent');
      const s = num(inputs, 'savingsPercent');
      const sum = n + w + s;
      if (Math.abs(sum - 100) > 0.01) {
        return { valid: false, error: `Percentages must add up to 100% (currently ${sum}%).`, primaryLabel: 'Check Split', primaryValue: `${sum}%`, summaryItems: [], intermediateSteps: [] };
      }
      return {
        valid: true,
        primaryLabel: 'Monthly Savings Target',
        primaryValue: formatINR((inc * s) / 100),
        summaryItems: [
          { label: `Needs (${n}%)`, value: formatINR((inc * n) / 100) },
          { label: `Wants (${w}%)`, value: formatINR((inc * w) / 100) },
          { label: `Annual Savings (${s}%)`, value: formatINR(((inc * s) / 100) * 12), highlight: true }
        ],
        intermediateSteps: [`Needs + Wants + Savings = 100% of ${formatINR(inc)}.`],
        chartData: [
          { name: 'Needs', primary: Math.round((inc * n) / 100) },
          { name: 'Wants', primary: Math.round((inc * w) / 100) },
          { name: 'Savings', primary: Math.round((inc * s) / 100) }
        ],
        chartLabels: { primary: 'Monthly Allocation (₹)' }
      };
    }

    case 'debt-to-income': {
      const inc = num(inputs, 'monthlyIncome');
      const d1 = num(inputs, 'homeRentOrLoan');
      const d2 = num(inputs, 'otherEmis');
      if (inc <= 0) return { valid: false, error: 'Income must be > 0.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const totDebt = d1 + d2;
      const dti = (totDebt / inc) * 100;
      const status = dti <= 25 ? 'Comfortable (< 25%)' : dti <= 40 ? 'Manageable (25%–40%)' : 'High Risk (> 40%)';
      return {
        valid: true,
        primaryLabel: 'Debt-to-Income (DTI) Ratio',
        primaryValue: `${dti.toFixed(1)}%`,
        summaryItems: [
          { label: 'Debt Health Rating', value: status, highlight: true },
          { label: 'Total Monthly EMIs', value: formatINR(totDebt) },
          { label: 'Remaining Income After Debt', value: formatINR(Math.max(0, inc - totDebt)) }
        ],
        intermediateSteps: [`(${formatINR(totDebt)} / ${formatINR(inc)}) × 100 = ${dti.toFixed(1)}%`]
      };
    }

    case 'net-worth': {
      const a1 = num(inputs, 'bankSavings');
      const a2 = num(inputs, 'investments');
      const a3 = num(inputs, 'propertyAssets');
      const debt = num(inputs, 'loansDebt');
      const assets = a1 + a2 + a3;
      const nw = assets - debt;
      return {
        valid: true,
        primaryLabel: 'Total Household Net Worth',
        primaryValue: formatINR(nw),
        summaryItems: [
          { label: 'Total Assets', value: formatINR(assets) },
          { label: 'Total Liabilities', value: formatINR(debt) },
          { label: 'Debt-to-Asset Ratio', value: assets > 0 ? `${((debt / assets) * 100).toFixed(1)}%` : '0%', highlight: true }
        ],
        intermediateSteps: [`${formatINR(assets)} Assets − ${formatINR(debt)} Liabilities = ${formatINR(nw)}`]
      };
    }

    case 'financial-independence': {
      const exp = num(inputs, 'monthlyExpenses');
      const cur = num(inputs, 'currentCorpus');
      const add = num(inputs, 'monthlyInvest');
      const ret = num(inputs, 'expectedReturn');
      const mult = num(inputs, 'multiplier');
      const target = exp * 12 * mult;
      const i = ret / 1200;
      let bal = cur;
      let months = 0;
      while (bal < target && months < 600) {
        bal = (bal + add) * (1 + i);
        months++;
      }
      return {
        valid: true,
        primaryLabel: 'Financial Independence Target Corpus',
        primaryValue: formatINR(target),
        summaryItems: [
          { label: 'Estimated Years to Reach FI', value: months >= 600 ? '50+ years' : `${(months / 12).toFixed(1)} years`, highlight: true },
          { label: 'Annual Expenses Covered', value: formatINR(exp * 12) }
        ],
        intermediateSteps: [`${formatINR(exp * 12)} × ${mult} = ${formatINR(target)}`],
        disclaimer: 'Estimated projection only. Market returns and inflation fluctuate over long horizons.'
      };
    }

    case 'retirement-planning': {
      const age = num(inputs, 'currentAge');
      const retAge = num(inputs, 'retireAge');
      const expNow = num(inputs, 'monthlyExpenseNow');
      const inf = num(inputs, 'inflation');
      const preRet = num(inputs, 'preRetireReturn');
      if (retAge <= age) return { valid: false, error: 'Retirement age must exceed current age.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      const yrs = retAge - age;
      const futureMonthly = expNow * Math.pow(1 + inf / 100, yrs);
      const corpusNeeded = futureMonthly * 12 * 25; // 25x annual post-retirement expense rule of thumb
      const i = preRet / 1200;
      const n = yrs * 12;
      const monthlySave = (corpusNeeded * i) / (Math.pow(1 + i, n) - 1);
      return {
        valid: true,
        primaryLabel: `Target Retirement Corpus (Age ${retAge})`,
        primaryValue: formatINR(corpusNeeded),
        summaryItems: [
          { label: `Monthly Expenses at Age ${retAge}`, value: formatINR(futureMonthly) },
          { label: 'Monthly Investment Needed Now', value: formatINR(monthlySave), highlight: true }
        ],
        intermediateSteps: [`${yrs} years to retirement; ${formatINR(expNow)}/mo today scales to ${formatINR(futureMonthly)}/mo at ${inf}% inflation.`],
        disclaimer: 'Educational retirement estimate only; consult a SEBI-registered advisor for personalized planning.'
      };
    }

    case 'break-even': {
      const fixed = num(inputs, 'fixedCosts');
      const sp = num(inputs, 'sellingPricePerUnit');
      const vc = num(inputs, 'variableCostPerUnit');
      if (sp <= vc) {
        return { valid: false, error: 'Selling price per unit must exceed variable cost per unit.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
      }
      const margin = sp - vc;
      const units = Math.ceil(fixed / margin);
      return {
        valid: true,
        primaryLabel: 'Break-Even Sales Volume',
        primaryValue: `${units.toLocaleString('en-IN')} units`,
        summaryItems: [
          { label: 'Break-Even Revenue', value: formatINR(units * sp), highlight: true },
          { label: 'Contribution Margin / Unit', value: formatINR(margin) }
        ],
        intermediateSteps: [`${formatINR(fixed)} / (${formatINR(sp)} − ${formatINR(vc)}) = ${(fixed / margin).toFixed(2)} → ${units} units`]
      };
    }

    case 'currency-conversion': {
      const amt = num(inputs, 'amount');
      const from = String(inputs.fromCurrency || 'INR');
      const to = String(inputs.toCurrency || 'USD');
      const usdToInr = Math.max(1, num(inputs, 'customUsdToInr', 84.5));
      // Approximate cross-rates anchored via editable USD/INR rate
      const inrPerUnit: Record<string, number> = {
        INR: 1,
        USD: usdToInr,
        EUR: usdToInr * 1.08,
        GBP: usdToInr * 1.27,
        AED: usdToInr / 3.6725,
        SGD: usdToInr * 0.74
      };
      const inInr = amt * (inrPerUnit[from] || 1);
      const converted = inInr / (inrPerUnit[to] || 1);
      const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SGD: 'S$' };
      return {
        valid: true,
        primaryLabel: `Converted Amount (${to})`,
        primaryValue: `${symbols[to] || ''}${converted.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        summaryItems: [
          { label: 'Equivalent in INR', value: formatINR(inInr), highlight: true },
          { label: `Reference Rate (1 ${from})`, value: `${((inrPerUnit[from] || 1) / (inrPerUnit[to] || 1)).toFixed(4)} ${to}` }
        ],
        intermediateSteps: [`Anchored to your editable USD/INR reference rate of ₹${usdToInr}.`],
        disclaimer: 'Reference FX estimate only; actual bank/card conversion rates and forex markups apply.'
      };
    }

    default:
      return { valid: false, error: 'Calculator not found.', primaryLabel: 'Error', primaryValue: '—', summaryItems: [], intermediateSteps: [] };
  }
}
