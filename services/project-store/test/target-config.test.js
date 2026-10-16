import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const target = JSON.parse(fs.readFileSync(new URL('../../../pxtarget.json', import.meta.url), 'utf8'));

test('unsupported account sign-in and identity experiment are disabled', () => {
    // MakeCode gates its account UI on pxt.auth.hasIdentity(), which checks
    // whether any cloud provider has identity enabled.
    assert.deepEqual(Object.values(target.cloud.cloudProviders).filter(provider => provider.identity), []);
    assert.ok(!target.appTheme.experiments.includes('identity'));
});

test('anonymous saved links and GitHub package support stay enabled', () => {
    for (const feature of ['sharing', 'publishing', 'importing', 'packages', 'githubPackages']) {
        assert.equal(target.cloud[feature], true, feature);
    }
    assert.equal(target.cloud.workspace, false);
    assert.equal(target.cloud.cloudProviders.github.identity, false);
});
