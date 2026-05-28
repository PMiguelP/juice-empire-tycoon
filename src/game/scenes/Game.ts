import Phaser from "phaser";
import { EventBus } from "../EventBus";

export class Game extends Phaser.Scene {
	camera: Phaser.Cameras.Scene2D.Camera;
	map: Phaser.Tilemaps.Tilemap | null = null;
	player?: Phaser.Physics.Arcade.Sprite;
	interactKey?: Phaser.Input.Keyboard.Key;
	currentMapKey = "mapa";
	returnSpawn: { x: number; y: number } | null = null;
	centrifTexts: Phaser.GameObjects.Container[] = [];
	centrifCenters: { x: number; y: number }[] = [];
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

	create(data?: {
		mapKey?: string;
		spawnX?: number;
		spawnY?: number;
		returnSpawnX?: number;
		returnSpawnY?: number;
	}) {
		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0x88c070);
		this.currentMapKey = data?.mapKey ?? "mapa";
		this.returnSpawn =
			typeof data?.returnSpawnX === "number" &&
			typeof data?.returnSpawnY === "number"
				? { x: data.returnSpawnX, y: data.returnSpawnY }
				: null;
		this.centrifTexts = [];
		this.centrifCenters = [];

		// Criar o mapa
		this.map = this.make.tilemap({ key: this.currentMapKey });

		const tilesetImageKeys: Record<string, string> = {
			summer_outdoorsTileSheet: "summer_outdoorsTileSheet",
			summer_outdoorsTileSheet2: "summer_outdoorsTileSheet2",
			fall_Waterfalls: "fall_Waterfalls",
			Barn: "Barn",
			image: "image",
			Well: "Well",
			player: "player",
			centrifugadora: "centrifugadora",
		};

		const allTilesets = this.map.tilesets
			.map((ts) => {
				const textureKey = tilesetImageKeys[ts.name] ?? ts.name;
				return this.map?.addTilesetImage(ts.name, textureKey) ?? null;
			})
			.filter((t): t is Phaser.Tilemaps.Tileset => t !== null);

		const createdLayers = this.map.layers
			.map((layer) => this.map?.createLayer(layer.name, allTilesets) ?? null)
			.filter((layer): layer is Phaser.Tilemaps.TilemapLayer => layer !== null);

		const colisionLayer =
			createdLayers.find((layer) => layer.layer.name === "colision") ??
			createdLayers.find((layer) => layer.layer.name === "collision") ??
			null;

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

		// Spawn player at `playerSpawn` object if available, otherwise center
		let spawnX = mapWidth / 2;
		let spawnY = mapHeight / 2;
		const spawnLayer =
			this.map.getObjectLayer("playerSpawn") ??
			this.map.getObjectLayer("spawn");
		if (spawnLayer?.objects?.length) {
			const obj = spawnLayer.objects[0] as Phaser.Types.Tilemaps.TiledObject;
			spawnX = (obj.x ?? spawnX) + (obj.width ? obj.width / 2 : 0);
			spawnY = (obj.y ?? spawnY) + (obj.height ? obj.height / 2 : 0);
		}
		if (typeof data?.spawnX === "number" && typeof data?.spawnY === "number") {
			spawnX = data.spawnX;
			spawnY = data.spawnY;
		}

		this.player = this.physics.add
			.sprite(spawnX, spawnY, "player", 0)
			.setCollideWorldBounds(true);
		if (colisionLayer) {
			this.physics.add.collider(this.player, colisionLayer);
		}
		this.camera.startFollow(this.player, true, 0.1, 0.1);

		// Interaction key (F)
		this.interactKey = this.input.keyboard?.addKey(
			Phaser.Input.Keyboard.KeyCodes.F,
		);

		// Build interaction prompts from object layers, depending on the active map
		const interactionLayerName =
			this.currentMapKey === "centrifugadora" ? "spawn" : "centrifugadora";
		const interactionLayer = this.map.getObjectLayer(interactionLayerName);
		if (interactionLayer?.objects) {
			for (const obj of interactionLayer.objects) {
				const centerX = (obj.x ?? 0) + (obj.width ? obj.width / 2 : 0);
				const centerY = (obj.y ?? 0) + (obj.height ? obj.height / 2 : 0);
				this.centrifCenters.push({ x: centerX, y: centerY });
				const txt = this.createInteractionPrompt(centerX, centerY - 22);
				this.centrifTexts.push(txt);
			}
		}

