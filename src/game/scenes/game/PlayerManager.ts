import Phaser from "phaser";
import type { PlayerSave } from "../../../composables/usePlayerData";
import { EventBus } from "../../EventBus";
import type { Game } from "../Game";
import { PLAYER_SAVE_INTERVAL_MS } from "./constants";
import {
	createPlayerAnimations,
	getPlayerIdleFrame,
	getPlayerWalkAnimation,
	type PlayerDirection,
} from "./playerAnimations";
import type { GameSceneData, PlantTarget } from "./types";

export class PlayerManager {
	private readonly scene: Game;
	private wasd?: {
		up: Phaser.Input.Keyboard.Key;
		down: Phaser.Input.Keyboard.Key;
		left: Phaser.Input.Keyboard.Key;
		right: Phaser.Input.Keyboard.Key;
	};
	private levelUpKey?: Phaser.Input.Keyboard.Key;
	private lastDirection: PlayerDirection = "down";
	private lastPlayerStateEmitAt = 0;
	private lastPlayerStateKey = "";
	private walkingSound?: Phaser.Sound.BaseSound;

	readonly spriteSize = { width: 16, height: 32 };
	readonly bodySize = { width: 10, height: 6, offsetX: 3, offsetY: 26 };

	constructor(scene: Game) {
		this.scene = scene;
	}

