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
  //% pin.fieldOptions.values='D0,D1,D2,D3,D4,D5'
  //% pin.defl='d0'
  //% on.shadow="toggleOnOff"
  //% parts=chibiclip
  export function setLight(pin: DigitalPinInput, on: boolean): void {
    const digitalPin = stringToDigitalPin(pin);
    const value = on ? 1 : 0;
    pins.digitalWritePin(digitalPin, value);
  }
}

type DigitalPinInput = "D0"|"D1"|"D2"|"D3"|"D4"|"D5";

function stringToDigitalPin(pinInput : DigitalPinInput): DigitalPin {
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