import { vec, type Vec2 } from '../core/math';

export const CANVAS_W = 1100;
export const CANVAS_H = 700;
export const TABLE_W = 900;
export const TABLE_H = 500;
export const BALL_R = 12;
export const POCKET_R = 24;
export const FRICTION = 0.992;
export const RAIL_RESTITUTION = 0.94;
export const BALL_RESTITUTION = 0.98;
export const SPEED_EPS = 6;
export const SLEEP_TIME = 0.45;
export const VMAX = 760;
export const SPIN_RAIL = 0.08;
export const SPIN_FOLLOW = 20;

export type GuideMode = 'off' | 'basic' | 'advanced';
export type DrillType = 'free' | 'cut' | 'bank' | 'position';

export type Ball = {
  id: number;
  pos: Vec2;
  vel: Vec2;
  color: string;
  pocketed: boolean;
  sleepTimer: number;
};

export type Prediction = {
  collisionPoint?: Vec2;
  firstBallId?: number;
  cuePath: Vec2[];
  objectPath: Vec2[];
  cueDeflectPath: Vec2[];
  ghostPos?: Vec2;
  predictedObjectDir?: Vec2;
  predictedContactPoint?: Vec2;
};

export type ShotFeedback = {
  firstContactBallId: number | null;
  pocketedBallIds: number[];
  scratch: boolean;
  angleErrDeg: number;
  contactErrPx: number;
  coaching: string;
  score: number;
};

export type ShotRecord = ShotFeedback & { shotNo: number };

export type Table = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  pockets: Vec2[];
};

export type GameState = {
  balls: Ball[];
  cueBallId: number;
  table: Table;
  aiming: boolean;
  aimPoint: Vec2;
  power: number;
  spin: Vec2;
  guideMode: GuideMode;
  ghostBall: boolean;
  showSolution: boolean;
  drill: DrillType;
  targetCircle?: { center: Vec2; radius: number };
  runningShot: boolean;
  shotNumber: number;
  prediction: Prediction;
  feedback?: ShotFeedback;
  history: ShotRecord[];
  pendingShotSample?: {
    firstContactBallId: number | null;
    firstContactPoint?: Vec2;
    firstObjectDir?: Vec2;
    pocketed: Set<number>;
    scratch: boolean;
  };
};

export const makeTable = (): Table => {
  const left = (CANVAS_W - TABLE_W) / 2;
  const top = (CANVAS_H - TABLE_H) / 2;
  const right = left + TABLE_W;
  const bottom = top + TABLE_H;
  const midX = (left + right) / 2;
  return {
    left,
    right,
    top,
    bottom,
    pockets: [
      vec(left, top),
      vec(midX, top),
      vec(right, top),
      vec(left, bottom),
      vec(midX, bottom),
      vec(right, bottom)
    ]
  };
};
