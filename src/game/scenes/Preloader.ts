import Phaser from "phaser";

const MIN_LOADING_SCREEN_MS = 1200;

export class Preloader extends Phaser.Scene {
	private loadingStartedAt = 0;

	constructor() {
		super("Preloader");
	}

	init() {
		this.loadingStartedAt = Date.now();
		const width = this.scale.width;
		const height = this.scale.height;
		const centerX = width / 2;
		const centerY = height / 2;
		this.cameras.main.setBackgroundColor(0x10141c);

		this.add.rectangle(centerX, centerY, width, height, 0x10141c);
		this.add.rectangle(centerX, height * 0.78, width, height * 0.44, 0x243b2b);
		this.add.rectangle(centerX, height * 0.83, width, height * 0.3, 0x1a2b21);

		for (let x = -32; x < width + 32; x += 32) {
			this.add
				.rectangle(x, height * 0.75 + Math.sin(x * 0.05) * 8, 28, 10, 0x4d7a38)
				.setRotation(-0.15);
			this.add
				.rectangle(x + 14, height * 0.82 + Math.cos(x * 0.04) * 6, 24, 8, 0x315f34)
				.setRotation(0.12);
		}

		const panelWidth = Math.min(560, width - 48);
		const panelHeight = 230;
		const panel = this.add.graphics();
		panel.fillStyle(0x141922, 0.92);
		panel.lineStyle(2, 0x5f6f49, 0.95);
		panel.fillRoundedRect(
			centerX - panelWidth / 2,
			centerY - panelHeight / 2,
			panelWidth,
			panelHeight,
			14,
		);
		panel.strokeRoundedRect(
			centerX - panelWidth / 2,
			centerY - panelHeight / 2,
			panelWidth,
			panelHeight,
			14,
		);

		this.add
			.text(centerX, centerY - 66, "JUICE TYCOON", {
				fontFamily: '"Press Start 2P", monospace',
				fontSize: "24px",
				color: "#f9c74f",
				stroke: "#4a2d17",
				strokeThickness: 4,
				align: "center",
			})
			.setOrigin(0.5);

		this.add
			.text(centerX, centerY - 28, "FARM", {
				fontFamily: '"Press Start 2P", monospace',
				fontSize: "18px",
				color: "#90be6d",
				stroke: "#142414",
				strokeThickness: 3,
				align: "center",
			})
			.setOrigin(0.5);

		this.add
			.text(centerX, centerY + 34, "A preparar a quinta...", {
				fontFamily: '"Press Start 2P", monospace',
				fontSize: "8px",
				color: "#f7f5ef",
				align: "center",
			})
			.setOrigin(0.5);

		const barWidth = Math.min(420, panelWidth - 72);
		const barHeight = 18;
		const barX = centerX - barWidth / 2;
		const barY = centerY + 62;
		const barBack = this.add.graphics();
		barBack.fillStyle(0x080b10, 0.95);
		barBack.lineStyle(2, 0x6b7280, 0.9);
		barBack.fillRoundedRect(barX, barY, barWidth, barHeight, 7);
		barBack.strokeRoundedRect(barX, barY, barWidth, barHeight, 7);

		const bar = this.add.graphics();
		const percentText = this.add
			.text(centerX, barY + 38, "0%", {
				fontFamily: '"Press Start 2P", monospace',
				fontSize: "8px",
				color: "#cbd5e1",
			})
			.setOrigin(0.5);

		const drawProgress = (progress: number) => {
			bar.clear();
			bar.fillStyle(0xf9c74f, 1);
			bar.fillRoundedRect(
				barX + 4,
				barY + 4,
				Math.max(4, (barWidth - 8) * progress),
				barHeight - 8,
				4,
			);
			bar.fillStyle(0x90be6d, 0.85);
			bar.fillRoundedRect(
				barX + 4,
				barY + 4,
				Math.max(3, (barWidth - 8) * progress * 0.38),
				5,
				3,
			);
			percentText.setText(`${Math.round(progress * 100)}%`);
		};

		drawProgress(0);

		this.load.on("progress", (progress: number) => {
			drawProgress(progress);
		});
	}

	preload() {
		this.load.setPath("assets");

		// Assets do menu
		this.load.image("logo", "logo.png");
		this.load.image("star", "star.png");

		// ✅ ASSETS DO MAPA - ADICIONA ISTO!
		this.load.tilemapTiledJSON("mapa", "teste.tmj");
		this.load.tilemapTiledJSON("centrifugadora", "centrifugadora.tmj");
		this.load.tilemapTiledJSON("barn", "barn.tmj");
		this.load.tilemapTiledJSON("camera", "camera.tmj");
		this.load.tilemapTiledJSON("mercadovenda", "mercadovenda.tmj");
		this.load.tilemapTiledJSON("mercadocompra", "mercadocompra.tmj");
		this.load.image("centrifugadora", "centrifugadora.jpg");
		this.load.image("barnbau", "barnbau.png");
		this.load.image("camera", "camera.jpg");
		this.load.image("mercado", "mercado.jpg");
		this.load.image("mercadocompra", "mercadocompra.png");
		this.load.image("summer_outdoorsTileSheet", "summer_outdoorsTileSheet.png");
		this.load.image(
			"summer_outdoorsTileSheet2",
			"summer_outdoorsTileSheet2.png",
		);
		this.load.image("fall_Waterfalls", "fall_Waterfalls.png");
		this.load.image("Barn", "Barn.png");
		this.load.image("Big_Shed", "Big_Shed.png");
		this.load.image("Coop", "Coop.png");
		this.load.image("Log_Cabin", "Log_Cabin.png");
		this.load.image("Stone_Cabin", "Stone_Cabin.png");
		this.load.image("image", "image.png");
		this.load.image("Well", "Well.png");
		this.load.image("playerTileset", "player.png");
		this.load.spritesheet("player", "player.png", {
			frameWidth: 16,
			frameHeight: 32,
		});

		this.load.audio("sfx-walk", "sounds/walk.mp3");
		this.load.audio("sfx-juice", "sounds/juice.mp3");
		this.load.audio("sfx-water-fill", "sounds/water-fill.mp3");
		this.load.audio("sfx-water-tree", "sounds/water-tree.mp3");
		this.load.audio("sfx-plant", "sounds/plant.mp3");
		this.load.audio("sfx-harvest", "sounds/harvest.mp3");
		this.load.audio("sfx-fertilize", "sounds/fertilize.mp3");
		this.load.audio("sfx-sulfate", "sounds/sulfate.mp3");
		this.load.audio("sfx-error", "sounds/error.mp3");
		this.load.audio("sfx-buy", "sounds/buy.mp3");
		this.load.audio("sfx-menu-ambience", "sounds/menu-ambience.mp3");
	}

	create() {
		const elapsed = Date.now() - this.loadingStartedAt;
		const remaining = Math.max(0, MIN_LOADING_SCREEN_MS - elapsed);

		this.time.delayedCall(remaining, () => {
			this.scene.start("Game");
		});
	}
}
