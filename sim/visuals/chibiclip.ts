const ANALOG_PIN_MAX_VALUE = 1023;

const CLIP_X = 38;
const CLIP_Y = 220;
// const CLIP_Y = 220 + 120; // for testing (lets us see the underlying pins)

const CLIP_WIDTH = 420;
const CLIP_HEIGHT = 120;

const NUMBER_OF_GPIO_PINS = 6;
const TOTAL_NUMBER_OF_PINS = NUMBER_OF_GPIO_PINS + 2; // GPIO + power + ground

const ITEM_WIDTH = 30;
const GAP = 20;
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

const TEXT_Y = 140;
const TEXT_X_OFFSET = X_OFFSET;
const TEXT_X_DISTANCE = SPACING;

const WIRE_WIDTH = 20;
const WIRE_DISTANCE = 120;
const SWITCH_DISTANCE = 50;
const SWITCH_GAP = 40;
const WIRE_COLOR = "gray";
const GAP_OFF_COLOR = "transparent";
const GAP_ON_COLOR = WIRE_COLOR;

const SWITCH_TOGGLES_Y = CLIP_HEIGHT + WIRE_DISTANCE + WIRE_WIDTH + 40;
const SWITCH_TOGGLES_GAP = 20;
const SWITCH_TOGGLE_HEIGHT = RECT_HEIGHT;
const SWITCH_TOGGLE_WIDTH = RECT_WIDTH;
const SWITCH_OFF_COLOR = "gainsboro";
const SWITCH_ON_COLOR = "green";

