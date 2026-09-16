import { member } from './fixtures';
import { mayaEligibility, mayaOfferPreview } from './offerFixtures';
export const activationDefinition = 'A member becomes Activated after completing their first qualifying purchase following enrollment.';
export const initialMemberScenario = { points: member.points as number, status: 'Enrolled' as 'Enrolled' | 'Activated', activated: false, offerUsed: false };
export type MemberScenario = typeof initialMemberScenario;
export function memberScenarioReducer(state: MemberScenario, action: 'complete' | 'reset'): MemberScenario {
  if (action === 'reset') return { ...initialMemberScenario };
  if (state.offerUsed || !mayaEligibility.every(rule => rule.passes)) return state;
  return { points: state.points + mayaOfferPreview.totalPoints, status: 'Activated', activated: true, offerUsed: true };
}
