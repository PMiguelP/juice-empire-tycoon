import Phaser from "phaser";
import { EventBus } from "../EventBus";

export class Game extends Phaser.Scene {
	camera: Phaser.Cameras.Scene2D.Camera;
	map: Phaser.Tilemaps.Tilemap | null = null;
	player?: Phaser.Physics.Arcade.Sprite;
	wasd?: {
		up: Phaser.Input.Keyboard.Key;
		down: Phaser.Input.Keyboard.Key;
		left: Phaser.Input.Keyboard.Key;
		right: Phaser.Input.Keyboard.Key;
	};
	levelUpKey?: Phaser.Input.Keyboard.Key;
	lastDirection: "down" | "up" | "left" | "right" = "down";

	constructor() {
		super("Game");
	}

	create() {
		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0x88c070);

		// Criar o mapa
		this.map = this.make.tilemap({ key: "mapa" });

		// ✅ Usar os nomes EXATOS do JSON (sem "2")
		const tileset1 = this.map.addTilesetImage(
			"summer_outdoorsTileSheet", // ← SEM o "2"
			"summer_outdoorsTileSheet",
		);
		const tileset1b = this.map.addTilesetImage(
			"summer_outdoorsTileSheet2",
			"summer_outdoorsTileSheet2",
		);
		const tileset2 = this.map.addTilesetImage(
			"fall_Waterfalls",
			"fall_Waterfalls",
		);
		const tileset3 = this.map.addTilesetImage("Barn", "Barn");
		const tileset4 = this.map.addTilesetImage("image", "image");
		const tileset5 = this.map.addTilesetImage("Well", "Well");
		const tileset6 = this.map.addTilesetImage("player", "player");

		// Filtrar nulls
		const allTilesets = [
			tileset1,
			tileset1b,
			tileset2,
			tileset3,
			tileset4,
			tileset5,
			tileset6,
		].filter((t): t is Phaser.Tilemaps.Tileset => t !== null);

		const layerOrder = [
			"ground",
			"water",
			"poco",
			"cliffs",
			"buildings",
			"trees",
			"objects",
			"colision",
		];
		const createdLayers = layerOrder.map(
			(layerName) => this.map?.createLayer(layerName, allTilesets) ?? null,
		);
		const colisionLayer = createdLayers[layerOrder.indexOf("colision")];

		// Esconder a layer de colisão
		if (colisionLayer) {
			colisionLayer.setCollisionByExclusion([-1]);
			colisionLayer.setVisible(false);
		}

		// Ajustar câmera
		const mapWidth = this.map.widthInPixels;
		const mapHeight = this.map.heightInPixels;
		this.camera.setBounds(0, 0, mapWidth, mapHeight);
		this.camera.centerOn(mapWidth / 2, mapHeight / 2);
		this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

		const zoomX = this.camera.width / mapWidth;
		const zoomY = this.camera.height / mapHeight;
		this.camera.setZoom(Math.max(zoomX, zoomY));

		this.player = this.physics.add
			.sprite(mapWidth / 2, mapHeight / 2, "player", 0)
			.setCollideWorldBounds(true);
		if (colisionLayer) {
			this.physics.add.collider(this.player, colisionLayer);
		}
		this.camera.startFollow(this.player, true, 0.1, 0.1);

		this.anims.create({
			key: "player-walk-down",
			frames: this.anims.generateFrameNumbers("player", {
				start: 0,
				end: 3,
			}),
			frameRate: 8,
			repeat: -1,
		});
		this.anims.create({
			key: "player-walk-left",
			frames: this.anims.generateFrameNumbers("player", {
				start: 12,
				end: 15,
			}),
			frameRate: 8,
			repeat: -1,
		});
		this.anims.create({
			key: "player-walk-right",
			frames: this.anims.generateFrameNumbers("player", {
				start: 4,
				end: 7,
			}),
			frameRate: 8,
			repeat: -1,
		});
		this.anims.create({
			key: "player-walk-up",
			frames: this.anims.generateFrameNumbers("player", {
				start: 8,
				end: 11,
			}),
			frameRate: 8,
			repeat: -1,
		});

		this.wasd = this.input.keyboard?.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
		}) as {
			up: Phaser.Input.Keyboard.Key;
			down: Phaser.Input.Keyboard.Key;
			left: Phaser.Input.Keyboard.Key;
			right: Phaser.Input.Keyboard.Key;
		};

		this.levelUpKey = this.input.keyboard?.addKey(
			Phaser.Input.Keyboard.KeyCodes.U,
		);

		EventBus.emit("current-scene-ready", this);
	}

	update() {
		if (!this.player || !this.wasd) {
			return;
		}

		if (this.levelUpKey && Phaser.Input.Keyboard.JustDown(this.levelUpKey)) {
			EventBus.emit("hud:add-coins", 25);
			EventBus.emit("hud:add-level", 1);
		}

		const speed = 120;
		this.player.setVelocity(0, 0);

		const movingUp = this.wasd.up.isDown;
		const movingDown = this.wasd.down.isDown;
		const movingLeft = this.wasd.left.isDown;
		const movingRight = this.wasd.right.isDown;

		if (movingLeft) {
			this.player.setVelocityX(-speed);
			this.player.anims.play("player-walk-left", true);
			this.lastDirection = "left";
		} else if (movingRight) {
			this.player.setVelocityX(speed);
			this.player.anims.play("player-walk-right", true);
			this.lastDirection = "right";
		} else if (movingUp) {
			this.player.setVelocityY(-speed);
			this.player.anims.play("player-walk-up", true);
			this.lastDirection = "up";
		} else if (movingDown) {
			this.player.setVelocityY(speed);
			this.player.anims.play("player-walk-down", true);
			this.lastDirection = "down";
		} else {
			this.player.anims.stop();
			switch (this.lastDirection) {
				case "left":
					this.player.setFrame(12);
					break;
				case "right":
					this.player.setFrame(4);
					break;
				case "up":
					this.player.setFrame(8);
					break;
				default:
					this.player.setFrame(0);
					break;
			}
		}
	}

	changeScene() {
		this.scene.start("GameOver");
	}
}
