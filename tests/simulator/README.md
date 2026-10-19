# Simulator regression tests

Run `npm run test:sim` from the repository root. The tests use the pinned
TypeScript compiler, Node's test runner, a deterministic timer queue and an audio
sink. No AWS credentials, browser, database or physical board are needed.

`pitch-switch.test.cjs` executes the actual simulator Pin/tone implementations
and the Chibitronics switch polling/fade code. The reported regression is:

1. Register P0 pressed with a pull-up, and attach a switch from P0 to ground.
2. Play a blocking melody (including a rest), then fade P1.
3. Release the switch while the handler is busy, then press again after it ends.
4. Repeat five times without resetting.

Before the fix only the first melody/fade completed: audio's default P0 output
cleared the released switch level to LOW. The simulator now leaves configured
input pins alone while rendering audio. Tests also cover quiet/muted tones,
rests, immediate tones, changing to an input during playback, and normal audio
output cleanup on otherwise-unused pins. Device code is not changed.

`cache-version.test.cjs` ensures a simulator-only change updates the simulator
iframe URL and script URLs, including on repeated postbuild runs. This prevents
an old cached simulator from masking a newly deployed fix.
