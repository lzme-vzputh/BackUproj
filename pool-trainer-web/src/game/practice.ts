import { vec } from '../core/math';
import { Rng } from '../core/rng';
import { defaultLayout } from '../data/layout';
import { clampBallsInside, resetVelocities } from '../physics/solver';
import type { DrillType, GameState } from './state';

const rng = new Rng(424242);

export const createInitialState = (): GameState => ({
  balls: defaultLayout(),
  cueBallId: 0,
  table: {
    left: 100,
    right: 1000,
    top: 100,
    bottom: 600,
    pockets: []
  },
  aiming: false,
  aimPoint: vec(850, 350),
  power: 55,
  spin: vec(),
  guideMode: 'basic',
  ghostBall: true,
  showSolution: false,
  drill: 'free',
  runningShot: false,
  shotNumber: 0,
  prediction: { cuePath: [], objectPath: [], cueDeflectPath: [] },
  history: []
});

export const setDrill = (state: GameState, drill: DrillType): void => {
  state.drill = drill;
  randomizeDrill(state);
};

export const randomizeDrill = (state: GameState): void => {
  state.balls = defaultLayout();
  resetVelocities(state);
  state.feedback = undefined;
  state.pendingShotSample = undefined;
  state.targetCircle = undefined;

  if (state.drill === 'free') {
    clampBallsInside(state);
    return;
  }

  const cue = state.balls[0];
  cue.pos = vec(rng.range(230, 360), rng.range(230, 470));

  if (state.drill === 'cut') {
    const obj = state.balls[1];
    obj.pos = vec(rng.range(650, 840), rng.range(180, 520));
  } else if (state.drill === 'bank') {
    const obj = state.balls[1];
    obj.pos = vec(rng.range(500, 680), rng.range(200, 500));
    state.aimPoint = vec(state.table.right - 20, rng.range(state.table.top + 40, state.table.bottom - 40));
  } else if (state.drill === 'position') {
    const obj = state.balls[1];
    obj.pos = vec(rng.range(680, 820), rng.range(200, 500));
    state.targetCircle = { center: vec(rng.range(420, 580), rng.range(240, 460)), radius: 34 };
  }

  clampBallsInside(state);
};

export const resetShot = (state: GameState): void => {
  for (const b of state.balls) {
    b.pocketed = false;
    b.vel = vec();
    b.sleepTimer = 0;
  }
  state.feedback = undefined;
  state.pendingShotSample = undefined;
};
