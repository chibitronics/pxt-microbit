const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../../node_modules/typescript');

// Run the actual simulator pin/tone code and Chibitronics event polling code,
// with a deterministic clock and audio sink rather than a browser/audio device.
const root = path.resolve(__dirname, '../..');
const load = (context, relativePath) => vm.runInContext(ts.transpileModule(
    fs.readFileSync(path.join(root, relativePath), 'utf8'),
    { compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.None } }
).outputText, context, { filename: relativePath });
const setup = () => {
    const timers = [], polls = [], tones = [], writes = [];
    let resumes = 0;
    const context = vm.createContext({
        console,
        PinPullMode: { PullDown: 0, PullUp: 1, PullNone: 2 },
        DigitalPin: Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`P${i}`, i])),
        AnalogPin: Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`P${i}`, i])),
        Math_: { randomRange: () => 500 },
        runtime: { queueDisplayUpdate() {} },
        getResume: () => () => { resumes++; },
        setTimeout: callback => { timers.push(callback); },
        AudioContextManager: { tone: (...args) => tones.push(args), stop() {}, setCurrentToneGain() {} },
        basic: { forever: poll => polls.push(poll), pause() {} },
    });
    load(context, 'sim/state/edgeconnectorsim.ts');
    const edge = new context.pxsim.EdgeConnectorState({ pins: Array.from({ length: 21 }, (_, i) => i) });
    const board = { edgeConnectorState: edge };
    context.board = () => board;
    context.pxsim.board = () => board;
    load(context, 'sim/state/edgeconnector.ts');
    // Transpile-only cannot resolve symbols declared in other source files.
    context.getPin = id => edge.getPin(id);
    context.PinFlags = context.pxsim.PinFlags;
    context.WriteMode = context.pxsim.WriteMode;
    context.pins = context.pxsim.pins;
    const write = context.pins.analogWritePin;
    context.pins.analogWritePin = (pin, value) => { writes.push({ pin, value }); write(pin, value); };
    load(context, 'libs/core/chibiclip.ts');
    return { context, edge, tones, writes, polls, timers,
        poll: () => polls.forEach(poll => poll()),
        finishTone: () => { assert.ok(timers.length, 'tone must schedule completion'); timers.shift()(); },
        resumes: () => resumes };
};
const registerSwitch = (sim, handler) => sim.context.ChibiClip.onPinEvent(
    sim.context.PinBlockParameter.Pin0, sim.context.PinEventParameter.Pressed, handler);

test('control: a switch can repeatedly trigger a fade without sound', () => {
    const sim = setup();
    let presses = 0;
    registerSwitch(sim, () => {
        presses++;
        sim.context.ChibiClip.showEffectOnPin(sim.context.EffectBlockParameter.Fade, sim.context.PinBlockParameter.Pin1);
    });
    for (let i = 0; i < 5; i++) {
        sim.edge.pins[0].connectToGround(); sim.poll();
        sim.edge.pins[0].disconnectFromGround(); sim.poll();
    }
    assert.equal(presses, 5);
    assert.ok(sim.writes.some(write => write.pin === 1 && write.value > 0));
});

test('regression: repeated P0 press -> melody until done -> P1 fade works without reset', () => {
    const sim = setup();
    let presses = 0, completedFades = 0;
    registerSwitch(sim, () => {
        presses++;
        for (const frequency of [262, 330, 392, 0]) {
            sim.context.pins.analogPitch(frequency, 100);
            // Release while the blocking handler is playing, just like a click.
            sim.edge.pins[0].disconnectFromGround();
            sim.finishTone();
        }
        sim.context.ChibiClip.showEffectOnPin(sim.context.EffectBlockParameter.Fade, sim.context.PinBlockParameter.Pin1);
        completedFades++;
    });
    for (let i = 0; i < 5; i++) {
        sim.edge.pins[0].connectToGround(); sim.poll();
        sim.poll(); // Observe the released HIGH level before the next press.
    }
    assert.equal(presses, 5);
    assert.equal(completedFades, 5);
    assert.equal(sim.tones.length, 20);
    assert.equal(sim.resumes(), 20);
});

for (const [name, frequency, volume] of [['tone', 440, 255], ['quiet tone', 440, 64], ['rest', 0, 255], ['muted tone', 440, 0]]) {
    test(`${name} preserves a switch input during and after playback`, () => {
        const sim = setup(); registerSwitch(sim, () => {});
        sim.edge.pitchVolume = volume;
        sim.context.pins.analogPitch(frequency, 100);
        assert.equal(sim.context.pins.digitalReadPin(0), 1, 'released switch stays HIGH during audio');
        assert.equal(sim.edge.pins[0].value, 1023, 'input pull-up is not replaced with an audio PWM value');
        sim.edge.pins[0].connectToGround();
        assert.equal(sim.context.pins.digitalReadPin(0), 0, 'pressed switch stays LOW during audio');
        sim.finishTone();
        sim.edge.pins[0].disconnectFromGround();
        assert.equal(sim.context.pins.digitalReadPin(0), 1, 'release returns HIGH after audio');
        assert.equal(sim.resumes(), 1);
    });
}

test('unconfigured audio output still drives and clears the selected pitch pin', () => {
    const sim = setup(); sim.context.pins.analogSetPitchPin(2);
    sim.context.pins.analogPitch(440, 100);
    assert.ok(sim.edge.pins[2].value > 0);
    assert.ok(sim.edge.pins[2].mode & sim.context.PinFlags.Output);
    sim.finishTone();
    assert.equal(sim.edge.pins[2].value, 0);
    assert.equal(sim.edge.pins[2].mode, sim.context.PinFlags.Unused);
    assert.equal(sim.edge.pins[0].value, 0);
    assert.equal(sim.resumes(), 1);
});

test('native touch-pin input mode also survives sound playback', () => {
    const sim = setup(), pin = sim.edge.pins[0];
    pin.isTouched(); // Same input setup as input.onPinPressed.
    const inputMode = pin.mode;
    sim.context.pins.analogPitch(440, 100);
    assert.equal(pin.mode, inputMode);
    sim.finishTone();
    assert.equal(pin.mode, inputMode);
    for (let i = 0; i < 3; i++) {
        pin.touched = true; assert.equal(pin.isTouched(), true);
        pin.touched = false; assert.equal(pin.isTouched(), false);
    }
});

test('audio completion does not clear an input configured while the tone was playing', () => {
    const sim = setup(); sim.context.pins.analogPitch(440, 100);
    registerSwitch(sim, () => {});
    sim.finishTone();
    assert.equal(sim.context.pins.digitalReadPin(0), 1);
});

test('zero-duration tones resume immediately without changing an active input', () => {
    const sim = setup(); registerSwitch(sim, () => {});
    sim.edge.pitchVolume = 64;
    sim.context.pins.analogPitch(440, 0);
    assert.equal(sim.context.pins.digitalReadPin(0), 1);
    assert.equal(sim.resumes(), 1);
    assert.equal(sim.timers.length, 0);
});
