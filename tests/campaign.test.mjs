import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(
  new URL("../src/campaignFixtures.ts", import.meta.url),
  "utf8",
);
const javascript = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;
const {
  buildFunnel,
  featuredCriteria,
  allocateMembers,
  metrics,
  defaultOffers,
  offerLabel,
  criteria,
} = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
);
test("featured filters produce the specified funnel, with membership redundant", () => {
  assert.deepEqual(
    buildFunnel(featuredCriteria).map((row) => row.count),
    [24830, 8412, 6731, 6731, 6204],
  );
});
test("all 32 filter combinations are deterministic, ordered, and narrowing", () => {
  for (let mask = 0; mask < 32; mask++) {
    const selected = criteria
      .filter((_, index) => mask & (1 << index))
      .map((c) => c.id);
    const funnel = buildFunnel(selected);
    assert.deepEqual(funnel, buildFunnel([...selected].reverse()));
    for (let i = 1; i < funnel.length; i++)
      assert.ok(funnel[i].count <= funnel[i - 1].count);
  }
  assert.equal(buildFunnel([])[0].count, 24830);
  assert.ok(buildFunnel(["noBra", "marketing"]).at(-1).count > 6204);
});
test("allocation assigns every member exactly once with deterministic rounding", () => {
  assert.deepEqual(allocateMembers(6204, [34, 33, 33]), [2110, 2047, 2047]);
  for (const total of [1, 2, 3, 6204, 24830]) {
    for (const percentages of [
      [34, 33, 33],
      [20, 40, 40],
      [1, 98, 1],
    ]) {
      const counts = allocateMembers(total, percentages);
      assert.equal(
        counts.reduce((a, b) => a + b, 0),
        total,
      );
      assert.ok(counts.every(Number.isInteger));
    }
  }
});
test("featured outcomes match the supplied fixtures exactly", () => {
  assert.deepEqual(
    metrics.map((m) => [...m.values]),
    [
      [12.4, 18.7, 17.1],
      [3.1, 8.9, 7.6],
      [68, 72, 71],
      [0, 1.84, 2.5],
      [9.2, 14.6, 13.1],
    ],
  );
});
test("member previews distinguish multiplier and conditional bonus", () => {
  assert.equal(offerLabel(defaultOffers.A), "2× points on all sports bras.");
  assert.equal(
    offerLabel(defaultOffers.B),
    "250 bonus points after a qualifying sports-bra purchase.",
  );
});

test("example results independently identify their fixed 2× experiment", async () => {
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
  const fixtureModule = `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
  const brandModule = componentModule("../src/components/Brand.tsx");
  const exampleModule = componentModule(
    "../src/components/campaign/ExampleResults.tsx",
    {
      "../../campaignFixtures": fixtureModule,
      "../Brand": brandModule,
    },
  );
  const { ExampleResults } = await import(exampleModule);
  const before = renderToStaticMarkup(createElement(ExampleResults));
  const configuredOffer = { ...defaultOffers.A, value: 4 };
  assert.equal(offerLabel(configuredOffer), "4× points on all sports bras.");
  const after = renderToStaticMarkup(createElement(ExampleResults));
  assert.equal(after, before);
  assert.match(after, /Example Treatment A/);
  assert.match(after, /2× points on sports bras/);
  assert.match(
    after,
    /They are not generated from the campaign you configured above/,
  );
  assert.match(after, /18\.7%/);
  assert.doesNotMatch(
    after,
    /4×|Run simulation|Simulation ready|Setup changed/,
  );
});

 test("out-of-range incentives cannot appear as valid member offers", () => {
  for (const value of [0, 1, 11, 2.5, NaN]) {
    assert.match(offerLabel({ ...defaultOffers.A, value }), /Choose a valid incentive/);
  }
  for (const value of [0, 1001, 1.5, NaN]) {
    assert.match(offerLabel({ ...defaultOffers.B, value }), /Choose a valid incentive/);
  }
  assert.match(offerLabel({ ...defaultOffers.A, value: 10 }), /10×/);
  assert.match(offerLabel({ ...defaultOffers.B, value: 1000 }), /1000 bonus/);
});
