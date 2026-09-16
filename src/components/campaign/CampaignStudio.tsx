import { ScenarioReset } from "../ScenarioReset";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  FlaskConical,
  Info,
  Users,
} from "lucide-react";
import { BrandMark, ReferenceImage } from "../Brand";
import {
  allocateMembers,
  buildFunnel,
  criteria,
  defaultOffers,
  featuredCriteria,
  goals,
  goalNotes,
  offerLabel,
  type Criterion,
  type Offer,
} from "../../campaignFixtures";
import "./campaign.css";
import { ExampleResults } from "./ExampleResults";
const number = (value: number) => value.toLocaleString("en-US");
const groupNames = ["Control", "Treatment A", "Treatment B"];
export function ProductEntry() {
  return (
    <aside className="product-entry" aria-label="Portfolio product perspective">
      <div>
        <FlaskConical size={19} />
        <span>
          <strong>Behind the member experience</strong>
          <span>
            Explore the product decisions in this fictional loyalty study.
          </span>
        </span>
      </div>
    </aside>
  );
}
function Step({
  number: step,
  title,
  description,
}: {
  number: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="studio-step">
      <span>{step}</span>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}
export function CampaignStudio() {
  const [goal, setGoal] = useState<string>("Introduce category");
  const [selected, setSelected] = useState<Criterion[]>([...featuredCriteria]);
  const [offers, setOffers] = useState(defaultOffers);
  const [treatment, setTreatment] = useState<"A" | "B">("A");
  const [allocation, setAllocation] = useState([33, 33, 33]);
  const funnel = buildFunnel(selected);
  const audience = funnel[funnel.length - 1].count;
  const total = allocation.reduce((a, b) => a + b, 0);
  const effective = [
    allocation[0] + Math.max(0, 100 - total),
    allocation[1],
    allocation[2],
  ];
  const validAllocation =
    total <= 100 && effective.every((n) => Number.isFinite(n) && n > 0);
  const counts = validAllocation
    ? allocateMembers(audience, effective)
    : [0, 0, 0];
  const invalidOffer = Object.values(offers).some(
    (o) =>
      !Number.isInteger(o.value) ||
      o.value < (o.type === "multiplier" ? 2 : 1) ||
      o.value > (o.type === "multiplier" ? 10 : 1000) ||
      !o.start ||
      !o.end ||
      o.end < o.start,
  );
  const current = offers[treatment];
  function updateOffer<K extends keyof Offer>(key: K, value: Offer[K]) {
    setOffers((previous) => ({
      ...previous,
      [treatment]: { ...previous[treatment], [key]: value },
    }));
  }
  function reset() {
    setGoal("Introduce category");
    setSelected([...featuredCriteria]);
    setOffers(defaultOffers);
    setAllocation([33, 33, 33]);
    setTreatment("A");
  }
  return (
    <div className="studio-shell">
      <div className="studio-main">
        <div className="studio-workspace">
          <div className="studio-title">
            <div>
              <p className="eyebrow">
                DESIGN THE OFFER. EXPLORE THE TRADEOFFS.
              </p>
              <h1>Campaign Studio</h1>
              <p>
                Thoughtful offers. Meaningful questions. A stronger member
                relationship.
              </p>
            </div>
            <ScenarioReset label="Reset campaign" title="Reset campaign?"
              description="Restore the featured campaign configuration. Other study scenarios will not be changed." onReset={reset} />
          </div>
          <div className="studio-context">
            <Info size={16} />
            <p>
              You’re exploring the product team’s perspective. This local study
              does not launch campaigns or change Maya’s account.
            </p>
          </div>
          <aside className="studio-study-question">
            <span className="eyebrow">THE QUESTION</span>
            <p>Can the right offer inspire a new kind of movement?</p>
            <span>Fictional members. Real product questions.</span>
          </aside>
          <div className="studio-phase builder-phase">
            <span className="eyebrow">BUILD YOUR CAMPAIGN</span>
            <h2>Build your campaign</h2>
            <p>What can the product team control?</p>
          </div>
          <section
            className="studio-goal studio-panel"
            aria-labelledby="goal-label"
          >
            <Step number="01" title="Choose a goal" />
            <label id="goal-label" htmlFor="campaign-goal">
              What behavior do you want to explore?
            </label>
            <select
              id="campaign-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              {goals.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <p>
              Illustrative goals, not an exhaustive playbook. {goalNotes[goal]}
            </p>
          </section>
          <div className="studio-builder">
            <section className="studio-panel audience-panel">
              <Step
                number="02"
                title="Build your audience"
                description="Start broad. Make each criterion count."
              />
              <div className="audience-total" aria-live="polite">
                <Users size={27} />
                <div>
                  <strong>{number(audience)}</strong>
                  <span>eligible simulated members</span>
                </div>
              </div>
              <ol className="audience-funnel">
                {funnel.map((row, index) => (
                  <li key={row.label}>
                    <div>
                      <span>{row.label}</span>
                      <strong>{number(row.count)}</strong>
                    </div>
                    <div className="funnel-track">
                      <span
                        style={{ width: `${(row.count / 24830) * 100}%` }}
                      />
                    </div>
                    <small>
                      {index === 0
                        ? "Starting population"
                        : row.count === funnel[index - 1].count
                          ? "Already included · no additional reduction"
                          : `${number(funnel[index - 1].count - row.count)} excluded at this step`}
                    </small>
                  </li>
                ))}
              </ol>
              <fieldset className="criteria-list">
                <legend>Audience criteria</legend>
                {criteria.map((criterion, index) => (
                  <label key={criterion.id}>
                    <input
                      type="checkbox"
                      checked={selected.includes(criterion.id)}
                      onChange={() =>
                        setSelected((previous) =>
                          previous.includes(criterion.id)
                            ? previous.filter((id) => id !== criterion.id)
                            : [...previous, criterion.id],
                        )
                      }
                    />
                    <span>
                      {criterion.label}
                      {index === 4 && <small>Optional exploration</small>}
                    </span>
                  </label>
                ))}
              </fieldset>
              <details className="studio-details">
                <summary>
                  How eligibility is constructed <ChevronDown size={15} />
                </summary>
                <p>
                  Every selected criterion must be true (AND). Filters always
                  apply in the order shown. Removing a filter recomputes the
                  intersection from 24,830 synthetic members.
                </p>
                {criteria
                  .filter((c) => selected.includes(c.id))
                  .map((c) => (
                    <p key={c.id}>
                      <strong>{c.label}:</strong> {c.explanation}
                    </p>
                  ))}
              </details>
            </section>
            <section className="studio-panel offer-panel">
              <Step
                number="03"
                title="Shape the offer"
                description="Two incentives. One behavior to explore."
              />
              <div
                className="treatment-switch"
                role="group"
                aria-label="Treatment to configure"
              >
                {(["A", "B"] as const).map((value) => (
                  <button
                    key={value}
                    aria-pressed={value === treatment}
                    onClick={() => setTreatment(value)}
                  >
                    Treatment {value}
                    {value === treatment && <Check size={13} />}
                  </button>
                ))}
              </div>
              <div className="offer-fields">
                <label>
                  Offer type
                  <select
                    value={current.type}
                    onChange={(event) => {
                      const type = event.target.value as Offer["type"];
                      setOffers((previous) => ({
                        ...previous,
                        [treatment]: {
                          ...previous[treatment],
                          type,
                          value: type === "multiplier" ? 2 : 250,
                        },
                      }));
                    }}
                  >
                    <option value="multiplier">Points multiplier</option>
                    <option value="bonus">Bonus points after purchase</option>
                  </select>
                </label>
                <label>
                  Incentive value{" "}
                  {current.type === "multiplier" ? "(× points)" : "(points)"}
                  <input
                    type="number"
                    min={current.type === "multiplier" ? 2 : 1}
                    max={current.type === "multiplier" ? 10 : 1000}
                    step={1}
                    value={Number.isFinite(current.value) ? current.value : ""}
                    onChange={(event) =>
                      updateOffer("value", event.target.valueAsNumber)
                    }
                  />
                </label>
                <label>
                  Qualifying category
                  <select
                    value={current.category}
                    onChange={(event) =>
                      updateOffer("category", event.target.value)
                    }
                  >
                    <option>Sports bras</option>
                    <option>Leggings</option>
                  </select>
                </label>
                <label>
                  Eligibility
                  <select
                    value={current.eligibility}
                    onChange={(event) =>
                      updateOffer("eligibility", event.target.value)
                    }
                  >
                    <option>Selected eligible audience</option>
                    <option>
                      Selected audience · first qualifying purchase only
                    </option>
                  </select>
                </label>
                <div className="offer-dates">
                  <label>
                    Start date
                    <input
                      type="date"
                      value={current.start}
                      onInput={(event) =>
                        updateOffer("start", event.currentTarget.value)
                      }
                      onChange={(event) =>
                        updateOffer("start", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    End date
                    <input
                      type="date"
                      min={current.start}
                      value={current.end}
                      onInput={(event) =>
                        updateOffer("end", event.currentTarget.value)
                      }
                      onChange={(event) =>
                        updateOffer("end", event.target.value)
                      }
                    />
                  </label>
                </div>
                <details className="studio-details">
                  <summary>
                    Optional limits <ChevronDown size={15} />
                  </summary>
                  <label>
                    Purchase limit
                    <select
                      value={current.limit}
                      onChange={(event) =>
                        updateOffer("limit", event.target.value)
                      }
                    >
                      <option>One qualifying purchase per member</option>
                      <option>Two qualifying purchases per member</option>
                      <option>No purchase-count limit</option>
                    </select>
                  </label>
                </details>
              </div>
              <div className="preview-heading">
                <span>MEMBER PREVIEW</span>
                <span>Treatment {treatment}</span>
              </div>
              <div className="offer-preview">
                <div>
                  <BrandMark />
                  <h3>
                    For your
                    <br />
                    <em>next level.</em>
                  </h3>
                  <p>{offerLabel(current)}</p>
                  <span className="preview-cta">
                    Made for your next move <ArrowRight size={13} />
                  </span>
                </div>
                <ReferenceImage
                  crop="285 55 220 484"
                  label="FORM activewear member offer illustration"
                />
              </div>
              <p className="preview-caption">
                Illustrative placement for a member like Maya if eligible.
                Preview only; no offer is sent or added to her account.
              </p>
            </section>
            <section className="studio-panel experiment-panel">
              <Step
                number="04"
                title="Design the experiment"
                description="Compare against a group with no incentive."
              />
              <div className="experiment-groups">
                {groupNames.map((name, index) => (
                  <div className={`experiment-group group-${index}`} key={name}>
                    <strong>{name}</strong>
                    <label>
                      <span className="sr-only">
                        {name} requested allocation
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={allocation[index]}
                        onChange={(event) =>
                          setAllocation((previous) =>
                            previous.map((value, i) =>
                              i === index
                                ? Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      event.target.valueAsNumber || 0,
                                    ),
                                  )
                                : value,
                            ),
                          )
                        }
                      />
                      <span>%</span>
                    </label>
                    <span>
                      {validAllocation
                        ? `${number(counts[index])} members`
                        : "Check allocation"}
                    </span>
                    <p>
                      {index === 0
                        ? "No promotional incentive"
                        : offerLabel(offers[index === 1 ? "A" : "B"])}
                    </p>
                  </div>
                ))}
              </div>
              <div className="allocation-note" role="status">
                <Info size={15} />
                <p>
                  {validAllocation
                    ? `${100 - total}% unassigned is added to Control. Effective split: ${effective.join("% / ")}%. Member counts use largest-remainder rounding and sum to ${number(audience)}.`
                    : "Keep requested allocation at or below 100% and give every group a positive effective allocation."}
                </p>
              </div>
              <p className="assignment-note">
                The eligible audience is split into mutually exclusive groups.
                These are deterministic group counts, not live member
                assignments. A live experiment would require a documented random
                assignment method.
              </p>
              <div className="experiment-question">
                <span className="eyebrow">WHAT ARE WE LEARNING?</span>
                <h3>
                  New category.
                  <br />
                  Lasting habit?
                </h3>
                <p>
                  Compare purchase behavior, category conversion, basket value,
                  reward cost, and whether members return within 28 days.
                </p>
              </div>
              {invalidOffer && (
                <p className="studio-error" role="alert">
                  Check both offers: multiplier 2–10 or bonus 1–1,000; enter
                  valid dates with end on or after start.
                </p>
              )}
              <div className="campaign-ready">
                <h3>
                  {validAllocation && !invalidOffer && audience > 0
                    ? "Campaign ready"
                    : "Review your campaign setup"}
                </h3>
                <p>
                  You've defined who receives the offer and how the experiment
                  would run. How members respond can't be known from these
                  settings alone. That requires observed behavior.
                </p>
                <button
                  className="button primary explore-results"
                  onClick={() => {
                    const heading = document.getElementById(
                      "example-results-title",
                    );
                    heading?.focus({ preventScroll: true });
                    heading?.scrollIntoView({
                      block: "start",
                      behavior: "auto",
                    });
                  }}
                >
                  Explore example results <ArrowRight size={17} />
                </button>
                <p className="run-hint">
                  Your campaign stays intact. The example is a separate
                  experiment.
                </p>
              </div>
            </section>
          </div>
          <ExampleResults />
          <div className="studio-end">
            <BrandMark />
            <span>Thoughtful incentives. Stronger questions.</span>
            <a href="#rewards">
              Return to Maya’s experience <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
