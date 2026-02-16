export class Rng {
  private state: number;

  constructor(seed = 123456789) {
    this.state = seed >>> 0;
  }

  next(): number {
    // xorshift32 for deterministic drill generation
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 0xffffffff;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
}
