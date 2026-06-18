import type Phaser from "phaser";
import type { InteractionTarget } from "./types";
import {
	addRectToBounds,
	createEmptyBounds,
	createTargetFromBounds,
} from "./interactionGeometry";

const NEIGHBOR_OFFSETS = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
];

const getTileKey = (tile: Phaser.Tilemaps.Tile) => `${tile.x},${tile.y}`;

const collectFilledTiles = (tileLayer: Phaser.Tilemaps.TilemapLayer) => {
	const pendingTiles = new Set<string>();
	const tilesByKey = new Map<string, Phaser.Tilemaps.Tile>();

	tileLayer.forEachTile((tile) => {
		if (tile.index < 0) {
			return;
		}
		const key = getTileKey(tile);
		pendingTiles.add(key);
		tilesByKey.set(key, tile);
	});

	return { pendingTiles, tilesByKey };
};

const collectTileClusterTarget = (
	firstKey: string,
	pendingTiles: Set<string>,
	tilesByKey: Map<string, Phaser.Tilemaps.Tile>,
	action: NonNullable<InteractionTarget["action"]>,
	label: string,
) => {
	const bounds = createEmptyBounds();
	const stack = [firstKey];
	pendingTiles.delete(firstKey);

	while (stack.length > 0) {
		const key = stack.pop();
		const tile = key ? tilesByKey.get(key) : null;
		if (!tile) {
			continue;
		}

		addRectToBounds(bounds, tile.pixelX, tile.pixelY, tile.width, tile.height);

		for (const [offsetX, offsetY] of NEIGHBOR_OFFSETS) {
			const nextKey = `${tile.x + offsetX},${tile.y + offsetY}`;
			if (!pendingTiles.has(nextKey)) {
				continue;
			}
			pendingTiles.delete(nextKey);
			stack.push(nextKey);
		}
	}

	return createTargetFromBounds(bounds, action, label);
};

export const getTileLayerTargets = (
	map: Phaser.Tilemaps.Tilemap | undefined,
	layerName: string,
	action: NonNullable<InteractionTarget["action"]>,
	label: string,
) => {
	const tileLayer = map?.getLayer(layerName)?.tilemapLayer;
	if (!tileLayer) {
		return [];
	}

	const { pendingTiles, tilesByKey } = collectFilledTiles(tileLayer);
	const targets: InteractionTarget[] = [];

	while (pendingTiles.size > 0) {
		const firstKey = pendingTiles.values().next().value;
		if (!firstKey) {
			break;
		}

		const target = collectTileClusterTarget(
			firstKey,
			pendingTiles,
			tilesByKey,
			action,
			label,
		);
		if (target) {
			targets.push(target);
		}
	}

	return targets;
};
