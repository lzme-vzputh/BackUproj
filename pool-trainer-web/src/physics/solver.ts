import { distance, len, mul, norm, vec } from '../core/math';
import { BALL_R, FRICTION, POCKET_R, SPEED_EPS, SPIN_FOLLOW, SLEEP_TIME, type GameState } from '../game/state';
import { resolveBallBall, resolveRail } from './collision';

export const strikeCue = (state: GameState, aimDir: { x: number; y: number }): void => {
  const cue = state.balls.find((b) => b.id === state.cueBallId);
  if (!cue || cue.pocketed) return;
  cue.vel = mul(norm(aimDir), (state.power / 100) * 760);
  state.runningShot = true;
  state.feedback = undefined;
  state.pendingShotSample = {
    firstContactBallId: null,
    pocketed: new Set<number>(),
    scratch: false
  };
};

export const stepPhysics = (state: GameState, dt: number): void => {
  const liveBalls = state.balls.filter((b) => !b.pocketed);
  for (const b of liveBalls) {
    b.pos.x += b.vel.x * dt;
    b.pos.y += b.vel.y * dt;
  }

  const cue = state.balls.find((b) => b.id === state.cueBallId);

  for (let i = 0; i < liveBalls.length; i += 1) {
    for (let j = i + 1; j < liveBalls.length; j += 1) {
      const a = liveBalls[i];
      const b = liveBalls[j];
      const result = resolveBallBall(a, b);
      if (!result.collided) continue;
      if (!state.pendingShotSample) continue;
      if (state.pendingShotSample.firstContactBallId !== null) continue;
      if (a.id === state.cueBallId || b.id === state.cueBallId) {
        const other = a.id === state.cueBallId ? b : a;
        state.pendingShotSample.firstContactBallId = other.id;
        state.pendingShotSample.firstContactPoint = {
          x: (a.pos.x + b.pos.x) / 2,
          y: (a.pos.y + b.pos.y) / 2
        };
        state.pendingShotSample.firstObjectDir = { ...other.vel };
        if (cue && other.id !== state.cueBallId) {
          cue.vel = {
            x: cue.vel.x + result.normal.x * (state.spin.y * SPIN_FOLLOW),
            y: cue.vel.y + result.normal.y * (state.spin.y * SPIN_FOLLOW)
          };
        }
      }
    }
  }

  for (const b of liveBalls) {
    resolveRail(b, state.table, state.spin.x);
    for (const pocket of state.table.pockets) {
      if (distance(b.pos, pocket) <= POCKET_R) {
        b.pocketed = true;
        b.vel = vec();
        if (state.pendingShotSample) {
          state.pendingShotSample.pocketed.add(b.id);
          if (b.id === state.cueBallId) state.pendingShotSample.scratch = true;
        }
      }
    }
  }

  let moving = false;
  for (const b of liveBalls) {
    const spd = len(b.vel);
    if (spd > 0) {
      b.vel = mul(b.vel, FRICTION);
    }
    if (spd < SPEED_EPS) {
      b.sleepTimer += dt;
      if (b.sleepTimer >= SLEEP_TIME) b.vel = vec();
    } else {
      b.sleepTimer = 0;
    }
    if (len(b.vel) > 0) moving = true;
  }

  if (!moving) {
    state.runningShot = false;
  }
};

export const resetVelocities = (state: GameState): void => {
  for (const b of state.balls) {
    b.vel = vec();
    b.sleepTimer = 0;
  }
  state.runningShot = false;
};

export const clampBallsInside = (state: GameState): void => {
  for (const b of state.balls) {
    b.pos.x = Math.max(state.table.left + BALL_R, Math.min(state.table.right - BALL_R, b.pos.x));
    b.pos.y = Math.max(state.table.top + BALL_R, Math.min(state.table.bottom - BALL_R, b.pos.y));
  }
};
