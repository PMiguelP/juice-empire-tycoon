import Phaser from "phaser";
import type { TreePlant } from "./types";

const FRUIT_COLORS: Record<string, number> = {
	"orange-tree-seed": 0xf28c28,
	"pomegranate-tree-seed": 0x9d174d,
	"peach-tree-seed": 0xfb9f89,
	"lemon-tree-seed": 0xfacc15,
};

export class TreeRenderer {
	draw(tree: TreePlant) {
		const fruitColor = FRUIT_COLORS[tree.seedId] ?? 0xfacc15;
		const { x, y } = tree;
		tree.graphics.clear();
		tree.graphics.fillStyle(0x172016, 0.22);
		tree.graphics.fillEllipse(x, y + 2, 34, 10);

		if (tree.stage === "sprout") {
			this.drawSprout(tree);
			return;
		}

		this.drawTrunkAndCanopy(tree);
		this.drawTreeStateMarkers(tree);

		if (tree.hasFruit) {
			this.drawFruit(tree, fruitColor);
		}
		if (tree.hasPests) {
			this.drawPests(tree);
		}
	}

	private drawSprout(tree: TreePlant) {
		const { x, y } = tree;
		tree.graphics.lineStyle(3, 0x2f6b35, 1);
		tree.graphics.strokeLineShape(new Phaser.Geom.Line(x, y, x, y - 10));
		tree.graphics.fillStyle(0x63a548, 1);
		tree.graphics.fillEllipse(x - 5, y - 8, 12, 6);
		tree.graphics.fillEllipse(x + 5, y - 13, 12, 6);
		tree.graphics.fillStyle(0x9fd071, 0.95);
		tree.graphics.fillEllipse(x + 3, y - 15, 6, 3);
	}

	private drawTrunkAndCanopy(tree: TreePlant) {
		const { x, y } = tree;
		const trunkHeight = tree.stage === "small" ? 22 : 34;
		const trunkWidth = tree.stage === "small" ? 9 : 12;
		const canopyRadius = tree.stage === "small" ? 17 : 27;

		tree.graphics.fillStyle(0x7c4a24, 1);
		tree.graphics.fillRoundedRect(
			x - trunkWidth / 2,
			y - trunkHeight,
			trunkWidth,
			trunkHeight,
			4,
		);
		tree.graphics.fillStyle(0x9b6330, 0.8);
		tree.graphics.fillRect(x - 2, y - trunkHeight + 5, 2, trunkHeight - 8);
		tree.graphics.fillStyle(0x245f31, 1);
		tree.graphics.fillCircle(x, y - trunkHeight - 13, canopyRadius);
		tree.graphics.fillCircle(
			x - canopyRadius * 0.6,
			y - trunkHeight - 7,
			canopyRadius * 0.78,
		);
		tree.graphics.fillCircle(
			x + canopyRadius * 0.6,
			y - trunkHeight - 7,
			canopyRadius * 0.78,
		);
		tree.graphics.fillCircle(x, y - trunkHeight - 2, canopyRadius * 0.82);
		tree.graphics.fillStyle(0x3f8f45, 0.96);
		tree.graphics.fillCircle(
			x - canopyRadius * 0.28,
			y - trunkHeight - 18,
			canopyRadius * 0.58,
		);
		tree.graphics.fillCircle(
			x + canopyRadius * 0.34,
			y - trunkHeight - 15,
			canopyRadius * 0.52,
		);
		tree.graphics.fillStyle(0x79b65a, 0.5);
		tree.graphics.fillCircle(
			x - canopyRadius * 0.34,
			y - trunkHeight - 24,
			canopyRadius * 0.22,
		);
	}

	private drawTreeStateMarkers(tree: TreePlant) {
		const { x, y } = tree;
		if (tree.isWatered) {
			tree.graphics.fillStyle(0x38bdf8, 0.9);
			tree.graphics.fillCircle(x - 21, y - 6, 3);
			tree.graphics.fillCircle(x - 15, y - 2, 2);
		}
		if (tree.isFertilized) {
			tree.graphics.fillStyle(0xfacc15, 0.95);
			tree.graphics.fillCircle(x + 18, y - 5, 3);
			tree.graphics.fillCircle(x + 24, y - 1, 2);
		}
		if (tree.pestProtectionUntilDay) {
			tree.graphics.lineStyle(2, 0xb7f7c5, 0.85);
			tree.graphics.strokeCircle(x + 23, y - 14, 5);
		}
	}

	private drawFruit(tree: TreePlant, fruitColor: number) {
		const { x, y } = tree;
		const trunkHeight = tree.stage === "small" ? 22 : 34;

		tree.graphics.fillStyle(fruitColor, 1);
		tree.graphics.fillCircle(x - 10, y - trunkHeight - 17, 3.2);
		tree.graphics.fillCircle(x + 11, y - trunkHeight - 10, 3.2);
		tree.graphics.fillCircle(x + 2, y - trunkHeight - 24, 3.2);
		tree.graphics.fillCircle(x - 17, y - trunkHeight - 8, 3.2);
		tree.graphics.fillCircle(x + 18, y - trunkHeight - 22, 3.2);
	}

	private drawPests(tree: TreePlant) {
		const { x, y } = tree;
		const trunkHeight = tree.stage === "small" ? 22 : 34;
		const bugY = y - trunkHeight - 15;

		tree.graphics.fillStyle(0x171018, 0.95);
		tree.graphics.fillCircle(x - 14, bugY - 4, 2.6);
		tree.graphics.fillCircle(x + 7, bugY + 8, 2.4);
		tree.graphics.fillCircle(x + 18, bugY - 8, 2.2);
		tree.graphics.lineStyle(1, 0xd9f99d, 0.9);
		tree.graphics.strokeLineShape(
			new Phaser.Geom.Line(x - 17, bugY - 6, x - 21, bugY - 9),
		);
		tree.graphics.strokeLineShape(
			new Phaser.Geom.Line(x + 4, bugY + 6, x, bugY + 3),
		);
		tree.graphics.fillStyle(0xfacc15, 0.95);
		tree.graphics.fillCircle(x - 2, y - trunkHeight - 36, 7);
		tree.graphics.fillStyle(0x1f2937, 1);
		tree.graphics.fillRect(x - 3, y - trunkHeight - 41, 2, 7);
		tree.graphics.fillRect(x - 3, y - trunkHeight - 32, 2, 2);
	}
}
