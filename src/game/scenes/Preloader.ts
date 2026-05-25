import Phaser from "phaser";

export class Preloader extends Phaser.Scene {
	constructor() {
		super("Preloader");
	}

	init() {
		this.add.image(512, 384, "background");
		this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
		const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

		this.load.on("progress", (progress: number) => {
			bar.width = 4 + 460 * progress;
		});
	}

	preload() {
		this.load.setPath("assets");

		// Assets do menu
		this.load.image("logo", "logo.png");
		this.load.image("star", "star.png");

		// ✅ ASSETS DO MAPA - ADICIONA ISTO!
		this.load.tilemapTiledJSON("mapa", "mapa.json");
		this.load.image("summer_outdoorsTileSheet", "summer_outdoorsTileSheet.png");
		this.load.image(
			"summer_outdoorsTileSheet2",
			"summer_outdoorsTileSheet2.png",
		);
		this.load.image("fall_Waterfalls", "fall_Waterfalls.png");
		this.load.image("Barn", "Barn.png");
		this.load.image("image", "image.png");
		this.load.image("Well", "Well.png");
		this.load.spritesheet("player", "player.png", {
			frameWidth: 16,
			frameHeight: 32,
		});
	}

	create() {
		// ✅ IR DIRETO PARA O GAME
		this.scene.start("Game");
	}
}
