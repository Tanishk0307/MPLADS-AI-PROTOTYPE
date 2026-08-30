export function formatLakhs(amount: number): string {
  if (amount >= 10000) return `₹${(amount / 100).toFixed(1)} Cr`;
  if (amount >= 100) return `₹${amount.toFixed(0)} L`;
  return `₹${amount.toFixed(1)} L`;
}

export function formatCount(n: number): string {
  return n.toLocaleString('en-IN');
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function daysAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}
