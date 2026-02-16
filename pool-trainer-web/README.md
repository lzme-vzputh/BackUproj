# Pool Trainer Web (TypeScript + Canvas)

Standalone pool practice trainer and simple deterministic top-down pool simulation.

## Requirements
- Node.js LTS (18+ recommended)
- npm

## Install / Run / Build
```bash
npm install
npm run dev
npm run build
```

## Controls
- **Aim**: move mouse over table.
- **Shoot**: click **Shoot**.
- **Free practice drag**: in Free practice drill, drag balls on table.
- **Power**: slider 0–100 or presets (25/50/75/100).
- **Spin puck**: drag inside spin circle (`x` = rail english, `y` = follow/draw).
- **Guide mode**: Off / Basic / Advanced.
- **Ghost ball**: toggle on/off.
- **Drills**: Free practice / Random cut / Bank shot / Position play.
- **Reset shot**: restore unpocketed balls with zero velocity.
- **Randomize drill**: regenerate drill layout.
- **Save layout JSON**: dumps current balls into JSON text area.
- **Load layout JSON**: reads JSON from text area and restores.
- **Show solution**: enables advanced guide and adds suggested power range after shot feedback.

## Deterministic Physics Notes
- Fixed update timestep at `dt = 1/120`.
- Equal-mass elastic ball collisions with overlap correction.
- Rail reflection with restitution and tiny spin-based tangent tweak.
- Friction + sleep threshold to remove jitter and force hard stop.

## Manual Test Checklist
1. **Aim line and first contact**
   - Place cue and object ball in line, verify cue guide intersects expected first object ball.
2. **Potting works**
   - Shoot object ball into pocket, verify it disappears and appears in pocketed list.
3. **Scratch works**
   - Pot cue ball, verify scratch = yes and score penalty.
4. **Stop/jitter-free**
   - Soft shot and wait; balls should settle to exact stop (no endless micro-drift).
5. **Drill randomizes**
   - Switch drill and click randomize multiple times; layout should change deterministically per RNG stream.
6. **Save/load restores**
   - Save JSON, move balls, load JSON, verify positions restore.

## Troubleshooting
- If `npm install` fails due to blocked registry, retry with your network/proxy enabled.
- If canvas appears stretched, ensure browser zoom is 100% and window is wide enough for side panel.
