import Phaser from "phaser";

import { createConfig } from "./config.js";

export function createGame(uiBridge) {
  const config = createConfig();
  const game = new Phaser.Game(config);
  game.uiBridge = uiBridge;
  return game;
}
