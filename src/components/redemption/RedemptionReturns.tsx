import type { Dispatch } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Check } from 'lucide-react';
import type { RedemptionState, RedemptionAction } from '../../redemptionScenario';
import { ValueExchange } from './ValueExchange';
import './redemption.css';

const steps = ['Redeem', 'Purchase', 'Return', 'New purchase'];
const actions = ['Redeem 1,000 points', 'Purchase the $20 item', 'Return the $20 item', 'Purchase the new $10 item'];
export function RedemptionReturns({ state, dispatch }: { state: RedemptionState; dispatch: Dispatch<RedemptionAction> }) {
  return <div className="commerce-study page-shell">
    <header className="commerce-intro">
      <div className="commerce-masthead"><span className="eyebrow">AN INTERACTIVE PM CASE STUDY</span><span>01 / COMMERCE & LOYALTY</span></div>
      <p className="commerce-category">B2C Commerce & Loyalty</p>
      <h1>Purchase <em>≠</em><br className="commerce-title-break" /> Final Transaction</h1>
      <p className="commerce-deck">One purchase. A return. A new purchase.<br />Follow what changes for the customer—and what must reconcile underneath.</p>
    </header>
    <aside className="commerce-principle"><span className="eyebrow">THE PRODUCT PRINCIPLE</span><div><h2>Complexity belongs underneath the experience.</h2><p>The customer should understand what happened to their money and rewards without needing to understand the reconciliation logic that made the result correct.</p></div></aside>
    <section className="commerce-journey" aria-label="Transaction journey">
      <div className="commerce-journey-heading"><p className="eyebrow">ONE JOURNEY / TWO PERSPECTIVES</p><span>{state.stage === 0 ? 'Starting position' : `Step ${state.stage} of 4`}</span></div>
      <ol className="commerce-steps">{steps.map((step, index) => <li key={step} className={state.stage === index + 1 ? 'is-current' : state.stage > index + 1 ? 'is-complete' : ''} aria-current={state.stage === index + 1 ? 'step' : undefined}><span className="commerce-step-number">{state.stage > index + 1 ? <Check size={16} aria-hidden="true" /> : `0${index + 1}`}</span><span>{step}</span></li>)}</ol>
      <div className="commerce-controls"><button className="commerce-secondary" disabled={state.stage === 0} onClick={() => dispatch({ type: 'previous' })}><ArrowLeft size={15} aria-hidden="true" />Previous</button><button className="commerce-replay" onClick={() => dispatch({ type: 'replay' })}><RotateCcw size={14} aria-hidden="true" />Replay</button><button className="button primary commerce-next" disabled={state.stage === 4} onClick={() => dispatch({ type: 'advance', from: state.stage })}>{state.stage === 4 ? 'Journey complete' : <><span className="commerce-next-label">Next: </span>{actions[state.stage]}<ArrowRight size={16} aria-hidden="true" /></>}</button></div>
      <ValueExchange stage={state.stage} />
    </section>
    <footer className="commerce-footer"><p>Fictional scenario · 1 point per $1 of qualifying merchandise, before reward payment.<br />Full returns restore the reward as its original points. The new item is purchased separately.</p><span>Local simulation<br />No real payments or refunds</span></footer>
  </div>;
}
