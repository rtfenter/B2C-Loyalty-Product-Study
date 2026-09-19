import { experimentFor, guardrails } from '../../engagementExperiment';
import { objectiveFor, type ObjectiveId } from '../../engagementScenario';
export function ExperimentResult({ objectiveId }: { objectiveId: ObjectiveId }) {
  const objective = objectiveFor(objectiveId);
  const experiment = experimentFor(objectiveId);
  return <div className="eng-measurement">
    {experiment.result ? <>
      <p className="eng-fictional">ILLUSTRATIVE RESULTS · NOT LIVE CAMPAIGN DATA</p>
      <div className="eng-lift"><strong>+{experiment.result.lift}</strong><div><span>percentage points</span><p>incremental activation lift</p></div></div>
      <div className="eng-result-bars" aria-label="Treatment activation 24 percent, control activation 18 percent, incremental difference 6 percentage points">
        {[{ label: 'Treatment', value: experiment.result.treatmentRate, treatment: true }, { label: 'Control', value: experiment.result.controlRate, treatment: false }].map(row => <div className={row.treatment ? 'eng-bar-row is-treatment' : 'eng-bar-row'} key={row.label}><div><span>{row.label}</span><strong>{row.value}%</strong></div><div className="eng-bar-track"><span style={{ width: `${row.value}%` }} /></div></div>)}
        <p>Shared scale: 0–100% · first qualifying purchase within 14 days</p>
      </div>
      <div className="eng-insight"><h3>24% is the response. +6 percentage points is the incremental difference.</h3><p>24% of treatment members made a first qualifying purchase. In the normal experience, 18% of control members did too. The illustrative estimate of additional activation is <strong>24% − 18% = +6 percentage points</strong>, not the whole 24%.</p></div>
      <p className="eng-fineprint">Rates are supplied fictional observations. Sample sizes and uncertainty are not supplied; statistical significance is not established. A customer's simulated purchase does not change these results.</p>
    </> : <div className="eng-no-results"><p className="eyebrow">RESULTS NOT SUPPLIED</p><h3>Define what would count before measuring it.</h3><p>No treatment rate, control rate, or lift is supplied for this objective. The activation example is not evidence for this behavior.</p></div>}
    <div className="eng-primary-measure"><span className="eyebrow">PRIMARY MEASURE</span><h3>{objective.primary}</h3><p>Treatment success rate − control success rate, in percentage points, within {objective.measurementDays} days of the experiment start.</p></div>
    <h3 className="eng-subhead">Supporting measures</h3><ul className="eng-measure-list">{objective.supporting.map(item => <li key={item}>{item}</li>)}</ul>
    <p className="eng-measure-note">Incentive redemption (use) means the automatic bonus was applied to a qualifying purchase; it does not mean spending loyalty points. Supporting values are not supplied.</p>
    <div className="eng-followup"><h3>Look beyond the first response</h3><p>{objective.followUp}</p></div>
    <details className="eng-guardrails"><summary>Guardrails · what could make the lift not worth it?</summary><dl>{guardrails.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.description}</dd></div>)}</dl><p>No guardrail outcomes or decision thresholds have been supplied. These are checks to plan, not passed checks.</p></details>
  </div>;
}
