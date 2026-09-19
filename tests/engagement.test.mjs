import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
function moduleUrl(path, aliases = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
    .replace(/import ['"][^'"]+\.css['"];?/g, '')
    .replace(/from ["']([^"']+)["']/g, (_, name) => `from ${JSON.stringify(aliases[name] ?? import.meta.resolve(name))}`);
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}
const scenarioUrl = moduleUrl('../src/engagementScenario.ts');
const { objectives, objectiveFor, programContext, memberFor, eligibilityFor, qualifyingHistory, qualifiesAsSuccess, pointsFor, engagementReducer: reduce, initialEngagement } = await import(scenarioUrl);
const experimentUrl = moduleUrl('../src/engagementExperiment.ts', { './engagementScenario': scenarioUrl });
const { experimentFor, incrementalLift, outcomeRate } = await import(experimentUrl);
const { CustomerExperience } = await import(moduleUrl('../src/components/engagement/CustomerExperience.tsx', { '../../engagementScenario': scenarioUrl }));
const { ExperimentResult } = await import(moduleUrl('../src/components/engagement/ExperimentResult.tsx', { '../../engagementScenario': scenarioUrl, '../../engagementExperiment': experimentUrl }));
const passes = (id, member) => eligibilityFor(id, member).every(rule => rule.passes);
const purchase = (changes = {}) => ({ id: 'NEW-001', day: 3, qualifying: true, amount: 20, ...changes });
const complete = state => reduce(reduce(state, { type: 'preview' }), { type: 'purchase', objective: state.objective, purchase: purchase() });

