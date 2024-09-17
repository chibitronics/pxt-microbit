const CLIP_WIDTH = 420;
const CLIP_HEIGHT = 120;

const NUM_PINS = 6;

const ITEM_WIDTH = 30;
const GAP = 40;
const SPACING = ITEM_WIDTH + GAP;
const ALL_ITEMS_WIDTH = NUM_PINS * ITEM_WIDTH + GAP * (NUM_PINS - 1);
const X_OFFSET = (CLIP_WIDTH - ALL_ITEMS_WIDTH) / 2;
console.log('x offset', X_OFFSET);

const RECT_WIDTH = ITEM_WIDTH;
const RECT_HEIGHT = 50;
const RECT_Y = 70;
const RECT_X_OFFSET = X_OFFSET;
const RECT_X_DISTANCE = SPACING;
const RECT_DEFAULT_FILL = 'gold';

const CIRCLE_RADIUS = ITEM_WIDTH / 2;
const CIRCLE_DEFAULT_FILL = 'gray';
const CIRCLE_Y = 40;
const CIRCLE_X_OFFSET = X_OFFSET + CIRCLE_RADIUS;
const CIRCLE_X_DISTANCE = SPACING;

const TEXT_Y = 140;
const TEXT_X_OFFSET = X_OFFSET;
const TEXT_X_DISTANCE = SPACING;


namespace pxsim.visuals {
  function createSvgElement(tagName: string) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }

  function generateSvg(): SVGAElement {
    const root = svg.parseString(`<svg xmlns="http://www.w3.org/2000/svg" width="${CLIP_WIDTH}" height="${CLIP_HEIGHT}"></svg>`);
    const group = createSvgElement('g');
    root.append(group);

    // Add clip element
    const clipElement = createSvgElement('rect');
    clipElement.setAttribute('width', `${CLIP_WIDTH}`); 
    clipElement.setAttribute('height', `${CLIP_HEIGHT}`); 
    clipElement.setAttribute('fill', `lightblue`); 
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
      defaultCircle.classList.add('level');
      defaultCircle.setAttribute('cx', `${CIRCLE_X_OFFSET + CIRCLE_X_DISTANCE * i}`);
      defaultCircle.setAttribute('cy', `${CIRCLE_Y}`);
      defaultCircle.setAttribute('r', `${CIRCLE_RADIUS}`);
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
      pinGroup.append(levelRect);

      const labelText = createSvgElement('text');
      labelText.classList.add('label');
      labelText.setAttribute('x', `${TEXT_X_OFFSET + TEXT_X_DISTANCE * i}`);
      labelText.setAttribute('y', `${TEXT_Y}`);
      labelText.setAttribute('textAnchor', 'middle');
      labelText.innerHTML = 'OFF';
      pinGroup.append(labelText);
    }

    return root.firstElementChild as SVGAElement;
  }

  // For the instructions parts list
  export function mkChibiClipPart(xy: Coord = [0, 0]): SVGElAndSize {
    const chibiClip = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="100">
<g>
  <rect width="420" height="120" rx="5" fill="lightblue"/>
  <g id="pin0">
      <circle class="default" cx="30" cy="50" r="10" fill="grey"/>
      <circle class="level" cx="30" cy="50" r="10"/>
      <rect class="default" width="20" height="${RECT_HEIGHT}" x="20" y="${RECT_Y}" fill="gold"/>
      <rect class="level" width="20" height="0" x="20" y="${RECT_Y}" fill="green"/>
      <text class="label" x="20" y="125" textAnchor="middle">ON</text>
  </g>
  <g id="pin1">
      <circle cx="70" cy="50" r="10" fill="grey"/>
      <rect x="60" y="${RECT_Y}" width="20" height=""${RECT_HEIGHT}" fill="gold"/>
  </g>
  <g id="pin2">
      <circle cx="110" cy="50" r="10" fill="grey"/>
      <rect  x="100" y="${RECT_Y}" width="20" height="${RECT_HEIGHT}" fill="gold"/>
  </g>
  <g id="pin3">
      <circle cx="150" cy="50" r="10" fill="grey"/>
      <rect width="20" height="${RECT_HEIGHT}" x="140" y="${RECT_Y}" fill="gold"/>
  </g>
  <g id="pin4">
      <circle cx="190" cy="50" r="10" fill="grey"/>
      <rect width="20" height="${RECT_HEIGHT}" x="180" y="${RECT_Y}" fill="gold"/>
  </g>
  <g id="pin5">
      <circle cx="230" cy="50" r="10" fill="grey"/>
      <rect x="220" y="${RECT_Y}" width="20" height="${RECT_HEIGHT}" fill="gold"/>
  </g>
</g>
</svg>`;
    let [x, y] = xy;
    let l = x;
    let t = y;
    let w = 420;
    let h = 100;
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
      svg.hydrate(this.part.el, { transform: `translate(38 220)` });
    }

    public updateState(): void {
      for (let i = 0; i < 10; i++) {
        const pinLoaded = this.element.querySelector(`#pin${i}`);
        if (!pinLoaded) {
          return;
        }
        const pin = this.state.pins[i];

        const isAnalog = (pin.mode & PinFlags.Analog) !== 0;
        const isDigital = (pin.mode & PinFlags.Digital) !== 0;
        if (isAnalog) {
          this.setAnalogDisplay(i);
        } else if (isDigital) {
          this.setDigitalDisplay(i);
        } else {
          this.resetPin(i);
        }
      }
    }

    private resetPin(index: number) {
      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(`#pin${index} circle.level`);
      const pinLabelEl = this.element.querySelector(`#pin${index} text.label`);

      // pinLedFillEl.setAttribute("fill", "");
      // pinFillEl.setAttribute("height", "0")
      // pinFillEl.setAttribute("y", `${RECT_Y}`);
      // pinLabelEl.innerHTML = "";
    }

    private setDigitalDisplay(index: number) {
      const pin = this.state.pins[index];
      U.assert((pin.mode & PinFlags.Digital) !== 0);
      const value = pin.value > 0 ? "0%" : "100%";

      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(`#pin${index} circle.level`);
      const pinLabelEl = this.element.querySelector(`#pin${index} text.label`);

      pinFillEl.setAttribute("fill", "green");
      pinFillEl.setAttribute("height", `${RECT_HEIGHT}`);
      pinFillEl.setAttribute("y", `${RECT_Y - RECT_HEIGHT}`);

      pinLedFillEl.setAttribute("fill", "red");
      
      pinLabelEl.innerHTML = value;
    }

    private setAnalogDisplay(index: number) {
      const pin = this.state.pins[index];
      U.assert((pin.mode & PinFlags.Analog) !== 0);
      const value = Math.round(100 - (pin.value || 0) / 255 * 100) + "%";

      const pinFillEl = this.element.querySelector(`#pin${index} rect.level`);
      const pinLedFillEl = this.element.querySelector(`#pin${index} circle.level`);
      const pinLabelEl = this.element.querySelector(`#pin${index} text.label`);
      
      pinLabelEl.innerHTML = value;
    }

    public updateTheme(): void {}
  }
}
