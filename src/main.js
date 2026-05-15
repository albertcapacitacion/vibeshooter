import "./style.css";

import { createGame } from "./game/createGame.js";

const appState = {
  pendingAction: () => {},
};

const elements = {
  gameShell: document.querySelector("#game-shell"),
  rotateOverlay: document.querySelector("#rotate-overlay"),
  hudOverlay: document.querySelector("#hud-overlay"),
  titleOverlay: document.querySelector("#title-overlay"),
  titleEyebrow: document.querySelector("#title-eyebrow"),
  titleHeading: document.querySelector("#title-heading"),
  titleMessage: document.querySelector("#title-message"),
  statusOverlay: document.querySelector("#status-overlay"),
  startButton: document.querySelector("#start-button"),
  statusButton: document.querySelector("#status-button"),
  statusEyebrow: document.querySelector("#status-eyebrow"),
  statusTitle: document.querySelector("#status-title"),
  statusMessage: document.querySelector("#status-message"),
  score: document.querySelector("#hud-score"),
  stage: document.querySelector("#hud-stage"),
  lives: document.querySelector("#hud-lives"),
  hudCards: {
    lives: document.querySelector(".hud-panel-lives"),
    score: document.querySelector(".hud-panel-score"),
    stage: document.querySelector(".hud-panel-stage"),
    fire: document.querySelector(".hud-panel-fire"),
  },
};

const game = createGame({
  onBoot: ({ hudAssets }) => {
    elements.hudCards.lives.style.backgroundImage = `url(${hudAssets.livesPanel})`;
    elements.hudCards.score.style.backgroundImage = `url(${hudAssets.scorePanel})`;
    elements.hudCards.stage.style.backgroundImage = `url(${hudAssets.stagePanel})`;
    elements.hudCards.fire.style.backgroundImage = `url(${hudAssets.firePanel})`;
    renderLives(3, hudAssets.lifeFull, hudAssets.lifeEmpty);
  },
  onStateChange: ({ stageNumber, score, lives, hudAssets }) => {
    elements.stage.textContent = `${stageNumber} / 2`;
    elements.score.textContent = String(score).padStart(6, "0");
    renderLives(lives, hudAssets.lifeFull, hudAssets.lifeEmpty);
  },
  onShowTitle: ({ eyebrow, title, message, buttonLabel, action }) => {
    elements.hudOverlay.classList.add("is-hidden");
    elements.statusOverlay.classList.add("is-hidden");
    elements.titleOverlay.classList.remove("is-hidden");
    elements.startButton.textContent = buttonLabel;
    elements.titleEyebrow.textContent = eyebrow;
    elements.titleHeading.textContent = title;
    elements.titleMessage.innerHTML = message;
    appState.pendingAction = action;
  },
  onShowStatus: ({ eyebrow, title, message, buttonLabel, action }) => {
    elements.hudOverlay.classList.add("is-hidden");
    elements.titleOverlay.classList.add("is-hidden");
    elements.statusOverlay.classList.remove("is-hidden");
    elements.statusEyebrow.textContent = eyebrow;
    elements.statusTitle.textContent = title;
    elements.statusMessage.textContent = message;
    elements.statusButton.textContent = buttonLabel;
    appState.pendingAction = action;
  },
  onHideOverlays: () => {
    elements.hudOverlay.classList.remove("is-hidden");
    elements.titleOverlay.classList.add("is-hidden");
    elements.statusOverlay.classList.add("is-hidden");
  },
});

elements.startButton.addEventListener("click", () => appState.pendingAction());
elements.statusButton.addEventListener("click", () => appState.pendingAction());

function renderLives(lives, fullUrl, emptyUrl) {
  elements.lives.innerHTML = "";
  for (let index = 0; index < 3; index += 1) {
    const node = document.createElement("span");
    node.className = `life-cell${index < lives ? "" : " is-empty"}`;
    node.style.backgroundImage = `url(${index < lives ? fullUrl : emptyUrl})`;
    elements.lives.append(node);
  }
}

function updateOrientationGate() {
  const isPortrait = window.innerHeight > window.innerWidth;
  elements.rotateOverlay.classList.toggle("is-hidden", !isPortrait);
  elements.gameShell.style.visibility = isPortrait ? "hidden" : "visible";
  game?.scale?.refresh();
}

window.addEventListener("resize", updateOrientationGate);
window.addEventListener("orientationchange", updateOrientationGate);
updateOrientationGate();
