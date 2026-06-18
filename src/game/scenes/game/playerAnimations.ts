import type { Game } from "../Game";

export type PlayerDirection = "down" | "up" | "left" | "right";

const PLAYER_ANIMATIONS = [
	{ direction: "down", key: "player-walk-down", start: 0, end: 3 },
	{ direction: "left", key: "player-walk-left", start: 12, end: 15 },
	{ direction: "right", key: "player-walk-right", start: 4, end: 7 },
	{ direction: "up", key: "player-walk-up", start: 8, end: 11 },
] as const;

const IDLE_FRAMES: Record<PlayerDirection, number> = {
	down: 0,
	right: 4,
	up: 8,
	left: 12,
};

export const getPlayerWalkAnimation = (direction: PlayerDirection) => {
	return `player-walk-${direction}`;
};

export const getPlayerIdleFrame = (direction: PlayerDirection) => {
	return IDLE_FRAMES[direction];
};

export const createPlayerAnimations = (scene: Game) => {
	for (const animation of PLAYER_ANIMATIONS) {
		if (scene.anims.exists(animation.key)) {
			continue;
		}
		scene.anims.create({
			key: animation.key,
			frames: scene.anims.generateFrameNumbers("player", {
				start: animation.start,
				end: animation.end,
			}),
			frameRate: 8,
			repeat: -1,
		});
	}
};
