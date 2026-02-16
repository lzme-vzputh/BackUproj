import { add, dot, len, mul, norm, reflect, sub, vec, type Vec2 } from '../core/math';
import { BALL_R, BALL_RESTITUTION, RAIL_RESTITUTION, SPIN_RAIL, type Ball, type Table } from '../game/state';

export const resolveBallBall = (a: Ball, b: Ball): { collided: boolean; normal: Vec2 } => {
  const delta = sub(b.pos, a.pos);
  const dist = len(delta);
  const minDist = BALL_R * 2;
  if (dist <= 0 || dist >= minDist) return { collided: false, normal: vec() };

  const n = norm(delta);
  const overlap = minDist - dist;
  a.pos = add(a.pos, mul(n, -overlap / 2));
  b.pos = add(b.pos, mul(n, overlap / 2));

  const relVel = sub(b.vel, a.vel);
  const relN = dot(relVel, n);
  if (relN >= 0) return { collided: true, normal: n };

  // Equal masses, elastic impulse along collision normal.
  const j = -((1 + BALL_RESTITUTION) * relN) / 2;
  a.vel = add(a.vel, mul(n, -j));
  b.vel = add(b.vel, mul(n, j));
  return { collided: true, normal: n };
};

export const resolveRail = (ball: Ball, table: Table, spinX: number): Vec2 | null => {
  if (ball.pocketed) return null;
  let n: Vec2 | null = null;
  if (ball.pos.x - BALL_R < table.left) {
    ball.pos.x = table.left + BALL_R;
    n = vec(1, 0);
  } else if (ball.pos.x + BALL_R > table.right) {
    ball.pos.x = table.right - BALL_R;
    n = vec(-1, 0);
  }

  if (ball.pos.y - BALL_R < table.top) {
    ball.pos.y = table.top + BALL_R;
    n = vec(0, 1);
  } else if (ball.pos.y + BALL_R > table.bottom) {
    ball.pos.y = table.bottom - BALL_R;
    n = vec(0, -1);
  }

  if (!n) return null;

  let dir = reflect(ball.vel, n);
  dir = mul(dir, RAIL_RESTITUTION);
  const tangent = vec(-n.y, n.x);
  dir = add(dir, mul(tangent, spinX * SPIN_RAIL * 60));
  ball.vel = dir;
  return n;
};
