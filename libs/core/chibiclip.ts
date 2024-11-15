const ANALOG_PIN_MAX_VALUE = 1023;
type DigitalPinBlockParameter = "Pin 0" | "Pin 1" | "Pin 2" | "Pin 3" | "Pin 4" | "Pin 5";
type AnalogPinBlockParameter = DigitalPinBlockParameter;

// TODO: Some of these aren't exposed anymore in the public API, so let's clean up later.
type DigitalPinEventParameter =
  | "pressed"
  | "released"
  | "changed"
  | "HIGH"
  | "LOW";
type DigitalPinValueType = "HIGH" | "LOW";
// TODO: Some of these *also* aren't exposed anymore in the public API, so let's clean up later.
type EffectString = "twinkle" | "heartbeat" | "blink" | "sos" | "fade";

enum EffectStatus {
  NoEffect,
  EffectInProgress,
  StopEffectRequested,
}

const pinEffectStatuses: Array<EffectStatus> = [
  EffectStatus.NoEffect, // Pin 0
  EffectStatus.NoEffect, // Pin 1
  EffectStatus.NoEffect, // Pin 2
  EffectStatus.NoEffect, // Pin 3
  EffectStatus.NoEffect, // Pin 4
  EffectStatus.NoEffect, // Pin 5
];

type PinCallback = () => void;

type EventHandlersForPin = {
  onPressed: PinCallback | null;
  onReleased: PinCallback | null;
  onChanged: PinCallback | null;
  onLow: PinCallback | null;
  onHigh: PinCallback | null;
};

const TOTAL_GPIO_PINS = 6;

const pinToEventHandlers: Array<EventHandlersForPin> = [];

const prevPinValues: Array<number> = [
  0, // Pin 0
  0, // Pin 1
  0, // Pin 2
  0, // Pin 3
  0, // Pin 4
  0, // Pin 5
];

/*
 * Visualization for the Chibi Clip.
 */
//% color=#f91b4f weight=100 icon="\uf0c6" block="Chibi Clip" groups="['Lights', 'Sensing']"
namespace ChibiClip {
  function init() {
    // Initialize empty event handlers.
    for (let i = 0; i < TOTAL_GPIO_PINS; i++) {
      const empty: EventHandlersForPin = {
        onPressed: null,
        onReleased: null,
        onChanged: null,
        onLow: null,
        onHigh: null,
      };
      pinToEventHandlers[i] = empty;
    }

    // TODO: This is fragile!! Should rewrite to something more robust against future changes.
    const isAtLeastOneHandlerSet = (handler: EventHandlersForPin) => {
      return (
        handler.onChanged !== null ||
        handler.onHigh !== null ||
        handler.onLow !== null ||
        handler.onPressed !== null ||
        handler.onReleased !== null
      );
    };

    // Add a forever loop in the namespace to poll for pin event changes.
    basic.forever(() => {
      for (let pinIndex = 0; pinIndex < TOTAL_GPIO_PINS; pinIndex++) {
        const handlersForPin = pinToEventHandlers[pinIndex];

        if (!isAtLeastOneHandlerSet(handlersForPin)) {
          continue;
        }
        const prevPinValue = prevPinValues[pinIndex];
        const currentPinValue = pins.digitalReadPin(
          indexToDigitalPin(pinIndex)
        );
        prevPinValues[pinIndex] = currentPinValue;

        const isChanged = prevPinValue !== currentPinValue;
        const lowToHigh = isChanged && currentPinValue > 0;
        const highToLow = isChanged && currentPinValue === 0;

        if (isChanged && handlersForPin.onChanged) {
          handlersForPin.onChanged();
        }
        if (lowToHigh && handlersForPin.onHigh) {
          handlersForPin.onHigh();
        }
        if (lowToHigh && handlersForPin.onPressed) {
          handlersForPin.onPressed();
        }
        if (highToLow && handlersForPin.onLow) {
          handlersForPin.onLow();
        }
        if (highToLow && handlersForPin.onReleased) {
          handlersForPin.onReleased();
        }
      }
    });
  }
  init();

