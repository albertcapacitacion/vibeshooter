import Phaser from "phaser";

import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from "./data/stages.js";
import { BootScene } from "./scenes/BootScene.js";
import { GameplayScene } from "./scenes/GameplayScene.js";
import { TitleScene } from "./scenes/TitleScene.js";

export function createConfig() {
  return {
    type: Phaser.AUTO,
    parent: "game-viewport",
    width: PLAYFIELD_WIDTH,
    height: PLAYFIELD_HEIGHT,
    transparent: true,
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scene: [BootScene, TitleScene, GameplayScene],
  };
}
