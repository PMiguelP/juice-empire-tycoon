import Phaser from "phaser";
import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { Preloader } from "./scenes/Preloader";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: window.innerWidth,
	height: window.innerHeight,
	parent: "game-container",
	backgroundColor: "#10141c",
	pixelArt: true,
	antialias: false,
	roundPixels: true,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { x: 0, y: 0 },
			debug: false,
		},
	},
	scale: {
		mode: Phaser.Scale.RESIZE,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	scene: [Boot, Preloader, MainGame],
};

const StartGame = (parent: string) => {
	const game = new Phaser.Game({ ...config, parent });

	// Chrome blocks AudioContext until a user gesture. Phaser listens on
	// the canvas, but Vue overlays intercept clicks first, so we listen
	// at the document level and resume manually.
	const unlockAudio = () => {
		const webAudio = game.sound as Phaser.Sound.WebAudioSoundManager;
		if (webAudio?.context?.state === "suspended") {
			webAudio.context.resume();
		}
		document.removeEventListener("click", unlockAudio);
		document.removeEventListener("keydown", unlockAudio);
		document.removeEventListener("touchstart", unlockAudio);
	};
	document.addEventListener("click", unlockAudio);
	document.addEventListener("keydown", unlockAudio);
	document.addEventListener("touchstart", unlockAudio);

	return game;
};

export default StartGame;