const LED_TOGGLES_Y = SWITCH_TOGGLES_Y

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

    // Add gpio pins
    for (let i = 0; i < NUMBER_OF_GPIO_PINS; i++) {
      const pinGroup = createSvgElement("g");
      pinGroup.setAttribute("id", `pin${i}`);
      group.append(pinGroup);

      const defaultCircle = createLightCircle(
        i,
        "default",
        CIRCLE_DEFAULT_FILL
      );
      pinGroup.append(defaultCircle);

      const levelCircle = createLightCircle(i, "level", "transparent");
      pinGroup.append(levelCircle);

      const defaultRect = createPinRectangle(i, "default", RECT_DEFAULT_FILL);
      pinGroup.append(defaultRect);

      const levelRect = createPinRectangle(i, "level", "transparent");
      pinGroup.append(levelRect);

      const labelText = createSvgElement("text");
      labelText.classList.add("label");
      labelText.setAttribute("x", `${TEXT_X_OFFSET + TEXT_X_DISTANCE * i}`);
      labelText.setAttribute("y", `${TEXT_Y}`);
      labelText.setAttribute("textAnchor", "middle");
      // labelText.innerHTML = 'OFF';
      pinGroup.append(labelText);
    }

    // Add voltage pin
    const powerPin = createPinRectangle(
      TOTAL_NUMBER_OF_PINS - 2,
      "power",
      RECT_DEFAULT_FILL
    );
    group.append(powerPin);

    const groundPin = createPinRectangle(
      TOTAL_NUMBER_OF_PINS - 1,
      "ground",
      RECT_DEFAULT_FILL
    );
    group.append(groundPin);

    // Add switches (starts invisible)
    for (let i = 0; i < NUMBER_OF_GPIO_PINS; i++) {
      const switchLine = createSwitchFromPinToGround(i);
      group.append(switchLine);
    }

    // Add toggles add/remove switches
    group.append(addSwitchToggles());

    return root.firstElementChild as SVGAElement;
  }

  function createPinRectangle(
    pinIndex: number,
    className: string,
    fillColor: string
  ) {
    const pinRect = createSvgElement("rect");
    pinRect.classList.add(className);
    pinRect.setAttribute("x", `${RECT_X_OFFSET + RECT_X_DISTANCE * pinIndex}`);
    pinRect.setAttribute("y", `${RECT_Y}`);
    pinRect.setAttribute("height", `${RECT_HEIGHT}`);
    pinRect.setAttribute("width", `${RECT_WIDTH}`);
    pinRect.setAttribute("fill", fillColor);
    return pinRect;
  }

  function createLightCircle(
    pinIndex: number,
    className: string,
    fillColor: string
  ) {
    const levelCircle = createSvgElement("circle");
    levelCircle.classList.add(className);
    levelCircle.setAttribute(
      "cx",
      `${CIRCLE_X_OFFSET + CIRCLE_X_DISTANCE * pinIndex}`
    );
    levelCircle.setAttribute("cy", `${CIRCLE_Y}`);
    levelCircle.setAttribute("r", `${CIRCLE_RADIUS}`);
    levelCircle.setAttribute("fill", fillColor);
    return levelCircle;
  }

  function createSwitchFromPinToGround(i: number) {
    const group = createSvgElement("g");
    group.setAttribute("id", `switch${i}`);
    group.classList.add("wire");

    const widthOffset = (RECT_WIDTH - WIRE_WIDTH) / 2;
    const startingX = widthOffset + RECT_X_OFFSET + RECT_X_DISTANCE * i;
    const bottomOfClipY = RECT_Y + RECT_HEIGHT;

    const initialRect = createSvgElement("rect");
    initialRect.setAttribute("x", `${startingX}`);
    initialRect.setAttribute("y", `${bottomOfClipY}`);
    initialRect.setAttribute("height", `${SWITCH_DISTANCE}`);
    initialRect.setAttribute("width", `${WIRE_WIDTH}`);
    initialRect.setAttribute("fill", "gray");
    group.append(initialRect);

    const gapButton = createSvgElement("rect");
    gapButton.setAttribute("x", `${startingX}`);
    gapButton.setAttribute("y", `${bottomOfClipY + SWITCH_DISTANCE}`);
    gapButton.setAttribute("height", `${SWITCH_GAP}`);
    gapButton.setAttribute("width", `${WIRE_WIDTH}`);
    gapButton.setAttribute("fill", GAP_OFF_COLOR);
    gapButton.classList.add("clickableGap");
    gapButton.setAttribute("data-pin-index", `${i}`);
    group.append(gapButton);

    const polygon = createSvgElement("polygon");

    const x1 = startingX;
    const y1 = bottomOfClipY + SWITCH_DISTANCE + SWITCH_GAP;

    const x2 = x1 + WIRE_WIDTH;
    const y2 = y1;

    const x3 = x2;
    const y3 = y2 + (WIRE_DISTANCE - SWITCH_DISTANCE - SWITCH_GAP);

    const groundPinStartingX =
      RECT_X_OFFSET + RECT_X_DISTANCE * (TOTAL_NUMBER_OF_PINS - 1);
    const x4 = groundPinStartingX + widthOffset;
    const y4 = y3;

    const x5 = x4;
    const y5 = bottomOfClipY;

    const x6 = x5 + WIRE_WIDTH;
    const y6 = y5;

    const x7 = x6;
    const y7 = y3 + WIRE_WIDTH;

    const x8 = x1;
    const y8 = y7;

    const points = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4} ${x5},${y5} ${x6},${y6} ${x7},${y7} ${x8},${y8}`;
    polygon.setAttribute("points", points);
    polygon.setAttribute("fill", WIRE_COLOR);
    group.append(polygon);
    return group;
  }

  function addSwitchToggles() {
    const group = createSvgElement("g");
    group.classList.add("all-toggles");

    const labelText = createSvgElement("text");
    labelText.setAttribute("x", "0");
    labelText.setAttribute("y", `${SWITCH_TOGGLES_Y}`);
    labelText.setAttribute("textAnchor", "left");
    labelText.innerHTML = "Add Switch";
    group.append(labelText);

    for (let i = 0; i < NUMBER_OF_GPIO_PINS; i++) {
      const toggle = createSwitchToggle(i);
      group.append(toggle);
    }

    return group;
  }

  function createSwitchToggle(pinIndex: number) {
    const group = createSvgElement("g");
    group.id = `switch-toggle${pinIndex}`;
    group.classList.add("toggle-group");
    const pinRect = createSvgElement("rect");
    pinRect.classList.add("toggle");
    pinRect.setAttribute("data-pin-index", `${pinIndex}`);
    pinRect.setAttribute("x", `${RECT_X_DISTANCE * pinIndex}`);
    pinRect.setAttribute("y", `${SWITCH_TOGGLES_Y + SWITCH_TOGGLES_GAP}`);
    pinRect.setAttribute("height", `${SWITCH_TOGGLE_HEIGHT}`);
    pinRect.setAttribute("width", `${SWITCH_TOGGLE_WIDTH}`);
    pinRect.setAttribute("fill", SWITCH_OFF_COLOR);

    const labelText = createSvgElement("text");
    labelText.setAttribute(
      "x",
      `${RECT_X_DISTANCE * pinIndex + SWITCH_TOGGLE_WIDTH / 2 - 3}`
    );
    labelText.setAttribute(
      "y",
      `${SWITCH_TOGGLES_Y + SWITCH_TOGGLES_GAP + RECT_HEIGHT / 2 + 4}`
    );
    labelText.setAttribute("textAnchor", "middle");
    labelText.innerHTML = `${pinIndex}`;
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
            .sim-chibichip {
            }

            .wire {
              display: none;
            }

            .wire.chibi-visible {
              display: block;
            }
        `;
    public element: SVGElement;
    public overElement: SVGElement;
    public defs: SVGElement[];
    private state: EdgeConnectorState;
    private part: SVGElAndSize;
    private lastLocation: Coord;
    private stripGroup: SVGGElement;

    constructor() {
      console.log("ChibiClipView constructed");
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

      // Add switch event listeners
      const clickableGaps = this.element.querySelectorAll(
        ".wire .clickableGap"
      );
      for (const gap of clickableGaps) {
        gap.addEventListener("click", () => {
          const pinIndex = parseInt(gap.getAttribute("data-pin-index"));
          const pin = this.state.pins[pinIndex];
          if (this.isGapClicked(pinIndex)) {
            this.setGapClicked(pinIndex, false);
            pin.digitalWritePin(0);
          } else {
            this.setGapClicked(pinIndex, true);
            pin.digitalWritePin(1);
          }
        });
      }

      const switchToggles = this.element.querySelectorAll(
        ".all-toggles .toggle-group"
      );
      for (const toggle of switchToggles) {
        toggle.addEventListener("click", () => {
          console.log('clicked toggle');
          const toggleBody = toggle.querySelector(`.toggle`);
          const pinIndex = parseInt(toggleBody.getAttribute("data-pin-index"));
          const pin = this.state.pins[pinIndex];
          if (this.isSwitchLineShowing(pinIndex)) {
            this.setSwitchLineShowing(pinIndex, false);
            if (this.isGapClicked(pinIndex)) {
              this.setGapClicked(pinIndex, false);
              pin.digitalWritePin(0);
            }
          } else {
            this.setSwitchLineShowing(pinIndex, true);
          }
        });
      }
    }

    private isGapClicked(pinIndex: number) {
      const gap = this.element.querySelector(
        `#switch${pinIndex} .clickableGap`
      );
      return gap.getAttribute("fill") === GAP_ON_COLOR;
    }

    private setGapClicked(pinIndex: number, isClicked: boolean) {
      const gap = this.element.querySelector(
        `#switch${pinIndex} .clickableGap`
      );
      if (isClicked) {
        gap.setAttribute("fill", GAP_ON_COLOR);
        
      } else {
        gap.setAttribute("fill", GAP_OFF_COLOR);
      }
    }

    private isSwitchLineShowing(pinIndex: number) {
      const toggleBody = this.element.querySelector(
        `#switch-toggle${pinIndex} .toggle`
      );
      return toggleBody.getAttribute("fill") === SWITCH_ON_COLOR;
    }

    private setSwitchLineShowing(pinIndex: number, isShowing: boolean) {
      const toggleBody = this.element.querySelector(
        `#switch-toggle${pinIndex} .toggle`
      );
      const switchWireEl = this.element.querySelector(`#switch${pinIndex}`);
      if (isShowing) {
        toggleBody.setAttribute("fill", SWITCH_ON_COLOR);
        switchWireEl.classList.add("chibi-visible");
      } else {
        toggleBody.setAttribute("fill", SWITCH_OFF_COLOR);
        switchWireEl.classList.remove("chibi-visible");
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
      for (let i = 0; i < NUMBER_OF_GPIO_PINS; i++) {
        const pinLoaded = this.element.querySelector(`#pin${i}`);
        if (!pinLoaded) {
          return;
        }
        const pin = this.state.pins[i];
        this.resetPin(i);

        const isAnalog = (pin.mode & PinFlags.Analog) !== 0;
        const isDigital = (pin.mode & PinFlags.Digital) !== 0;
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
      const pinLabelEl = this.element.querySelector(`#pin${index} text.label`);

      pinLedFillEl.setAttribute("fill", "transparent");
      pinFillEl.setAttribute("height", `${RECT_HEIGHT}`);
      pinFillEl.setAttribute("y", `${RECT_Y}`);
      pinFillEl.setAttribute("fill", "transparent");
      pinFillEl.removeAttribute("stroke");
      pinFillEl.removeAttribute("filter");
      pinLabelEl.innerHTML = "";
    }

    private setDigitalDisplay(index: number) {
      const pin = this.state.pins[index];
      U.assert((pin.mode & PinFlags.Digital) !== 0);
      const isOn = pin.value > 0;

      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(
        `#pin${index} circle.level`
      );

      if (isOn) {
        pinFillEl.setAttribute("fill", `hsl(112.5, 100%, 67%)`); //chibineongreen
        pinLedFillEl.setAttribute("fill", "rgb(255, 255, 255)");
        pinLedFillEl.setAttribute("stroke", "rgb(235, 235, 235)");
        pinLedFillEl.setAttribute("stroke-width", "3");
        pinLedFillEl.setAttribute("stroke-miterlimit", "10");
        pinLedFillEl.setAttribute("filter", 'url("#ledGlow")'); //chibiglow
      } else {
        pinFillEl.setAttribute("fill", "transparent");
        pinLedFillEl.setAttribute("fill", "transparent");
        pinLedFillEl.removeAttribute("filter");
        pinLedFillEl.removeAttribute("stroke");
      }
    }

    private setAnalogDisplay(index: number) {
      const pin = this.state.pins[index];
      U.assert((pin.mode & PinFlags.Analog) !== 0);
      const percentFraction = pin.value / ANALOG_PIN_MAX_VALUE;
      const percentageValue = Math.round(percentFraction * 100);

      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(
        `#pin${index} circle.level`
      );
      const pinLabelEl = this.element.querySelector(`#pin${index} text.label`);

      const fillHeight = RECT_HEIGHT * percentFraction;
      pinFillEl.setAttribute("fill", "hsl(112.5, 100%, 67%)"); //chibineongreen
      pinFillEl.setAttribute("height", `${fillHeight}`);
      pinFillEl.setAttribute("y", `${RECT_Y + (RECT_HEIGHT - fillHeight)}`);

      pinLabelEl.innerHTML = `${percentageValue}%`;
      const alpha = percentFraction;
      pinLedFillEl.setAttribute("fill", `rgba(255, 255, 255, ${alpha})`);
      pinLedFillEl.setAttribute("stroke", `rgb(235, 235, 235, ${alpha})`);
      pinLedFillEl.setAttribute("stroke-width", "3");
      pinLedFillEl.setAttribute("stroke-miterlimit", "10");
      pinLedFillEl.setAttribute("filter", 'url("#ledGlow")'); //chibiglow
    }

    public updateTheme(): void {}
  }
}
