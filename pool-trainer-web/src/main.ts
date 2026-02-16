import { FixedLoop } from './core/loop';
import { distance, vec } from './core/math';
import { randomizeDrill } from './game/practice';
import { finalizeShot } from './game/scoring';
import { BALL_R, makeTable, type GameState } from './game/state';
import { stepPhysics } from './physics/solver';
import { computePrediction, suggestedPowerRange } from './physics/raycast';
import { updateHud } from './render/hud';
import { renderScene } from './render/render';
import { setupUi } from './ui/ui';

const canvas = document.getElementById('table') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('2D canvas not supported');

const state: GameState = {
  balls: [],
  cueBallId: 0,
  table: makeTable(),
  aiming: false,
  aimPoint: vec(750, 350),
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
};

randomizeDrill(state);

const ui = setupUi(document.getElementById('controls') as HTMLElement, state);

let dragBallId: number | null = null;
canvas.addEventListener('pointerdown', (e) => {
  const p = pointerPos(e);
  state.aiming = true;
  state.aimPoint = p;
  if (state.drill === 'free' && !state.runningShot) {
    const hit = state.balls.find((b) => !b.pocketed && distance(b.pos, p) <= BALL_R + 2);
    if (hit) dragBallId = hit.id;
  }
});

canvas.addEventListener('pointermove', (e) => {
  const p = pointerPos(e);
  state.aimPoint = p;
  if (dragBallId !== null) {
    const b = state.balls.find((ball) => ball.id === dragBallId);
    if (b) {
      b.pos = p;
      b.pocketed = false;
    }
  }
});

canvas.addEventListener('pointerup', () => {
  state.aiming = false;
  dragBallId = null;
});

const pointerPos = (e: PointerEvent) => {
  const rect = canvas.getBoundingClientRect();
  return vec(((e.clientX - rect.left) / rect.width) * canvas.width, ((e.clientY - rect.top) / rect.height) * canvas.height);
};

new FixedLoop({
  update: (dt) => {
    const wasRunning = state.runningShot;
    if (state.runningShot) {
      stepPhysics(state, dt);
    }

    state.prediction = computePrediction(state);

    if (wasRunning && !state.runningShot) {
      finalizeShot(state);
      if (state.showSolution) {
        const [minP, maxP] = suggestedPowerRange(state);
        state.feedback = state.feedback
          ? { ...state.feedback, coaching: `${state.feedback.coaching} · Suggested power ${minP.toFixed(0)}-${maxP.toFixed(0)}%` }
          : state.feedback;
      }
    }
    updateHud(state, ui.feedbackEl, ui.historyEl);
  },
  render: () => renderScene(ctx, state)
}).start();
