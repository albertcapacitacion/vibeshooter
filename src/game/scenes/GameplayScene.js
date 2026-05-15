import Phaser from "phaser";

import { assets } from "../data/assets.js";
import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH, stages } from "../data/stages.js";

const PLAYER_SPEED = 320;
const PLAYER_SCALE = 0.48;
const PLAYER_BULLET_SPEED = -460;
const ENEMY_BULLET_SPEED = 220;
const BOSS_BULLET_SPEED = 260;

export class GameplayScene extends Phaser.Scene {
  constructor() {
    super("GameplayScene");
  }

  create(data) {
    this.stageIndex = data.stageIndex ?? 0;
    this.score = data.score ?? 0;
    this.lives = data.lives ?? 3;
    this.stageData = stages[this.stageIndex];
    this.waveIndex = 0;
    this.stageState = "waves";
    this.stageCompleted = false;
    this.playerRecovering = false;

    this.background = this.add.tileSprite(
      PLAYFIELD_WIDTH / 2,
      PLAYFIELD_HEIGHT / 2,
      PLAYFIELD_WIDTH,
      PLAYFIELD_HEIGHT,
      this.stageData.backgroundKey,
    );

    this.player = this.physics.add
      .sprite(PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT - 120, "ship-player")
      .setScale(PLAYER_SCALE)
      .setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.28, this.player.height * 0.36, true);

    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.enemies = this.physics.add.group();

    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      fire: Phaser.Input.Keyboard.KeyCodes.J,
    });

    this.physics.add.overlap(this.playerBullets, this.enemies, this.handlePlayerHitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.enemyBullets, this.handlePlayerDeath, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerDeath, undefined, this);

    this.syncHud();
    this.time.delayedCall(900, () => this.spawnNextWave());
  }

  update(_, delta) {
    this.background.tilePositionY -= 0.55;
    this.handlePlayerMovement();
    this.handleTapFire();
    this.updateEnemies(delta / 1000);
    this.updateBullets();
  }

  handlePlayerMovement() {
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) velocityX -= 1;
    if (this.cursors.right.isDown) velocityX += 1;
    if (this.cursors.up.isDown) velocityY -= 1;
    if (this.cursors.down.isDown) velocityY += 1;

    const vector = new Phaser.Math.Vector2(velocityX, velocityY).normalize().scale(PLAYER_SPEED);
    this.player.body.setVelocity(vector.x || 0, vector.y || 0);
  }

  handleTapFire() {
    if (!Phaser.Input.Keyboard.JustDown(this.cursors.fire)) {
      return;
    }

    const bullet = this.playerBullets
      .create(this.player.x, this.player.y - this.player.displayHeight * 0.35, "bullet-player")
      .setScale(1.15)
      .setDepth(8);

    bullet.body.allowGravity = false;
    bullet.setVelocityY(PLAYER_BULLET_SPEED);
  }

  spawnNextWave() {
    if (this.stageState !== "waves") {
      return;
    }

    const wave = this.stageData.waves[this.waveIndex];
    if (!wave) {
      this.spawnBoss();
      return;
    }

    this.waveIndex += 1;
    const releaseDelay = 240;

    for (let index = 0; index < wave.count; index += 1) {
      this.time.delayedCall(index * releaseDelay, () => this.spawnEnemy(wave, index));
    }

    const cooldown = wave.count * releaseDelay + 2400;
    this.time.delayedCall(cooldown, () => this.spawnNextWave());
  }

  spawnEnemy(wave, index) {
    if (!this.scene.isActive()) {
      return;
    }

    const xPositions = {
      line: 110 + index * wave.spacing,
      sweep: 110 + index * wave.spacing,
      "heavy-drop": 135 + index * wave.spacing,
      "miniboss-run": PLAYFIELD_WIDTH / 2 + (index % 2 === 0 ? -90 : 90),
    };

    const enemy = this.enemies.create(
      Phaser.Math.Clamp(xPositions[wave.type] ?? PLAYFIELD_WIDTH / 2, 80, PLAYFIELD_WIDTH - 80),
      -120 - index * 60,
      wave.enemyKey,
    );

    enemy.setScale(this.getEnemyScale(wave.enemyKey));
    enemy.body.allowGravity = false;
    enemy.body.setSize(enemy.width * 0.42, enemy.height * 0.42, true);
    enemy.setData("kind", wave.type);
    enemy.setData("baseX", enemy.x);
    enemy.setData("speed", wave.speed);
    enemy.setData("shotInterval", wave.shotInterval);
    enemy.setData("nextShotAt", this.time.now + Phaser.Math.Between(800, 1500));
    enemy.setData("health", this.getEnemyHealth(wave.enemyKey));
    enemy.setData("enteredArena", false);
  }

  spawnBoss() {
    this.stageState = "boss";
    this.boss = this.enemies.create(PLAYFIELD_WIDTH / 2, -220, this.stageData.bossKey);
    this.boss.setScale(this.stageData.bossScale);
    this.boss.body.allowGravity = false;
    this.boss.body.setSize(this.boss.width * 0.5, this.boss.height * 0.45, true);
    this.boss.setData("kind", "boss");
    this.boss.setData("health", this.stageIndex === 0 ? 34 : 52);
    this.boss.setData("nextShotAt", this.time.now + 1100);
    this.boss.setData("moveDirection", 1);
  }

  getEnemyScale(enemyKey) {
    switch (enemyKey) {
      case "ship-enemy-light":
        return 0.29;
      case "ship-enemy-medium":
        return 0.32;
      case "ship-enemy-heavy":
        return 0.36;
      case "ship-enemy-miniboss":
        return 0.34;
      default:
        return 0.3;
    }
  }

  getEnemyHealth(enemyKey) {
    switch (enemyKey) {
      case "ship-enemy-light":
        return 2;
      case "ship-enemy-medium":
        return 3;
      case "ship-enemy-heavy":
        return 5;
      case "ship-enemy-miniboss":
        return 10;
      default:
        return 2;
    }
  }

  updateEnemies(dt) {
    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) {
        return;
      }

      const kind = enemy.getData("kind");
      if (kind === "boss") {
        this.updateBoss(enemy, dt);
      } else {
        this.updateRegularEnemy(enemy, dt);
      }
    });
  }

  updateRegularEnemy(enemy, dt) {
    const kind = enemy.getData("kind");
    const speed = enemy.getData("speed");
    const elapsed = this.time.now * 0.001;
    const baseX = enemy.getData("baseX");

    if (kind === "line") {
      enemy.y += speed * dt;
    }

    if (kind === "sweep") {
      enemy.y += speed * dt;
      enemy.x = baseX + Math.sin(elapsed * 2.2 + baseX * 0.01) * 70;
    }

    if (kind === "heavy-drop") {
      enemy.y += speed * dt * 0.9;
      enemy.x = baseX + Math.sin(elapsed * 1.4 + baseX * 0.01) * 38;
    }

    if (kind === "miniboss-run") {
      enemy.y = Math.min(enemy.y + speed * dt, 210);
      enemy.x = baseX + Math.sin(elapsed * 1.8) * 96;
    }

    if (enemy.y > 120) {
      enemy.setData("enteredArena", true);
    }

    if (enemy.getData("enteredArena") && this.time.now >= enemy.getData("nextShotAt")) {
      this.fireEnemyBullet(enemy, ENEMY_BULLET_SPEED);
      enemy.setData("nextShotAt", this.time.now + enemy.getData("shotInterval"));
    }

    if (enemy.y > PLAYFIELD_HEIGHT + 140) {
      enemy.destroy();
    }
  }

  updateBoss(enemy, dt) {
    if (enemy.y < 190) {
      enemy.y += 110 * dt;
      return;
    }

    enemy.x += 110 * enemy.getData("moveDirection") * dt;
    if (enemy.x < 130 || enemy.x > PLAYFIELD_WIDTH - 130) {
      enemy.setData("moveDirection", enemy.getData("moveDirection") * -1);
    }

    if (this.time.now >= enemy.getData("nextShotAt")) {
      [-0.28, 0, 0.28].forEach((offset) => this.fireEnemyBullet(enemy, BOSS_BULLET_SPEED, offset));
      enemy.setData("nextShotAt", this.time.now + (this.stageIndex === 0 ? 1100 : 850));
    }
  }

  fireEnemyBullet(enemy, speed, offsetX = 0) {
    const bullet = this.enemyBullets.create(enemy.x + offsetX * 120, enemy.y + enemy.displayHeight * 0.2, "bullet-enemy");
    bullet.setScale(offsetX === 0 ? 0.9 : 0.8);
    bullet.body.allowGravity = false;
    bullet.setVelocity(offsetX * 120, speed);
  }

  updateBullets() {
    this.playerBullets.getChildren().forEach((bullet) => {
      if (bullet.active && bullet.y < -40) {
        bullet.destroy();
      }
    });

    this.enemyBullets.getChildren().forEach((bullet) => {
      if (bullet.active && bullet.y > PLAYFIELD_HEIGHT + 40) {
        bullet.destroy();
      }
    });
  }

  handlePlayerHitEnemy(bullet, enemy) {
    bullet.destroy();
    const nextHealth = enemy.getData("health") - 1;
    enemy.setData("health", nextHealth);
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      if (enemy.active) {
        enemy.clearTint();
      }
    });

    if (nextHealth > 0) {
      return;
    }

    const isBoss = enemy.getData("kind") === "boss";
    this.addKillScore(isBoss ? 2000 : 250);
    enemy.destroy();

    if (isBoss) {
      this.handleStageClear();
    }
  }

  handlePlayerDeath(_player, collider) {
    if (!this.player.active || this.stageCompleted || this.playerRecovering) {
      return;
    }

    this.playerRecovering = true;
    collider.destroy();
    this.player.disableBody(true, true);
    this.lives -= 1;
    this.syncHud();

    if (this.lives <= 0) {
      this.handleGameOver();
      return;
    }

    this.time.delayedCall(900, () => {
      this.player.enableBody(true, PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT - 120, true, true);
      this.player.setScale(PLAYER_SCALE);
      this.player.body.setSize(this.player.width * 0.28, this.player.height * 0.36, true);
      this.playerRecovering = false;
    });
  }

  addKillScore(amount) {
    this.score += amount;
    this.syncHud();
  }

  syncHud() {
    this.game.uiBridge.onStateChange?.({
      score: this.score,
      lives: this.lives,
      stageNumber: this.stageData.stageNumber,
      hudAssets: assets.hud,
    });
  }

  handleStageClear() {
    this.stageCompleted = true;
    this.physics.pause();

    if (this.stageIndex < stages.length - 1) {
      this.game.uiBridge.onShowStatus?.({
        eyebrow: "Stage Clear",
        title: `Stage ${this.stageData.stageNumber} Complete`,
        message: "Re-arm and advance to the next combat zone.",
        buttonLabel: "Next Stage",
        action: () => {
          this.game.uiBridge.onHideOverlays?.();
          this.scene.restart({
            stageIndex: this.stageIndex + 1,
            score: this.score,
            lives: this.lives,
          });
        },
      });
      return;
    }

    this.game.uiBridge.onShowStatus?.({
      eyebrow: "Operation Complete",
      title: "Victory",
      message: "Both fleets are broken. The corridor is secure.",
      buttonLabel: "Return To Title",
      action: () => {
        this.game.uiBridge.onHideOverlays?.();
        this.scene.start("TitleScene");
      },
    });
  }

  handleGameOver() {
    this.stageCompleted = true;
    this.physics.pause();
    this.game.uiBridge.onShowStatus?.({
      eyebrow: "Mission Failed",
      title: "Game Over",
      message: "Your squadron was wiped before the route was cleared.",
      buttonLabel: "Retry",
      action: () => {
        this.game.uiBridge.onHideOverlays?.();
        this.scene.restart({
          stageIndex: 0,
          score: 0,
          lives: 3,
        });
      },
    });
  }
}