		if (!this.anims.exists("player-walk-down")) {
			this.anims.create({
				key: "player-walk-down",
				frames: this.anims.generateFrameNumbers("player", {
					start: 0,
					end: 3,
				}),
				frameRate: 8,
				repeat: -1,
			});
		}
		if (!this.anims.exists("player-walk-left")) {
			this.anims.create({
				key: "player-walk-left",
				frames: this.anims.generateFrameNumbers("player", {
					start: 12,
					end: 15,
				}),
				frameRate: 8,
				repeat: -1,
			});
		}
		if (!this.anims.exists("player-walk-right")) {
			this.anims.create({
				key: "player-walk-right",
				frames: this.anims.generateFrameNumbers("player", {
					start: 4,
					end: 7,
				}),
				frameRate: 8,
				repeat: -1,
			});
		}
		if (!this.anims.exists("player-walk-up")) {
			this.anims.create({
				key: "player-walk-up",
				frames: this.anims.generateFrameNumbers("player", {
					start: 8,
					end: 11,
				}),
				frameRate: 8,
				repeat: -1,
			});
		}

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

		// Show/hide centrifugadora prompts when player is near and handle F
		if (this.centrifTexts.length > 0) {
			const px = this.player.x;
			const py = this.player.y;
			let anyVisible = false;
			let nearestVisibleCenter: { x: number; y: number } | null = null;
			let nearestDistance = Number.POSITIVE_INFINITY;
			for (let index = 0; index < this.centrifTexts.length; index += 1) {
				const txt = this.centrifTexts[index];
				const center = this.centrifCenters[index];
				const dx = px - center.x;
				const dy = py - center.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const visible = dist < 72;
				txt.setVisible(visible);
				if (visible) {
					anyVisible = true;
					if (dist < nearestDistance) {
						nearestDistance = dist;
						nearestVisibleCenter = center;
					}
				}
			}

			if (
				anyVisible &&
				this.interactKey &&
				Phaser.Input.Keyboard.JustDown(this.interactKey)
			) {
				if (this.currentMapKey !== "centrifugadora") {
					this.scene.restart({
						mapKey: "centrifugadora",
						returnSpawnX: nearestVisibleCenter?.x,
						returnSpawnY: nearestVisibleCenter?.y,
					});
				} else {
					this.scene.restart({
						mapKey: "mapa",
						spawnX: this.returnSpawn?.x,
						spawnY: this.returnSpawn?.y,
					});
				}
				EventBus.emit("centrif:interact");
			}
		}
	}

	private createInteractionPrompt(
		x: number,
		y: number,
	): Phaser.GameObjects.Container {
		const badge = this.add.graphics();
		badge.fillStyle(0x0f131b, 0.9);
		badge.lineStyle(1, 0x5d6577, 0.95);
		badge.fillRoundedRect(-54, -15, 108, 30, 10);
		badge.strokeRoundedRect(-54, -15, 108, 30, 10);
		badge.fillStyle(0xf9c74f, 0.95);
		badge.fillRoundedRect(-47, -10, 20, 20, 6);

		const keyText = this.add
			.text(-37, 0, "F", {
				fontFamily: '"Press Start 2P", monospace',
				fontSize: "9px",
				color: "#1f1600",
			})
			.setOrigin(0.5);

		const label = this.add
			.text(6, 0, "INTERACT", {
				fontFamily: '"Press Start 2P", monospace',
				fontSize: "8px",
				color: "#f7fafc",
				stroke: "#0b0f16",
				strokeThickness: 2,
			})
			.setOrigin(0.5);

		const container = this.add
			.container(x, y, [badge, keyText, label])
			.setDepth(200)
			.setVisible(false);

		container.setAlpha(0.95);
		return container;
	}
}
