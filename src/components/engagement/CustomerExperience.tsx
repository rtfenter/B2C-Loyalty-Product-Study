import { useEffect, useRef, type Dispatch } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { incentive, objectiveFor, pointsFor, type EngagementState, type EngagementAction } from '../../engagementScenario';
export function CustomerExperience({ state, dispatch }: { state: EngagementState; dispatch: Dispatch<EngagementAction> }) {
  const objective = objectiveFor(state.objective);
  const promoted = state.arm === 'treatment';
  const points = pointsFor(incentive.demoAmount, state.arm);
  const complete = state.phase === 'purchased';
  const confirmation = useRef<HTMLHeadingElement>(null);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state.phase === 'preview') previewHeading.current?.focus({ preventScroll: true });
    if (state.phase === 'purchased') confirmation.current?.focus({ preventScroll: true });
  }, [state.phase]);
  return <section className="eng-customer" aria-labelledby="eng-customer-title">
    <div className="eng-panel-label"><span className="eyebrow">CUSTOMER VIEW</span><span>What I see. What I can do.</span></div>
    <div className="eng-customer-brand">FORM <span>REWARDS</span></div>
    <div className="eng-customer-message" aria-live="polite" aria-atomic="true">
      <p className="eyebrow">{complete ? 'PURCHASE CONFIRMATION' : promoted ? 'A LITTLE EXTRA FOR YOU' : 'YOUR EVERYDAY REWARDS'}</p>
      <h2 id="eng-customer-title" ref={confirmation} tabIndex={-1}>{complete ? 'Thanks for your purchase.' : promoted ? objective.customerHeadline : 'Something for your next move.'}</h2>
      {complete ? <><p>Your $20 qualifying purchase is complete. You earned <strong>{points.total} points.</strong></p><div className="eng-points-earned"><Check size={20} aria-hidden="true" /><strong>+{points.total}</strong><span>points earned</span></div></> : <>
        <div className="eng-offer-value">{promoted ? '2×' : '1'}<span>{promoted ? 'points' : 'point per $1'}</span></div>
        <p>{promoted ? `Earn twice the usual points on your ${objective.customerAction} within ${objective.measurementDays} days of receiving this offer.` : 'Earn 1 point for every $1 of qualifying merchandise. Your usual program benefits are available whenever you shop.'}</p>
        <p className="eng-customer-note">{promoted ? 'One qualifying purchase. Extra points apply automatically when you complete it.' : 'Points are added after you complete a qualifying purchase.'}</p>
      </>}
    </div>
    <details className="eng-terms"><summary>{promoted ? 'How the extra points work' : 'How points work'}</summary><p>{promoted ? '2× is the total: your usual points plus the same amount in extra points. ' : ''}At 1 base point per $1, a $20 qualifying purchase earns {points.base} usual points{promoted ? ` + ${points.promotional} extra points = ${points.total} points` : ''}. Tax and shipping do not earn points.</p>{promoted && <p>Available once, during the {objective.measurementDays}-day offer window. Viewing the offer does not earn points.</p>}</details>
    <div className="eng-demo">
      <p className="eng-demo-caption">TRY THE CUSTOMER EXPERIENCE · FICTIONAL $20 PURCHASE</p>
      {state.phase === 'offered' && <button className="button primary" onClick={() => dispatch({ type: 'preview' })}>Preview a $20 purchase <ArrowRight size={16} aria-hidden="true" /></button>}
      {state.phase === 'preview' && <><h3 ref={previewHeading} tabIndex={-1}>Your purchase preview</h3><dl><div><dt>Qualifying merchandise</dt><dd>$20</dd></div><div><dt>Usual points</dt><dd>{points.base}</dd></div>{promoted && <div><dt>Extra points</dt><dd>+{points.promotional}</dd></div>}<div className="eng-total"><dt>Points after purchase</dt><dd>{points.total}</dd></div></dl><p role="status">No purchase completed. No points earned yet.</p><button className="button primary" onClick={() => dispatch({ type: 'purchase', objective: state.objective, purchase: { id: `DEMO-${state.objective}`, day: incentive.demoPurchaseDay, qualifying: true, amount: incentive.demoAmount } })}>Complete simulated purchase <ArrowRight size={16} aria-hidden="true" /></button></>}
      {complete && <p className="eng-purchase-done"><Check size={15} aria-hidden="true" /> Purchase complete · points awarded once</p>}
      <p className="eng-demo-disclosure">Local preview only. No order or payment is created.</p>
    </div>
  </section>;
}
