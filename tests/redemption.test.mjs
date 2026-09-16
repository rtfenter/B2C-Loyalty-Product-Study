import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
function url(file){return `data:text/javascript;base64,${Buffer.from(ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64')}`;}
const {exchange,valueExchangeSnapshot:v,standardReturnSnapshot:s}=await import(url('../src/valueExchange.ts'));
const {redemptionReducer:r,initialRedemption}=await import(url('../src/redemptionScenario.ts'));
test('standard return reverses the same purchase earning without negative balance',()=>{assert.equal(s(false).earned,30);assert.equal(s(false).balance,30);assert.equal(s(true).reversed,30);assert.equal(s(true).balance,0);assert.equal(s(true).refund,30);});
test('redemption exchanges 500 points for one $5 reward',()=>{assert.equal(v(0).points,500);assert.equal(exchange.redemptionCost,500);assert.equal(v(1).points,0);assert.equal(v(1).rewardAvailable,5);});
test('purchase earns on spend after reward tender',()=>{const p=v(2);assert.equal(exchange.merchandise,10);assert.equal(p.rewardApplied,5);assert.equal(p.qualifyingSpend,5);assert.equal(p.tenderPaid,5);assert.equal(p.earned,5);assert.equal(p.points,5);assert.equal(p.rewardAvailable,0);});
test('full return restores reward as points and refunds only actual tender',()=>{const p=v(2),f=v(3);assert.equal(f.reversed,5);assert.equal(f.earned-f.reversed,0);assert.equal(f.tenderRefund,p.tenderPaid);assert.equal(f.tenderRefund,5);assert.equal(f.restoredPoints,500);assert.equal(f.points,500);assert.equal(f.rewardAvailable,0);assert.equal(f.merchandiseRetained,0);assert.equal(f.rewardCreated-f.rewardApplied,0);});
test('history reconciles at every stage',()=>{for(const stage of [0,1,2,3]){const snap=v(stage);assert.equal(snap.history.reduce((sum,row)=>sum+row.points,0),snap.points);}});
test('replay and repeated completion are safe',()=>{let state=initialRedemption;for(let i=0;i<3;i++)state=r(state,{type:'advance'});assert.equal(state.stage,3);assert.strictEqual(r(state,{type:'advance'}),state);assert.deepEqual(r(state,{type:'replay'}),initialRedemption);assert.equal(initialRedemption.stage,0);});
