import Phaser from "phaser";
import type { InteractionTarget } from "./types";

export type InteractionBounds = NonNullable<InteractionTarget["bounds"]>;

export const createEmptyBounds = (): InteractionBounds => ({
	minX: Number.POSITIVE_INFINITY,
	minY: Number.POSITIVE_INFINITY,
	maxX: Number.NEGATIVE_INFINITY,
	maxY: Number.NEGATIVE_INFINITY,
});

export const isValidBounds = (bounds: InteractionBounds) => {
	return Number.isFinite(bounds.minX) && Number.isFinite(bounds.minY);
};

export const addRectToBounds = (
	bounds: InteractionBounds,
	x = 0,
	y = 0,
	width = 0,
	height = 0,
) => {
	bounds.minX = Math.min(bounds.minX, x);
	bounds.minY = Math.min(bounds.minY, y);
	bounds.maxX = Math.max(bounds.maxX, x + width);
	bounds.maxY = Math.max(bounds.maxY, y + height);
};

export const createTargetFromBounds = (
	bounds: InteractionBounds,
	action: NonNullable<InteractionTarget["action"]>,
	label: string,
): InteractionTarget | null => {
	if (!isValidBounds(bounds)) {
		return null;
	}

	return {
		x: (bounds.minX + bounds.maxX) / 2,
		y: bounds.maxY,
		bounds,
		action,
		label,
	};
};

export const getDistanceToTarget = (
	x: number,
	y: number,
	target: InteractionTarget,
) => {
	if (!target.bounds) {
		const dx = x - target.x;
		const dy = y - target.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	const closestX = Phaser.Math.Clamp(x, target.bounds.minX, target.bounds.maxX);
	const closestY = Phaser.Math.Clamp(y, target.bounds.minY, target.bounds.maxY);
	const dx = x - closestX;
	const dy = y - closestY;
	return Math.sqrt(dx * dx + dy * dy);
};
