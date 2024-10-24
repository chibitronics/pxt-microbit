const ANALOG_PIN_MAX_VALUE = 1023;

const CLIP_X = 38;
const CLIP_Y = 220;
// const CLIP_Y = 220 + 120; // for testing (lets us see the underlying pins)

const CLIP_WIDTH = 420;
const CLIP_HEIGHT = 120;

const NUM_PINS = 6;

const ITEM_WIDTH = 30;
const GAP = 35;
const SPACING = ITEM_WIDTH + GAP;
const ALL_ITEMS_WIDTH = NUM_PINS * ITEM_WIDTH + GAP * (NUM_PINS - 1);
const X_OFFSET = (CLIP_WIDTH - ALL_ITEMS_WIDTH) / 2;

const RECT_WIDTH = ITEM_WIDTH;
const RECT_HEIGHT = 50;
const RECT_Y = CLIP_HEIGHT - RECT_HEIGHT;
const RECT_X_OFFSET = X_OFFSET;
const RECT_X_DISTANCE = SPACING;
const RECT_DEFAULT_FILL = 'hsl(185.35, 66%, 54%)'; //chibiblue

const CIRCLE_RECT_GAP = 10;

const CIRCLE_RADIUS = ITEM_WIDTH / 2;
const CIRCLE_DEFAULT_FILL = 'gray';
const CIRCLE_Y = CLIP_HEIGHT - RECT_HEIGHT - CIRCLE_RADIUS * 2 - CIRCLE_RECT_GAP;
const CIRCLE_X_OFFSET = X_OFFSET + CIRCLE_RADIUS;
const CIRCLE_X_DISTANCE = SPACING;

const TEXT_Y = 140;
const TEXT_X_OFFSET = X_OFFSET;
const TEXT_X_DISTANCE = SPACING;