  /**
   * Turns the light on or off at the given pin value.
   */
  //% blockId=chibiclip_set
  //% block="set $pin to $on"
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='Pin 0,Pin 1,Pin 2'
  //% pin.defl='Pin 0'
  //% on.shadow="toggleOnOff"
  //% parts=chibiclip
  //% group="Lights"
  //% weight=3
  export function setLight(pin: DigitalPinBlockParameter, on: boolean): void {
    const digitalPin = stringToDigitalPin(pin);
    const value = on ? 1 : 0;
    pins.digitalWritePin(digitalPin, value);
    const pinIndex = stringToPinNumber(pin);

    // Check to see if there's an effect in progress and if so, stop.
    if (pinEffectStatuses[pinIndex] === EffectStatus.EffectInProgress) {
      pinEffectStatuses[pinIndex] = EffectStatus.StopEffectRequested;
    }
  }

  /**
   * Dims the light at the pin to the given brightness.
   */
  //% blockId=chibiclip_setlevel
  //% block="set $pin level to $level"
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='Pin 0,Pin 1,Pin 2'
  //% pin.defl='Pin 0'
  //% level.min=0 level.max=100
  //% parts=chibiclip
  //% group="Lights"
  //% weight=2
  export function setLightLevel(
    pin: AnalogPinBlockParameter,
    level: number
  ): void {
    const analogPin = stringToAnalogPin(pin);
    const writePinValue = Math.round((level / 100.0) * ANALOG_PIN_MAX_VALUE);
    pins.analogWritePin(analogPin, writePinValue);
    const pinIndex = stringToPinNumber(pin);

    // Check to see if there's an effect in progress and if so, stop.
    if (pinEffectStatuses[pinIndex] === EffectStatus.EffectInProgress) {
      pinEffectStatuses[pinIndex] = EffectStatus.StopEffectRequested;
    }
  }

  /**
   *
   */
  //% block="show $effect on $pin"
  //% effect.fieldEditor="textdropdown"
  //% effect.fieldOptions.decompileLiterals=true
  //% effect.fieldOptions.values='blink,fade'
  //% effect.defl='blink'
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='Pin 0,Pin 1,Pin 2'
  //% pin.defl='Pin 0'
  //% parts=chibiclip
  //% group="Lights"
  //% weight=1
  export function showEffectOnPin(
    effect: EffectString,
    pin: AnalogPinBlockParameter
  ) {
    const analogPin = stringToAnalogPin(pin);
    const pinIndex = stringToPinNumber(pin);
    pinEffectStatuses[pinIndex] = EffectStatus.EffectInProgress;

    // Executes the animation
    const commands = getCommandsForEffect(effect);
    executeCommands(commands, pinIndex, analogPin);

    pinEffectStatuses[pinIndex] = EffectStatus.NoEffect;
  }

  function getCommandsForEffect(effect: EffectString) {
    switch (effect) {
      case "twinkle":
        return twinkle();

      case "heartbeat":
        return heartbeat();

      case "fade":
        return fade();

      case "sos":
        return sos();

      case "blink":
        return blink();
    }
  }

  /**
   * Register an event handler for various pin conditions.
   */
  //% block="when $pin is $eventType"
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='Pin 0,Pin 1,Pin 2'
  //% pin.defl='Pin 0'
  //% eventType.fieldEditor="textdropdown"
  //% eventType.fieldOptions.decompileLiterals=true
  //% eventType.fieldOptions.values='pressed,released'
  //% eventType.defl='pressed'
  //% parts=chibiclip
  //% group="Sensing"
  //% weight=3
  export function onPinEvent(
    pin: DigitalPinBlockParameter,
    eventType: DigitalPinEventParameter,
    handler: () => void
  ) {
    const pinIndex = stringToPinNumber(pin);

    switch (eventType) {
      case "pressed":
        pinToEventHandlers[pinIndex].onPressed = handler;
        break;
      case "released":
        pinToEventHandlers[pinIndex].onReleased = handler;
        break;
      case "changed":
        pinToEventHandlers[pinIndex].onChanged = handler;
        break;
      case "HIGH":
        pinToEventHandlers[pinIndex].onHigh = handler;
        break;
      case "LOW":
        pinToEventHandlers[pinIndex].onLow = handler;
        break;
    }
  }
}

