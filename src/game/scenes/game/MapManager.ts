import Phaser from "phaser";
import type { Game } from "../Game";
import { INTERIOR_MAP_KEYS } from "./constants";
import type { GameSceneData, InteriorMapKey } from "./types";

const TILESET_IMAGE_KEYS: Record<string, string> = {
	summer_outdoorsTileSheet: "summer_outdoorsTileSheet",
	summer_outdoorsTileSheet2: "summer_outdoorsTileSheet2",
	fall_Waterfalls: "fall_Waterfalls",
	Barn: "Barn",
	image: "image",
	Well: "Well",
	player: "playerTileset",
	Big_Shed: "Big_Shed",
	Coop: "Coop",
	Log_Cabin: "Log_Cabin",
	Stone_Cabin: "Stone_Cabin",
	centrifugadora: "centrifugadora",
	barn: "barnbau",
	camera: "camera",
	mercado: "mercado",
	mercadocompra: "mercadocompra",
};

export class MapManager {
	private readonly scene: Game;
	private unlockedFieldNames = new Set(["field1"]);

	createdLayers: Phaser.Tilemaps.TilemapLayer[] = [];
	collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
	mapWidth = 0;
	mapHeight = 0;

	constructor(scene: Game) {
		this.scene = scene;
	}

	setup(data?: GameSceneData) {
		this.scene.camera = this.scene.cameras.main;
		this.scene.currentMapKey = data?.mapKey ?? "mapa";
		this.scene.camera.setBackgroundColor(
			this.isInteriorMap() ? 0x000000 : 0x88c070,
		);

		this.scene.map = this.scene.make.tilemap({
			key: this.scene.currentMapKey,
		});

		const allTilesets = this.scene.map.tilesets
			.map((tileset) => {
				const textureKey = TILESET_IMAGE_KEYS[tileset.name] ?? tileset.name;
				if (!this.scene.textures.exists(textureKey)) {
					console.warn(`Missing tileset texture: ${textureKey}`);
					return null;
				}
				return this.scene.map?.addTilesetImage(tileset.name, textureKey) ?? null;
			})
			.filter((tileset): tileset is Phaser.Tilemaps.Tileset => tileset !== null);

		this.createdLayers = this.scene.map.layers
			.map((layer) => this.scene.map?.createLayer(layer.name, allTilesets) ?? null)
			.filter(
				(layer): layer is Phaser.Tilemaps.TilemapLayer => layer !== null,
			);
		this.applyFieldLayerUnlocks();

		this.collisionLayer =
			this.createdLayers.find((layer) => layer.layer.name === "colision") ??
			this.createdLayers.find((layer) => layer.layer.name === "collision") ??
			null;

		if (this.collisionLayer) {
			this.collisionLayer.setCollisionByExclusion([-1]);
			this.collisionLayer.setVisible(false);
		}

		this.mapWidth = this.scene.map.widthInPixels;
		this.mapHeight = this.scene.map.heightInPixels;
		this.scene.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
		this.configureCameraForMap();
	}

	getSpawnPosition(data?: GameSceneData) {
		if (!this.scene.map) {
			return { x: 0, y: 0 };
		}

		let x = this.mapWidth / 2;
		let y = this.mapHeight / 2;
		const spawnLayer =
			this.scene.map.getObjectLayer("playerSpawn") ??
			this.scene.map.getObjectLayer("spawn");

		if (spawnLayer?.objects?.length) {
			const object = spawnLayer.objects[0] as Phaser.Types.Tilemaps.TiledObject;
			x = (object.x ?? x) + (object.width ? object.width / 2 : 0);
			y = (object.y ?? y) + (object.height ? object.height / 2 : 0);
		}

		if (typeof data?.spawnX === "number" && typeof data?.spawnY === "number") {
			x = data.spawnX;
			y = data.spawnY;
		}

		return { x, y };
	}

	handleUnlockedFields(fieldNames: string[]) {
		this.unlockedFieldNames = new Set(fieldNames);
		this.applyFieldLayerUnlocks();
	}

	applyFieldLayerUnlocks() {
		if (!this.scene.map || this.scene.currentMapKey !== "mapa") {
			return;
		}

		for (const layerData of this.scene.map.layers) {
			if (!/^field\d+$/i.test(layerData.name)) {
				continue;
			}
			const layer = this.scene.map.getLayer(layerData.name)?.tilemapLayer ?? null;
			if (!layer) {
				continue;
			}
			if (this.unlockedFieldNames.has(layerData.name)) {
				layer.setTint(0xffffff);
				layer.setAlpha(1);
			} else {
				layer.setTint(0x8a8f98);
				layer.setAlpha(0.58);
			}
		}
	}

	configureCameraForMap() {
		const zoomX = this.scene.camera.width / this.mapWidth;
		const zoomY = this.scene.camera.height / this.mapHeight;

		if (this.isInteriorMap()) {
			const containZoom = Math.min(zoomX, zoomY);
			const crispZoom = containZoom >= 1 ? Math.floor(containZoom) : containZoom;
			const zoom = Math.min(crispZoom, 2);
			const visibleWorldWidth = this.scene.camera.width / zoom;
			const visibleWorldHeight = this.scene.camera.height / zoom;
			const marginX = Math.max(0, (visibleWorldWidth - this.mapWidth) / 2);
			const marginY = Math.max(0, (visibleWorldHeight - this.mapHeight) / 2);
			this.scene.camera.setBounds(
				-marginX,
				-marginY,
				this.mapWidth + marginX * 2,
				this.mapHeight + marginY * 2,
			);
			this.scene.camera.setZoom(zoom);
			this.scene.camera.centerOn(this.mapWidth / 2, this.mapHeight / 2);
			return;
		}

		this.scene.camera.setBounds(0, 0, this.mapWidth, this.mapHeight);
		this.scene.camera.setZoom(Math.max(zoomX, zoomY));
		this.scene.camera.centerOn(this.mapWidth / 2, this.mapHeight / 2);
	}

	isInteriorMap(mapKey = this.scene.currentMapKey) {
		return INTERIOR_MAP_KEYS.includes(mapKey as InteriorMapKey);
	}

	getUnlockedFieldNameAt(tileX: number, tileY: number) {
		if (!this.scene.map) {
			return null;
		}

		for (const layerData of this.scene.map.layers) {
			if (!/^field\d+$/i.test(layerData.name)) {
				continue;
			}
			if (!this.unlockedFieldNames.has(layerData.name)) {
				continue;
			}
			const layer = this.scene.map.getLayer(layerData.name)?.tilemapLayer ?? null;
			const tile = layer?.getTileAt(tileX, tileY);
			if (tile && tile.index >= 0) {
				return layerData.name;
			}
		}

		return null;
	}
}
