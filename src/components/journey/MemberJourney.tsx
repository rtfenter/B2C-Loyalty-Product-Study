import { ScenarioReset } from "../ScenarioReset";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
} from "lucide-react";
import { BrandMark } from "../Brand";
import {
  definitions,
  journeyEvents,
  journeyRules,
  lifecycleOrder,
  riskDecisions,
  snapshotAt,
  stateExperiences,
} from "../../journeyFixtures";
import { MemberPreview } from "./MemberPreview";
import "./journey.css";
export function MemberJourney() {
  const [index, setIndex] = useState(0);
  const [showMember, setShowMember] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const snapshot = snapshotAt(index);
  const event = journeyEvents[index];
  const experience = stateExperiences[snapshot.state];
  function select(next: number) {
    setIndex(next);
    setChoice(null);
  }
  return (
    <div className="journey-page">
      <div className="journey-content">
        <section className="journey-intro">
          <div>
            <p className="eyebrow">ONE MEMBER. A CHANGING RELATIONSHIP.</p>
            <h1>
              Maya’s <em>member journey.</em>
            </h1>
            <p>
              How does FORM decide where a member is in their journey,
              <br className="desktop-break" /> and what should the product do
              with that information?
            </p>
          </div>
          <BrandMark />
        </section>
        <div className="journey-context">
          <span>FICTIONAL SCENARIO</span>
          <p>
            FORM’s definitions for this study. A separate journey that leaves
            the member-facing purchase scenario unchanged. The targeted $48 Sculpt Bra purchase awards 96 points and demonstrates the same Enrolled → Activated rule; this timeline retains its own purchases and points.
          </p>
        </div>
        <details className="journey-definitions">
          <summary>
            How FORM defines these states <ChevronDown size={17} />
          </summary>
          <p>
            Lifecycle definitions are product decisions. Different programs may
            define activation, engagement, risk, and reactivation differently
            based on their goals and observed behavior.
          </p>
          <dl>
            {lifecycleOrder.map((state) => (
              <div key={state}>
                <dt>{state}</dt>
                <dd>{definitions[state]}</dd>
              </div>
            ))}
          </dl>
          <p>
            For this scenario, qualifying purchases earn{" "}
            {journeyRules.pointsPerDollar} point per $1. Engagement includes
            purchases on the {journeyRules.engagementWindowDays}-day boundary;
            risk begins after {journeyRules.riskInactivityDays} complete days
            without a qualifying purchase. State is retained until another
            featured rule is met. Reactivation takes priority when a purchase
            follows At risk.
          </p>
        </details>
        <nav className="journey-timeline" aria-label="Maya’s lifecycle events">
          <ol>
            {lifecycleOrder.map((state, i) => (
              <li
                key={state}
                className={
                  i === index ? "current" : i < index ? "completed" : ""
                }
              >
                <button
                  onClick={() => select(i)}
                  aria-current={i === index ? "step" : undefined}
                  aria-label={`Event ${i + 1}: ${state}, day ${journeyEvents[i].day}`}
                >
                  <span className="journey-node">
                    {i < index ? <Check size={15} /> : `0${i + 1}`}
                  </span>
                  <strong>{state}</strong>
                  <small>Day {journeyEvents[i].day}</small>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="journey-controls">
          <span>
            EVENT {index + 1} OF {journeyEvents.length}
          </span>
          <div>
            <button
              onClick={() => select(index - 1)}
              disabled={index === 0}
              aria-label="Previous journey event"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <ScenarioReset label="Replay journey" title="Replay member journey?"
              description="Return this timeline to Maya’s enrollment and clear its selected reflection and member preview. Other study scenarios will not be changed."
              onReset={() => { select(0); setShowMember(false); }} />
            <button
              onClick={() => select(index + 1)}
              disabled={index === journeyEvents.length - 1}
              aria-label="Next journey event"
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="journey-stage" key={index}>
          <section
            className="journey-story"
            aria-labelledby="journey-event-title"
          >
            <p className="eyebrow">MAYA’S STORY / DAY {snapshot.day}</p>
            <div className="journey-state" role="status">
              <span className="journey-state-dot" /> {snapshot.state}
            </div>
            <h2 id="journey-event-title">{event.title}</h2>
            <p className="journey-narrative">{event.story}</p>
            <dl className="journey-facts">
              <div>
                <dt>Points</dt>
                <dd>{snapshot.points}</dd>
              </div>
              <div>
                <dt>Qualifying purchases</dt>
                <dd>{snapshot.purchases}</dd>
              </div>
              <div>
                <dt>Last qualifying activity</dt>
                <dd>
                  {snapshot.lastPurchaseDay === null
                    ? "None yet"
                    : `Day ${snapshot.lastPurchaseDay}`}
                  <small>
                    {snapshot.daysSincePurchase === null
                      ? "No qualifying purchase"
                      : `${snapshot.daysSincePurchase} days ago`}
                  </small>
                </dd>
              </div>
              <div>
                <dt>Rewards enrollment</dt>
                <dd>Complete</dd>
                <small>Since day 0</small>
              </div>
            </dl>
            <details className="journey-reason" open>
              <summary>
                Why did Maya’s state change? <ChevronDown size={16} />
              </summary>
              <dl>
                <div>
                  <dt>Previous state</dt>
                  <dd>{snapshot.previousState ?? "Not enrolled"}</dd>
                </div>
                <div>
                  <dt>Event received</dt>
                  <dd>{event.title}</dd>
                </div>
                <div>
                  <dt>Relevant member facts</dt>
                  <dd>
                    {snapshot.purchases} qualifying{" "}
                    {snapshot.purchases === 1 ? "purchase" : "purchases"};{" "}
                    {snapshot.recentPurchases} in the last{" "}
                    {journeyRules.engagementWindowDays} days.
                    {snapshot.daysSincePurchase !== null &&
                      ` ${snapshot.daysSincePurchase} days since the last purchase.`}
                    {index === 3 && " Previously Engaged."}
                    {index === 4 && " Previously At risk."}
                    {event.amount !== undefined &&
                      ` $${event.amount} qualifying merchandise → ${event.amount * journeyRules.pointsPerDollar} points.`}
                  </dd>
                </div>
                <div>
                  <dt>Rule evaluated</dt>
                  <dd>{snapshot.rule}</dd>
                </div>
                <div className="journey-rule-result">
                  <dt>Resulting state</dt>
                  <dd>{snapshot.state}</dd>
                </div>
              </dl>
            </details>
          </section>
          <aside className="journey-perspective">
            <p className="eyebrow">FROM SIGNAL TO EXPERIENCE</p>
            <h2>What could FORM do next?</h2>
            <p>{experience.thought}</p>
            <ul>
              {experience.options.map((option) => (
                <li key={option}>
                  <span /> {option}
                </li>
              ))}
            </ul>
            <p className="journey-options-note">
              Product options, not automatic actions. A lifecycle state alone
              does not mean Maya needs a promotion or message.
            </p>
            <button
              className="button primary journey-preview-toggle"
              aria-expanded={showMember}
              aria-controls="journey-member-preview"
              onClick={() => setShowMember((value) => !value)}
            >
              <Eye size={17} />
              {showMember ? "Hide member preview" : "See what Maya sees"}
              <ArrowRight size={16} />
            </button>
            <div id="journey-member-preview" hidden={!showMember}>
              <div className="journey-preview-caption">
                <span className="eyebrow">MEMBER VIEW</span>
                <p>
                  One possible experience, not a sent message. Internal
                  lifecycle labels stay in Product View.
                </p>
              </div>
              <MemberPreview snapshot={snapshot} />
            </div>
          </aside>
        </div>
        {snapshot.state === "At risk" && (
          <section className="journey-decision">
            <p className="eyebrow">
              A PRODUCT DECISION / NO SINGLE RIGHT ANSWER
            </p>
            <h2>
              Maya has entered At risk.
              <br />
              <em>What would you do?</em>
            </h2>
            <div className="journey-decision-options">
              {riskDecisions.map((decision, i) => (
                <button
                  key={decision.title}
                  aria-pressed={choice === i}
                  onClick={() => setChoice(i)}
                >
                  {decision.title}
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
            <div className="journey-tradeoff" role="status">
              {choice !== null && (
                <>
                  <h3>{riskDecisions[choice].title}</h3>
                  <p>{riskDecisions[choice].text}</p>
                  <small>
                    Reflection only. This choice does not send an offer, alter
                    the timeline, or cause Maya’s later return.
                  </small>
                </>
              )}
            </div>
          </section>
        )}
        <footer className="journey-footer">
          <BrandMark />
          <p>
            A state is a signal.
            <br />
            <em>The experience is a product decision.</em>
          </p>
          <span>
            All members, events, and points in this journey are fictional.
            <br />
            No campaign is launched. No customer data is used.
          </span>
        </footer>
      </div>
    </div>
  );
}
