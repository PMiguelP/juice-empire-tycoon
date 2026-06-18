import type { Game } from "../Game";

export const createInteractionPrompt = (
	scene: Game,
	x: number,
	y: number,
	labelText: string,
) => {
	const badge = scene.add.graphics();
	const promptWidth = Math.max(64, labelText.length * 8 + 36);
	const halfWidth = promptWidth / 2;
	badge.fillStyle(0x0f131b, 0.9);
	badge.lineStyle(1, 0x5d6577, 0.95);
	badge.fillRoundedRect(-halfWidth, -11, promptWidth, 22, 8);
	badge.strokeRoundedRect(-halfWidth, -11, promptWidth, 22, 8);
	badge.fillStyle(0xf9c74f, 0.95);
	badge.fillRoundedRect(-halfWidth + 6, -7, 14, 14, 4);

	const keyText = scene.add
		.text(-halfWidth + 13, 0, "F", {
			fontFamily: '"Press Start 2P", monospace',
			fontSize: "7px",
			color: "#1f1600",
		})
		.setOrigin(0.5);

	const label = scene.add
		.text(12, 0, labelText, {
			fontFamily: '"Press Start 2P", monospace',
			fontSize: "6px",
			color: "#f7fafc",
			stroke: "#0b0f16",
			strokeThickness: 1,
		})
		.setOrigin(0.5);

	return scene.add
		.container(x, y, [badge, keyText, label])
		.setDepth(200)
		.setVisible(false)
		.setAlpha(0.95);
};
