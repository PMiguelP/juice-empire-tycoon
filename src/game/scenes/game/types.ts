import type Phaser from "phaser";
import type { FarmTreeSave } from "../../../composables/usePlayerData";
import type { INTERIOR_MAP_KEYS } from "./constants";

export type TreeStage = "sprout" | "small" | "full";
export type SulfateQuality = "perfect" | "good" | "poor";

export type PlantTarget = {
	tileX: number;
	tileY: number;
	worldX: number;
	worldY: number;
	fieldName: string;
};

export type InteriorMapKey = (typeof INTERIOR_MAP_KEYS)[number];

export type InteractionTarget = {
	x: number;
	y: number;
	bounds?: {
		minX: number;
		minY: number;
		maxX: number;
		maxY: number;
	};
	mapKey?: InteriorMapKey;
	action?:
		| "enter"
		| "exit"
		| "farm"
		| "shop"
		| "sell"
		| "juice"
		| "chest"
		| "contracts"
		| "water"
		| "camera";
	label?: string;
};

export type GameSceneData = {
	mapKey?: string;
	spawnX?: number;
	spawnY?: number;
	returnSpawnX?: number;
	returnSpawnY?: number;
};

export type TreePlant = FarmTreeSave & {
	stage: TreeStage;
	isRegrowing: boolean;
	graphics: Phaser.GameObjects.Graphics;
	trunkCollider: Phaser.GameObjects.Rectangle;
	growthTimers: Phaser.Time.TimerEvent[];
	regrowTimer?: Phaser.Time.TimerEvent;
};
