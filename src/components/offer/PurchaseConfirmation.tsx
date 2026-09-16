import { ScenarioReset } from "../ScenarioReset";
import { useEffect, useRef } from 'react';
import { Check, ChevronDown, ArrowRight } from 'lucide-react';
import { useMemberScenario } from '../../MemberScenarioContext';
import { activationDefinition } from '../../memberScenario';
import { mayaOfferPreview as preview, offerProduct } from '../../offerFixtures';
import { money } from '../../fixtures';
export function PurchaseConfirmation() {
  const { state, reset } = useMemberScenario();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className="targeted-offer page-shell">
    <p className="eyebrow">FORM REWARDS / SIMULATED PURCHASE COMPLETE</p>
    <div className="targeted-earning">
      <div className="targeted-preview-heading"><div><h1 ref={heading} tabIndex={-1}>A good move, Maya.</h1><p>Your Sculpt Bra purchase is complete.</p></div><span><Check size={16}/>Offer used · Activated</span></div>
      <div className="targeted-preview-grid"><div><h2>{offerProduct.name}</h2><p>Mauve · M · Quantity 1 · {money(offerProduct.price)} purchased</p><p>2× points on sports bras applied.</p><p className="targeted-no-checkout">Simulated purchase for this product study.</p><div className="purchase-confirmation-actions"><a className="text-link" href="#rewards">See your rewards <ArrowRight size={16}/></a><ScenarioReset label="Replay offer scenario" title="Replay offer scenario?" description="Return Maya to Enrolled with 0 points and restore her unused targeted offer. Other Product View scenarios will not be changed." confirmLabel="Replay offer" onReset={() => { reset(); requestAnimationFrame(() => { document.getElementById('main')?.focus({ preventScroll: true }); window.scrollTo(0, 0); }); }} /></div></div>
      <div className="targeted-points-card"><h2>You earned <em>{preview.totalPoints} points.</em></h2><dl><div><dt>Base points earned</dt><dd>{preview.basePoints}</dd></div><div><dt>Promotional points earned</dt><dd>+{preview.promotionalPoints}</dd></div><div className="targeted-total"><dt>Total points awarded</dt><dd>{preview.totalPoints}</dd></div><div><dt>Previous balance</dt><dd>0 points</dd></div><div><dt>New balance</dt><dd>{state.points} points</dd></div></dl></div></div>
      <details><summary>Why did Maya’s state change?<ChevronDown size={17}/></summary><ol className="purchase-explanation"><li>Simulated purchase completed.</li><li>The $48 Sculpt Bra transaction qualified for rewards.</li><li>The active 2× sports-bra offer matched Maya’s eligible account.</li><li>48 base points + 48 promotional points = 96 points awarded.</li><li>Her first qualifying purchase after enrollment satisfied FORM’s activation definition.</li><li>Member state changed from Enrolled to Activated.</li></ol><p className="activation-explainer">{activationDefinition}</p><p className="activation-explainer">This is a program definition, not evidence of engagement, retention, or future purchases. Customer behavior after activation remains unknown until observed.</p></details>
    </div>
    <aside className="targeted-study"><p>Explore the Enrolled → Activated transition in <strong>Product View → Member Journey</strong> using the study navigation. Its separate fictional timeline illustrates the same activation definition.</p><p>This offer has been used. Viewing this confirmation again will not award more points.</p></aside>
  </section>;
}
