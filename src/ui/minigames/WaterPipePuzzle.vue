<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMinigameTimer } from "./useMinigameTimer";

type Direction = "up" | "right" | "down" | "left";
type PipeCell = {
	id: string;
	base: Direction[];
	rotation: number;
	isSource?: boolean;
	isBucket?: boolean;
};

const props = defineProps({
	open: { type: Boolean, required: true },
	labels: { type: Object, required: true },
});

const emit = defineEmits<{
	(event: "success", quantity: number): void;
	(event: "fail"): void;
	(event: "close"): void;
}>();

const size = 5;
const cells = ref<PipeCell[]>([]);
const message = ref("");
const timer = useMinigameTimer(30_000, () => {
	message.value = props.labels.fail;
	emit("fail");
});

const opposite: Record<Direction, Direction> = {
	up: "down",
	right: "left",
	down: "up",
	left: "right",
};

const directionDelta: Record<Direction, { x: number; y: number }> = {
	up: { x: 0, y: -1 },
	right: { x: 1, y: 0 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
};

const directionOrder: Direction[] = ["up", "right", "down", "left"];

const rotateDirection = (direction: Direction, rotation: number) => {
	const index = directionOrder.indexOf(direction);
	return directionOrder[(index + rotation) % directionOrder.length];
};

const getOpenings = (cell: PipeCell) => {
	return new Set(cell.base.map((direction) => rotateDirection(direction, cell.rotation)));
};

const pipeGlyph = (cell: PipeCell) => {
	const openings = getOpenings(cell);
	const key = directionOrder.filter((direction) => openings.has(direction)).join("-");
	const glyphs: Record<string, string> = {
		"up-down": "┃",
		"right-left": "━",
		"up-right": "┗",
		"right-down": "┏",
		"down-left": "┓",
		"up-left": "┛",
		"up-right-down": "┣",
		"right-down-left": "┳",
		"up-down-left": "┫",
		"up-right-left": "┻",
		"up-right-down-left": "╋",
	};
	return glyphs[key] ?? "•";
};

const cellAt = (x: number, y: number) => cells.value[y * size + x] ?? null;

const toIndex = (x: number, y: number) => y * size + x;

const randomRotation = () => Math.floor(Math.random() * 4);

const makePathCells = () => {
	const path = [
		{ x: 0, y: 2 },
		{ x: 1, y: 2 },
		{ x: 1, y: 1 },
		{ x: 2, y: 1 },
		{ x: 3, y: 1 },
		{ x: 3, y: 2 },
		{ x: 3, y: 3 },
		{ x: 4, y: 3 },
	];
	const nextCells = Array.from({ length: size * size }, (_, index): PipeCell => {
		const filler: Direction[][] = [
			["up", "down"],
			["right", "left"],
			["up", "right"],
			["right", "down"],
			["up", "right", "down"],
		];
		return {
			id: `pipe-${index}-${Date.now()}`,
			base: filler[index % filler.length],
			rotation: randomRotation(),
		};
	});

	for (let index = 0; index < path.length; index += 1) {
		const current = path[index];
		const previous = path[index - 1];
		const next = path[index + 1];
		const openings: Direction[] = [];

		if (!previous) {
			openings.push("left");
		} else {
			const previousDirection = directionOrder.find((direction) => {
				const delta = directionDelta[direction];
				return current.x + delta.x === previous.x && current.y + delta.y === previous.y;
			});
			if (previousDirection) {
				openings.push(previousDirection);
			}
		}

		if (!next) {
			openings.push("right");
		} else {
			const nextDirection = directionOrder.find((direction) => {
				const delta = directionDelta[direction];
				return current.x + delta.x === next.x && current.y + delta.y === next.y;
			});
			if (nextDirection) {
				openings.push(nextDirection);
			}
		}

		nextCells[toIndex(current.x, current.y)] = {
			id: `path-${index}-${Date.now()}`,
			base: openings,
			rotation: randomRotation(),
			isSource: index === 0,
			isBucket: index === path.length - 1,
		};
	}

	return nextCells;
};

const resetPuzzle = () => {
	cells.value = makePathCells();
	message.value = props.labels.initial;
	timer.start();
};

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) {
			resetPuzzle();
			return;
		}
		timer.stop();
	},
);

const rotateCell = (index: number) => {
	if (!timer.isPlaying.value) {
		return;
	}
	cells.value[index].rotation = (cells.value[index].rotation + 1) % 4;
	if (!isSolved()) {
		return;
	}
	timer.win();
	const seconds = timer.timeLeft.value;
	const quantity = seconds >= 20 ? 3 : seconds >= 10 ? 2 : 1;
	message.value = props.labels.success(quantity);
	emit("success", quantity);
};

const isSolved = () => {
	const source = cellAt(0, 2);
	if (!source || !getOpenings(source).has("left")) {
		return false;
	}
	const queue = [{ x: 0, y: 2 }];
	const visited = new Set(["0:2"]);

	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) {
			continue;
		}
		const cell = cellAt(current.x, current.y);
		if (!cell) {
			continue;
		}
		const openings = getOpenings(cell);
		if (cell.isBucket && openings.has("right")) {
			return true;
		}
		for (const direction of directionOrder) {
			if (!openings.has(direction)) {
				continue;
			}
			const delta = directionDelta[direction];
			const nextX = current.x + delta.x;
			const nextY = current.y + delta.y;
			if (nextX < 0 || nextX >= size || nextY < 0 || nextY >= size) {
				continue;
			}
			const nextCell = cellAt(nextX, nextY);
			if (!nextCell || !getOpenings(nextCell).has(opposite[direction])) {
				continue;
			}
			const key = `${nextX}:${nextY}`;
			if (visited.has(key)) {
				continue;
			}
			visited.add(key);
			queue.push({ x: nextX, y: nextY });
		}
	}
	return false;
};

const timerWidth = computed(() => `${timer.progress.value * 100}%`);
</script>

<template>
	<div class="minigame-overlay" :class="{ 'is-open': open }">
		<div class="minigame-scrim"></div>
		<section class="minigame-panel pipe-panel" role="dialog" :aria-label="labels.title">
			<header class="minigame-header">
				<div>
					<div class="minigame-title">{{ labels.title }}</div>
					<div class="minigame-subtitle">{{ labels.subtitle }}</div>
				</div>
				<button class="minigame-close" type="button" @click="emit('close')">x</button>
			</header>

			<div class="minigame-timer">
				<div class="minigame-timer-fill water" :style="{ width: timerWidth }"></div>
				<span>{{ timer.timeLeft }}s</span>
			</div>

			<div class="pipe-board">
				<button
					v-for="(cell, index) in cells"
					:key="cell.id"
					class="pipe-cell"
					:class="{ 'is-source': cell.isSource, 'is-bucket': cell.isBucket }"
					type="button"
					@click="rotateCell(index)"
				>
					<span class="pipe-glyph">{{ pipeGlyph(cell) }}</span>
				</button>
			</div>

			<div class="minigame-footer">
				<span>{{ labels.source }}</span>
				<strong>{{ message }}</strong>
				<span>{{ labels.bucket }}</span>
			</div>
		</section>
	</div>
</template>
