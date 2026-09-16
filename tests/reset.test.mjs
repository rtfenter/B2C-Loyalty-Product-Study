import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const code = ts.transpileModule(readFileSync(new URL('../src/components/ScenarioReset.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
}).outputText.replace(/import ['"][^'"]+\.css['"];?/g, '').replace(/from ["']([^"']+)["']/g, (_, name) => `from ${JSON.stringify(import.meta.resolve(name))}`);
const { ScenarioReset } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('multiple reset dialogs retain distinct accessible scope labels and descriptions', () => {
  const html = renderToStaticMarkup(createElement('div', null,
    ...['Main Maya', 'Campaign', 'Journey'].map(scope => createElement(ScenarioReset, {
      key: scope, label: `Reset ${scope}`, title: `${scope}?`, description: `Only reset ${scope}.`, onReset() { assert.fail('render must not reset state'); },
    })),
  ));
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, 6);
  for (const scope of ['Main Maya', 'Campaign', 'Journey']) {
    const dialog = [...html.matchAll(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/g)].map(match => match[0]).find(text => text.includes(`${scope}?`));
    const title = dialog.match(/aria-labelledby="([^"]+)"/)[1];
    const description = dialog.match(/aria-describedby="([^"]+)"/)[1];
    assert.ok(dialog.includes(`id="${title}">${scope}?</h2>`));
    assert.ok(dialog.includes(`id="${description}">Only reset ${scope}.</p>`));
    assert.match(dialog, /autofocus=""[^>]*>Cancel/);
    assert.doesNotMatch(dialog, /<dialog[^>]* open/);
  }
});
test('disabled reset trigger remains a native disabled button', () => {
  const html = renderToStaticMarkup(createElement(ScenarioReset, {
    label: 'Replay scenario', title: 'Replay?', description: 'Only this scenario.', disabled: true, onReset() {},
  }));
  assert.match(html, /<button[^>]*disabled=""[^>]*aria-haspopup="dialog"/);
});
