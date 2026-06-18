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
	return new Phaser.Game({ ...config, parent });
};

export default StartGame;