test('program context is not an eligible audience or an experiment sample', () => {
  assert.equal(programContext.enrolled, 100000);
  assert.equal(programContext.activated, 58000);
  assert.equal(programContext.notActivated, 42000);
  for (const { id } of objectives) {
    assert.equal(experimentFor(id).eligibleCount, null);
    assert.equal(experimentFor(id).sampleSize, null);
    assert.equal(experimentFor(id).treatmentPercent + experimentFor(id).controlPercent, 100);
  }
});
test('objective definitions change the cohort, success event, primary measure and window', () => {
  assert.equal(new Set(objectives.map(o => o.audience)).size, 3);
  assert.equal(new Set(objectives.map(o => o.success)).size, 3);
  assert.equal(new Set(objectives.map(o => o.primary)).size, 3);
  assert.deepEqual(objectives.map(o => o.measurementDays), [14, 14, 30]);
  for (const { id } of objectives) {
    assert.ok(passes(id, memberFor(id)));
    for (const other of objectives.filter(o => o.id !== id)) assert.equal(passes(other.id, memberFor(id)), false);
  }
});
test('activation requires recent enrollment, no qualifying purchase, and all eligibility gates', () => {
  const member = memberFor('activate');
  for (const enrollmentDay of [0, -30]) assert.ok(passes('activate', { ...member, enrollmentDay }));
  for (const enrollmentDay of [1, -31]) assert.equal(passes('activate', { ...member, enrollmentDay }), false);
  assert.equal(passes('activate', { ...member, purchases: [purchase({ day: -1 })] }), false);
  assert.ok(passes('activate', { ...member, purchases: [purchase({ day: -1, qualifying: false })] }));
  for (const { id } of objectives) {
    for (const key of ['enrolled', 'contactable', 'promotionEligible']) assert.equal(passes(id, { ...memberFor(id), [key]: false }), false);
  }
});
test('second purchase needs exactly one distinct recent qualifying purchase', () => {
  const member = memberFor('second');
  assert.ok(passes('second', { ...member, purchases: [purchase({ day: -30 })] }));
  assert.equal(passes('second', { ...member, purchases: [purchase({ day: -31 })] }), false);
  assert.equal(passes('second', { ...member, purchases: [] }), false);
  assert.equal(passes('second', { ...member, purchases: [...member.purchases, purchase({ day: -1 })] }), false);
  assert.ok(passes('second', { ...member, purchases: [...member.purchases, ...member.purchases] }));
});
test('lapse starts at 90 days and does not require previous engagement', () => {
  const member = memberFor('lapsed');
  assert.ok(passes('lapsed', { ...member, purchases: [purchase({ day: -90 })] }));
  assert.equal(passes('lapsed', { ...member, purchases: [purchase({ day: -89 })] }), false);
  assert.equal(passes('lapsed', { ...member, purchases: [] }), false);
  assert.equal(passes('lapsed', { ...member, purchases: [...member.purchases, purchase({ day: -10 })] }), false);
});
test('qualifying history excludes pre-enrollment, future, nonqualifying and duplicate records', () => {
  const member = { ...memberFor('activate'), purchases: [purchase({ id: 'BEFORE', day: -11 }), purchase({ id: 'FUTURE', day: 1 }), purchase({ id: 'NO', day: -3, qualifying: false }), purchase({ id: 'YES', day: -2 }), purchase({ id: 'YES', day: -2 })] };
  assert.deepEqual(qualifyingHistory(member).map(p => p.id), ['YES']);
});
test('success requires a distinct qualifying purchase within the exposure-relative window', () => {
  for (const { id, measurementDays } of objectives) {
    const member = memberFor(id);
    for (const day of [0, measurementDays]) assert.ok(qualifiesAsSuccess(id, member, purchase({ day })));
    for (const day of [-1, measurementDays + 1]) assert.equal(qualifiesAsSuccess(id, member, purchase({ day })), false);
    assert.equal(qualifiesAsSuccess(id, member, purchase({ qualifying: false })), false);
    assert.equal(qualifiesAsSuccess(id, { ...member, promotionEligible: false }, purchase()), false);
    if (member.purchases.length) assert.equal(qualifiesAsSuccess(id, member, purchase({ id: member.purchases[0].id })), false);
    const shifted = { ...member, enrollmentDay: member.enrollmentDay + 100, purchases: member.purchases.map(p => ({ ...p, day: p.day + 100 })) };
    assert.ok(qualifiesAsSuccess(id, shifted, purchase({ day: 100 + measurementDays }), 100));
    assert.equal(qualifiesAsSuccess(id, shifted, purchase({ day: 101 + measurementDays }), 100), false);
  }
});
test('views and clicks do not qualify; completion awards the purchase once in either arm', () => {
  for (const { id } of objectives) for (const arm of ['treatment', 'control']) {
    const state = { ...initialEngagement, objective: id, arm };
    assert.equal(state.purchase, null);
    const preview = reduce(state, { type: 'preview' });
    assert.equal(preview.purchase, null);
    const done = complete(state);
    assert.equal(done.phase, 'purchased');
    assert.equal(done.purchase.id, 'NEW-001');
    assert.strictEqual(reduce(done, { type: 'purchase', objective: id, purchase: purchase() }), done);
    assert.strictEqual(reduce(done, { type: 'preview' }), done);
    assert.deepEqual(pointsFor(done.purchase.amount, arm), arm === 'treatment' ? { base: 20, promotional: 20, total: 40 } : { base: 20, promotional: 0, total: 20 });
    assert.equal(state.purchase, null);
  }
});
test('invalid, nonqualifying, stale-objective and pre-preview purchase actions are ignored', () => {
  assert.strictEqual(reduce(initialEngagement, { type: 'purchase', objective: 'activate', purchase: purchase() }), initialEngagement);
  const preview = reduce(initialEngagement, { type: 'preview' });
  for (const action of [
    { type: 'purchase', objective: 'second', purchase: purchase() },
    { type: 'purchase', objective: 'activate', purchase: purchase({ qualifying: false }) },
    { type: 'purchase', objective: 'activate', purchase: purchase({ day: 15 }) },
    { type: 'purchase', objective: 'activate', purchase: purchase({ day: NaN }) },
    { type: 'purchase', objective: 'activate', purchase: purchase({ amount: -20 }) },
  ]) assert.strictEqual(reduce(preview, action), preview);
});
test('objective switching, arm switching and replay clear stale customer state', () => {
  const done = { ...complete(initialEngagement), step: 6 };
  const switched = reduce(done, { type: 'objective', objective: 'lapsed' });
  assert.deepEqual(switched, { ...initialEngagement, objective: 'lapsed' });
  const control = reduce(done, { type: 'arm', arm: 'control' });
  assert.equal(control.phase, 'offered');
  assert.equal(control.purchase, null);
  assert.equal(control.step, 6);
  assert.deepEqual(reduce(complete(switched), { type: 'replay' }), switched);
  for (const step of [-1, 7, 0.5]) assert.strictEqual(reduce(done, { type: 'step', step }), done);
});
test('24 minus 18 is six percentage points, with safe zero and negative cases', () => {
  assert.equal(incrementalLift(24, 18), 6);
  assert.equal(incrementalLift(18, 18), 0);
  assert.equal(incrementalLift(12, 18), -6);
  for (const value of [null, NaN, Infinity, -1, 101]) assert.equal(incrementalLift(value, 18), null);
  assert.equal(outcomeRate(24, 100), 24);
  assert.equal(outcomeRate(0, 100), 0);
  for (const [successes, total] of [[0, 0], [101, 100], [-1, 100], [1.5, 10]]) assert.equal(outcomeRate(successes, total), null);
});
test('only activation has results, independent of customer actions and objective switches', () => {
  const expected = { treatmentRate: 24, controlRate: 18, lift: 6 };
  assert.deepEqual(experimentFor('activate').result, expected);
  let state = complete(initialEngagement);
  for (const { id } of objectives) {
    state = reduce(state, { type: 'objective', objective: id });
    state = complete(state);
    assert.deepEqual(experimentFor('activate').result, expected);
    if (id !== 'activate') assert.equal(experimentFor(id).result, null);
  }
  const altered = experimentFor('activate');
  altered.result.treatmentRate = 99;
  assert.deepEqual(experimentFor('activate').result, expected);
});
test('customer copy excludes internal labels and campaign machinery in every objective and arm', () => {
  for (const { id } of objectives) for (const arm of ['treatment', 'control']) for (const phase of ['offered', 'preview', 'purchased']) {
    const state = { ...initialEngagement, objective: id, arm, phase, purchase: phase === 'purchased' ? purchase() : null };
    const html = renderToStaticMarkup(createElement(CustomerExperience, { state, dispatch() {} }));
    assert.doesNotMatch(html, /activation|reactivation|lapsed|treatment|control|cohort|experiment|incremental|campaign/i);
    if (arm === 'control') assert.doesNotMatch(html, /2×|extra points/);
    if (phase === 'preview') assert.match(html, /No purchase completed. No points earned yet/);
  }
});
test('results presentation does not pass activation numbers off as results for other objectives', () => {
  const html = renderToStaticMarkup(createElement(ExperimentResult, { objectiveId: 'activate' }));
  assert.match(html, /24% − 18% = \+6 percentage points/);
  assert.match(html, /not the whole 24%/);
  for (const objectiveId of ['second', 'lapsed']) {
    const other = renderToStaticMarkup(createElement(ExperimentResult, { objectiveId }));
    assert.match(other, /RESULTS NOT SUPPLIED/);
    assert.doesNotMatch(other, /24%|18%|\+6/);
    assert.match(other, new RegExp(objectiveFor(objectiveId).primary));
  }
});
