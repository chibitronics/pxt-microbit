const ANALOG_PIN_MAX_VALUE = 1023;

const CLIP_X = 38;
const CLIP_Y = 225;
// const CLIP_Y = 225 + 120; // for testing (lets us see the underlying pins)

const CLIP_WIDTH = 420;
const CLIP_HEIGHT = 120;

const NUMBER_OF_GPIO_PINS = 6;
const NUMBER_OF_USABLE_GPIO_PINS = 3; // Using only the first 3 pins for now
const TOTAL_NUMBER_OF_PINS = NUMBER_OF_GPIO_PINS + 3; // GPIO + power + 2 grounds

const ITEM_WIDTH = 30;
const GAP = 15;
const SPACING = ITEM_WIDTH + GAP;
const ALL_ITEMS_WIDTH =
  TOTAL_NUMBER_OF_PINS * ITEM_WIDTH + GAP * (TOTAL_NUMBER_OF_PINS - 1);
const X_OFFSET = (CLIP_WIDTH - ALL_ITEMS_WIDTH) / 2;

const RECT_WIDTH = ITEM_WIDTH;
const RECT_HEIGHT = 50;
const RECT_Y = CLIP_HEIGHT - RECT_HEIGHT;
const RECT_X_OFFSET = X_OFFSET;
const RECT_X_DISTANCE = SPACING;
const RECT_DEFAULT_FILL = "hsl(185.35,66%,54%)"; //chibiblue

const CIRCLE_RECT_GAP = 10;

const CIRCLE_RADIUS = ITEM_WIDTH / 2;
const CIRCLE_DEFAULT_FILL = "gray";
const CIRCLE_Y =
  CLIP_HEIGHT - RECT_HEIGHT - CIRCLE_RADIUS * 2 - CIRCLE_RECT_GAP;
const CIRCLE_X_OFFSET = X_OFFSET + CIRCLE_RADIUS;
const CIRCLE_X_DISTANCE = SPACING;

const TEXT_Y = RECT_Y + RECT_Y / 2;
const TEXT_TOP_Y = RECT_Y + RECT_Y / 4;
const TEXT_X_OFFSET = X_OFFSET;
const TEXT_X_DISTANCE = SPACING;

const PIN_INDEX_DATA_NAME = "data-pin-index";

const WIRE_WIDTH = 12;
const WIRE_CLASS_NAME = "wire";

const SWITCH_WIRE_HEIGHT = 100;
const SWITCH_TOGGLES_Y = CLIP_HEIGHT + SWITCH_WIRE_HEIGHT + WIRE_WIDTH + 100;
const SWITCH_GROUP_CLASS_NAME = "all-switch-toggles";
const CLICKABLE_SWITCH_CLASS_NAME = "clickable-switch";
const SWITCH_OFF_INITIAL_WIRE_HEIGHT = 30;
const CLICKABLE_SWITCH_WIRE_LENGTH = 30;
const SWITCH_OFF_ROTATION_DEG = 45;

const LIGHT_TOGGLES_Y = SWITCH_TOGGLES_Y + 100;
const LIGHT_GROUP_CLASS_NAME = "all-light-toggles";
const LIGHT_WIRE_HEIGHT = 140;
const LIGHT_WIRE_JUMP_HEIGHT = 40;
const LIGHT_WIRE_BEZIER_CURVE_HEIGHT = 25;
const LIGHT_WIDTH = 36;
//
//   |\
// a | \ c
//   |__\
//     b
// a^2 + b^2 = c^2
// a = Math.sqrt(c^2 - b^2)
// c = LIGHT_WIDTH
// b = LIGHT_WIDTH / 2
const LIGHT_HEIGHT = Math.sqrt(
  Math.pow(LIGHT_WIDTH, 2) - Math.pow(LIGHT_WIDTH / 2, 2)
);
const LIGHT_Y = CLIP_HEIGHT + SWITCH_OFF_INITIAL_WIRE_HEIGHT;

const TOGGLES_GAP = 20;
const TOGGLE_HEIGHT = RECT_WIDTH;
const TOGGLE_WIDTH = RECT_WIDTH;
const TOGGLES_X_DISTANCE = TOGGLE_WIDTH + TOGGLES_GAP;

const POWER_PIN_INDEX = NUMBER_OF_GPIO_PINS;
const CHIBI_NEON_GREEN_COLOR = "hsl(112.5, 100%, 67%)";

enum ToggleValue {
  On,
  OffAndEnabled,
  OffAndDisabled,
}

// NOTE: These values are meaningful, and represent the Position Number of the pin
// in the clip. I made them a string type because it's REALLY easy to get off by
// one bugs by mixing up the Pin Number and the Position Number, and so having
// a string type will force a compiler error when that mistake happens.
enum VisualizerPin {
  LeftGround = "Left Ground",
  Pin0 = "Pin 0",
  Pin1 = "Pin 1",
  Pin2 = "Pin 2",
  Pin3 = "Pin 3",
  Pin4 = "Pin 4",
  Pin5 = "Pin 5",
  ThreeVolt = "Voltage",
  RightGround = "Right Ground",
}

type NonGpioPin =
  | VisualizerPin.LeftGround
  | VisualizerPin.ThreeVolt
  | VisualizerPin.RightGround;

function visualizerPinToPositionNumber(visualizerPin: VisualizerPin) {
  switch (visualizerPin) {
    case VisualizerPin.LeftGround:
      return 0;
    case VisualizerPin.Pin0:
      return 1;
    case VisualizerPin.Pin1:
      return 2;
    case VisualizerPin.Pin2:
      return 3;
    case VisualizerPin.Pin3:
      return 4;
    case VisualizerPin.Pin4:
      return 5;
    case VisualizerPin.Pin5:
      return 6;
    case VisualizerPin.ThreeVolt:
      return 7;
    case VisualizerPin.RightGround:
      return 8;
  }
}

