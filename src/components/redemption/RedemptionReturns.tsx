import {ScenarioReset} from "../ScenarioReset";
import {type Dispatch} from 'react';
import {type RedemptionState,type RedemptionAction} from '../../redemptionScenario';
import {standardReturnSnapshot} from '../../valueExchange';
import {ValueExchange} from './ValueExchange';
import './redemption.css';
export function RedemptionReturns({state,dispatch}:{state:RedemptionState;dispatch:Dispatch<RedemptionAction>}) {
 const standard=standardReturnSnapshot(state.standardReturned);
 return <div className="redemption-page page-shell"><div className="redemption-intro"><div><p className="eyebrow">A FORM PRODUCT STUDY</p><h1>Value, <em>reconciled.</em></h1><p>Redemption & Returns</p></div><ScenarioReset label="Replay scenario" title="Replay redemption & returns?" description="Restart the standard purchase example and restore the reward example to 500 points before redemption. Other study scenarios will not be changed." onReset={()=>dispatch({type:'replay'})} /></div>
 <div className="redemption-context"><strong>SEPARATE FICTIONAL SCENARIOS</strong><p>Explore FORM’s defined return policy. These examples leave Maya’s main Rewards account, targeted offer, Campaign Studio, and Member Journey unchanged. Reset study affects only her main account; Replay here restarts these examples.</p></div>
 <section className="redemption-question"><h2>One policy. A traceable return.</h2><p>FORM reverses points earned on returned merchandise, restores consumed FORM Reward value as points, and refunds only the normal tender actually paid. Qualifying spend earns points after reward value is applied. Each reversal preserves the original transaction relationships without duplicating value.</p></section>
 <p className="redemption-perspective">01 / STANDARD EARN REVERSAL <span>No reward tender</span></p>
 <section className="redemption-member"><div className="redemption-balance"><p className="eyebrow">PURCHASE → EARNING → RETURN</p><h2>The earning follows<br/><em>the merchandise.</em></h2><p>This example begins at 0 points. A $30 purchase paid with normal tender has $30 qualifying spend at 1 point per $1.</p><div className="redemption-number">+{standard.earned}<span>points earned from this purchase</span></div><p>Returning the same merchandise reverses exactly those 30 points and refunds $30 to the original tender.</p></div><div className="redemption-reward" aria-live="polite"><p className="eyebrow">WHAT MAYA SEES / MEMBER VIEW</p><h2>{state.standardReturned?'Return complete':'Purchase complete'}</h2><div className="redemption-number">{standard.balance}<span>points available</span></div><dl><div><dt>Purchase earning</dt><dd>+30 points</dd></div>{state.standardReturned && <><div><dt>Returned purchase earning reversed</dt><dd>−30 points</dd></div><div><dt>Refunded to original payment method</dt><dd>$30</dd></div></>}<div><dt>Current balance</dt><dd>{standard.balance} points</dd></div></dl>{!state.standardReturned && <button className="button primary" onClick={()=>dispatch({type:'standard-return'})}>Return the $30 purchase</button>}<p>The return reverses the earning associated with the returned merchandise.</p></div></section>
 <ValueExchange stage={state.stage} advance={()=>dispatch({type:'advance'})}/>
 <section className="redemption-reconciliation"><h2>A balance needs a history.</h2><p>A loyalty return is not always “subtract points from the current balance.” FORM preserves the relationship between the activity that earned points, redemption into a reward, the purchase where that reward was used, actual tender paid, and the return that reverses the purchase.</p></section>
 <section className="alternative-policies" aria-labelledby="alternative-policies-title">
 <p className="eyebrow">OTHER PROGRAM APPROACHES</p>
 <h2 id="alternative-policies-title">Programs can handle this differently.</h2>
 <p>FORM reverses the original value exchange, but loyalty programs can make different policy choices when previously earned value is no longer available to reverse.</p>
 <div className="alternative-policy-cards">
 <article><h3>Allow a negative balance</h3><p className="alternative-policy-math">240 points → reverse 300 → -60 points</p><p>Reverse the full earning even when the available balance is insufficient. Future earning first clears the deficit.</p></article>
 <article><h3>Floor at zero</h3><p className="alternative-policy-math">240 points → reverse available 240 → 0 points</p><p>Avoid a negative member balance, but some previously issued value is not recovered through the points balance.</p></article>
 <article><h3>Recover through future earning</h3><p className="alternative-policy-math">240 points → 0 visible · 60 to recover</p><p>Keep the member-visible balance at zero while tracking the remaining amount for recovery from future earning.</p></article>
 </div>
 <p className="alternative-policy-note">Illustrative alternative program policies, not FORM’s policy. These examples are not selectable, exhaustive, or universally correct.</p>
 </section>
 <p className="redemption-disclosure">All members, purchases, rewards, and rules are fictional. No payment, coupon, refund, or external system is created.</p>
</div>;
}
