export type ObjectiveId = 'activate' | 'second' | 'lapsed';
export type ExperimentArm = 'treatment' | 'control';
export type Purchase = { id: string; day: number; qualifying: boolean; amount: number };
export type MemberFacts = { enrolled: boolean; enrollmentDay: number; contactable: boolean; promotionEligible: boolean; purchases: readonly Purchase[] };
export type ObjectiveDefinition = {
  id: ObjectiveId; label: string; behavior: string; audience: string; success: string;
  measurementDays: number; primary: string; supporting: readonly string[]; followUp: string;
  customerHeadline: string; customerAction: string; assumption: string;
};
export const programContext = Object.freeze({ enrolled: 100000, activated: 58000, notActivated: 42000 });
export const incentive = Object.freeze({ multiplier: 2, basePointsPerDollar: 1, demoAmount: 20, demoPurchaseDay: 3 });
export const objectives: readonly ObjectiveDefinition[] = [
  {
    id: 'activate', label: 'Activate a new member', behavior: 'Move from joining the program to a first qualifying purchase.',
    audience: 'Members enrolled within the last 30 days with no qualifying purchases. Contactability and promotion eligibility narrow this audience further.',
    success: 'First qualifying purchase after enrollment', measurementDays: 14, primary: 'Incremental activation lift',
    supporting: ['Activation rate', 'Time to first qualifying purchase', 'Incentive redemption (use) rate', 'Progression to subsequent engagement'],
    followUp: 'Observe another qualifying purchase during days 15–60 after exposure. A first purchase does not establish sustained engagement.',
    customerHeadline: 'A little extra for your first purchase.', customerAction: 'first qualifying purchase',
    assumption: 'Follow-up through day 60 is a study assumption. The primary activation window is the specified 14 days.',
  },
  {
    id: 'second', label: 'Drive a second purchase', behavior: 'Help a one-time purchaser make a second distinct qualifying purchase.',
    audience: 'Members with exactly one qualifying purchase, completed within the last 30 days, who are contactable and promotion eligible.',
    success: 'Second distinct qualifying purchase', measurementDays: 14, primary: 'Incremental second-purchase rate',
    supporting: ['Second-purchase rate', 'Time to second qualifying purchase', 'Incentive redemption (use) rate', 'Later purchase frequency'],
    followUp: 'Compare days 15–60 purchase behavior and cumulative purchases through day 60 across both groups. Check whether an early gain is offset later: the incentive may only bring a purchase forward.',
    customerHeadline: 'Make your next purchase twice as rewarding.', customerAction: 'next qualifying purchase',
    assumption: 'Study assumptions: first purchase within 30 days; 14-day response window; follow-up through day 60. Contactability and promotion eligibility apply here too.',
  },
  {
    id: 'lapsed', label: 'Re-engage a lapsed member', behavior: 'Encourage a previous purchaser to return after a meaningful period without a qualifying purchase.',
    audience: 'Previous qualifying purchasers with at least 90 days since their last qualifying purchase, who are contactable and promotion eligible.',
    success: 'First qualifying purchase after the lapse', measurementDays: 30, primary: 'Incremental reactivation lift',
    supporting: ['Reactivation rate', 'Time to the return purchase', 'Incentive redemption (use) rate', 'Subsequent return behavior'],
    followUp: 'Observe another qualifying purchase during days 31–60 after exposure. Separate a one-off response from continued return behavior.',
    customerHeadline: 'A little extra when you shop with us again.', customerAction: 'next qualifying purchase',
    assumption: 'The lapse threshold is at least 90 days; the response window is 30 days. Follow-up through day 60 is a study assumption. Prior engagement status is not required.',
  },
];
export const objectiveFor = (id: ObjectiveId) => objectives.find(objective => objective.id === id)!;
export function memberFor(id: ObjectiveId): MemberFacts {
  return {
    enrolled: true, enrollmentDay: id === 'activate' ? -10 : -180, contactable: true, promotionEligible: true,
    purchases: id === 'activate' ? [] : [{ id: 'PRIOR-001', day: id === 'second' ? -10 : -100, qualifying: true, amount: 30 }],
  };
}
export function qualifyingHistory(member: MemberFacts, throughDay = 0) {
  const seen = new Set<string>();
  return member.purchases.filter(purchase => {
    if (!purchase.qualifying || purchase.day < member.enrollmentDay || purchase.day > throughDay || seen.has(purchase.id)) return false;
    seen.add(purchase.id);
    return true;
  });
}
export function eligibilityFor(id: ObjectiveId, member: MemberFacts, exposureDay = 0) {
  const purchases = qualifyingHistory(member, exposureDay);
  const lastDay = purchases.length ? Math.max(...purchases.map(purchase => purchase.day)) : null;
  const recentEnrollment = exposureDay - member.enrollmentDay;
  const behaviorRules = id === 'activate'
    ? [{ label: 'Enrolled within the last 30 days', passes: recentEnrollment >= 0 && recentEnrollment <= 30 }, { label: 'No qualifying purchases', passes: purchases.length === 0 }]
    : id === 'second'
      ? [{ label: 'Exactly one qualifying purchase', passes: purchases.length === 1 }, { label: 'First purchase within the last 30 days', passes: lastDay !== null && exposureDay - lastDay <= 30 }]
      : [{ label: 'At least one previous qualifying purchase', passes: purchases.length > 0 }, { label: 'At least 90 days since the last qualifying purchase', passes: lastDay !== null && exposureDay - lastDay >= 90 }];
  return [{ label: 'Enrolled in the program', passes: member.enrolled && member.enrollmentDay <= exposureDay }, ...behaviorRules,
    { label: 'Contactable', passes: member.contactable }, { label: 'Promotion eligible', passes: member.promotionEligible }];
}
export function qualifiesAsSuccess(id: ObjectiveId, member: MemberFacts, purchase: Purchase, exposureDay = 0) {
  if (!Number.isFinite(purchase.day) || !Number.isFinite(purchase.amount) || purchase.amount <= 0 || !purchase.id) return false;
  if (!purchase.qualifying || purchase.day < exposureDay || purchase.day > exposureDay + objectiveFor(id).measurementDays) return false;
  if (member.purchases.some(previous => previous.id === purchase.id)) return false;
  return eligibilityFor(id, member, exposureDay).every(rule => rule.passes);
}
export function pointsFor(amount: number, arm: ExperimentArm) {
  const base = Math.floor(amount * incentive.basePointsPerDollar);
  const promotional = arm === 'treatment' ? base * (incentive.multiplier - 1) : 0;
  return { base, promotional, total: base + promotional };
}
export type EngagementState = { objective: ObjectiveId; step: number; arm: ExperimentArm; phase: 'offered' | 'preview' | 'purchased'; purchase: Purchase | null };
export const initialEngagement: EngagementState = { objective: 'activate', step: 0, arm: 'treatment', phase: 'offered', purchase: null };
export type EngagementAction = { type: 'objective'; objective: ObjectiveId } | { type: 'step'; step: number } | { type: 'arm'; arm: ExperimentArm } | { type: 'preview' } | { type: 'purchase'; objective: ObjectiveId; purchase: Purchase } | { type: 'replay' };
export function engagementReducer(state: EngagementState, action: EngagementAction): EngagementState {
  switch (action.type) {
    case 'objective': return { ...initialEngagement, objective: action.objective };
    case 'step': return Number.isInteger(action.step) && action.step >= 0 && action.step <= 6 ? { ...state, step: action.step } : state;
    case 'arm': return action.arm === state.arm ? state : { ...state, arm: action.arm, phase: 'offered', purchase: null };
    case 'preview': return state.phase === 'offered' ? { ...state, phase: 'preview' } : state;
    case 'purchase':
      if (state.phase !== 'preview' || action.objective !== state.objective || !qualifiesAsSuccess(state.objective, memberFor(state.objective), action.purchase)) return state;
      return { ...state, phase: 'purchased', purchase: { ...action.purchase } };
    case 'replay': return { ...initialEngagement, objective: state.objective };
  }
}
