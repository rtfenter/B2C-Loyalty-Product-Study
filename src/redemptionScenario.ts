import type { ExchangeStage } from './valueExchange';
export type RedemptionState = { standardReturned: boolean; stage: ExchangeStage };
export const initialRedemption: RedemptionState = { standardReturned:false, stage:0 };
export type RedemptionAction = {type:'standard-return'|'advance'|'replay'};
export function redemptionReducer(state:RedemptionState,action:RedemptionAction):RedemptionState {
 if(action.type==='replay') return {...initialRedemption};
 if(action.type==='standard-return') return {...state,standardReturned:true};
 return state.stage<3 ? {...state,stage:(state.stage+1) as ExchangeStage} : state;
}
