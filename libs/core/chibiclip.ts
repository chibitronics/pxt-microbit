const ANALOG_PIN_MAX_VALUE = 1023;
type DigitalPinBlockParameter = "D0" | "D1" | "D2" | "D3" | "D4" | "D5";
type AnalogPinBlockParameter = "A0" | "A1" | "A2" | "A3" | "A4" | "A5";
type DigitalPinEventParameter = "pressed" | "released" | "changed" | "HIGH" | "LOW";

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
          if (prevPinValue  !== currentPinValue) {
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
