declare module "vanta/dist/vanta.net.min" {
  interface VantaNetOptions {
    el: HTMLElement | null;
    THREE: unknown;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    backgroundColor?: number;
    points?: number;
    maxDistance?: number;
    spacing?: number;
    showDots?: boolean;
  }

  interface VantaEffect {
    destroy: () => void;
    resize: () => void;
    setOptions: (opts: Partial<VantaNetOptions>) => void;
  }

  const NET: (options: VantaNetOptions) => VantaEffect;
  export default NET;
}
