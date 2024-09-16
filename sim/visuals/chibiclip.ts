
namespace pxsim.visuals {
    const PIXEL_RADIUS = PIN_DIST;

    // For the instructions parts list
    export function mkChibiClipPart(xy: Coord = [0, 0]): SVGElAndSize {
        const chibiClip = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="100">
<g>
  <rect width="420" height="100" rx="5" fill="lightblue"/>
  <g id="pin0">
      <circle cx="30" cy="50" r="10" fill="grey"/>
      <rect width="20" height="20" x="20" y="80" fill="gold"/>
  </g>
  <g id="pin1">
      <circle cx="70" cy="50" r="10" fill="grey"/>
      <rect  x="60" y="80" width="20" height="20" fill="gold"/>
  </g>
  <g id="pin2">
      <circle cx="110" cy="50" r="10" fill="grey"/>
      <rect  x="100" y="80" width="20" height="20" fill="gold"/>
  </g>
  <g id="pin3">
      <circle cx="150" cy="50" r="10" fill="grey"/>
      <rect width="20" height="20" x="140" y="80" fill="gold"/>
  </g>
  <g id="pin4">
      <circle cx="190" cy="50" r="10" fill="grey"/>
      <rect width="20" height="20" x="180" y="80" fill="gold"/>
  </g>
  <g id="pin5">
      <circle cx="230" cy="50" r="10" fill="grey"/>
      <rect x="220" y="80" width="20" height="20" fill="gold"/>
  </g>
  <g id="pin6">
      <circle cx="270" cy="50" r="10" fill="grey"/>
      <rect x="260" y="80" width="20" height="20" fill="gold"/>
  </g>
  <g id="pin7">
      <circle cx="310" cy="50" r="10" fill="grey"/>
      <rect x="300" y="80" width="20" height="20" fill="gold"/>
  </g>
  <g id="pin8">
      <circle cx="350" cy="50" r="10" fill="grey"/>
      <rect x="340" y="80" width="20" height="20" fill="gold"/>
  </g>
  <g id="pin9">
      <circle cx="390" cy="50" r="10" fill="grey"/>
      <rect x="380" y="80" width="20" height="20" fill="gold"/>
  </g>
</g>
</svg>`;
        let [x, y] = xy;
        let l = x;
        let t = y;
        let w = 420;
        let h = 100;
        const el = svg.parseString(chibiClip).firstElementChild as SVGGElement;
        return { el, x: l, y: t, w: w, h: h };
    }
    export class ChibiClipView implements IBoardPart<EdgeConnectorState> {
        public style: string = `
            .sim-neopixel-strip {
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
            console.log('ChibiClipView constructed');
        }

        public init(bus: EventBus,
            state: EdgeConnectorState,
            svgEl: SVGSVGElement,
            otherParams: Map<string>): void {
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
            svg.hydrate(this.part.el, { transform: `translate(26 280)` });
        }

        public updateState(): void {
            for (let i = 0; i < 10; i++) {
                console.log('update state here', this.state.pins[i].value);

                const pinEl = this.element.querySelector(`#pin${i} rect`);
                const pinLedEl = this.element.querySelector(`#pin${i} circle`);
                if (!pinEl || !pinLedEl) {
                    continue;
                }
                if (this.state.pins[i].value > 1000) {
                    pinEl.setAttribute('fill', 'red');
                    pinLedEl.setAttribute('fill', 'yellow');
                } else {
                    pinEl.setAttribute('fill', 'gold');
                    pinLedEl.setAttribute('fill', 'gray');
                }
            }
        }
        public updateTheme(): void { }
    }
}