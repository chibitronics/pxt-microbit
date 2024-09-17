const ANALOG_PIN_MAX_VALUE = 1023;
type DigitalPinBlockParameter = "D0" | "D1" | "D2" | "D3" | "D4" | "D5";
type AnalogPinBlockParameter = "A0" | "A1" | "A2" | "A3" | "A4" | "A5";
type DigitalPinEventParameter =
  | "pressed"
  | "released"
  | "changed"
  | "HIGH"
  | "LOW";
type DigitalPinValueType = "HIGH" | "LOW";
type EffectString = "twinkle" | "heartbeat" | "blink" | "sos";

const EVENT1_PERIOD = 5000; // Fire every 5 seconds
const EVENT2_PERIOD = 3000; // Fire every 3 seconds

/*
 * Visualization for the Chibi Clip.
 */
//% color=#f91b4f weight=100 icon="\uf0c6" block="Chibi Clip"
namespace ChibiClip {
  /**
   * Turns the light on or off at the given pin value.
   */
  //% blockId=chibiclip_set
  //% block="set $pin to $on"
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='D0,D1,D2,D3,D4,D5'
  //% pin.defl='D0'
  //% on.shadow="toggleOnOff"
  //% parts=chibiclip
  export function setLight(pin: DigitalPinBlockParameter, on: boolean): void {
    const digitalPin = stringToDigitalPin(pin);
    const value = on ? 1 : 0;
    pins.digitalWritePin(digitalPin, value);
  }

  /**
   * Dims the light at the pin to the given brightness.
   */
  //% blockId=chibiclip_setlevel
  //% block="set $pin level to $level"
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='A0,A1,A2,A3,A4,A5'
  //% pin.defl='A0'
  //% level.min=0 level.max=100
  //% parts=chibiclip
  export function setLightLevel(
    pin: AnalogPinBlockParameter,
    level: number
  ): void {
    const analogPin = stringToAnalogPin(pin);
    const writePinValue = Math.round((level / 100.0) * ANALOG_PIN_MAX_VALUE);
    pins.analogWritePin(analogPin, writePinValue);
  }

  /**
   *
   */
  //% block="show $effect on $pin"
  //% effect.fieldEditor="textdropdown"
  //% effect.fieldOptions.decompileLiterals=true
  //% effect.fieldOptions.values='twinkle,heartbeat,blink,sos'
  //% effect.defl='twinkle'
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='A0,A1,A2,A3,A4,A5'
  //% pin.defl='A0'
  //% parts=chibiclip
  export function showEffectOnPin(
    effect: EffectString,
    pin: AnalogPinBlockParameter
  ) {
    const analogPin = stringToAnalogPin(pin);
    switch (effect) {
      case "twinkle":
        twinkle(analogPin);
        break;

      case "heartbeat":
        heartbeat(analogPin);
        break;

      case "blink":
        blink(analogPin);
        break;

      case "sos":
        sos(analogPin);
        break;
    }
  }

  function twinkle(pin: AnalogPin, tempo = 16) {
    let current = ANALOG_PIN_MAX_VALUE / 2;
    for (let i = 0; i < tempo * 8; i++) {
      current = fadeTo(
        current,
        getRandomInt(0, ANALOG_PIN_MAX_VALUE),
        tempo,
        pin,
        3
      );
    }
  }

  function blink(pin: AnalogPin, tempo = 16) {
    fadeTo(0, ANALOG_PIN_MAX_VALUE, tempo, pin, 7);
    fadeTo(ANALOG_PIN_MAX_VALUE, 0, tempo, pin, 7);
  }

  function heartbeat(pin: AnalogPin, tempo = 50) {
    let current = 0;
    if (tempo > 50) tempo = 50;

    current = fadeTo(current, 768, 8, pin, 1);
    current = fadeTo(current, 16, 8, pin, 1);
    basic.pause(80);
    basic.pause((13 - tempo / 4) * 15);

    current = fadeTo(current, ANALOG_PIN_MAX_VALUE, 8, pin, 1);
    current = fadeTo(current, 0, 8, pin, 1);
    basic.pause(214);
    basic.pause((13 - tempo / 4) * 37);
  }

  function sos(pin: AnalogPin, tempo = 20) {
    for (let i = 0; i < 3; i++) {
      pins.analogWritePin(pin, ANALOG_PIN_MAX_VALUE);
      basic.pause((tempo / 4) * 20);
      pins.analogWritePin(pin, 0);
      basic.pause((tempo / 4) * 20);
    }
    for (let i = 0; i < 3; i++) {
      pins.analogWritePin(pin, ANALOG_PIN_MAX_VALUE);
      basic.pause((tempo / 4) * 50);
      pins.analogWritePin(pin, 0);
      basic.pause((tempo / 4) * 20);
    }
    for (let i = 0; i < 3; i++) {
      pins.analogWritePin(pin, ANALOG_PIN_MAX_VALUE);
      basic.pause((tempo / 4) * 20);
      pins.analogWritePin(pin, 0);
      basic.pause((tempo / 4) * 20);
    }
    basic.pause((tempo / 4) * 100);
  }

