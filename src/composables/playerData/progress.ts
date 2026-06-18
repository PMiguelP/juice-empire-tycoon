import { getXpForNextLevel } from "./normalizers";

export const getLevelProgress = (xp: number, level: number) => {
	return Math.min(1, Math.max(0, xp / getXpForNextLevel(level)));
};

export const applyXpGain = (
	currentXp: number,
	currentLevel: number,
	amount: number,
) => {
	const gained = Math.max(0, Math.floor(amount));
	let nextXp = currentXp + gained;
	let nextLevel = currentLevel;

	while (nextXp >= getXpForNextLevel(nextLevel)) {
		nextXp -= getXpForNextLevel(nextLevel);
		nextLevel += 1;
	}

	return {
		amount: gained,
		xp: nextXp,
		level: nextLevel,
		leveledUp: nextLevel > currentLevel,
	};
};
