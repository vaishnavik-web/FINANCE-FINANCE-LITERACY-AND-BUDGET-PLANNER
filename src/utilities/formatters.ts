import type { CurrencyCode } from '../types/finance';

const CURRENCY_CONFIG: Record<CurrencyCode, { locale: string; multiplierFromInr: number }> = {
  INR: { locale: 'en-IN', multiplierFromInr: 1 },
  USD: { locale: 'en-US', multiplierFromInr: 1 / 84.5 },
  EUR: { locale: 'de-DE', multiplierFromInr: 1 / 91.2 },
  GBP: { locale: 'en-GB', multiplierFromInr: 1 / 107.3 },
};

export function formatMoney(amountInInr: number, currency: CurrencyCode = 'INR', maximumFractionDigits = 0): string {
  const safeVal = Number.isFinite(amountInInr) ? amountInInr : 0;
  const cfg = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
  const converted = safeVal * cfg.multiplierFromInr;
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(converted);
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getCurrentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return monthKey;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}
