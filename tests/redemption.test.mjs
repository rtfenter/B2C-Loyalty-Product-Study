import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
function url(file) { return `data:text/javascript;base64,${Buffer.from(ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64')}`; }
const { valueExchangeSnapshot: snapshot, exchangeRecords: records } = await import(url('../src/valueExchange.ts'));
const { redemptionReducer: reduce, initialRedemption } = await import(url('../src/redemptionScenario.ts'));
const byId = id => records.find(record => record.id === id);

test('one journey produces the expected customer balances and retained value', () => {
  const expected = [
    [1000, 0, 0, 0], [0, 0, 5, 0], [20, 15, 0, 20], [1000, 0, 0, 0], [1010, 10, 0, 10],
  ];
  expected.forEach(([points, netPaid, rewardAvailable, merchandiseRetained], stage) => {
    const actual = snapshot(stage);
    assert.deepEqual([actual.points, actual.netPaid, actual.rewardAvailable, actual.merchandiseRetained], [points, netPaid, rewardAvailable, merchandiseRetained]);
  });
});
test('purchase earning uses full merchandise value independently of reward tender', () => {
  assert.equal(byId('PUR-001').qualifyingSpend, 20);
  assert.equal(byId('PAY-001').cash, 15);
  assert.equal(byId('USE-001').reward, -5);
  assert.equal(byId('ERN-001').points, 20);
  assert.deepEqual(byId('ERN-001').sourceIds, ['PUR-001']);
});
test('a single return atomically restores the original value through linked reversals', () => {
  const purchased = reduce(reduce(initialRedemption, { type: 'advance', from: 0 }), { type: 'advance', from: 1 });
  const returned = reduce(purchased, { type: 'advance', from: 2 });
  assert.deepEqual(snapshot(returned.stage).currentRecords.map(record => record.kind), ['return', 'refund', 'restoration', 'earning-reversal']);
  assert.equal(byId('REF-001').cash, -byId('PAY-001').cash);
  assert.ok(byId('REF-001').sourceIds.includes('PAY-001'));
  assert.equal(byId('RST-001').points, -byId('RED-001').points);
  for (const id of ['RED-001', 'RWD-001', 'USE-001', 'RET-001']) assert.ok(byId('RST-001').sourceIds.includes(id));
  assert.equal(byId('REV-001').points, -byId('ERN-001').points);
  assert.ok(byId('REV-001').sourceIds.includes('ERN-001'));
  assert.equal(snapshot(3).rewardAvailable, 0);
  assert.equal(snapshot(3).totalRefunded, 15);
});
test('new purchase has independent payment and earning; previous return stays settled', () => {
  assert.deepEqual(byId('PUR-002').sourceIds, []);
  assert.deepEqual(byId('PAY-002').sourceIds, ['PUR-002']);
  assert.deepEqual(byId('ERN-002').sourceIds, ['PUR-002']);
  assert.equal(byId('ERN-002').points, 10);
  assert.equal(snapshot(4).totalPaid, 25);
  assert.equal(snapshot(4).totalRefunded, 15);
  assert.deepEqual(snapshot(4).records.slice(0, snapshot(3).records.length), snapshot(3).records);
});
test('every reference resolves to an earlier record and all balances reconcile', () => {
  const seen = new Set();
  for (const record of records) {
    assert.ok(!seen.has(record.id));
    for (const source of record.sourceIds) assert.ok(seen.has(source), `${record.id} must reference an existing origin: ${source}`);
    seen.add(record.id);
  }
  for (let stage = 0; stage <= 4; stage++) {
    const value = snapshot(stage);
    assert.equal(value.history.reduce((total, record) => total + record.points, 0), value.points);
    assert.equal(value.totalPaid - value.totalRefunded, value.netPaid);
    assert.equal(new Set(value.records.map(record => record.id)).size, value.records.length);
  }
});
test('previous, replay, duplicate clicks and terminal advance never duplicate events', () => {
  const original = JSON.stringify(records);
  let state = initialRedemption;
  assert.strictEqual(reduce(state, { type: 'previous' }), state);
  for (let stage = 0; stage < 4; stage++) {
    const action = { type: 'advance', from: stage };
    state = reduce(state, action);
    assert.strictEqual(reduce(state, action), state);
  }
  assert.strictEqual(reduce(state, { type: 'advance', from: 4 }), state);
  const previous = reduce(state, { type: 'previous' });
  assert.equal(snapshot(previous.stage).points, 1000);
  assert.deepEqual(reduce(previous, { type: 'advance', from: 3 }), state);
  assert.deepEqual(reduce(state, { type: 'replay' }), initialRedemption);
  assert.equal(initialRedemption.stage, 0);
  assert.equal(JSON.stringify(records), original);
});
