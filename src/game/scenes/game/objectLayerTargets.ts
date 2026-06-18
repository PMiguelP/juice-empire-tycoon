import type Phaser from "phaser";
import type { InteractionTarget } from "./types";
import {
	addRectToBounds,
	createEmptyBounds,
	createTargetFromBounds,
} from "./interactionGeometry";

export const getObjectLayerCenterTarget = (
	map: Phaser.Tilemaps.Tilemap | undefined,
	layerName: string,
	action: NonNullable<InteractionTarget["action"]>,
	label: string,
) => {
	const objectLayer = map?.getObjectLayer(layerName);
	if (!objectLayer?.objects) {
		return null;
	}

	const bounds = createEmptyBounds();
	for (const object of objectLayer.objects) {
		addRectToBounds(
			bounds,
			object.x ?? 0,
			object.y ?? 0,
			object.width ?? 0,
			object.height ?? 0,
		);
	}

	return createTargetFromBounds(bounds, action, label);
};
