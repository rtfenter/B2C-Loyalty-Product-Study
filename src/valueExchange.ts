export const exchange = {
  startingPoints: 1000, redemptionCost: 1000, rewardValue: 5,
  merchandise: 20, newMerchandise: 10, pointsPerDollar: 1,
} as const;
export type ExchangeStage = 0 | 1 | 2 | 3 | 4;
export type ExchangeRecord = {
  id: string;
  stage: ExchangeStage;
  kind: 'opening' | 'redemption' | 'reward' | 'purchase' | 'payment' | 'reward-use' | 'earning' | 'return' | 'refund' | 'restoration' | 'earning-reversal';
  label: string;
  sourceIds: readonly string[];
  points: number;
  cash: number;
  reward: number;
  merchandise: number;
  qualifyingSpend: number;
};
const record = (id: string, stage: ExchangeStage, kind: ExchangeRecord['kind'], label: string,
  sourceIds: readonly string[] = [], changes: Partial<Pick<ExchangeRecord, 'points' | 'cash' | 'reward' | 'merchandise' | 'qualifyingSpend'>> = {}): ExchangeRecord =>
  ({ id, stage, kind, label, sourceIds, points: 0, cash: 0, reward: 0, merchandise: 0, qualifyingSpend: 0, ...changes });

const opening = record('BAL-001', 0, 'opening', 'Starting points', [], { points: exchange.startingPoints });
const redemption = record('RED-001', 1, 'redemption', 'Points exchanged for reward', [opening.id], { points: -exchange.redemptionCost });
const reward = record('RWD-001', 1, 'reward', '$5 reward issued', [redemption.id], { reward: exchange.rewardValue });
const purchase = record('PUR-001', 2, 'purchase', 'Original $20 purchase', [], { merchandise: exchange.merchandise, qualifyingSpend: exchange.merchandise });
const use = record('USE-001', 2, 'reward-use', '$5 reward used', [reward.id, purchase.id], { reward: -reward.reward });
const payment = record('PAY-001', 2, 'payment', '$15 paid', [purchase.id], { cash: purchase.merchandise + use.reward });
const earning = record('ERN-001', 2, 'earning', 'Points earned on the $20 purchase', [purchase.id], { points: purchase.qualifyingSpend * exchange.pointsPerDollar });
const returned = record('RET-001', 3, 'return', 'Original item returned', [purchase.id], { merchandise: -purchase.merchandise });
const refund = record('REF-001', 3, 'refund', '$15 refunded to original payment method', [returned.id, payment.id], { cash: -payment.cash });
const restoration = record('RST-001', 3, 'restoration', 'Points restored from your $5 reward', [returned.id, use.id, reward.id, redemption.id], { points: -redemption.points });
const reversal = record('REV-001', 3, 'earning-reversal', 'Points from the returned purchase removed', [returned.id, earning.id], { points: -earning.points });
const nextPurchase = record('PUR-002', 4, 'purchase', 'New $10 purchase', [], { merchandise: exchange.newMerchandise, qualifyingSpend: exchange.newMerchandise });
const nextPayment = record('PAY-002', 4, 'payment', '$10 paid for the new item', [nextPurchase.id], { cash: nextPurchase.merchandise });
const nextEarning = record('ERN-002', 4, 'earning', 'Points earned on the new $10 purchase', [nextPurchase.id], { points: nextPurchase.qualifyingSpend * exchange.pointsPerDollar });

// A fixed, ordered event history. Navigation selects a prefix; it never posts events again.
export const exchangeRecords: readonly ExchangeRecord[] = Object.freeze([
  opening, redemption, reward, purchase, use, payment, earning, returned,
  refund, restoration, reversal, nextPurchase, nextPayment, nextEarning,
].map(item => Object.freeze({ ...item, sourceIds: Object.freeze([...item.sourceIds]) })));

export function valueExchangeSnapshot(stage: ExchangeStage) {
  const records = exchangeRecords.filter(item => item.stage <= stage);
  const sum = (key: 'points' | 'cash' | 'reward' | 'merchandise') => records.reduce((total, item) => total + item[key], 0);
  return {
    records, currentRecords: records.filter(item => item.stage === stage),
    history: records.filter(item => item.points !== 0),
    points: sum('points'), netPaid: sum('cash'), rewardAvailable: sum('reward'), merchandiseRetained: sum('merchandise'),
    totalPaid: records.reduce((total, item) => total + Math.max(0, item.cash), 0),
    totalRefunded: records.reduce((total, item) => total + Math.max(0, -item.cash), 0),
  };
}
