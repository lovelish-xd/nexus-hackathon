const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(`${__dirname}/app.js`, 'utf8').split('let profile = defaults;')[0];
vm.runInNewContext(source + `
assert.equal(safeUrl('javascript:alert(1)'), '');
assert.equal(safeUrl('data:text/html,test'), '');
assert.equal(safeUrl('https://example.com'), 'https://example.com/');
assert.equal(normalizeProfile(null).name, 'Player One');
assert.equal(normalizeProfile({name:'  Builder  ',url:'file:///secret'}).name, 'Builder');
assert.equal(normalizeProfile({url:'file:///secret'}).url, '');
assert.equal(normalizeProfile({name:'x'.repeat(100)}).name.length, 50);
`, { assert, URL });
console.log('7 profile and URL validation checks passed');
