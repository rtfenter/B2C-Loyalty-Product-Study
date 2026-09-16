import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
function moduleUrl(path, aliases = {}) {
  let code = ts.transpileModule(
    readFileSync(new URL(path, import.meta.url), "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
  code = code.replace(
    /from ["']([^"']+)["']/g,
    (_, name) => `from ${JSON.stringify(aliases[name])}`,
  );
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
const baseUrl = moduleUrl("../src/fixtures.ts");
const canonical = await import(baseUrl);
const {
  offerEligibility,
  offerAudience,
  previewOffer,
  mayaOfferPreview,
  targetedOffer,
} = await import(
  moduleUrl("../src/offerFixtures.ts", { "./fixtures": baseUrl })
);
test("eligible Sculpt Bra earns 48 base plus 48 promotional points in preview", () => {
  assert.deepEqual(mayaOfferPreview, {
    qualifyingMerchandise: 48,
    baseRate: 1,
    basePoints: 48,
    multiplier: 2,
    promotionalPoints: 48,
    totalPoints: 96,
  });
});
test("each deterministic targeting rule gates eligibility", () => {
  assert.ok(
    offerEligibility(offerAudience, targetedOffer.scenarioDate).every(
      (rule) => rule.passes,
    ),
  );
  for (const key of Object.keys(offerAudience))
    assert.ok(
      offerEligibility(
        { ...offerAudience, [key]: !offerAudience[key] },
        targetedOffer.scenarioDate,
      ).some((rule) => !rule.passes),
    );
});
test("active period is inclusive and independent of the system clock", () => {
  for (const date of ["2026-09-01", "2026-09-30"])
    assert.ok(
      offerEligibility(offerAudience, date).every((rule) => rule.passes),
    );
  for (const date of ["2026-08-31", "2026-10-01"])
    assert.ok(
      offerEligibility(offerAudience, date).some((rule) => !rule.passes),
    );
});
test("nonqualifying merchandise receives no promotional multiplier", () => {
  assert.equal(previewOffer(78, false).totalPoints, 78);
  assert.equal(previewOffer(78, false).promotionalPoints, 0);
});
test("offer exploration leaves the canonical member and fixed bag intact", () => {
  const before = JSON.stringify(canonical.member);
  for (let i = 0; i < 5; i++) previewOffer(48, true);
  assert.equal(JSON.stringify(canonical.member), before);
  assert.equal(canonical.member.points, 0);
  assert.equal(canonical.member.activated, false);
  assert.equal(canonical.earning.subtotal, 126);
  assert.equal(canonical.pointsPreview, 126);
  assert.equal(canonical.earning.multiplier, null);
});
const { memberScenarioReducer, initialMemberScenario } = await import(moduleUrl('../src/memberScenario.ts', { './fixtures': baseUrl, './offerFixtures': moduleUrl('../src/offerFixtures.ts', { './fixtures': baseUrl }) }));
test('completed purchase activates and awards points exactly once', () => {
  const completed = memberScenarioReducer(initialMemberScenario, 'complete');
  assert.deepEqual(completed, {points:96,status:'Activated',activated:true,offerUsed:true});
  assert.strictEqual(memberScenarioReducer(completed, 'complete'), completed);
  assert.equal(initialMemberScenario.points, 0);
  assert.equal(canonical.pointsPreview, 126);
});
test('reset restores the unused scenario and permits one new simulated purchase', () => {
  const completed = memberScenarioReducer(initialMemberScenario, 'complete');
  const reset = memberScenarioReducer(completed, 'reset');
  assert.deepEqual(reset, initialMemberScenario);
  assert.equal(memberScenarioReducer(reset, 'complete').points,96);
});
