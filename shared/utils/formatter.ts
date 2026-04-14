export const formatCurrency = (n: number | undefined, period: 'monthly' | 'annual' = 'monthly'): string => {
  if (!n) return 'N/A';
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  return period === 'monthly' ? `${formatted}/mo` : `${formatted}/yr`;
};

export const formatSqft = (n: number | undefined): string =>
  n ? `${n.toLocaleString()} SF` : 'N/A';

export const formatDate = (d: Date | string | undefined): string => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatAcres = (n: number | undefined): string =>
  n ? `${n.toFixed(2)} acres` : 'N/A';
