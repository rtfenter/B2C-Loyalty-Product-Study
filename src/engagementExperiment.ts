import { objectiveFor, type ObjectiveId } from './engagementScenario';
export const experimentDesign = Object.freeze({ treatmentPercent: 50, controlPercent: 50, eligibleCount: null, sampleSize: null });
// Fixed illustrative observations, independent of the individual customer simulation.
const activationResults = Object.freeze({ treatmentRate: 24, controlRate: 18 });
export function incrementalLift(treatmentRate: number | null, controlRate: number | null): number | null {
  if (treatmentRate === null || controlRate === null || !Number.isFinite(treatmentRate) || !Number.isFinite(controlRate) || treatmentRate < 0 || controlRate < 0 || treatmentRate > 100 || controlRate > 100) return null;
  return Math.round((treatmentRate - controlRate) * 10000) / 10000;
}
export function outcomeRate(successes: number, assignedMembers: number): number | null {
  if (!Number.isInteger(successes) || !Number.isInteger(assignedMembers) || assignedMembers <= 0 || successes < 0 || successes > assignedMembers) return null;
  return successes / assignedMembers * 100;
}
export function experimentFor(id: ObjectiveId) {
  const objective = objectiveFor(id);
  return { ...experimentDesign, windowDays: objective.measurementDays, primary: objective.primary,
    result: id === 'activate' ? { ...activationResults, lift: incrementalLift(activationResults.treatmentRate, activationResults.controlRate)! } : null };
}
export const guardrails = [
  { label: 'Incentive cost', description: 'Track additional points issued and their expected cost per assigned member.' },
  { label: 'Incremental margin / contribution', description: 'Compare contribution per assigned member after incentive cost. More purchases alone are not enough.' },
  { label: 'Cannibalization', description: 'Use control and later purchase behavior to distinguish new demand from organic or accelerated purchases.' },
  { label: 'Promotion opt-outs', description: 'Compare opt-out rates during the same observation period.' },
  { label: 'Over-targeting / repeated exposure', description: 'Track contact frequency and suppress overlapping or repeated incentives.' },
] as const;
