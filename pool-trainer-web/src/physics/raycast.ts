import { add, clamp, dot, mul, norm, reflect, sub, type Vec2 } from '../core/math';
import { BALL_R, type Ball, type GameState, type Prediction } from '../game/state';

const rayCircle = (origin: Vec2, dir: Vec2, center: Vec2, radius: number): number | null => {
  const oc = sub(origin, center);
  const a = dot(dir, dir);
  const b = 2 * dot(oc, dir);
  const c = dot(oc, oc) - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);
  const eps = 1e-5;
  if (t1 > eps) return t1;
  if (t2 > eps) return t2;
  return null;
};

const firstRailHit = (state: GameState, origin: Vec2, dir: Vec2): { t: number; normal: Vec2 } | null => {
  const tCandidates: Array<{ t: number; normal: Vec2 }> = [];
  if (dir.x > 0) tCandidates.push({ t: (state.table.right - BALL_R - origin.x) / dir.x, normal: { x: -1, y: 0 } });
  if (dir.x < 0) tCandidates.push({ t: (state.table.left + BALL_R - origin.x) / dir.x, normal: { x: 1, y: 0 } });
  if (dir.y > 0) tCandidates.push({ t: (state.table.bottom - BALL_R - origin.y) / dir.y, normal: { x: 0, y: -1 } });
  if (dir.y < 0) tCandidates.push({ t: (state.table.top + BALL_R - origin.y) / dir.y, normal: { x: 0, y: 1 } });
  const positive = tCandidates.filter((c) => c.t > 1e-5);
  if (!positive.length) return null;
  positive.sort((a, b) => a.t - b.t);
  return positive[0];
};

export const computePrediction = (state: GameState): Prediction => {
  const cue = state.balls.find((b) => b.id === state.cueBallId);
  if (!cue || cue.pocketed || state.guideMode === 'off') return { cuePath: [], objectPath: [], cueDeflectPath: [] };

  const dir = norm(sub(state.aimPoint, cue.pos));
  if (Math.abs(dir.x) + Math.abs(dir.y) < 1e-6) return { cuePath: [], objectPath: [], cueDeflectPath: [] };

  const others = state.balls.filter((b) => b.id !== cue.id && !b.pocketed);
  let firstBall: Ball | undefined;
  let minT = Number.POSITIVE_INFINITY;
  for (const b of others) {
    const t = rayCircle(cue.pos, dir, b.pos, BALL_R * 2);
    if (t !== null && t < minT) {
      minT = t;
      firstBall = b;
    }
  }

  if (!firstBall || !Number.isFinite(minT)) {
    const rail = firstRailHit(state, cue.pos, dir);
    if (!rail) return { cuePath: [cue.pos], objectPath: [], cueDeflectPath: [] };
    const end = add(cue.pos, mul(dir, rail.t));
    return { cuePath: [cue.pos, end], objectPath: [], cueDeflectPath: [] };
  }

  const hitPoint = add(cue.pos, mul(dir, minT));
  const n = norm(sub(firstBall.pos, hitPoint));
  const ghostPos = sub(firstBall.pos, mul(n, BALL_R * 2));
  const objectDir = n;
  const cueDef = norm(sub(dir, mul(n, dot(dir, n))));

  const objectEnd = add(firstBall.pos, mul(objectDir, 180));
  const cueEnd = add(hitPoint, mul(cueDef, 150));

  const cuePath = [cue.pos, hitPoint];
  if (state.guideMode === 'advanced') {
    let origin = hitPoint;
    let rdir = dir;
    for (let i = 0; i < 2; i += 1) {
      const rail = firstRailHit(state, origin, rdir);
      if (!rail) break;
      const p = add(origin, mul(rdir, rail.t));
      cuePath.push(p);
      origin = p;
      rdir = norm(reflect(rdir, rail.normal));
    }
  }

  return {
    collisionPoint: hitPoint,
    firstBallId: firstBall.id,
    cuePath,
    objectPath: [firstBall.pos, objectEnd],
    cueDeflectPath: [hitPoint, cueEnd],
    ghostPos,
    predictedObjectDir: objectDir,
    predictedContactPoint: hitPoint
  };
};

export const suggestedPowerRange = (state: GameState): [number, number] => {
  const d = clamp(Math.hypot(state.aimPoint.x - state.table.left, state.aimPoint.y - state.table.top) / 25, 20, 90);
  return [Math.max(15, d - 10), Math.min(100, d + 10)];
};
