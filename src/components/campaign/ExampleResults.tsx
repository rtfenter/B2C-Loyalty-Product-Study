import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { BrandMark } from "../Brand";
import { decisions, metrics, exampleTreatments } from "../../campaignFixtures";
const groupNames = ["Control", "Treatment A", "Treatment B"];

// Deliberately accepts no campaign configuration: these are a separate experiment.
export function ExampleResults() {
  const [metricIndex, setMetricIndex] = useState(1);
  const [decision, setDecision] = useState<number | null>(null);
  const metric = metrics[metricIndex];
  return (
    <>
      <section
        className="studio-panel results-panel"
        aria-labelledby="example-results-title"
      >
        <div className="studio-phase">
          <span className="eyebrow">EXAMPLE EXPERIMENT RESULTS</span>
          <p>What did members do?</p>
        </div>
        <h2 id="example-results-title" tabIndex={-1}>
          Example experiment results
        </h2>
        <p className="example-distinction">
          The results below come from a fixed fictional FORM experiment. They
          are not generated from the campaign you configured above.
        </p>
        <div className="example-treatments">
          {exampleTreatments.map((group) => (
            <div key={group.name}>
              <span>{group.name}</span>
              <strong>{group.offer}</strong>
            </div>
          ))}
        </div>
        <p className="simulation-disclaimer">
          <Info size={17} />
          All members, results, and metrics are simulated for this product study
          and are not actual customer or company data.
        </p>
        <div className="results-grid">
          <div
            className="results-table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Outcome comparison table; scroll horizontally on smaller screens"
          >
            <table>
              <caption>Fixed fictional experiment · outcome comparison</caption>
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  {groupNames.map((name) => (
                    <th scope="col" key={name}>
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((row) => (
                  <tr key={row.name}>
                    <th scope="row">{row.name}</th>
                    {row.values.map((value, i) => (
                      <td key={i}>
                        {row.unit === "$"
                          ? `$${value.toFixed(row.name === "Reward cost/member" && value !== 0 ? 2 : 0)}`
                          : `${value}%`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="metric-chart">
            <label htmlFor="compare-metric">Explore a comparison</label>
            <select
              id="compare-metric"
              value={metricIndex}
              onChange={(event) => setMetricIndex(Number(event.target.value))}
            >
              {metrics.map((item, index) => (
                <option value={index} key={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <p>{metric.dimension}</p>
            {metric.values.map((value, index) => (
              <div className={`comparison-row group-${index}`} key={index}>
                <div>
                  <span>{groupNames[index]}</span>
                  <strong>
                    {metric.unit === "$"
                      ? `$${value.toFixed(metricIndex === 3 ? 2 : 0)}`
                      : `${value}%`}
                  </strong>
                </div>
                <div className="comparison-track">
                  <span
                    style={{
                      width: `${(value / Math.max(...metric.values)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <small>
              Bars start at zero; scale is relative to the largest value for
              this metric. Higher cost is not inherently better.
            </small>
          </div>
        </div>
        <div className="results-takeaway">
          <BrandMark />
          <p>
            <strong>A tradeoff worth exploring.</strong> In this fictional experiment,
            Treatment A pairs stronger category conversion and repeat behavior
            with lower reward cost than B. We still do not know margin impact or
            whether the behavior lasts beyond the offer.
          </p>
        </div>
      </section>
      <section
        className="studio-panel decision-panel"
        aria-labelledby="decision-title"
      >
        <div className="studio-phase">
          <span className="eyebrow">PRODUCT DECISION</span>
          <p>What do we do with what we learned?</p>
        </div>
        <h2 id="decision-title">What would you do next?</h2>
        <p className="decision-context">
          Consider the fixed example experiment above, not your configured
          campaign. There is no single right answer. Make the tradeoff explicit.
        </p>
        <div className="decision-options">
          {decisions.map((item, index) => (
            <button
              key={item.title}
              aria-pressed={decision === index}
              onClick={() => setDecision(index)}
            >
              {item.title}
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
        <div role="status" className="decision-response">
          {decision !== null && (
            <>
              <span className="eyebrow">A PRODUCT TRADEOFF</span>
              <h3>{decisions[decision].title}</h3>
              <p>{decisions[decision].text}</p>
              <small>Reflection only. No campaign has been launched.</small>
            </>
          )}
        </div>
      </section>
    </>
  );
}
