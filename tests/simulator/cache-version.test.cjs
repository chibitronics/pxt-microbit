const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('a simulator-only fix versions the iframe and its scripts without duplicate query strings', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'microbit-sim-cache-'));
    try {
        for (const file of ['main.js', 'editor.js', 'target.js', 'pxtapp.js', 'semantic.css', 'sim.js', 'pxtsim.js']) {
            fs.writeFileSync(path.join(directory, file), file);
        }
        fs.writeFileSync(path.join(directory, 'index.html'),
            '<script>var pxtConfig = {"pxtRelId": "@pxtRelId@", "simUrl": "/simulator.html"};</script>\n<script src="/main.js"></script>');
        fs.writeFileSync(path.join(directory, 'simulator.html'), '<script src="/pxtsim.js"></script><script src="/sim.js"></script>');
        fs.writeFileSync(path.join(directory, 'serviceworker.js'), 'const cache="makecode;microbit;@pxtRelId@";');
        const run = () => execFileSync(process.execPath,
            [path.resolve(__dirname, '../../scripts/postbuild-cache-version.js'), path.join(directory, 'index.html')]);
        const read = name => fs.readFileSync(path.join(directory, name), 'utf8');
        run();
        const before = read('index.html');
        fs.writeFileSync(path.join(directory, 'sim.js'), 'fixed simulator');
        run();
        const after = read('index.html');
        assert.notEqual(after, before);
        const release = /"pxtRelId": "([a-f0-9]{20})"/.exec(after)[1];
        assert.ok(after.includes(`/simulator.html?chibiRelease=${release}`));
        assert.ok(read('simulator.html').includes(`/sim.js?chibiRelease=${release}`));
        assert.ok(read('serviceworker.js').includes(release));
        const simulator = read('simulator.html');
        run();
        assert.equal(read('index.html'), after);
        assert.equal(read('simulator.html'), simulator);
    } finally {
        fs.rmSync(directory, { recursive: true });
    }
});
