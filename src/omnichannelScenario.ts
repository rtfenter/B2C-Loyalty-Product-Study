export const omniMember = { name: 'Maya', id: 'FORM-MAYA-01' } as const;
export const channelPurchases = {
 online: { id:'ONLINE-078', memberId:omniMember.id, label:'Online purchase · Lift Legging', spend:78 },
 pos: { id:'STORE-048', memberId:omniMember.id, label:'In-store purchase · Sculpt Bra', spend:48 },
} as const;
export type OmniState = { processed: string[]; duplicate: boolean };
export type OmniAction = {type:'receive'; channel:keyof typeof channelPurchases} | {type:'replay'};
export const startingOmni: OmniState = {processed:[],duplicate:false};
export function omniReducer(state:OmniState,action:OmniAction):OmniState {
 if(action.type==='replay') return {processed:[channelPurchases.online.id],duplicate:false};
 const purchase=channelPurchases[action.channel];
 if(purchase.memberId!==omniMember.id) return state;
 if(state.processed.includes(purchase.id)) return {...state,duplicate:true};
 return {processed:[...state.processed,purchase.id],duplicate:false};
}
export const initialOmni=omniReducer(startingOmni,{type:'receive',channel:'online'});
export function omniSnapshot(state:OmniState) {
 const history=[{id:'PRIOR',label:'Prior confirmed activity',spend:null,points:200},{id:'ONLINE-100',label:'Earlier online purchase',spend:100,points:100},...Object.values(channelPurchases).filter(p=>state.processed.includes(p.id)).map(p=>({id:p.id,label:p.label,spend:p.spend,points:p.spend}))];
 return {history,balance:history.reduce((sum,row)=>sum+row.points,0),posConfirmed:state.processed.includes(channelPurchases.pos.id)};
}
