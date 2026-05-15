export const PLAYFIELD_WIDTH = 540;
export const PLAYFIELD_HEIGHT = 960;

export const stages = [
  {
    stageNumber: 1,
    backgroundKey: "background-stage-1",
    bossKey: "ship-boss-stage-1",
    bossScale: 0.504,
    waves: [
      { type: "line", enemyKey: "ship-enemy-light", count: 5, speed: 170, shotInterval: 2000, spacing: 90 },
      { type: "sweep", enemyKey: "ship-enemy-medium", count: 4, speed: 150, shotInterval: 1800, spacing: 110 },
      { type: "heavy-drop", enemyKey: "ship-enemy-heavy", count: 3, speed: 130, shotInterval: 1700, spacing: 140 },
      { type: "miniboss-run", enemyKey: "ship-enemy-miniboss", count: 1, speed: 120, shotInterval: 1100, spacing: 0 },
    ],
  },
  {
    stageNumber: 2,
    backgroundKey: "background-stage-2",
    bossKey: "ship-boss-stage-2",
    bossScale: 0.42,
    waves: [
      { type: "line", enemyKey: "ship-enemy-light", count: 6, speed: 185, shotInterval: 1700, spacing: 78 },
      { type: "sweep", enemyKey: "ship-enemy-medium", count: 5, speed: 170, shotInterval: 1600, spacing: 92 },
      { type: "heavy-drop", enemyKey: "ship-enemy-heavy", count: 4, speed: 145, shotInterval: 1450, spacing: 120 },
      { type: "miniboss-run", enemyKey: "ship-enemy-miniboss", count: 2, speed: 130, shotInterval: 1050, spacing: 150 },
    ],
  },
];