namespace pxsim.visuals {
  function createSvgElement(tagName: string) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }

  function ledGlow() {
    const defsElement = createSvgElement("defs");
    const filterElement = createSvgElement("filter");
    defsElement.append(filterElement);
    filterElement.setAttribute('id', 'ledGlow');
    const feGaussianBlurElement = createSvgElement("feGaussianBlur");
    feGaussianBlurElement.setAttribute("stdDeviation", "4");
    feGaussianBlurElement.setAttribute("result", "coloredBlur");
    filterElement.append(feGaussianBlurElement);
    const feMergeElement = createSvgElement("feMerge");
    filterElement.append(feMergeElement);
    const feMergeNodeElement1 = createSvgElement("feMergeNode");
    feMergeNodeElement1.setAttribute("in", "coloredBlur")
    const feMergeNodeElement2 = createSvgElement("feMergeNode");
    feMergeNodeElement2.setAttribute("in", "coloredBlur")
    const feMergeNodeElement3 = createSvgElement("feMergeNode");
    feMergeNodeElement3.setAttribute("in", "SourceGraphic");
    feMergeElement.append(feMergeNodeElement1);
    feMergeElement.append(feMergeNodeElement2);
    feMergeElement.append(feMergeNodeElement3);
    return defsElement;
  }

  function generateSvg(): SVGAElement {
    const root = svg.parseString(`<svg xmlns="http://www.w3.org/2000/svg" width="${CLIP_WIDTH}" height="${CLIP_HEIGHT}"></svg>`);
    const group = createSvgElement('g');
    const defEl = ledGlow();
    group.append(defEl);
    root.append(group);

    // Add clip element
    const clipElement = createSvgElement('rect');
    clipElement.setAttribute('width', `${CLIP_WIDTH}`);
    clipElement.setAttribute('height', `${CLIP_HEIGHT}`);
    clipElement.setAttribute('fill', 'hsl(44.772, 100%, 61%)');//chibiyellow
    group.append(clipElement);

    // Add pins
    for (let i = 0; i < NUM_PINS; i++) {
      const pinGroup = createSvgElement('g');
      pinGroup.setAttribute('id', `pin${i}`);
      group.append(pinGroup);

      const defaultCircle = createSvgElement('circle');
      defaultCircle.classList.add('default');
      defaultCircle.setAttribute('cx', `${CIRCLE_X_OFFSET + CIRCLE_X_DISTANCE * i}`);
      defaultCircle.setAttribute('cy', `${CIRCLE_Y}`);
      defaultCircle.setAttribute('r', `${CIRCLE_RADIUS}`);
      defaultCircle.setAttribute('fill', CIRCLE_DEFAULT_FILL);
      pinGroup.append(defaultCircle);

      const levelCircle = createSvgElement('circle');
      levelCircle.classList.add('level');
      levelCircle.setAttribute('cx', `${CIRCLE_X_OFFSET + CIRCLE_X_DISTANCE * i}`);
      levelCircle.setAttribute('cy', `${CIRCLE_Y}`);
      levelCircle.setAttribute('r', `${CIRCLE_RADIUS}`);
      levelCircle.setAttribute('fill', 'transparent');
      pinGroup.append(levelCircle);

      const defaultRect = createSvgElement('rect');
      defaultRect.classList.add('default');
      defaultRect.setAttribute('x', `${RECT_X_OFFSET + RECT_X_DISTANCE * i}`);
      defaultRect.setAttribute('y', `${RECT_Y}`);
      defaultRect.setAttribute('height', `${RECT_HEIGHT}`);
      defaultRect.setAttribute('width', `${RECT_WIDTH}`);
      defaultRect.setAttribute('fill', RECT_DEFAULT_FILL);
      pinGroup.append(defaultRect);

      const levelRect = createSvgElement('rect');
      levelRect.classList.add('level');
      levelRect.setAttribute('x', `${RECT_X_OFFSET + RECT_X_DISTANCE * i}`);
      levelRect.setAttribute('y', `${RECT_Y}`);
      levelRect.setAttribute('height', `${RECT_HEIGHT}`);
      levelRect.setAttribute('width', `${RECT_WIDTH}`);
      levelRect.setAttribute('fill', 'transparent');
      pinGroup.append(levelRect);

      const labelText = createSvgElement('text');
      labelText.classList.add('label');
      labelText.setAttribute('x', `${TEXT_X_OFFSET + TEXT_X_DISTANCE * i}`);
      labelText.setAttribute('y', `${TEXT_Y}`);
      labelText.setAttribute('textAnchor', 'middle');
      // labelText.innerHTML = 'OFF';
      pinGroup.append(labelText);
    }

    return root.firstElementChild as SVGAElement;
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
    }

    public moveToCoord(xy: Coord): void {
      let [x, y] = xy;
      let loc: Coord = [x, y];
      this.lastLocation = loc;
      this.updateClipLoc();
    }

    private updateClipLoc() {
      // Hardcode the value for now:
      svg.hydrate(this.part.el, { transform: `translate(${CLIP_X} ${CLIP_Y})` });
    }

    public updateState(): void {
      for (let i = 0; i < 10; i++) {
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
      const pinLedFillEl = this.element.querySelector(`#pin${index} circle.level`);
      const pinLabelEl = this.element.querySelector(`#pin${index} text.label`);

      pinLedFillEl.setAttribute("fill", "transparent");
      pinFillEl.setAttribute("height", `${RECT_HEIGHT}`);
      pinFillEl.setAttribute("y", `${RECT_Y}`);
      pinFillEl.setAttribute("fill", "transparent");
      pinLabelEl.innerHTML = "";
    }

    private setDigitalDisplay(index: number) {
      const pin = this.state.pins[index];
      U.assert((pin.mode & PinFlags.Digital) !== 0);
      const isOn = pin.value > 0;

      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(`#pin${index} circle.level`);
      const pinLabelEl = this.element.querySelector(`#pin${index} text.label`);

      if (isOn) {
        pinFillEl.setAttribute("fill", `hsl(112.5, 100%, 67%)`);//chibineongreen
        pinLedFillEl.setAttribute("fill", 'rgb(255, 255, 255)');
        pinLedFillEl.setAttribute("stroke", 'rgb(235, 235, 235)');
        pinLedFillEl.setAttribute("stroke-width", '3');
        pinLedFillEl.setAttribute("stroke-miterlimit", '10');
        pinLedFillEl.setAttribute("filter", 'url("#ledGlow")');//chibiglow
      } else {
        pinFillEl.setAttribute("fill", 'transparent');
        pinLedFillEl.setAttribute("fill", "transparent");
      }
      pinLabelEl.innerHTML = isOn ? "ON" : "OFF";
    }

    private setAnalogDisplay(index: number) {
      const pin = this.state.pins[index];
      U.assert((pin.mode & PinFlags.Analog) !== 0);
      const percentFraction = (pin.value / ANALOG_PIN_MAX_VALUE);
      const percentageValue = Math.round(percentFraction * 100);

      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(`#pin${index} circle.level`);
      const pinLabelEl = this.element.querySelector(`#pin${index} text.label`);

      const fillHeight = RECT_HEIGHT * percentFraction
      pinFillEl.setAttribute('fill', 'hsl(112.5, 100%, 67%)'); //chibineongreen
      pinFillEl.setAttribute('height', `${fillHeight}`);
      pinFillEl.setAttribute('y', `${RECT_Y + (RECT_HEIGHT - fillHeight)}`);

      pinLabelEl.innerHTML = `${percentageValue}%`;
      const alpha = percentFraction;
      pinLedFillEl.setAttribute('fill', `rgba(255, 255, 255, ${alpha})`)
      pinLedFillEl.setAttribute("stroke", `rgb(235, 235, 235, ${alpha})`);
      pinLedFillEl.setAttribute("stroke-width", '3');
      pinLedFillEl.setAttribute("stroke-miterlimit", '10');
      pinLedFillEl.setAttribute("filter", 'url("#ledGlow")');//chibiglow
    }

    public updateTheme(): void {}
  }
}
