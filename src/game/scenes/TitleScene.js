import Phaser from "phaser";

import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from "../data/stages.js";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    const background = this.add.image(PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2, "background-title");
    const scale = Math.max(PLAYFIELD_WIDTH / background.width, PLAYFIELD_HEIGHT / background.height);
    background.setScale(scale);

    this.add.rectangle(PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT, 0x02070d, 0.25);

    this.game.uiBridge.onShowTitle?.({
      eyebrow: "Vertical Arcade Prototype",
      title: "Star Rift Assault",
      message:
        'Two-stage space assault. Desktop prototype uses <strong>WASD</strong> to move and <strong>J</strong> to fire.',
      buttonLabel: "Start Mission",
      action: () => {
        this.game.uiBridge.onHideOverlays?.();
        this.scene.start("GameplayScene", {
          stageIndex: 0,
          score: 0,
          lives: 3,
        });
      },
    });
  }
}
