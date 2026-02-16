export type FixedStepCallbacks = {
  update: (dt: number) => void;
  render: () => void;
};

export class FixedLoop {
  private readonly dt = 1 / 120;
  private readonly maxSubSteps = 8;
  private acc = 0;
  private last = 0;
  private raf = 0;

  constructor(private readonly cb: FixedStepCallbacks) {}

  start(): void {
    this.last = performance.now();
    const tick = (t: number) => {
      const frame = Math.min(0.05, (t - this.last) / 1000);
      this.last = t;
      this.acc += frame;
      let steps = 0;
      while (this.acc >= this.dt && steps < this.maxSubSteps) {
        this.cb.update(this.dt);
        this.acc -= this.dt;
        steps += 1;
      }
      this.cb.render();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
  }
}
