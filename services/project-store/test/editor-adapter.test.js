import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Compile editor with its pinned TypeScript before running this integration test.
const adapterURL = new URL('../../../built/editor/projectShare.js', import.meta.url);
const setup = (base = "/microbit-sandbox/", origin = "https://legacy.circuitsketcher.com") => {
    const calls = [];
    const source = fs.readFileSync(adapterURL, 'utf8');
    const cloud = { privatePostAsync: async (...args) => ({ legacyPost: args }),
        privateGetAsync: async (...args) => ({ legacyGet: args }),
        downloadScriptFilesAsync: async id => ({ legacyFiles: id }),
        downloadScriptMetaAsync: async id => ({ legacyMeta: id }), parseScriptId: uri => `legacy:${uri}` };
    const context = { exports: {}, window: { location: { origin } },
        fetch: async (url, options) => { calls.push({ url, ...options }); return { ok: true, json: async () => ({ id: '_cABCDEFGHIJK', meta: { versions: {} } }) }; },
        pxt: { webConfig: { relprefix: base, pxtRelId: 'test-release' }, Cloud: cloud,
            Util: { requestAsync: async options => { calls.push(options); return { json: { id: '_cABCDEFGHIJK', meta: { versions: {} } } }; } } } };
    vm.runInNewContext(source, context);
    const view = { getShareUrl: async id => ({ legacyUrl: id }), publishAsync: async (...args) => args };
    context.exports.configureProjectShare({ projectView: view });
    return { calls, cloud, view };
};
test('editor saves through the sandbox API, without redirecting other endpoints', async () => {
    const { cloud, calls } = setup();
    await cloud.privatePostAsync('scripts', { target: 'microbit' }, true);
    assert.equal(calls[0].url, '/microbit-sandbox/api/share/scripts');
    assert.equal(calls[0].method, 'POST');
    const legacy = await cloud.privatePostAsync('compile', { hello: 'world' }, true);
    assert.equal(legacy.legacyPost[0], 'compile');
});
test('new snapshots reopen locally while old Microsoft shares remain supported', async () => {
    const { cloud, calls, view } = setup();
    await cloud.downloadScriptFilesAsync('_cABCDEFGHIJK');
    assert.equal(calls[0].url, '/microbit-sandbox/api/share/_cABCDEFGHIJK/text');
    assert.equal((await cloud.downloadScriptFilesAsync('_legacy123456')).legacyFiles, '_legacy123456');
    assert.equal(cloud.parseScriptId('https://legacy.circuitsketcher.com/microbit-sandbox/#pub:_cABCDEFGHIJK'), '_cABCDEFGHIJK');
    assert.equal(cloud.parseScriptId('_legacy123456'), 'legacy:_legacy123456');
    const shared = await view.getShareUrl('_cABCDEFGHIJK', false);
    assert.equal(shared.url, 'https://legacy.circuitsketcher.com/microbit-sandbox/?v=test-release#pub:_cABCDEFGHIJK');
    assert.ok(shared.embed.editor.includes('?v=test-release&embed=1#pub:_cABCDEFGHIJK'));
    assert.equal((await view.publishAsync('Test', undefined))[2], true);
});

test('production uses same-origin API and root-level saved links', async () => {
    const { cloud, calls, view } = setup('/', 'https://microbit.chibitronics.com');
    await cloud.privatePostAsync('scripts', { target: 'microbit' });
    assert.equal(calls[0].url, '/api/share/scripts');
    assert.equal(calls[0].headers['Content-Type'], 'application/json');
    assert.equal(calls[0].cache, 'no-store');
    assert.equal((await view.getShareUrl('_cABCDEFGHIJK', false)).url,
        'https://microbit.chibitronics.com/?v=test-release#pub:_cABCDEFGHIJK');
});
