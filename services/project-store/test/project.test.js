import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../handler.js';
import { ID_PATTERN, newProjectId, normalizeProject } from '../project.js';
const sample = () => ({ target: 'microbit', name: 'Ground switch', editor: 'blocksprj',
    header: 'secret-local-header', meta: { versions: { target: '7.1.2' }, accountId: 'private' },
    text: { 'pxt.json': JSON.stringify({ name: 'Ground switch', files: ['main.ts', 'main.blocks'], dependencies: { core: '*' } }),
        'main.ts': 'ChibiClip.setLight(PinBlockParameter.Pin1, true)', 'main.blocks': '<xml/>', 'simstate.json': '{"switch":true}' } });
test('normalization preserves source and blocks but drops private metadata', () => {
    const normalized = normalizeProject(sample());
    assert.equal(normalized.text['main.blocks'], '<xml/>');
    assert.equal(normalized.header, undefined);
    assert.equal(normalized.meta.accountId, undefined);
    assert.ok(Object.isFrozen(normalized));
});
test('handles MakeCode string-encoded text', () => {
    const payload = sample();
    assert.deepEqual(normalizeProject({ ...payload, text: JSON.stringify(payload.text) }), normalizeProject(payload));
});
test('rejects invalid and oversized inputs', () => {
    for (const payload of [null, { ...sample(), target: 'arcade' }, { ...sample(), text: 'broken' },
        { ...sample(), text: { ...sample().text, '../bad': 'bad' } },
        { ...sample(), text: { ...sample().text, 'main.ts': 'x'.repeat(1048576) } }])
        assert.throws(() => normalizeProject(payload));
});
test('IDs are compatible with MakeCode and unguessable', () => {
    const ids = Array.from({ length: 1000 }, newProjectId);
    assert.ok(ids.every(id => ID_PATTERN.test(id)));
    assert.equal(new Set(ids).size, ids.length);
});
test('snapshot survives a separate handler/client and cannot be overwritten', async () => {
    const rows = new Map();
    const store = { health: async () => {}, insert: async row => rows.set(row.id, row), find: async id => rows.get(id) };
    const first = createHandler({ store, createId: () => '_cABCDEFGHIJK' });
    const saved = await first({ method: 'POST', path: '/scripts', body: sample() });
    assert.equal(saved.status, 201);
    const otherClient = createHandler({ store });
    const loaded = await otherClient({ method: 'GET', path: `/${saved.body.id}/text` });
    assert.deepEqual(loaded.body, sample().text);
    assert.equal((await otherClient({ method: 'GET', path: '/_cMISSINGTEST/text' })).status, 404);
    assert.equal((await otherClient({ method: 'PUT', path: `/${saved.body.id}`, body: sample() })).status, 404);
    assert.equal((await otherClient({ method: 'DELETE', path: `/${saved.body.id}` })).status, 404);
});
