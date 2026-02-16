import { clamp, vec } from '../core/math';
import { deserializeLayout, serializeLayout } from '../data/layout';
import { randomizeDrill, resetShot, setDrill } from '../game/practice';
import type { DrillType, GameState, GuideMode } from '../game/state';
import { clampBallsInside, strikeCue } from '../physics/solver';

export type UiRefs = {
  feedbackEl: HTMLElement;
  historyEl: HTMLElement;
  layoutEl: HTMLTextAreaElement;
};

export const setupUi = (container: HTMLElement, state: GameState): UiRefs => {
  container.innerHTML = `
    <h2>Pool Trainer</h2>
    <div class="row"><label>Guide</label>
      <select id="guide"><option value="off">Off</option><option value="basic" selected>Basic</option><option value="advanced">Advanced</option></select>
      <label><input id="ghost" type="checkbox" checked/> Ghost</label>
    </div>
    <div class="row"><label>Drill</label>
      <select id="drill"><option value="free">Free practice</option><option value="cut">Random cut shot</option><option value="bank">Bank shot (1 rail)</option><option value="position">Position play</option></select>
      <button id="randomize">Randomize</button>
    </div>
    <div class="row"><label>Power</label><input id="power" type="range" min="0" max="100" value="55" /></div>
    <div class="row" id="powerPresets">
      <button data-p="25">25</button><button data-p="50">50</button><button data-p="75">75</button><button data-p="100">100</button>
      <span id="powerValue">55%</span>
    </div>
    <h3>Spin</h3>
    <div id="spinPad"><div id="spinDot"></div></div>
    <div class="muted">x: rail english, y: follow/draw</div>
    <div class="row">
      <button id="shoot">Shoot</button>
      <button id="reset">Reset shot</button>
      <label><input id="solution" type="checkbox" /> Show solution</label>
    </div>
    <h3>Layout JSON</h3>
    <div class="row"><button id="save">Save layout</button><button id="load">Load layout</button></div>
    <textarea id="layout" rows="6" style="width:100%"></textarea>
    <h3>Feedback</h3>
    <div id="feedback">Take a shot to get feedback.</div>
    <h3>Shot history (last 10)</h3>
    <div id="history"></div>
  `;

  const guideEl = byId<HTMLSelectElement>('guide');
  const ghostEl = byId<HTMLInputElement>('ghost');
  const drillEl = byId<HTMLSelectElement>('drill');
  const powerEl = byId<HTMLInputElement>('power');
  const powerValueEl = byId<HTMLElement>('powerValue');
  const shootEl = byId<HTMLButtonElement>('shoot');
  const resetEl = byId<HTMLButtonElement>('reset');
  const randomizeEl = byId<HTMLButtonElement>('randomize');
  const solutionEl = byId<HTMLInputElement>('solution');
  const saveEl = byId<HTMLButtonElement>('save');
  const loadEl = byId<HTMLButtonElement>('load');
  const layoutEl = byId<HTMLTextAreaElement>('layout');
  const feedbackEl = byId<HTMLElement>('feedback');
  const historyEl = byId<HTMLElement>('history');
  const spinPad = byId<HTMLDivElement>('spinPad');
  const spinDot = byId<HTMLDivElement>('spinDot');

  const updateSpinDot = () => {
    spinDot.style.left = `${70 + state.spin.x * 60}px`;
    spinDot.style.top = `${70 - state.spin.y * 60}px`;
  };
  updateSpinDot();

  guideEl.onchange = () => {
    state.guideMode = guideEl.value as GuideMode;
  };
  ghostEl.onchange = () => {
    state.ghostBall = ghostEl.checked;
  };
  drillEl.onchange = () => {
    setDrill(state, drillEl.value as DrillType);
  };
  powerEl.oninput = () => {
    state.power = Number(powerEl.value);
    powerValueEl.textContent = `${state.power}%`;
  };

  byId<HTMLDivElement>('powerPresets').onclick = (e) => {
    const target = e.target as HTMLElement;
    const p = target.getAttribute('data-p');
    if (!p) return;
    state.power = Number(p);
    powerEl.value = p;
    powerValueEl.textContent = `${p}%`;
  };

  spinPad.onpointerdown = (e) => {
    const rect = spinPad.getBoundingClientRect();
    const update = (clientX: number, clientY: number) => {
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const nx = clamp((px - 70) / 60, -1, 1);
      const ny = clamp((70 - py) / 60, -1, 1);
      state.spin = vec(nx, ny);
      updateSpinDot();
    };
    update(e.clientX, e.clientY);
    const move = (ev: PointerEvent) => update(ev.clientX, ev.clientY);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  shootEl.onclick = () => {
    if (state.runningShot) return;
    const cue = state.balls.find((b) => b.id === state.cueBallId);
    if (!cue || cue.pocketed) return;
    strikeCue(state, { x: state.aimPoint.x - cue.pos.x, y: state.aimPoint.y - cue.pos.y });
  };

  resetEl.onclick = () => resetShot(state);
  randomizeEl.onclick = () => randomizeDrill(state);
  solutionEl.onchange = () => {
    state.showSolution = solutionEl.checked;
    if (state.showSolution) state.guideMode = 'advanced';
  };

  saveEl.onclick = () => {
    layoutEl.value = serializeLayout(state.balls);
  };
  loadEl.onclick = () => {
    try {
      state.balls = deserializeLayout(layoutEl.value);
      clampBallsInside(state);
    } catch {
      layoutEl.value = 'Invalid JSON layout.';
    }
  };

  return { feedbackEl, historyEl, layoutEl };
};

const byId = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
};
