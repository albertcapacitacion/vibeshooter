import Phaser from "phaser";

import { assets } from "../data/assets.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image("background-title", assets.backgrounds.title);
    this.load.image("background-stage-1", assets.backgrounds.stage1);
    this.load.image("background-stage-2", assets.backgrounds.stage2);

    this.load.image("ship-player", assets.ships.player);
    this.load.image("ship-boss-stage-1", assets.ships.bossStage1);
    this.load.image("ship-boss-stage-2", assets.ships.bossStage2);
    this.load.image("ship-enemy-light", assets.ships.enemyLight);
    this.load.image("ship-enemy-medium", assets.ships.enemyMedium);
    this.load.image("ship-enemy-heavy", assets.ships.enemyHeavy);
    this.load.image("ship-enemy-miniboss", assets.ships.enemyMiniboss);

    this.load.image("bullet-player", assets.fx.playerBullet);
    this.load.image("bullet-enemy", assets.fx.enemyBullet);
  }

  create() {
    this.game.uiBridge.onBoot?.({
      hudAssets: assets.hud,
    });

    this.scene.start("TitleScene");
  }
}
