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
  export function setLight(pin: string, on: boolean): void {
    // YIKES this is so hacky lol
    const indexNumber = parseInt(pin[1]);
    writeValueToPin(indexNumber, on ? 1 : 0);
  }

  /**
   * Activate the pin at index
   */
  //% blockId=chibiclip_activate
  //% block="activate pin at $index"
  //% index.min=0 index.max=9
  //% parts=chibiclip
  export function activatePin(index: number): void {
    writeValueToPin(index, 1);
  }

  /**
   * Deactivate the pin at index
   */
  //% blockId=chibiclip_deactivate
  //% block="deactivate pin at $index"
  //% index.min=0 index.max=9
  //% parts=chibiclip
  export function deactivatePin(index: number): void {
    writeValueToPin(index, 0);
  }
}

function writeValueToPin(index: number, value: number) {
  const pin = indexToPin(index);
  if (pin === null) {
    return;
  }
  pins.digitalWritePin(pin, value);
}

function indexToPin(index: number): DigitalPin | null {
  switch (index) {
    case 0:
      return DigitalPin.P0;
    case 1:
      return DigitalPin.P1;
    case 2:
      return DigitalPin.P2;
    case 3:
      return DigitalPin.P3;
    case 4:
      return DigitalPin.P4;
    case 5:
      return DigitalPin.P5;
    case 6:
      return DigitalPin.P6;
    case 7:
      return DigitalPin.P7;
    case 8:
      return DigitalPin.P8;
    case 9:
      return DigitalPin.P9;
  }
  return null;
}
