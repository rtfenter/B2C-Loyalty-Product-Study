import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(
  new URL("../src/journeyFixtures.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;
const fixtureUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const { evaluateJourney, snapshotAt, journeyEvents, lifecycleOrder } =
  await import(fixtureUrl);
const purchase = (day, qualifying = true) => ({
  day,
  kind: "purchase",
  qualifying,
  amount: 50,
  title: "Purchase",
  story: "",
});
const time = (day) => ({ day, kind: "time", title: "Time passes", story: "" });
test("initial enrollment aligns with the original Maya account", () => {
  const initial = snapshotAt(0);
  assert.equal(initial.state, "Enrolled");
  assert.equal(initial.points, 0);
  assert.equal(initial.purchases, 0);
  assert.equal(initial.lastPurchaseDay, null);
});
for (let index = 1; index < lifecycleOrder.length; index++) {
  test(`${lifecycleOrder[index - 1]} → ${lifecycleOrder[index]}`, () => {
    const result = snapshotAt(index);
    assert.equal(result.previousState, lifecycleOrder[index - 1]);
    assert.equal(result.state, lifecycleOrder[index]);
  });
}
test("forward, backward, and reset replay deterministic metrics without accumulation", () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((i) => snapshotAt(i).points),
    [0, 126, 222, 222, 300],
  );
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((i) => snapshotAt(i).purchases),
    [0, 1, 2, 2, 3],
  );
  const engaged = snapshotAt(2);
  snapshotAt(4);
  assert.deepEqual(snapshotAt(2), engaged);
  assert.equal(snapshotAt(0).points, 0);
  assert.equal(snapshotAt(3).daysSincePurchase, 90);
  assert.equal(snapshotAt(3).recentPurchases, 0);
});
test("engagement includes the 60-day boundary and excludes purchases outside it", () => {
  assert.equal(
    evaluateJourney([journeyEvents[0], purchase(1), purchase(61)]).state,
    "Engaged",
  );
  assert.equal(
    evaluateJourney([journeyEvents[0], purchase(1), purchase(62)]).state,
    "Activated",
  );
});
test("risk requires previous engagement and begins at 90 days", () => {
  const engaged = journeyEvents.slice(0, 3);
  assert.equal(evaluateJourney([...engaged, time(124)]).state, "Engaged");
  assert.equal(evaluateJourney([...engaged, time(125)]).state, "At risk");
  assert.equal(
    evaluateJourney([journeyEvents[0], purchase(1), time(200)]).state,
    "Activated",
  );
});
test("nonqualifying purchases do not activate, add points, reset inactivity, or reactivate", () => {
  assert.equal(
    evaluateJourney([journeyEvents[0], purchase(1, false)]).state,
    "Enrolled",
  );
  const risk = evaluateJourney([
    ...journeyEvents.slice(0, 4),
    purchase(130, false),
  ]);
  assert.equal(risk.state, "At risk");
  assert.equal(risk.points, 222);
  assert.equal(risk.lastPurchaseDay, 35);
});
test("member previews omit internal lifecycle labels at every journey point", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  function componentModule(path, aliases = {}) {
    const code = ts
      .transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.ReactJSX,
        },
      })
      .outputText.replace(
        /from ["']([^"']+)["']/g,
        (_, name) =>
          `from ${JSON.stringify(aliases[name] ?? import.meta.resolve(name))}`,
      );
    return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  }
  const brandUrl = componentModule("../src/components/Brand.tsx");
  const previewUrl = componentModule(
    "../src/components/journey/MemberPreview.tsx",
    { "../Brand": brandUrl, "../../journeyFixtures": fixtureUrl },
  );
  const { MemberPreview } = await import(previewUrl);
  for (let i = 0; i < 5; i++) {
    const html = renderToStaticMarkup(
      createElement(MemberPreview, { snapshot: snapshotAt(i) }),
    );
    assert.doesNotMatch(html, /At risk|Activated|Engaged|Reactivated|Enrolled/);
    assert.match(html, new RegExp(`>${snapshotAt(i).points}<`));
  }
});