  function getRandomInt(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }

  function fadeTo(
    startingValue: number,
    targetValue: number,
    fadeDelta: number,
    pin: AnalogPin,
    pauseInMs: number
  ) {
    let currentValue = startingValue;
    while (Math.abs(currentValue - targetValue) > fadeDelta) {
      pins.analogWritePin(pin, currentValue);
      currentValue =
        currentValue +
        (targetValue - currentValue > 0 ? fadeDelta : -fadeDelta);
      basic.pause(pauseInMs);
    }
    return currentValue;
  }

  /**
   *
   */
  //% block="is $pin $value"
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='D0,D1,D2,D3,D4,D5'
  //% pin.defl='D0'
  //% value.fieldEditor="textdropdown"
  //% value.fieldOptions.decompileLiterals=true
  //% value.fieldOptions.values='HIGH,LOW'
  //% value.defl='HIGH'
  //% parts=chibiclip
  export function isPinValue(
    pin: DigitalPinBlockParameter,
    value: DigitalPinValueType
  ): boolean {
    const digitalPin = stringToDigitalPin(pin);
    const pinValue = pins.digitalReadPin(digitalPin);
    if (value === "HIGH") {
      return pinValue > 0;
    } else if (value === "LOW") {
      return pinValue === 0;
    }
    console.error(`Parameter value=${value} is invalid`);
    return false;
  }

  //% block="read level $pin"
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.values='A0,A1,A2,A3,A4,A5'
  //% pin.defl='A0'
  //% parts=chibiclip
  export function readPinLevel(pin: AnalogPinBlockParameter): number {
    const analogPin = stringToAnalogPin(pin);
    const pinValue = pins.analogReadPin(analogPin);
    // This pin value will be between 0 and 1023, so let's map it to 0 to 100
    const level = Math.round((pinValue / ANALOG_PIN_MAX_VALUE) * 100);
    return level;
  }

  /**
   * Register an event handler for various pin conditions.
   */
  //% block="when $pin is $eventType"
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='D0,D1,D2,D3,D4,D5'
  //% pin.defl='D0'
  //% eventType.fieldEditor="textdropdown"
  //% eventType.fieldOptions.decompileLiterals=true
  //% eventType.fieldOptions.values='pressed,released,changed,HIGH,LOW'
  //% eventType.defl='pressed'
  //% parts=chibiclip
  export function onPinEvent(
    pin: DigitalPinBlockParameter,
    eventType: DigitalPinEventParameter,
    handler: () => void
  ) {
    const digitalPin = stringToDigitalPin(pin);

    let prevPinValue = pins.digitalReadPin(digitalPin);
    // Start polling the pin value and fire whenever there's a change.
    // TODO: See if there's a better way to do this.
    basic.forever(() => {
      let currentPinValue = pins.digitalReadPin(digitalPin);
      // console.log(`prev: ${prevPinValue}, current: ${currentPinValue}`);
      switch (eventType) {
        case "pressed":
          if (prevPinValue === 0 && currentPinValue > 0) {
            handler();
          }
          break;
        case "released":
          if (prevPinValue > 0 && currentPinValue === 0) {
            handler();
          }
          break;
        case "changed":
          if (prevPinValue !== currentPinValue) {
            handler();
          }
          break;
        case "HIGH":
          if (currentPinValue > 0) {
            handler();
          }
          break;
        case "LOW":
          if (currentPinValue === 0) {
            handler();
          }
          break;
      }
      prevPinValue = currentPinValue;
    });
  }
}

function stringToDigitalPin(pinInput: DigitalPinBlockParameter): DigitalPin {
  switch (pinInput) {
    case "D0":
      return DigitalPin.P0;
    case "D1":
      return DigitalPin.P1;
    case "D2":
      return DigitalPin.P2;
    case "D3":
      return DigitalPin.P3;
    case "D4":
      return DigitalPin.P4;
    case "D5":
      return DigitalPin.P5;
  }
}

function stringToAnalogPin(pinInput: AnalogPinBlockParameter): AnalogPin {
  switch (pinInput) {
    case "A0":
      return AnalogPin.P0;
    case "A1":
      return AnalogPin.P1;
    case "A2":
      return AnalogPin.P2;
    case "A3":
      return AnalogPin.P3;
    case "A4":
      return AnalogPin.P4;
    case "A5":
      return AnalogPin.P5;
  }
}
