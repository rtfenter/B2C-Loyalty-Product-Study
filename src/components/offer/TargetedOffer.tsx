import { useMemberScenario } from "../../MemberScenarioContext";
import { PurchaseConfirmation } from "./PurchaseConfirmation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gift,
  Info,
  Sparkles,
} from "lucide-react";
import { BrandMark, ReferenceImage } from "../Brand";
import { money } from "../../fixtures";
import {
  mayaEligibility,
  mayaOfferPreview as preview,
  offerProduct,
  targetedOffer,
} from "../../offerFixtures";
import "./offer.css";
export function TargetedOffer() {
  const { state, complete } = useMemberScenario();
  const [usingOffer, setUsingOffer] = useState(false);
  useEffect(() => { if (!state.offerUsed) setUsingOffer(false); }, [state.offerUsed]);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  function useOffer() {
    setUsingOffer(true);
    requestAnimationFrame(() => {
      previewHeading.current?.focus({ preventScroll: true });
      previewHeading.current?.scrollIntoView({ block: "start" });
    });
  }
  if (state.offerUsed) return <PurchaseConfirmation />;
  return (
    <section className="targeted-offer page-shell">
      <div className="offer-welcome">
        <BrandMark />
        <p className="eyebrow">A LITTLE EXTRA, JUST FOR YOU</p>
        <span className="offer-available">
          <Gift size={14} />
          Maya, you have an offer
        </span>
      </div>
      <div className="targeted-hero">
        <div className="targeted-copy">
          <p className="eyebrow">YOUR FORM REWARDS OFFER</p>
          <h1>
            For your
            <br />
            <em>next level.</em>
          </h1>
          <h2>{targetedOffer.title}</h2>
          <p>
            A little more for your next move. This offer is available to you,
            Maya, on qualifying sports bras.
          </p>
          <p className="targeted-expiry">
            Available {targetedOffer.periodLabel}
          </p>
          <button className="button primary" onClick={useOffer}>
            Use offer with Sculpt Bra
            <ArrowRight size={17} />
          </button>
          <span className="targeted-promise">
            Points are earned only after a qualifying purchase.
          </span>
        </div>
        <div className="targeted-visual">
          <ReferenceImage
            crop="285 55 220 484"
            label="Woman wearing FORM performance activewear"
          />
          <span>YOUR MOVEMENT. A LITTLE MORE REWARD.</span>
        </div>
      </div>
      <div className="targeted-details">
        <div>
          <p className="eyebrow">THE QUALIFYING ESSENTIAL</p>
          <div className="targeted-product">
            <ReferenceImage
              crop={offerProduct.crop}
              label="Sculpt Bra in Mauve"
            />
            <div>
              <h3>{offerProduct.name}</h3>
              <p>Mauve / Size M · Quantity 1</p>
              <strong>{money(offerProduct.price)}</strong>
              <span>Qualifies for your 2× offer</span>
            </div>
          </div>
        </div>
        <details className="targeted-terms">
          <summary>
            Offer terms & earning rule
            <ChevronDown size={17} />
          </summary>
          <ul>
            <li>
              Available to Maya’s eligible FORM Rewards account during{" "}
              {targetedOffer.periodLabel}, inclusive.
            </li>
            <li>
              Sports bras qualify. Leggings and other merchandise earn no
              promotional multiplier under this offer.
            </li>
            <li>
              Earn {preview.baseRate} point per $1 of qualifying merchandise,
              multiplied by {targetedOffer.multiplier}. 2× means twice the base
              points in total.
            </li>
            <li>
              One qualifying purchase per member. This preview uses one $48
              Sculpt Bra, with no other promotions applied.
            </li>
            <li>
              Tax and shipping do not earn points. Points are awarded only after
              a completed qualifying purchase, not when viewing or selecting the
              offer.
            </li>
          </ul>
        </details>
      </div>
      <section
        className="targeted-earning"
        hidden={!usingOffer}
        aria-labelledby="targeted-preview-title"
      >
        <div className="targeted-preview-heading">
          <div>
            <p className="eyebrow">YOUR OFFER / BEFORE YOU PURCHASE</p>
            <h2 id="targeted-preview-title" ref={previewHeading} tabIndex={-1}>
              A little more from this move.
            </h2>
          </div>
          <span>
            <Check size={15} />
            2× included in this preview
          </span>
        </div>
        <div className="targeted-preview-grid">
          <div>
            <h3>{offerProduct.name}</h3>
            <p>Mauve · M · Quantity 1</p>
            <dl>
              <div>
                <dt>Merchandise subtotal</dt>
                <dd>{money(offerProduct.price)}</dd>
              </div>
              <div>
                <dt>Current rewards balance</dt>
                <dd>{state.points} points</dd>
              </div>
            </dl>
            <p className="targeted-no-checkout">
              No points have been awarded yet. Complete this portfolio simulation to award points. No payment is processed and no real order is placed.
            </p>
            <button className="button primary purchase-complete" onClick={complete}>Complete simulated purchase</button>
            <a href="#rewards" className="text-link">
              Back to Maya’s Rewards
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="targeted-points-card">
            <Sparkles size={26} />
            <h3>
              You’ll earn <em>{preview.totalPoints} points</em>
            </h3>
            <p>After a qualifying purchase with this offer.</p>
            <details>
              <summary>
                How did FORM decide that?
                <ChevronDown size={17} />
              </summary>
              <dl>
                <div>
                  <dt>Qualifying merchandise</dt>
                  <dd>Sculpt Bra · {money(preview.qualifyingMerchandise)}</dd>
                </div>
                <div>
                  <dt>Base earning rule</dt>
                  <dd>{preview.baseRate} point / $1</dd>
                </div>
                <div>
                  <dt>Base earning</dt>
                  <dd>{preview.basePoints} points</dd>
                </div>
                <div>
                  <dt>Promotional multiplier</dt>
                  <dd>{preview.multiplier}×</dd>
                </div>
                <div>
                  <dt>Additional promotional points</dt>
                  <dd>+{preview.promotionalPoints} points</dd>
                </div>
                <div className="targeted-total">
                  <dt>Total points you would earn</dt>
                  <dd>{preview.totalPoints} points</dd>
                </div>
              </dl>
              <p className="targeted-equation">
                {money(offerProduct.price)} × {preview.baseRate} point per $1 ×{" "}
                {preview.multiplier} = {preview.totalPoints} points
              </p>
              <p>
                Your balance remains {state.points} points. The multiplier
                applies only in this separate offer preview; your regular $126
                bag keeps its base earning rule.
              </p>
            </details>
          </div>
        </div>
      </section>
      <aside className="targeted-study">
        <div>
          <Info size={17} />
          <span className="eyebrow">BEHIND THE OFFER / PRODUCT STUDY</span>
        </div>
        <details>
          <summary>
            Why is Maya eligible?
            <ChevronDown size={17} />
          </summary>
          <p>
            This fictional scenario uses explicit rules. Maya qualifies because
            every condition below is met.
          </p>
          <ul>
            {mayaEligibility.map((rule) => (
              <li key={rule.label}>
                <Check size={15} />
                {rule.label}
              </li>
            ))}
          </ul>
          <p>
            <strong>Fixed study date: September 16, 2026.</strong> The offer is
            active on this scenario date. Refreshing the page does not advance
            time.
          </p>
          <p>
            Prior leggings shopping is part of this offer’s broader fictional
            targeting history, not a qualifying Rewards event added to Maya’s
            account or Member Journey. Exploring the offer leaves her enrolled, 0-point state intact; completing the simulated purchase changes it.
          </p>
          <p>
            The product controls eligibility and earning rules. The offer is
            what Maya sees. Whether she buys or returns cannot be known from
            these rules; no behavior or campaign performance is predicted.
          </p>
        </details>
        <p>
          Explore how offers are configured using{" "}
          <strong>Product View → Campaign Studio</strong> in the study
          navigation above. Its fixed example results are a separate fictional
          experiment, not outcomes of Maya receiving this offer.
        </p>
      </aside>
    </section>
  );
}
