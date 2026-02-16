import { BALL_R, CANVAS_H, CANVAS_W, POCKET_R, type GameState } from '../game/state';

export const renderScene = (ctx: CanvasRenderingContext2D, state: GameState): void => {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = '#14532d';
  ctx.fillRect(state.table.left, state.table.top, state.table.right - state.table.left, state.table.bottom - state.table.top);

  ctx.strokeStyle = '#2b3d4f';
  ctx.lineWidth = 24;
  ctx.strokeRect(state.table.left, state.table.top, state.table.right - state.table.left, state.table.bottom - state.table.top);

  ctx.fillStyle = '#06080d';
  for (const p of state.table.pockets) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2);
    ctx.fill();
  }

  if (state.targetCircle) {
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.targetCircle.center.x, state.targetCircle.center.y, state.targetCircle.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawGuide(ctx, state);

  for (const b of state.balls) {
    if (b.pocketed) continue;
    ctx.beginPath();
    ctx.fillStyle = b.color;
    ctx.arc(b.pos.x, b.pos.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#0b1220';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(b.id), b.pos.x, b.pos.y + 3);
  }
};

const drawPolyline = (ctx: CanvasRenderingContext2D, pts: Array<{ x: number; y: number }>, color: string): void => {
  if (pts.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawGuide = (ctx: CanvasRenderingContext2D, state: GameState): void => {
  drawPolyline(ctx, state.prediction.cuePath, '#7dd3fc');
  drawPolyline(ctx, state.prediction.objectPath, '#fca5a5');
  drawPolyline(ctx, state.prediction.cueDeflectPath, '#86efac');

  if (state.ghostBall && state.prediction.ghostPos) {
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(state.prediction.ghostPos.x, state.prediction.ghostPos.y, BALL_R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};
