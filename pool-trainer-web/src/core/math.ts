export type Vec2 = { x: number; y: number };

export const vec = (x = 0, y = 0): Vec2 => ({ x, y });

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const lenSq = (a: Vec2): number => dot(a, a);
export const len = (a: Vec2): number => Math.sqrt(lenSq(a));
export const norm = (a: Vec2): Vec2 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : vec(0, 0);
};
export const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
export const perp = (a: Vec2): Vec2 => ({ x: -a.y, y: a.x });
export const reflect = (dir: Vec2, normal: Vec2): Vec2 => sub(dir, mul(normal, 2 * dot(dir, normal)));
export const distance = (a: Vec2, b: Vec2): number => len(sub(a, b));

export const angleDegBetween = (a: Vec2, b: Vec2): number => {
  const d = clamp(dot(norm(a), norm(b)), -1, 1);
  return (Math.acos(d) * 180) / Math.PI;
};
