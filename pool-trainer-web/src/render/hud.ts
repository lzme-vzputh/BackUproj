import type { GameState } from '../game/state';

export const updateHud = (state: GameState, feedbackEl: HTMLElement, historyEl: HTMLElement): void => {
  const f = state.feedback;
  feedbackEl.innerHTML = f
    ? [
        `<div><strong>First contact:</strong> ${f.firstContactBallId ?? 'None'}</div>`,
        `<div><strong>Pocketed:</strong> ${f.pocketedBallIds.length ? f.pocketedBallIds.join(', ') : 'None'}</div>`,
        `<div><strong>Scratch:</strong> ${f.scratch ? 'Yes' : 'No'}</div>`,
        `<div><strong>Angle error:</strong> ${f.angleErrDeg.toFixed(2)}°</div>`,
        `<div><strong>Contact error:</strong> ${f.contactErrPx.toFixed(2)} px</div>`,
        `<div><strong>Score:</strong> ${f.score}</div>`,
        `<div><strong>Coach:</strong> ${f.coaching}</div>`
      ].join('')
    : 'Take a shot to get feedback.';

  historyEl.innerHTML = state.history
    .map((h) => `#${h.shotNo}: score ${h.score}, angle ${h.angleErrDeg.toFixed(1)}°, contact ${h.contactErrPx.toFixed(1)}px${h.scratch ? ', scratch' : ''}`)
    .join('<br/>');
};
