export const exchange = { startingPoints: 500, redemptionCost: 500, rewardValue: 5, merchandise: 10, pointsPerDollar: 1 } as const;
export type ExchangeStage = 0 | 1 | 2 | 3;
export function valueExchangeSnapshot(stage: ExchangeStage) {
 const redeemed = stage >= 1, purchased = stage >= 2, returned = stage === 3;
 const qualifyingSpend = exchange.merchandise - exchange.rewardValue;
 const earned = purchased ? qualifyingSpend * exchange.pointsPerDollar : 0;
 const reversed = returned ? earned : 0;
 const restoredPoints = returned ? exchange.redemptionCost : 0;
 const history = [{label:'Opening points from prior activity',points:exchange.startingPoints},...(redeemed ? [{label:'Redeemed for $5 FORM Reward',points:-exchange.redemptionCost}] : []),...(purchased ? [{label:'$5 qualifying paid spend',points:earned}] : []),...(returned ? [{label:'Returned purchase earning reversed',points:-reversed},{label:'FORM Reward value restored as points',points:restoredPoints}] : [])];
 return { qualifyingSpend, earned, reversed, restoredPoints, points:history.reduce((sum,row)=>sum+row.points,0), tenderPaid:purchased?5:0, tenderRefund:returned?5:0, rewardCreated:redeemed?5:0, rewardApplied:purchased?5:0, rewardAvailable:stage===1?5:0, merchandiseRetained:purchased&&!returned?10:0, history };
}
export function standardReturnSnapshot(returned: boolean) {
 return { merchandise: 30, qualifyingSpend:30, earned:30, reversed:returned?30:0, balance:returned?0:30, refund:returned?30:0 };
}