// NOTE!!!!!
// The Chibi Clip pin mappings are:
// 0 - Pin 0
// 1 - Pin 1
// 2 - Pin 2
// 3 - Pin 13
// 4 - Pin 14
// 5 - Pin 15
function indexToAnalogPin(pinIndex: number): AnalogPin {
  switch (pinIndex) {
    case 0:
      return AnalogPin.P0;
    case 1:
      return AnalogPin.P1;
    case 2:
      return AnalogPin.P2;
    case 3:
      return AnalogPin.P13;
    case 4:
      return AnalogPin.P14;
    case 5:
      return AnalogPin.P15;
    default:
      throw `not a valid index: ${pinIndex}`;
  }
}

function indexToDigitalPin(pinIndex: number): DigitalPin {
  switch (pinIndex) {
    case 0:
      return DigitalPin.P0;
    case 1:
      return DigitalPin.P1;
    case 2:
      return DigitalPin.P2;
    case 3:
      return DigitalPin.P13;
    case 4:
      return DigitalPin.P14;
    case 5:
      return DigitalPin.P15;
    default:
      throw `not a valid index: ${pinIndex}`;
  }
}

function stringToAnalogPin(pinInput: AnalogPinBlockParameter): AnalogPin {
  const index = stringToPinNumber(pinInput);
  return indexToAnalogPin(index);
}

function stringToDigitalPin(pinInput: DigitalPinBlockParameter): DigitalPin {
  const index = stringToPinNumber(pinInput);
  return indexToDigitalPin(index);
}

function stringToPinNumber(pinInput: string): number {
  if (pinInput.length !== 5) {
    throw `Parameter is in unexpected format: ${pinInput}`;
  }
  return parseInt(pinInput[4]);
}

function twinkle(tempo = 16) {
  let current = ANALOG_PIN_MAX_VALUE / 2;
  const allCommands: Array<Command> = [];
  for (let i = 0; i < tempo * 8; i++) {
    const { commands, endingValue } = generateCommandsForFade(
      current,
      getRandomInt(0, ANALOG_PIN_MAX_VALUE),
      tempo,
      3
    );
    append(allCommands, commands);
    current = endingValue;
  }
  return allCommands;
}

function blink() {
  const allCommands: Array<Command> = [];
  allCommands.push({ type: CommandType.Write, value: ANALOG_PIN_MAX_VALUE });
  allCommands.push({ type: CommandType.Pause, durationMs: 500 });
  allCommands.push({ type: CommandType.Write, value: 0 });
  allCommands.push({ type: CommandType.Pause, durationMs: 500 });
  return allCommands;
}

function fade(tempo = 16) {
  const { commands: firstCommands } = generateCommandsForFade(
    0,
    ANALOG_PIN_MAX_VALUE,
    tempo,
    7
  );
  const { commands: secondCommands } = generateCommandsForFade(
    ANALOG_PIN_MAX_VALUE,
    0,
    tempo,
    7
  );
  return firstCommands.concat(secondCommands);
}

function heartbeat(tempo = 50) {
  if (tempo > 50) tempo = 50;

  let allCommands: Array<Command> = [];

  // The first up and down of the heartbeat
  const { commands, endingValue } = generateCommandsForFade(0, 768, 8, 1);
  append(allCommands, commands);
  const { commands: downCommands, endingValue: downEndingValue } =
    generateCommandsForFade(endingValue, 16, 8, 1);
  append(allCommands, downCommands);

  // Pause for a bit
  allCommands.push({ type: CommandType.Pause, durationMs: 80 });
  allCommands.push({
    type: CommandType.Pause,
    durationMs: (13 - tempo / 4) * 15,
  });

  // The second up and down of the heartbeat
  const { commands: upCommands, endingValue: upEndingvalue } =
    generateCommandsForFade(downEndingValue, ANALOG_PIN_MAX_VALUE, 8, 1);
  append(allCommands, upCommands);
  const { commands: downAgainCommands, endingValue: downAgainEndingValue } =
    generateCommandsForFade(upEndingvalue, 0, 8, 1);
  append(allCommands, downAgainCommands);

  // Pause again
  allCommands.push({ type: CommandType.Pause, durationMs: 214 });
  allCommands.push({
    type: CommandType.Pause,
    durationMs: (13 - tempo / 4) * 37,
  });
  return allCommands;
}

