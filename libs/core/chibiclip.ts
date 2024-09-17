/*
 * Test thing
 */
//% color=#f91b4f weight=100 icon="\uf0c6" block="Chibi Clip"
namespace ChibiClip {
  /**
   * Set the pin at index
   */
  //% blockId=chibiclip_set
  //% block="set $pin to $on"
  //% pin.fieldEditor="textdropdown"
  //% pin.fieldOptions.decompileLiterals=true
  //% pin.fieldOptions.values='d0,d1,d2,d3,d4,d5'
  //% pin.defl='d0'
  //% on.shadow="toggleOnOff"
  //% parts=chibiclip
  export function setLight(pin: DigitalPinInput, on: boolean): void {
    const digitalPin = stringToDigitalPin(pin);
    const value = on ? 1 : 0;
    pins.digitalWritePin(digitalPin, value);
  }
}

type DigitalPinInput = "d0"|"d1"|"d2"|"d3"|"d4"|"d5";

function stringToDigitalPin(pinInput : DigitalPinInput): DigitalPin {
  switch (pinInput) {
    case "d0":
      return DigitalPin.P0;
    case "d1":
      return DigitalPin.P1;
    case "d2":
      return DigitalPin.P2;
    case "d3":
      return DigitalPin.P3;
    case "d4":
      return DigitalPin.P4;
    case "d5":
      return DigitalPin.P5;
  }
}