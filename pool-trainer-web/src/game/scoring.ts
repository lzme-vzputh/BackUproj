import { angleDegBetween, distance, dot, norm } from '../core/math';
import type { GameState, ShotFeedback } from './state';

export const finalizeShot = (state: GameState): ShotFeedback | undefined => {
  const sample = state.pendingShotSample;
  if (!sample) return undefined;

  const angleErr = sample.firstObjectDir && state.prediction.predictedObjectDir
    ? angleDegBetween(sample.firstObjectDir, state.prediction.predictedObjectDir)
    : 0;
  const contactErr = sample.firstContactPoint && state.prediction.predictedContactPoint
    ? distance(sample.firstContactPoint, state.prediction.predictedContactPoint)
    : 0;

  const foulPenalty = sample.scratch ? 30 : 0;
  const score = Math.max(0, Math.round(100 - angleErr * 5 - contactErr * 0.5 - foulPenalty));

  const coaching = buildCoachingText(state, angleErr, contactErr);

  const feedback: ShotFeedback = {
    firstContactBallId: sample.firstContactBallId,
    pocketedBallIds: [...sample.pocketed.values()].filter((id) => id !== state.cueBallId),
    scratch: sample.scratch,
    angleErrDeg: Number(angleErr.toFixed(2)),
    contactErrPx: Number(contactErr.toFixed(2)),
    coaching,
    score
  };

  state.shotNumber += 1;
  state.history.unshift({ ...feedback, shotNo: state.shotNumber });
  state.history = state.history.slice(0, 10);
  state.pendingShotSample = undefined;
  state.feedback = feedback;
  return feedback;
};

const buildCoachingText = (state: GameState, angleErr: number, contactErr: number): string => {
  const messages: string[] = [];
  const predicted = state.prediction.predictedObjectDir;
  const actual = state.pendingShotSample?.firstObjectDir;
  if (predicted && actual) {
    const cross = predicted.x * actual.y - predicted.y * actual.x;
    if (Math.abs(angleErr) > 2) {
      messages.push(cross > 0 ? `Aim ${angleErr.toFixed(1)}° right` : `Aim ${angleErr.toFixed(1)}° left`);
    }
    const align = dot(norm(predicted), norm(actual));
    if (align < 0.96) {
      messages.push(cross > 0 ? 'Hit was too thin' : 'Hit was too thick');
    }
  }

  if (contactErr > 3) {
    messages.push(`Contact point off by ${contactErr.toFixed(1)} px`);
  }

  if (state.power < 35) messages.push('Power +10% suggested');
  if (state.power > 80) messages.push('Power -10% suggested');

  return messages.length ? messages.join(' · ') : 'Great shot. Keep this stroke and speed.';
};
