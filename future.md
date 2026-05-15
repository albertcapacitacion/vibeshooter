# Future Notes

This file tracks ideas, mechanics, and production tasks that were explicitly rejected for now or postponed for a later milestone.

## Deferred Features

- Additional sprite animation frames are postponed. The first build should use simple static ship presentation without extra frame sets.
- Smooth rotation or interpolation-heavy motion is postponed. Keep the presentation simple and aligned with the source sprites for now.
- Bomb mechanics are postponed. Do not implement player bombs in the first playable build.
- Power-up effects are postponed. The bottom-row power-up sprites from `reference/ships.jpg` are reserved, but their gameplay behavior will be decided later.
- Asteroids are background-only for now. Do not make them collidable hazards in the first playable build.
- Shield systems, health bars, and other multi-hit durability models are postponed. The first build uses one-hit death with 3 total lives.
- Expanded stage structure such as miniboss encounters is postponed. The first build uses waves followed by a boss.
- Touch mobile controls are postponed. The first build should use desktop keyboard controls only.

## Rejected For This Project

- Do not use React for the game runtime or UI shell.
- Do not use a dependency-heavy frontend framework stack.

## Asset Pipeline Notes

- Source sheets in `reference/` are strict production assets, not loose inspiration.
- Sprites will need extraction and transparency cleanup from the provided white-background sheets.
- HUD elements should be pulled directly from `reference/HUD.jpg`.
- `reference/background3.jpg` should be used for the title screen in the first build.
- `reference/background3.jpg` is also reserved for a future playable stage once the game expands beyond two stages.

## Stack Notes

- Use HTML, CSS, JavaScript, and Phaser for the runtime.
- The game must work in both desktop and mobile browsers.
- The game should present a vertical playfield inside a normal horizontal browser layout.
- On mobile, support one landscape orientation properly and show a rotate-device message when the device is not in the supported orientation.
- Desktop controls for the first build are `WASD` for movement and `J` for fire.
