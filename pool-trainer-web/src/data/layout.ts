import { vec } from '../core/math';
import type { Ball } from '../game/state';

const colors = ['#ffffff', '#fbbf24', '#60a5fa', '#f87171', '#34d399', '#c084fc', '#f472b6'];

export const defaultLayout = (): Ball[] => [
  { id: 0, pos: vec(330, 350), vel: vec(), color: colors[0], pocketed: false, sleepTimer: 0 },
  { id: 1, pos: vec(760, 350), vel: vec(), color: colors[1], pocketed: false, sleepTimer: 0 },
  { id: 2, pos: vec(785, 336), vel: vec(), color: colors[2], pocketed: false, sleepTimer: 0 },
  { id: 3, pos: vec(785, 364), vel: vec(), color: colors[3], pocketed: false, sleepTimer: 0 }
];

export const serializeLayout = (balls: Ball[]): string => JSON.stringify(
  balls.map((b) => ({ id: b.id, x: b.pos.x, y: b.pos.y, color: b.color, pocketed: b.pocketed })),
  null,
  2
);

export const deserializeLayout = (raw: string): Ball[] => {
  const parsed = JSON.parse(raw) as Array<{ id: number; x: number; y: number; color?: string; pocketed?: boolean }>;
  return parsed.map((p, index) => ({
    id: p.id ?? index,
    pos: vec(p.x, p.y),
    vel: vec(),
    color: p.color ?? '#ffffff',
    pocketed: Boolean(p.pocketed),
    sleepTimer: 0
  }));
};
