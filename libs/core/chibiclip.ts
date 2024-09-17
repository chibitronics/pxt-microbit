const ANALOG_PIN_MAX_VALUE = 1023;

/*
 * Visualization for the Chibi Clip.
 */
//% color=#f91b4f weight=100 icon="\uf0c6" block="Chibi Clip"
namespace ChibiClip {
  type DigitalPinBlockParameter = "D0" | "D1" | "D2" | "D3" | "D4" | "D5";

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

  type AnalogPinBlockParameter = "A0" | "A1" | "A2" | "A3" | "A4" | "A5";
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
    const writePinValue = Math.round(level / 100.0 * ANALOG_PIN_MAX_VALUE);
    pins.analogWritePin(analogPin, writePinValue);
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
}