	setup(data?: GameSceneData) {
		const spawn = this.scene.mapManager.getSpawnPosition(data);
		this.scene.player = this.scene.physics.add
			.sprite(spawn.x, spawn.y, "player", 0)
			.setCollideWorldBounds(true);

		if (this.scene.mapManager.collisionLayer) {
			this.scene.physics.add.collider(
				this.scene.player,
				this.scene.mapManager.collisionLayer,
			);
		}

		this.scene.player.setSize(this.bodySize.width, this.bodySize.height);
		this.scene.player.setOffset(this.bodySize.offsetX, this.bodySize.offsetY);
		this.configureCameraFollow();
		createPlayerAnimations(this.scene);
		this.setupWalkingSound();

		this.wasd = this.scene.input.keyboard?.addKeys({
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

		this.levelUpKey = this.scene.input.keyboard?.addKey(
			Phaser.Input.Keyboard.KeyCodes.U,
		);
	}

	update() {
		if (!this.scene.player || !this.wasd) {
			return;
		}

		if (this.levelUpKey && Phaser.Input.Keyboard.JustDown(this.levelUpKey)) {
			EventBus.emit("hud:add-coins", 25);
			EventBus.emit("hud:add-level", 1);
		}

		const speed = 120;
		this.scene.player.setVelocity(0, 0);

		const movingUp = this.wasd.up.isDown;
		const movingDown = this.wasd.down.isDown;
		const movingLeft = this.wasd.left.isDown;
		const movingRight = this.wasd.right.isDown;
		const velocityX = Number(movingRight) - Number(movingLeft);
		const velocityY = Number(movingDown) - Number(movingUp);

		if (velocityX !== 0 || velocityY !== 0) {
			this.startWalkingSound();
			const velocity = new Phaser.Math.Vector2(velocityX, velocityY)
				.normalize()
				.scale(speed);
			this.scene.player.setVelocity(velocity.x, velocity.y);

			this.lastDirection = this.getDirectionFromVelocity(velocityX, velocityY);
			this.scene.player.anims.play(
				getPlayerWalkAnimation(this.lastDirection),
				true,
			);
			this.emitPlayerStateChanged();
			return;
		}

		this.stopWalkingSound();
		this.scene.player.anims.stop();
		this.scene.player.setFrame(getPlayerIdleFrame(this.lastDirection));
		this.emitPlayerStateChanged();
	}

	destroy() {
		this.stopWalkingSound();
		this.walkingSound?.destroy();
		this.walkingSound = undefined;
	}

	handlePlayerState(state: PlayerSave) {
		if (!this.scene.player || !this.scene.map) {
			return;
		}

		const nextMapKey = state.mapKey || "mapa";
		const hasSavedPosition =
			typeof state.x === "number" && typeof state.y === "number";

		if (nextMapKey !== this.scene.currentMapKey) {
			this.scene.suppressNextShutdownPlayerSave = true;
			this.scene.scene.restart({
				mapKey: nextMapKey,
				spawnX: hasSavedPosition ? state.x : undefined,
				spawnY: hasSavedPosition ? state.y : undefined,
				returnSpawnX: state.returnSpawnX ?? undefined,
				returnSpawnY: state.returnSpawnY ?? undefined,
			});
			return;
		}

		if (hasSavedPosition) {
			this.scene.player.setPosition(state.x, state.y);
			this.scene.returnSpawn =
				typeof state.returnSpawnX === "number" &&
				typeof state.returnSpawnY === "number"
					? { x: state.returnSpawnX, y: state.returnSpawnY }
					: this.scene.returnSpawn;
			this.emitPlayerStateChanged(true);
		}
	}

	emitPlayerStateChanged(force = false) {
		if (!this.scene.player) {
			return;
		}

		const now = Date.now();
		const x = Math.round(this.scene.player.x);
		const y = Math.round(this.scene.player.y);
		const state: PlayerSave = {
			mapKey: this.scene.currentMapKey,
			x,
			y,
			returnSpawnX: this.scene.returnSpawn?.x ?? null,
			returnSpawnY: this.scene.returnSpawn?.y ?? null,
		};
		const stateKey = JSON.stringify(state);
		if (
			!force &&
			(stateKey === this.lastPlayerStateKey ||
				now - this.lastPlayerStateEmitAt < PLAYER_SAVE_INTERVAL_MS)
		) {
			return;
		}

		this.lastPlayerStateEmitAt = now;
		this.lastPlayerStateKey = stateKey;
		EventBus.emit("farm:player-state-changed", state);
	}

	getFacingTilePosition(): PlantTarget {
		const tileSize = this.scene.map?.tileWidth ?? 16;
		const feet = this.getPlayerFeetPosition();
		let x = feet.x;
		let y = feet.y;

		if (this.lastDirection === "left") {
			x -= tileSize;
		} else if (this.lastDirection === "right") {
			x += tileSize;
		} else if (this.lastDirection === "up") {
			y -= tileSize;
		} else {
			y += tileSize;
		}

		const tileX = this.scene.map?.worldToTileX(x) ?? 0;
		const tileY = this.scene.map?.worldToTileY(y) ?? 0;
		return {
			tileX,
			tileY,
			worldX: tileX * tileSize + tileSize / 2,
			worldY: tileY * tileSize + tileSize,
			fieldName: "",
		};
	}

	getPlayerFeetPosition() {
		if (!this.scene.player) {
			return { x: 0, y: 0 };
		}

		return {
			x: this.getPlayerBodyX() + this.bodySize.width / 2,
			y: this.getPlayerBodyY() + this.bodySize.height - 1,
		};
	}

	getPlayerBodyX() {
		if (!this.scene.player) {
			return 0;
		}
		return (
			this.scene.player.x -
			this.spriteSize.width / 2 +
			this.bodySize.offsetX
		);
	}

	getPlayerBodyY() {
		if (!this.scene.player) {
			return 0;
		}
		return (
			this.scene.player.y -
			this.spriteSize.height / 2 +
			this.bodySize.offsetY
		);
	}

	private configureCameraFollow() {
		if (!this.scene.player) {
			return;
		}
		if (this.scene.mapManager.isInteriorMap()) {
			this.scene.camera.stopFollow();
			this.scene.camera.centerOn(
				this.scene.mapManager.mapWidth / 2,
				this.scene.mapManager.mapHeight / 2,
			);
			return;
		}
		this.scene.camera.startFollow(this.scene.player, true, 0.1, 0.1);
	}

	private setupWalkingSound() {
		if (!this.scene.cache.audio.exists("sfx-walk")) {
			return;
		}
		this.walkingSound = this.scene.sound.add("sfx-walk", {
			loop: true,
			volume: 0.16,
			rate: 1.05,
		});
	}

	private startWalkingSound() {
		if (!this.walkingSound || this.walkingSound.isPlaying) {
			return;
		}
		this.walkingSound.play();
	}

	private stopWalkingSound() {
		if (!this.walkingSound?.isPlaying) {
			return;
		}
		this.walkingSound.stop();
	}

	private getDirectionFromVelocity(
		velocityX: number,
		velocityY: number,
	): PlayerDirection {
		if (velocityX < 0) {
			return "left";
		}
		if (velocityX > 0) {
			return "right";
		}
		if (velocityY < 0) {
			return "up";
		}
		return "down";
	}
}