function gpioPinNumberToVisalizerPin(pinNumber: number) {
  switch (pinNumber) {
    case 0:
      return VisualizerPin.Pin0;
    case 1:
      return VisualizerPin.Pin1;
    case 2:
      return VisualizerPin.Pin2;
    case 3:
      return VisualizerPin.Pin3;
    case 4:
      return VisualizerPin.Pin4;
    case 5:
      return VisualizerPin.Pin5;
  }
  throw `invalid pin ${pinNumber}`;
}

enum ToggleStateValues {
  HasSwitch,
  HasLight,
  HasNothing,
}

namespace pxsim.visuals {
  function createSvgElement(tagName: string) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }

  function ledGlow() {
    const defsElement = createSvgElement("defs");
    const filterElement = createSvgElement("filter");
    defsElement.append(filterElement);
    filterElement.setAttribute("id", "ledGlow");
    const feGaussianBlurElement = createSvgElement("feGaussianBlur");
    feGaussianBlurElement.setAttribute("stdDeviation", "4");
    feGaussianBlurElement.setAttribute("result", "coloredBlur");
    filterElement.append(feGaussianBlurElement);
    const feMergeElement = createSvgElement("feMerge");
    filterElement.append(feMergeElement);
    const feMergeNodeElement1 = createSvgElement("feMergeNode");
    feMergeNodeElement1.setAttribute("in", "coloredBlur");
    const feMergeNodeElement2 = createSvgElement("feMergeNode");
    feMergeNodeElement2.setAttribute("in", "coloredBlur");
    const feMergeNodeElement3 = createSvgElement("feMergeNode");
    feMergeNodeElement3.setAttribute("in", "SourceGraphic");
    feMergeElement.append(feMergeNodeElement1);
    feMergeElement.append(feMergeNodeElement2);
    feMergeElement.append(feMergeNodeElement3);
    return defsElement;
  }

  function getTextXCoordinateForPin(visualizerPin: VisualizerPin) {
    const positionNumber = visualizerPinToPositionNumber(visualizerPin);
    return TEXT_X_OFFSET + TEXT_X_DISTANCE * positionNumber;
  }

  function getCircleCoordinateForPin(visualizerPin: VisualizerPin) {
    const positionNumber = visualizerPinToPositionNumber(visualizerPin);
    return CIRCLE_X_OFFSET + CIRCLE_X_DISTANCE * positionNumber;
  }

  function getRectangleXCoordinateForPin(visualizerPin: VisualizerPin) {
    const positionNumber = visualizerPinToPositionNumber(visualizerPin);
    return RECT_X_OFFSET + RECT_X_DISTANCE * positionNumber;
  }

  function generateSvg(): SVGAElement {
    const root = svg.parseString(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${CLIP_WIDTH}" height="${CLIP_HEIGHT}"></svg>`
    );
    const group = createSvgElement("g");
    const defEl = ledGlow();
    group.append(defEl);
    root.append(group);

    // Add clip element
    const clipElement = createSvgElement("rect");
    clipElement.setAttribute("width", `${CLIP_WIDTH}`);
    clipElement.setAttribute("height", `${CLIP_HEIGHT}`);
    clipElement.setAttribute("fill", "hsl(44.772, 100%, 61%)"); //chibiyellow
    group.append(clipElement);

    // Add left ground
    const leftGroundPin = createNonGpioPin(
      VisualizerPin.LeftGround,
      "ground",
      "GND",
      "-"
    );
    group.append(leftGroundPin);

    // Add gpio pins
    for (let i = 0; i < NUMBER_OF_USABLE_GPIO_PINS; i++) {
      const pinGroup = createGpioPin(i);
      group.append(pinGroup);
    }

    // Add power & right ground pins
    const voltagePin = createNonGpioPin(
      VisualizerPin.ThreeVolt,
      "power",
      "3V",
      "+"
    );
    group.append(voltagePin);

    const rightGround = createNonGpioPin(
      VisualizerPin.RightGround,
      "right-ground",
      "GND",
      "-"
    );
    group.append(rightGround);

    // Add toggles add/remove switches
    group.append(
      addToggles(SWITCH_TOGGLES_Y, SWITCH_GROUP_CLASS_NAME, "Add Switch")
    );
    group.append(
      addToggles(LIGHT_TOGGLES_Y, LIGHT_GROUP_CLASS_NAME, "Add Light")
    );

    // Finally, black out pins 13, 14, 15 for now since they're buggy at the moment
    const blackoutRect = createBlackoutRectangle(
      VisualizerPin.Pin3,
      VisualizerPin.Pin5
    );
    group.append(blackoutRect);

    return root.firstElementChild as SVGAElement;
  }

  function createGpioPin(pinNumber: number) {
    const visualizerPin = gpioPinNumberToVisalizerPin(pinNumber);
    const pinGroup = createSvgElement("g");
    pinGroup.setAttribute("id", `pin${pinNumber}`);

    const defaultCircle = createLightCircle(
      visualizerPin,
      "default",
      CIRCLE_DEFAULT_FILL
    );
    pinGroup.append(defaultCircle);

    const levelCircle = createLightCircle(
      visualizerPin,
      "level",
      "transparent"
    );
    pinGroup.append(levelCircle);

    const defaultRect = createPinRectangle(
      visualizerPin,
      "default",
      RECT_DEFAULT_FILL
    );
    pinGroup.append(defaultRect);

    const levelRect = createPinRectangle(visualizerPin, "level", "transparent");
    pinGroup.append(levelRect);

    const label = createPinLabel(visualizerPin, `${pinNumber}`);
    pinGroup.append(label);
    return pinGroup;
  }

  function createNonGpioPin(
    pin: NonGpioPin,
    className: string,
    topLabel: string,
    bottomLabel: string
  ) {
    const group = createSvgElement("g");
    const powerPin = createPinRectangle(pin, className, RECT_DEFAULT_FILL);
    group.append(powerPin);
    const bottomLabelEl = createPinLabel(pin, bottomLabel);
    group.append(bottomLabelEl);
    const topLabelEl = createPinTopLabel(pin, topLabel);
    group.append(topLabelEl);

    if (pin === VisualizerPin.ThreeVolt) {
      const lightCircle = createLightCircle(
        pin,
        "voltage-on",
        CHIBI_NEON_GREEN_COLOR
      );
      group.append(lightCircle);
    }
    return group;
  }

  function createPinRectangle(
    visualizerPin: VisualizerPin,
    className: string,
    fillColor: string
  ) {
    const pinRect = createSvgElement("rect");
    pinRect.classList.add(className);
    pinRect.setAttribute(
      "x",
      `${getRectangleXCoordinateForPin(visualizerPin)}`
    );
    pinRect.setAttribute("y", `${RECT_Y}`);
    pinRect.setAttribute("height", `${RECT_HEIGHT}`);
    pinRect.setAttribute("width", `${RECT_WIDTH}`);
    pinRect.setAttribute("fill", fillColor);
    return pinRect;
  }

  function createBlackoutRectangle(
    rectangleStart: VisualizerPin,
    rectangleEnd: VisualizerPin
  ) {
    const startPositionNumber = visualizerPinToPositionNumber(rectangleStart);
    const endPositionNumber = visualizerPinToPositionNumber(rectangleEnd);
    const numberItems = endPositionNumber - startPositionNumber + 1;
    if (numberItems <= 0) {
      throw `invalid range: ${rectangleStart} ${rectangleEnd}`;
    }
    const pinRect = createSvgElement("rect");
    pinRect.classList.add("blackout");
    pinRect.setAttribute(
      "x",
      `${getRectangleXCoordinateForPin(rectangleStart)}`
    );
    const width = RECT_WIDTH * numberItems + GAP * (numberItems - 1);
    pinRect.setAttribute("y", `${RECT_Y}`);
    pinRect.setAttribute("height", `${RECT_HEIGHT}`);
    pinRect.setAttribute("width", `${width}`);
    pinRect.setAttribute("fill", "black");
    return pinRect;
  }

  function createPinLabel(visualizerPin: VisualizerPin, text: string) {
    return drawPinText(visualizerPin, text, "pin-label", TEXT_Y);
  }

  function createPinTopLabel(visualizerPin: VisualizerPin, text: string) {
    return drawPinText(visualizerPin, text, "pin-top-label", TEXT_TOP_Y);
  }

  function drawPinText(
    visualizerPin: VisualizerPin,
    text: string,
    className: string,
    yPosition: number
  ) {
    const labelText = createSvgElement("text");
    labelText.classList.add(className);
    labelText.setAttribute(
      "x",
      `${getTextXCoordinateForPin(visualizerPin) + RECT_WIDTH / 2}`
    );
    labelText.setAttribute("y", `${yPosition}`);
    labelText.innerHTML = text;
    return labelText;
  }

  function createLightTriangle(
    visualizerPin: VisualizerPin,
    className: string
  ) {
    const polygon = createSvgElement("polygon");
    polygon.classList.add(className);
    const xCenterPoint =
      getRectangleXCoordinateForPin(visualizerPin) + RECT_WIDTH / 2;

    const x1 = xCenterPoint - LIGHT_WIDTH / 2;
    const x2 = x1 + LIGHT_WIDTH;
    const x3 = xCenterPoint;
    const y1 = LIGHT_Y;
    const y2 = LIGHT_Y;
    const y3 = LIGHT_Y + LIGHT_HEIGHT;

    const points = `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
    polygon.setAttribute("points", points);
    return polygon;
  }

  function createLightCircle(
    visualizerPin: VisualizerPin,
    className: string,
    fillColor: string
  ) {
    const levelCircle = createSvgElement("circle");
    levelCircle.classList.add(className);
    levelCircle.setAttribute(
      "cx",
      `${getCircleCoordinateForPin(visualizerPin)}`
    );
    levelCircle.setAttribute("cy", `${CIRCLE_Y}`);
    levelCircle.setAttribute("r", `${CIRCLE_RADIUS}`);
    levelCircle.setAttribute("fill", fillColor);
    return levelCircle;
  }

  function createSwitchFromPinToVoltage(pinNumber: number) {
    const group = createSvgElement("g");
    group.setAttribute(
      "id",
      `${getWireIdName(pinNumber, SWITCH_GROUP_CLASS_NAME)}`
    );
    const visualizerPin = gpioPinNumberToVisalizerPin(pinNumber);

    const startingX =
      getRectangleXCoordinateForPin(visualizerPin) + RECT_WIDTH / 2;
    const bottomOfClipY = CLIP_HEIGHT;

    // Draw the initial line before the gap.
    const initialLinePath = createSvgElement("path");
    const initialEndingY = bottomOfClipY + SWITCH_OFF_INITIAL_WIRE_HEIGHT;
    const initialLineD = `M ${startingX} ${bottomOfClipY} V ${initialEndingY}`;
    initialLinePath.setAttribute("d", initialLineD);
    initialLinePath.classList.add(WIRE_CLASS_NAME);
    group.append(initialLinePath);

    // Draw the switch in the off state
    const clickableSwitchWire = createSvgElement("path");
    const switchWireD = getDrawValueForSwitch(pinNumber, false);
    clickableSwitchWire.setAttribute("d", switchWireD);
    clickableSwitchWire.setAttribute(PIN_INDEX_DATA_NAME, `${pinNumber}`);
    clickableSwitchWire.classList.add(
      WIRE_CLASS_NAME,
      CLICKABLE_SWITCH_CLASS_NAME,
      "off"
    );
    group.append(clickableSwitchWire);

    // Draw the remaining line.
    const remainingLinePath = createSvgElement("path");
    const remainingY1 =
      bottomOfClipY +
      SWITCH_OFF_INITIAL_WIRE_HEIGHT +
      CLICKABLE_SWITCH_WIRE_LENGTH;
    let remainingLineD = `M ${startingX} ${remainingY1} `;

    // 1. Draw the downward stroke
    remainingLineD += `V ${CLIP_HEIGHT + SWITCH_WIRE_HEIGHT} `;

    // 2. Draw the horizontal stroke
    const powerPinStartingX =
      getRectangleXCoordinateForPin(VisualizerPin.ThreeVolt) + RECT_WIDTH / 2;
    remainingLineD += `H ${powerPinStartingX} `;

    // 3. Draw the remaining vertical stroke
    remainingLineD += `V ${bottomOfClipY} `;

    remainingLinePath.setAttribute("d", remainingLineD);
    remainingLinePath.classList.add(WIRE_CLASS_NAME);
    group.append(remainingLinePath);

    return group;
  }

  function getDrawValueForSwitch(pinNumber: number, isConnected: boolean) {
    const visualizerPin = gpioPinNumberToVisalizerPin(pinNumber);
    const wireStartingX =
      getRectangleXCoordinateForPin(visualizerPin) + RECT_WIDTH / 2;
    const wireStartingY = CLIP_HEIGHT + SWITCH_OFF_INITIAL_WIRE_HEIGHT;

    if (isConnected) {
      const endingY = wireStartingY + CLICKABLE_SWITCH_WIRE_LENGTH;
      return `M ${wireStartingX} ${wireStartingY} V ${endingY}`;
    } else {
      // Start drawing slightly above wire start, so that we have a continuous line
      const fudgeRoom = 10; // eyeballed value
      const x1 = wireStartingX;
      const y1 = wireStartingY - fudgeRoom;

      //
      // h   /|
      //   /  | adj
      // /____|
      //   opp
      // cos(ang) = adj / hyp
      // adj = hyp * cos(ang)
      const yDistance =
        CLICKABLE_SWITCH_WIRE_LENGTH *
        Math.cos(toRadians(SWITCH_OFF_ROTATION_DEG));
      const endingY = wireStartingY + yDistance;

      // sin(ang) = opp / hyp
      // opp = hyp * sin(ang)
      const xDistance =
        CLICKABLE_SWITCH_WIRE_LENGTH *
        Math.sin(toRadians(SWITCH_OFF_ROTATION_DEG));
      const endingX = wireStartingX - xDistance;

      return `M ${x1} ${y1} V ${y1 + fudgeRoom} L ${endingX} ${endingY}`;
    }
  }

  function toRadians(angle: number) {
    return angle * (Math.PI / 180);
  }

  function createLightFromPinToGround(pinNumber: number, hasJump: boolean) {
    const visualizerPin = gpioPinNumberToVisalizerPin(pinNumber);
    const group = createSvgElement("g");
    group.setAttribute(
      "id",
      `${getWireIdName(pinNumber, LIGHT_GROUP_CLASS_NAME)}`
    );

    const startingX =
      getRectangleXCoordinateForPin(visualizerPin) + RECT_WIDTH / 2;
    const bottomOfClipY = RECT_Y + RECT_HEIGHT;
    const path = createSvgElement("path");
    path.classList.add(WIRE_CLASS_NAME);

    const x1 = startingX;
    const y1 = bottomOfClipY;
    const leftGroundPositionNumber = visualizerPinToPositionNumber(
      VisualizerPin.LeftGround
    );
    const lengthOfWire = RECT_X_DISTANCE * leftGroundPositionNumber;
    const endWireX = RECT_X_OFFSET + RECT_WIDTH / 2 + lengthOfWire;

    let d = "";
    if (hasJump) {
      const jumpStartLength = SWITCH_WIRE_HEIGHT - LIGHT_WIRE_JUMP_HEIGHT / 2;
      const jumpStartY = y1 + jumpStartLength;
      const jumpEndLength = SWITCH_WIRE_HEIGHT + LIGHT_WIRE_JUMP_HEIGHT / 2;
      const jumpEndY = y1 + jumpEndLength;
      const bezierX = `${LIGHT_WIRE_BEZIER_CURVE_HEIGHT + x1}`;
      const bezier = `C ${bezierX} ${jumpStartY} ${bezierX} ${jumpEndY} ${x1} ${jumpEndY}`;

      const lineEndY = y1 + LIGHT_WIRE_HEIGHT;
      d = `M ${x1} ${y1} V ${jumpStartY} ${bezier} V ${lineEndY} H ${endWireX} V ${y1}`;
    } else {
      d = `M ${x1} ${y1} V ${y1 + LIGHT_WIRE_HEIGHT} H ${endWireX} V ${y1}`;
    }

    path.setAttribute("d", d);
    group.append(path);

    const lightGroup = createSvgElement("g");
    lightGroup.id = getLightIdName(pinNumber);

    const lightGraphicBottom = createLightTriangle(
      visualizerPin,
      "triangle-base"
    );
    lightGroup.append(lightGraphicBottom);

    const lightGraphicTop = createLightTriangle(
      visualizerPin,
      "triangle-light"
    );
    lightGraphicTop.setAttribute("fill", "transparent");
    lightGraphicTop.classList.add("off");
    lightGroup.append(lightGraphicTop);

    group.append(lightGroup);

    return group;
  }

  function addToggles(yOffset: number, groupClassName: string, label: string) {
    const group = createSvgElement("g");
    group.classList.add(groupClassName);

    const labelText = createSvgElement("text");
    labelText.setAttribute("x", "0");
    labelText.setAttribute("y", `${yOffset}`);
    labelText.setAttribute("text-anchor", "left");
    labelText.innerHTML = label;
    group.append(labelText);

    for (let i = 0; i < NUMBER_OF_USABLE_GPIO_PINS; i++) {
      const toggle = createToggle(i, groupClassName, yOffset);
      group.append(toggle);
    }

    return group;
  }

  function getToggleIdName(pinNumber: number, groupClassName: string) {
    return `${groupClassName}-pin-${pinNumber}`;
  }

  function getWireIdName(pinNumber: number, groupClassName: string) {
    return `${groupClassName}-wire-${pinNumber}`;
  }

  function getLightIdName(pinNumber: number) {
    return `${LIGHT_GROUP_CLASS_NAME}-light-${pinNumber}`;
  }

  function createToggle(
    pinNumber: number,
    groupClassName: string,
    overallYOffset: number
  ) {
    const group = createSvgElement("g");
    group.id = getToggleIdName(pinNumber, groupClassName);
    group.classList.add("toggle-group");
    const pinRect = createSvgElement("rect");
    pinRect.classList.add("toggle");
    pinRect.setAttribute(PIN_INDEX_DATA_NAME, `${pinNumber}`);
    pinRect.setAttribute("x", `${TOGGLES_X_DISTANCE * pinNumber}`);
    pinRect.setAttribute("y", `${overallYOffset + TOGGLES_GAP}`);
    pinRect.setAttribute("height", `${TOGGLE_HEIGHT}`);
    pinRect.setAttribute("width", `${TOGGLE_WIDTH}`);
    group.classList.add("off");

    const labelText = createSvgElement("text");
    labelText.setAttribute(
      "x",
      `${TOGGLES_X_DISTANCE * pinNumber + TOGGLE_WIDTH / 2}`
    );
    labelText.setAttribute(
      "y",
      `${overallYOffset + TOGGLES_GAP + TOGGLE_HEIGHT / 2 + 4}`
    );
    labelText.setAttribute("text-anchor", "middle");
    labelText.innerHTML = `${pinNumber}`;
    group.append(pinRect);
    group.append(labelText);

    return group;
  }

  // For the instructions parts list
  export function mkChibiClipPart(xy: Coord = [0, 0]): SVGElAndSize {
    let [x, y] = xy;
    let l = x;
    let t = y;
    let w = CLIP_WIDTH;
    let h = CLIP_HEIGHT;
    // const el = svg.parseString(chibiClip).firstElementChild as SVGGElement;
    const el = generateSvg();
    return { el, x: l, y: t, w: w, h: h };
  }
  export class ChibiClipView implements IBoardPart<EdgeConnectorState> {
    public style: string = `
            svg text {
              font-family: "Arial";
              font-weight: bold;
              user-select: none;
            }

            .voltage-on {
              stroke, rgb(235, 235, 235);
              stroke-width: 3;
              stroke-miterlimit: 10;
              filter: url("#ledGlow");
            }

            .${CLICKABLE_SWITCH_CLASS_NAME},
            .toggle-group.on,
            .toggle-group.off {
              cursor: pointer;
            }
            
            .${CLICKABLE_SWITCH_CLASS_NAME}.on {
              stroke: Gray;
            }

            .toggle-group.off:hover .toggle,
            .toggle-group.on:hover .toggle {
              fill: gray;
            }
            
            .toggle-group.disabled text {
              fill: Silver;
            }

            .toggle-group .toggle {
              fill: gainsboro;
            }

            .toggle-group.on .toggle {
              fill: MediumAquamarine;
            }

            .pin-label, .pin-top-label {
              font-family: "Courier New";
              text-anchor: middle;
            }

            svg text.pin-top-label {
              font-size: 12px;
            }

            polygon.triangle-base {
              fill: gray;
            }
            
            .${WIRE_CLASS_NAME} {
              stroke: Silver;
              stroke-width: 12px;
              fill: none;
            }
        `;
    public element: SVGElement;
    public overElement: SVGElement;
    public defs: SVGElement[];
    private state: EdgeConnectorState;
    private toggleState = [
      ToggleStateValues.HasNothing,
      ToggleStateValues.HasNothing,
      ToggleStateValues.HasNothing,
      ToggleStateValues.HasNothing,
      ToggleStateValues.HasNothing,
      ToggleStateValues.HasNothing,
    ];
    private part: SVGElAndSize;
    private lastLocation: Coord;
    private stripGroup: SVGGElement;

    constructor() {
      console.log("ChibiClipView constructed");
    }

    private getLocalStorageTokenName() {
      try {
        const iframeIdentifier = window.frameElement.id;
        if (!iframeIdentifier) {
          return null;
        }
        return `chibiclip-saved-state-${iframeIdentifier}`;
      } catch {
        console.error(`something went wrong with loading state, abort`);
        return null;
      }
    }

    private loadToggleState() {
      const tokenName = this.getLocalStorageTokenName();
      if (!tokenName) {
        return;
      }
      const savedData = window.localStorage.getItem(tokenName);
      if (!savedData) {
        return;
      }
      this.toggleState = JSON.parse(savedData);
      for (let pinNumber = 0; pinNumber < NUMBER_OF_USABLE_GPIO_PINS; pinNumber++) {
        const toggleValue = this.toggleState[pinNumber];
        // TODO: This is pretty fragile, rewrite this logic later
        switch (toggleValue) {
          case ToggleStateValues.HasSwitch:
            this.setToggleValue(
              pinNumber,
              SWITCH_GROUP_CLASS_NAME,
              ToggleValue.On,
              false
            );
            this.setToggleValue(
              pinNumber,
              LIGHT_GROUP_CLASS_NAME,
              ToggleValue.OffAndDisabled,
              false
            );
            this.addCircuitElementsForSwitch(pinNumber);
            break;
          case ToggleStateValues.HasLight:
            this.setToggleValue(
              pinNumber,
              LIGHT_GROUP_CLASS_NAME,
              ToggleValue.On,
              false
            );
            this.setToggleValue(
              pinNumber,
              SWITCH_GROUP_CLASS_NAME,
              ToggleValue.OffAndDisabled,
              false
            );
            this.addCircuitElementsForLight(pinNumber);
            break;
          case ToggleStateValues.HasNothing:
            break;
        }
      }
    }

    private saveToggleState() {
      const savedData = JSON.stringify(this.toggleState);
      const tokenName = this.getLocalStorageTokenName();
      if (!tokenName) {
        return;
      }
      window.localStorage.setItem(tokenName, savedData);
    }

    public init(
      bus: EventBus,
      state: EdgeConnectorState,
      svgEl: SVGSVGElement,
      otherParams: Map<string>
    ): void {
      this.stripGroup = <SVGGElement>svg.elt("g");
      this.element = this.stripGroup;
      this.lastLocation = [0, 0];
      this.state = state;

      let part = mkChibiClipPart();
      this.part = part;
      this.stripGroup.appendChild(part.el);
      this.overElement = null;

      // Add switch toggles
      const switchToggles = this.element.querySelectorAll(
        `.${SWITCH_GROUP_CLASS_NAME} .toggle-group`
      );
      for (const toggle of switchToggles) {
        toggle.addEventListener("click", () => {
          const toggleBody = toggle.querySelector(`.toggle`);
          const pinNumber = parseInt(
            toggleBody.getAttribute(PIN_INDEX_DATA_NAME)
          );
          const pin = this.getPinFromIndexNumber(pinNumber);
          const toggleValue = this.getToggleValue(
            pinNumber,
            SWITCH_GROUP_CLASS_NAME
          );
          switch (toggleValue) {
            case ToggleValue.On:
              this.removeSwitchCircuit(pinNumber, pin);
              this.enableLightToggle(pinNumber);
              break;
            case ToggleValue.OffAndEnabled:
              this.addSwitchCircuit(pinNumber);
              this.disableLightToggle(pinNumber);
              break;
            case ToggleValue.OffAndDisabled:
              break; // do nothing
          }
        });
      }

      // Add light toggles
      const lightToggles = this.element.querySelectorAll(
        `.${LIGHT_GROUP_CLASS_NAME} .toggle-group`
      );
      for (const toggle of lightToggles) {
        toggle.addEventListener("click", () => {
          const toggleBody = toggle.querySelector(`.toggle`);
          const pinNumber = parseInt(toggleBody.getAttribute("data-pin-index"));
          const toggleValue = this.getToggleValue(
            pinNumber,
            LIGHT_GROUP_CLASS_NAME
          );
          switch (toggleValue) {
            case ToggleValue.On:
              this.removeLightCircuit(pinNumber);
              this.enableSwitchToggle(pinNumber);
              break;
            case ToggleValue.OffAndEnabled:
              this.addLightCircuit(pinNumber);
              this.disableSwitchToggle(pinNumber);
              break;
            case ToggleValue.OffAndDisabled:
              break; // do nothing
          }
        });
      }

      this.loadToggleState();
    }

    private addSwitchCircuit(pinNumber: number) {
      this.setToggleValue(pinNumber, SWITCH_GROUP_CLASS_NAME, ToggleValue.On);
      this.addCircuitElementsForSwitch(pinNumber);
      this.redrawLightWiresIfNeeded(pinNumber);
    }

    private addCircuitElementsForSwitch(pinNumber: number) {
      const wireEl = createSwitchFromPinToVoltage(pinNumber);
      this.part.el.append(wireEl);
      this.addEventListenerForClickableSwitch(pinNumber);
    }

    private addEventListenerForClickableSwitch(pinNumber: number) {
      const clickableSwitchEl = this.getClickableSwitchElement(pinNumber);
      // Set its event listener.
      clickableSwitchEl.addEventListener("click", () => {
        const pinIndex = parseInt(
          clickableSwitchEl.getAttribute(PIN_INDEX_DATA_NAME)
        );
        const pin = this.getPinFromIndexNumber(pinIndex);
        if (this.isSwitchConnected(pinIndex)) {
          this.setSwitchIsConnected(pinIndex, false);
          pin.removeExternalVoltage();
        } else {
          this.setSwitchIsConnected(pinIndex, true);
          pin.addExternalVoltage();
        }
      });
    }

    private removeCircuitElementsForSwitch(pinNumber: number) {
      this.removeCircuit(pinNumber, SWITCH_GROUP_CLASS_NAME);
    }

    private removeSwitchCircuit(pinNumber: number, pin: Pin) {
      if (this.isSwitchConnected(pinNumber)) {
        pin.removeExternalVoltage();
      }

      this.setToggleValue(
        pinNumber,
        SWITCH_GROUP_CLASS_NAME,
        ToggleValue.OffAndEnabled
      );
      this.removeCircuitElementsForSwitch(pinNumber);
      this.redrawLightWiresIfNeeded(pinNumber);
    }

    private enableSwitchToggle(pinNumber: number) {
      this.setToggleValue(
        pinNumber,
        SWITCH_GROUP_CLASS_NAME,
        ToggleValue.OffAndEnabled
      );
    }

    private disableSwitchToggle(pinNumber: number) {
      this.setToggleValue(
        pinNumber,
        SWITCH_GROUP_CLASS_NAME,
        ToggleValue.OffAndDisabled
      );
    }

    private redrawLightWiresIfNeeded(switchCircuitPinNumber: number) {
      // If a pin after me has a light
      for (let i = switchCircuitPinNumber + 1; i < NUMBER_OF_USABLE_GPIO_PINS; i++) {
        const value = this.getToggleValue(i, LIGHT_GROUP_CLASS_NAME);
        if (value === ToggleValue.On) {
          this.removeCircuitForLight(i);
          this.addCircuitElementsForLight(i);
        }
      }
    }

    private lightWireHasJump(pinNumber: number) {
      // If a pin before it has a switch
      for (let i = 0; i < pinNumber; i++) {
        const value = this.getToggleValue(i, SWITCH_GROUP_CLASS_NAME);
        if (value === ToggleValue.On) {
          return true;
        }
      }
      return false;
    }

    private addLightCircuit(pinNumber: number) {
      this.addCircuitElementsForLight(pinNumber);
      this.setToggleValue(pinNumber, LIGHT_GROUP_CLASS_NAME, ToggleValue.On);
    }

    private addCircuitElementsForLight(pinNumber: number) {
      const wireEl = createLightFromPinToGround(
        pinNumber,
        this.lightWireHasJump(pinNumber)
      );
      this.part.el.append(wireEl);

      // Call update state to refresh the light if needed.
      this.updateState();
    }

    private removeLightCircuit(pinNumber: number) {
      this.setToggleValue(
        pinNumber,
        LIGHT_GROUP_CLASS_NAME,
        ToggleValue.OffAndEnabled
      );
      this.removeCircuitForLight(pinNumber);
    }

    private enableLightToggle(pinNumber: number) {
      this.setToggleValue(
        pinNumber,
        LIGHT_GROUP_CLASS_NAME,
        ToggleValue.OffAndEnabled
      );
    }

    private disableLightToggle(pinNumber: number) {
      this.setToggleValue(
        pinNumber,
        LIGHT_GROUP_CLASS_NAME,
        ToggleValue.OffAndDisabled
      );
    }

    private removeCircuitForLight(pinNumber: number) {
      this.removeCircuit(pinNumber, LIGHT_GROUP_CLASS_NAME);
    }

    private removeCircuit(pinNumber: number, groupClassName: string) {
      const groupEl = this.element.querySelector(
        `#${getWireIdName(pinNumber, groupClassName)}`
      );
      groupEl.remove();
    }

    private isSwitchConnected(pinNumber: number) {
      const clickableSwitchEl = this.getClickableSwitchElement(pinNumber);
      return clickableSwitchEl.classList.contains("on");
    }

    private getClickableSwitchElement(pinNumber: number) {
      return this.element.querySelector(
        `#${getWireIdName(
          pinNumber,
          SWITCH_GROUP_CLASS_NAME
        )} .${CLICKABLE_SWITCH_CLASS_NAME}`
      );
    }

    private setSwitchIsConnected(pinNumber: number, isConnected: boolean) {
      const clickableSwitchEl = this.getClickableSwitchElement(pinNumber);
      clickableSwitchEl.setAttribute(
        "d",
        getDrawValueForSwitch(pinNumber, isConnected)
      );
      if (isConnected) {
        clickableSwitchEl.classList.add("on");
        clickableSwitchEl.classList.remove("off");
      } else {
        clickableSwitchEl.classList.remove("on");
        clickableSwitchEl.classList.add("off");
      }
    }

    private getToggleValue(pinNumber: number, groupClassName: string) {
      const pinToggleValue = this.toggleState[pinNumber];
      // TODO: Rewrite this to not rely on groupClassName, this is super ugly and hacky
      if (groupClassName === LIGHT_GROUP_CLASS_NAME) {
        switch (pinToggleValue) {
          case ToggleStateValues.HasSwitch:
            return ToggleValue.OffAndDisabled;
          case ToggleStateValues.HasLight:
            return ToggleValue.On;
          case ToggleStateValues.HasNothing:
            return ToggleValue.OffAndEnabled;
        }
      } else if (groupClassName === SWITCH_GROUP_CLASS_NAME) {
        switch (pinToggleValue) {
          case ToggleStateValues.HasSwitch:
            return ToggleValue.On;
          case ToggleStateValues.HasLight:
            return ToggleValue.OffAndDisabled;
          case ToggleStateValues.HasNothing:
            return ToggleValue.OffAndEnabled;
        }
      } else {
        throw `unexpected class name: ${groupClassName}`;
      }
    }

    private setToggleValue(
      pinNumber: number,
      groupClassName: string,
      pinToggleValue: ToggleValue,
      saveToLocalStorage = true
    ) {
      // TODO: Rewrite this whole function, this is super ugly and hacky

      const toggleGroup = this.element.querySelector(
        `#${getToggleIdName(pinNumber, groupClassName)}`
      );
      switch (pinToggleValue) {
        case ToggleValue.On:
          toggleGroup.classList.add("on");
          toggleGroup.classList.remove("disabled", "off");
          break;
        case ToggleValue.OffAndEnabled:
          toggleGroup.classList.add("off");
          toggleGroup.classList.remove("disabled", "on");
          break;
        case ToggleValue.OffAndDisabled:
          toggleGroup.classList.add("disabled");
          toggleGroup.classList.remove("off", "on");
      }

      if (groupClassName === LIGHT_GROUP_CLASS_NAME) {
        switch (pinToggleValue) {
          case ToggleValue.On:
            this.toggleState[pinNumber] = ToggleStateValues.HasLight;
            break;
          case ToggleValue.OffAndEnabled:
            this.toggleState[pinNumber] = ToggleStateValues.HasNothing;
            break;
          case ToggleValue.OffAndDisabled:
            this.toggleState[pinNumber] = ToggleStateValues.HasSwitch;
            break;
        }
      } else if (groupClassName === SWITCH_GROUP_CLASS_NAME) {
        switch (pinToggleValue) {
          case ToggleValue.On:
            this.toggleState[pinNumber] = ToggleStateValues.HasSwitch;
            break;
          case ToggleValue.OffAndEnabled:
            this.toggleState[pinNumber] = ToggleStateValues.HasNothing;
            break;
          case ToggleValue.OffAndDisabled:
            this.toggleState[pinNumber] = ToggleStateValues.HasLight;
            break;
        }
      } else {
        throw `unexpected class name: ${groupClassName}`;
      }
      if (saveToLocalStorage) {
        this.saveToggleState();
      }
    }

    public moveToCoord(xy: Coord): void {
      let [x, y] = xy;
      let loc: Coord = [x, y];
      this.lastLocation = loc;
      this.updateClipLoc();
    }

    private updateClipLoc() {
      // Hardcode the value for now:
      svg.hydrate(this.part.el, {
        transform: `translate(${CLIP_X} ${CLIP_Y})`,
      });
    }

    public updateState(): void {
      for (let i = 0; i < NUMBER_OF_USABLE_GPIO_PINS; i++) {
        const pinLoaded = this.element.querySelector(`#pin${i}`);
        if (!pinLoaded) {
          return;
        }
        const pin = this.getPinFromIndexNumber(i);
        this.resetPin(i);

        if (pin.isExternalVoltageApplied) {
          this.updateDigitalDisplayWithValue(i, true);
          continue;
        }

        const isAnalog = pin.lastWriteMode === WriteMode.Analog;
        const isDigital = pin.lastWriteMode === WriteMode.Digital;
        if (isAnalog) {
          this.setAnalogDisplay(i);
        } else if (isDigital) {
          this.setDigitalDisplay(i);
        }
      }
    }

    private resetPin(index: number) {
      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(
        `#pin${index} circle.level`
      );
      pinLedFillEl.setAttribute("fill", "transparent");
      pinFillEl.setAttribute("height", `${RECT_HEIGHT}`);
      pinFillEl.setAttribute("y", `${RECT_Y}`);
      pinFillEl.setAttribute("fill", "transparent");
      pinLedFillEl.removeAttribute("stroke");
      pinLedFillEl.removeAttribute("filter");
    }

    private setDigitalDisplay(index: number) {
      const pin = this.getPinFromIndexNumber(index);
      const isOn = pin.value > 0;
      this.updateDigitalDisplayWithValue(index, isOn);
    }

    private updateDigitalDisplayWithValue(index: number, isOn: boolean) {
      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(
        `#pin${index} circle.level`
      );
      const lightEl = this.element.querySelector(
        `#${getLightIdName(index)} .triangle-light`
      );

      if (isOn) {
        pinFillEl.setAttribute("fill", CHIBI_NEON_GREEN_COLOR); //chibineongreen
        this.setLedOn(pinLedFillEl, 100);
        if (lightEl) {
          this.setLedOn(lightEl, 100);
        }
      } else {
        pinFillEl.setAttribute("fill", "transparent");
        this.setLedOff(pinLedFillEl);
        if (lightEl) {
          this.setLedOff(lightEl);
        }
      }
    }

    private setAnalogDisplay(index: number) {
      const pin = this.getPinFromIndexNumber(index);
      const percentFraction = pin.value / ANALOG_PIN_MAX_VALUE;

      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(
        `#pin${index} circle.level`
      );
      const lightEl = this.element.querySelector(
        `#${getLightIdName(index)} .triangle-light`
      );

      const fillHeight = RECT_HEIGHT * percentFraction;
      pinFillEl.setAttribute("fill", CHIBI_NEON_GREEN_COLOR); //chibineongreen
      pinFillEl.setAttribute("height", `${fillHeight}`);
      pinFillEl.setAttribute("y", `${RECT_Y + (RECT_HEIGHT - fillHeight)}`);

      const alpha = percentFraction;
      this.setLedOn(pinLedFillEl, alpha);
      if (lightEl) {
        this.setLedOn(lightEl, alpha);
      }
    }

    private setLedOn(element: Element, alpha: number) {
      element.setAttribute("fill", `rgba(255, 255, 255, ${alpha})`);
      element.setAttribute("stroke", `rgb(235, 235, 235, ${alpha})`);
      element.setAttribute("stroke-width", "3");
      element.setAttribute("stroke-miterlimit", "10");
      element.setAttribute("filter", 'url("#ledGlow")'); //chibiglow
    }

    private setLedOff(element: Element) {
      element.setAttribute("fill", "transparent");
      element.removeAttribute("filter");
      element.removeAttribute("stroke");
    }

    public updateTheme(): void {}

    private getPinFromIndexNumber(pinNumber: number): Pin {
      // NOTE!!!!!
      // The Chibi Clip pin mappings are:
      // 0 - Pin 0
      // 1 - Pin 1
      // 2 - Pin 2
      // 3 - Pin 13
      // 4 - Pin 14
      // 5 - Pin 15
      // This must maps the equivalent code in core/chibipclip.ts
      // TODO: make this more robust
      switch (pinNumber) {
        case 0:
          return this.state.pins[0];
        case 1:
          return this.state.pins[1];
        case 2:
          return this.state.pins[2];
        case 3:
          return this.state.pins[13];
        case 4:
          return this.state.pins[14];
        case 5:
          return this.state.pins[15];
        default:
          throw `not a valid index: ${pinNumber}`;
      }
    }
  }
}
