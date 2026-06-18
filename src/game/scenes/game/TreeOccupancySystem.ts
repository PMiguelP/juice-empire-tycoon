import { TREE_AREA_RADIUS_TILES } from "./constants";

export class TreeOccupancySystem {
	private readonly occupiedTiles = new Set<string>();

	clear() {
		this.occupiedTiles.clear();
	}

	isAreaFree(tileX: number, tileY: number) {
		return this.forEachTreeAreaTile(tileX, tileY, (areaTileX, areaTileY) => {
			return !this.isTileOccupied(areaTileX, areaTileY);
		});
	}

	isTileFree(tileX: number, tileY: number) {
		return !this.isTileOccupied(tileX, tileY);
	}

	blockArea(tileX: number, tileY: number) {
		this.forEachTreeAreaTile(tileX, tileY, (areaTileX, areaTileY) => {
			this.occupiedTiles.add(this.getTileKey(areaTileX, areaTileY));
		});
	}

	blockAreaFromKey(tileKey: string) {
		const [tileX, tileY] = tileKey.split(":").map(Number);
		if (!Number.isFinite(tileX) || !Number.isFinite(tileY)) {
			return;
		}
		this.blockArea(tileX, tileY);
	}

	private isTileOccupied(tileX: number, tileY: number) {
		return this.occupiedTiles.has(this.getTileKey(tileX, tileY));
	}

	private getTileKey(tileX: number, tileY: number) {
		return `${tileX}:${tileY}`;
	}

	private forEachTreeAreaTile(
		tileX: number,
		tileY: number,
		visit: (areaTileX: number, areaTileY: number) => boolean | void,
	) {
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
				if (visit(tileX + xOffset, tileY + yOffset) === false) {
					return false;
				}
			}
		}
		return true;
	}
}