function sos(tempo = 20) {
  const allCommands: Array<Command> = [];
  const shortPauseMs = (tempo / 4) * 20;
  const longerPauseMs = (tempo / 4) * 50;
  const longestPauseMs = (tempo / 4) * 100;
  for (let i = 0; i < 3; i++) {
    allCommands.push({ type: CommandType.Write, value: ANALOG_PIN_MAX_VALUE });
    allCommands.push({ type: CommandType.Pause, durationMs: shortPauseMs });
    allCommands.push({ type: CommandType.Write, value: 0 });
    allCommands.push({ type: CommandType.Pause, durationMs: shortPauseMs });
  }
  for (let i = 0; i < 3; i++) {
    allCommands.push({ type: CommandType.Write, value: ANALOG_PIN_MAX_VALUE });
    allCommands.push({ type: CommandType.Pause, durationMs: longerPauseMs });
    allCommands.push({ type: CommandType.Write, value: 0 });
    allCommands.push({ type: CommandType.Pause, durationMs: shortPauseMs });
  }
  for (let i = 0; i < 3; i++) {
    allCommands.push({ type: CommandType.Write, value: ANALOG_PIN_MAX_VALUE });
    allCommands.push({ type: CommandType.Pause, durationMs: shortPauseMs });
    allCommands.push({ type: CommandType.Write, value: 0 });
    allCommands.push({ type: CommandType.Pause, durationMs: shortPauseMs });
  }
  allCommands.push({ type: CommandType.Pause, durationMs: longestPauseMs });
  return allCommands;
}

// Argh this is a bizarre function;
// Basically for some reason, it seems Microsoft's MakeCode compiler is unhappy with
// allCommands.push(...array) -- because array might be length 0
// (even though this is perfectly fine JavaScript / TypeScript normally)
// So this helper function is workaround for this.
function append(destination: Array<Command>, itemsToAppend: Array<Command>) {
  for (const item of itemsToAppend) {
    destination.push(item);
  }
}

function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function generateCommandsForFade(
  startingValue: number,
  targetValue: number,
  fadeDelta: number,
  pauseInMs: number
) {
  const commands: Array<Command> = [];
  let currentValue = startingValue;
  while (Math.abs(currentValue - targetValue) > fadeDelta) {
    const writeCommand: WriteCommand = {
      type: CommandType.Write,
      value: currentValue,
    };
    commands.push(writeCommand);

    currentValue =
      currentValue + (targetValue - currentValue > 0 ? fadeDelta : -fadeDelta);

    const pauseCommand: PauseCommand = {
      type: CommandType.Pause,
      durationMs: pauseInMs,
    };
    commands.push(pauseCommand);
  }
  return { commands, endingValue: currentValue };
}

enum CommandType {
  Pause,
  Write,
}

interface PauseCommand {
  type: CommandType.Pause;
  durationMs: number;
}

interface WriteCommand {
  type: CommandType.Write;
  value: number;
}

type Command = PauseCommand | WriteCommand;

function executeCommands(
  commands: Array<Command>,
  pinIndex: number,
  pin: AnalogPin
) {
  // NOTE: We're doing something a bit weird here --
  // If this were regular JavaScript, we would want to execute each iteration of this loop in something like a setTimeout or a
  // requestAnimationFrame, because JavaScript is single threaded, and we're waiting for a function outside of us to
  // potentially reset the value of pinEffectStatuses.
  // However, two things:
  //   1. The pxt coding environment in which this code executes, *doesn't* support rAF or setTimeout
  //   2. The pxt coding environment _seems_ to call different control blocks either in a separate thread or some other way that is interruptible....
  // So for some reason this works with a for-loop, even though it wouldn't work in regular JavaScript.
  for (const command of commands) {
    // Check for interrupt -- immediately return if stop effect is requested
    if (pinEffectStatuses[pinIndex] === EffectStatus.StopEffectRequested) {
      return;
    }

    switch (command.type) {
      case CommandType.Pause:
        basic.pause(command.durationMs);
        continue;
      case CommandType.Write:
        pins.analogWritePin(pin, command.value);
        continue;
    }
  }
}
