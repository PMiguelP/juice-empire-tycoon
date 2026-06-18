import { computed, onUnmounted, ref } from "vue";

export type MinigameState = "idle" | "playing" | "won" | "lost";

export const useMinigameTimer = (
	durationMs: number,
	onExpire?: () => void,
) => {
	const state = ref<MinigameState>("idle");
	const timeLeftMs = ref(durationMs);
	let intervalId: number | null = null;
	let startedAt = 0;

	const isPlaying = computed(() => state.value === "playing");
	const timeLeft = computed(() => Math.ceil(timeLeftMs.value / 1000));
	const progress = computed(() => {
		return Math.max(0, Math.min(1, timeLeftMs.value / durationMs));
	});

	const clearTimer = () => {
		if (intervalId === null) {
			return;
		}
		window.clearInterval(intervalId);
		intervalId = null;
	};

	const start = () => {
		clearTimer();
		state.value = "playing";
		timeLeftMs.value = durationMs;
		startedAt = Date.now();
		intervalId = window.setInterval(() => {
			const remaining = durationMs - (Date.now() - startedAt);
			timeLeftMs.value = Math.max(0, remaining);
			if (remaining > 0) {
				return;
			}
			state.value = "lost";
			clearTimer();
			onExpire?.();
		}, 100);
	};

	const stop = () => {
		clearTimer();
		state.value = "idle";
		timeLeftMs.value = durationMs;
	};

	const win = () => {
		clearTimer();
		state.value = "won";
	};

	const lose = () => {
		clearTimer();
		state.value = "lost";
		onExpire?.();
	};

	onUnmounted(clearTimer);

	return {
		state,
		timeLeft,
		timeLeftMs,
		progress,
		isPlaying,
		start,
		stop,
		win,
		lose,
	};
};
