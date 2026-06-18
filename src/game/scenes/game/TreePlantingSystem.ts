import Phaser from "phaser";
import type { Game } from "../Game";
import { TREE_AREA_RADIUS_TILES } from "./constants";
import type { PlantTarget } from "./types";

export class TreePlantingSystem {
	private readonly preview: Phaser.GameObjects.Graphics;
	private selectedSeedId: string | null = null;

	constructor(
		private readonly scene: Game,
		private readonly isAreaFree: (tileX: number, tileY: number) => boolean,
		private readonly isTileFree: (tileX: number, tileY: number) => boolean,
		private readonly onPointerPlantRequested: (
			seedId: string,
			target: PlantTarget,
		) => void,
	) {
		this.preview = this.scene.add.graphics().setDepth(10_000).setVisible(false);
		this.scene.input.on(
			Phaser.Input.Events.POINTER_DOWN,
			this.handlePointerDown,
			this,
		);
	}

	destroy() {
		this.scene.input.off(
			Phaser.Input.Events.POINTER_DOWN,
			this.handlePointerDown,
			this,
		);
		this.preview.destroy();
	}

	getPlantableTilePosition(): PlantTarget | null {
		if (!this.scene.map || !this.scene.player) {
			return null;
		}

		const playerFieldName = this.getPlayerFieldName();
		return playerFieldName
			? this.getRandomPlantTargetInField(playerFieldName)
			: null;
	}

	updatePointerPreview(seedId: string | null) {
		this.selectedSeedId = seedId;
		const playerFieldName = this.getPlayerFieldName();
		if (
			!seedId ||
			!this.scene.map ||
			this.scene.currentMapKey !== "mapa" ||
			!playerFieldName
		) {
			this.hidePreview();
			return;
		}

		const pointer = this.scene.input.activePointer;
		const tileX = this.scene.map.worldToTileX(pointer.worldX) ?? 0;
		const tileY = this.scene.map.worldToTileY(pointer.worldY) ?? 0;
		const target = this.createTarget(tileX, tileY, this.scene.map.tileWidth);
		const isValid = Boolean(this.resolvePlantTarget(tileX, tileY, playerFieldName));
		this.drawPreview(target, playerFieldName, isValid);
	}

	hidePreview() {
		this.selectedSeedId = null;
		this.preview.clear();
		this.preview.setVisible(false);
	}

	resolvePlantTarget(
		tileX: number,
		tileY: number,
		requiredFieldName = this.getPlayerFieldName(),
	): PlantTarget | null {
		if (!this.scene.map) {
			return null;
		}

		const fieldName = this.scene.mapManager.getUnlockedFieldNameAt(tileX, tileY);
		if (!fieldName || fieldName !== requiredFieldName || !this.isAreaFree(tileX, tileY)) {
			return null;
		}

		return this.createTarget(tileX, tileY, this.scene.map.tileWidth, fieldName);
	}

	private getRandomPlantTargetInField(fieldName: string): PlantTarget | null {
		if (!this.scene.map) {
			return null;
		}

		const layer = this.scene.map.getLayer(fieldName)?.tilemapLayer ?? null;
		if (!layer) {
			return null;
		}

		const validTiles: PlantTarget[] = [];
		for (let tileY = 0; tileY < this.scene.map.height; tileY += 1) {
			for (let tileX = 0; tileX < this.scene.map.width; tileX += 1) {
				const tile = layer.getTileAt(tileX, tileY);
				if (
					!tile ||
					tile.index < 0 ||
					!this.isAreaFree(tileX, tileY)
				) {
					continue;
				}
				validTiles.push(
					this.createTarget(tileX, tileY, this.scene.map.tileWidth, fieldName),
				);
			}
		}

		return validTiles.length > 0 ? Phaser.Utils.Array.GetRandom(validTiles) : null;
	}

	private getPlayerFieldName(): string | null {
		if (!this.scene.map || !this.scene.player || this.scene.currentMapKey !== "mapa") {
			return null;
		}

		const bodyX = this.scene.playerManager.getPlayerBodyX();
		const bodyY = this.scene.playerManager.getPlayerBodyY();
		const body = this.scene.playerManager.bodySize;
		const feet = this.scene.playerManager.getPlayerFeetPosition();
		const points = [
			feet,
			{ x: bodyX + body.width / 2, y: bodyY + body.height - 1 },
			{ x: bodyX + 1, y: bodyY + body.height - 1 },
			{ x: bodyX + body.width - 1, y: bodyY + body.height - 1 },
		];

		for (const point of points) {
			const tileX = this.scene.map.worldToTileX(point.x) ?? 0;
			const tileY = this.scene.map.worldToTileY(point.y) ?? 0;
			const fieldName = this.scene.mapManager.getUnlockedFieldNameAt(tileX, tileY);
			if (fieldName) {
				return fieldName;
			}
		}

		return null;
	}

	private createTarget(
		tileX: number,
		tileY: number,
		tileSize: number,
		fieldName = "",
	): PlantTarget {
		return {
			tileX,
			tileY,
			worldX: tileX * tileSize + tileSize / 2,
			worldY: tileY * tileSize + tileSize,
			fieldName,
		};
	}

	private handlePointerDown() {
		if (!this.selectedSeedId || !this.scene.map || this.scene.currentMapKey !== "mapa") {
			return;
		}

		const pointer = this.scene.input.activePointer;
		const tileX = this.scene.map.worldToTileX(pointer.worldX) ?? 0;
		const tileY = this.scene.map.worldToTileY(pointer.worldY) ?? 0;
		const target = this.resolvePlantTarget(tileX, tileY);
		if (target) {
			this.onPointerPlantRequested(this.selectedSeedId, target);
		}
	}

	private drawPreview(
		target: PlantTarget,
		requiredFieldName: string,
		isValid: boolean,
	) {
		if (!this.scene.map) {
			this.hidePreview();
			return;
		}

		const tileSize = this.scene.map.tileWidth;
		const centerFieldName = this.scene.mapManager.getUnlockedFieldNameAt(
			target.tileX,
			target.tileY,
		);
		const isCenterValid = centerFieldName === requiredFieldName;
		this.preview.clear();
		this.preview.setVisible(true);

		for (
			let yOffset = -TREE_AREA_RADIUS_TILES;
			yOffset <= TREE_AREA_RADIUS_TILES;
			yOffset += 1
		) {
			for (
				let xOffset = -TREE_AREA_RADIUS_TILES;
				xOffset <= TREE_AREA_RADIUS_TILES;
				xOffset += 1
			) {
				const tileX = target.tileX + xOffset;
				const tileY = target.tileY + yOffset;
				const isTileValid = isCenterValid && this.isTileFree(tileX, tileY);
				const fillColor = isTileValid ? 0x22c55e : 0xef4444;
				const strokeColor = isTileValid ? 0xbbf7d0 : 0xfca5a5;
				const x = (target.tileX + xOffset) * tileSize;
				const y = (target.tileY + yOffset) * tileSize;
				this.preview.fillStyle(fillColor, isValid ? 0.22 : 0.3);
				this.preview.lineStyle(1, strokeColor, 0.88);
				this.preview.fillRect(x, y, tileSize, tileSize);
				this.preview.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
			}
		}
	}
}
