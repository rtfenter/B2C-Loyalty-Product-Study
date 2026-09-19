import type { ExchangeStage } from './valueExchange';
export type RedemptionState = { stage: ExchangeStage };
export const initialRedemption: RedemptionState = { stage: 0 };
export type RedemptionAction = { type: 'advance'; from: ExchangeStage } | { type: 'previous' } | { type: 'replay' };
export function redemptionReducer(state: RedemptionState, action: RedemptionAction): RedemptionState {
  if (action.type === 'replay') return { ...initialRedemption };
  if (action.type === 'previous') return state.stage > 0 ? { stage: (state.stage - 1) as ExchangeStage } : state;
  // Ignore duplicate/stale clicks from an already completed screen.
  if (action.from !== state.stage || state.stage === 4) return state;
  return { stage: (state.stage + 1) as ExchangeStage };
}
