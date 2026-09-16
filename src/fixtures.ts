export const member = { name: 'Maya', status: 'Enrolled', points: 0, nextReward: 500, activated: false } as const;
export const products = [
  { id: 'lift-legging', name: 'Lift Legging', color: 'Black', size: 'M', price: 78, crop: '1075 207 125 118' },
  { id: 'sculpt-bra', name: 'Sculpt Bra', color: 'Mauve', size: 'M', price: 48, crop: '1075 340 125 113' },
] as const;
export const earning = { subtotal: products.reduce((sum, item) => sum + item.price, 0), pointsPerDollar: 1, multiplier: null };
export const pointsPreview = Math.floor(earning.subtotal * earning.pointsPerDollar);
export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
