<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMinigameTimer } from "./useMinigameTimer";

type SulfateQuality = "perfect" | "good" | "poor";

const props = defineProps({
	open: { type: Boolean, required: true },
	sulfateId: { type: String, default: "sulfate-basic" },
	labels: { type: Object, required: true },
});

const emit = defineEmits<{
	(event: "success", quality: SulfateQuality): void;
	(event: "fail"): void;
	(event: "close"): void;
}>();

const water = ref(50);
const message = ref("");
const timer = useMinigameTimer(25_000, () => {
	message.value = props.labels.fail;
	emit("fail");
});

const recipes: Record<string, { water: number; sulfate: number }> = {
	"sulfate-basic": { water: 70, sulfate: 30 },
	"sulfate-strong": { water: 50, sulfate: 50 },
	"sulfate-premium": { water: 30, sulfate: 70 },
};

const recipe = computed(() => recipes[props.sulfateId] ?? recipes["sulfate-basic"]);
const recipeLabel = computed(() => props.labels.recipes[props.sulfateId] ?? props.labels.recipes["sulfate-basic"]);
const sulfate = computed(() => 100 - water.value);
const difference = computed(() => Math.abs(water.value - recipe.value.water));
const quality = computed<SulfateQuality>(() => {
	if (difference.value <= 5) {
		return "perfect";
	}
	if (difference.value <= 15) {
		return "good";
	}
	return "poor";
});
const zoneLabel = computed(() => {
	if (quality.value === "perfect") {
		return props.labels.perfect;
	}
	if (quality.value === "good") {
		return props.labels.good;
	}
	return props.labels.poor;
});
const timerWidth = computed(() => `${timer.progress.value * 100}%`);
const heatHeight = computed(() => `${(1 - timer.progress.value) * 100}%`);
const idealLeft = computed(() => `${recipe.value.water}%`);
const currentLeft = computed(() => `${water.value}%`);

const resetMixer = () => {
	water.value = 50;
	message.value = props.labels.initial;
	timer.start();
};

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) {
			resetMixer();
			return;
		}
		timer.stop();
	},
);

const adjustWater = (delta: number) => {
	if (!timer.isPlaying.value) {
		return;
	}
	water.value = Math.max(0, Math.min(100, water.value + delta));
};

const confirmMix = () => {
	if (!timer.isPlaying.value) {
		return;
	}
	timer.win();
	message.value =
		quality.value === "perfect"
			? props.labels.successPerfect
			: quality.value === "good"
				? props.labels.successGood
				: props.labels.successPoor;
	emit("success", quality.value);
};
</script>

<template>
	<div class="minigame-overlay" :class="{ 'is-open': open }">
		<div class="minigame-scrim"></div>
		<section class="minigame-panel mixer-panel" role="dialog" :aria-label="labels.title">
			<header class="minigame-header">
				<div>
					<div class="minigame-title">{{ labels.title }}</div>
					<div class="minigame-subtitle">{{ labels.subtitle(recipeLabel) }}</div>
				</div>
				<button class="minigame-close" type="button" @click="emit('close')">x</button>
			</header>

			<div class="minigame-timer">
				<div class="minigame-timer-fill sulfate" :style="{ width: timerWidth }"></div>
				<span>{{ timer.timeLeft }}s</span>
			</div>

			<div class="mixer-body">
				<div class="mixer-controls">
					<div class="mixer-stepper water">
						<span>{{ labels.water }}</span>
						<strong>{{ water }}%</strong>
						<div>
							<button type="button" @click="adjustWater(-5)">-</button>
							<button type="button" @click="adjustWater(5)">+</button>
						</div>
					</div>
					<div class="mixer-stepper sulfate">
						<span>{{ labels.sulfate }}</span>
						<strong>{{ sulfate }}%</strong>
						<div>
							<button type="button" @click="adjustWater(5)">-</button>
							<button type="button" @click="adjustWater(-5)">+</button>
						</div>
					</div>

					<div class="mixer-meter" :class="quality">
						<div class="mixer-meter-track">
							<span class="mixer-ideal" :style="{ left: idealLeft }"></span>
							<span class="mixer-current" :style="{ left: currentLeft }"></span>
						</div>
						<div class="mixer-meter-label">{{ zoneLabel }}</div>
					</div>
				</div>

				<div class="mixer-thermo">
					<div class="mixer-thermo-glass">
						<div class="mixer-thermo-fill" :style="{ height: heatHeight }"></div>
					</div>
					<span>{{ labels.heat }}</span>
				</div>
			</div>

			<div class="minigame-footer mixer-footer">
				<strong>{{ message }}</strong>
				<button class="mixer-confirm" type="button" @click="confirmMix">
					{{ labels.confirm }}
				</button>
			</div>
		</section>
	</div>
</template>
