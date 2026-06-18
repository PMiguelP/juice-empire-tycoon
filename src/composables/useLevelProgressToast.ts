import { onUnmounted, ref, watch, type ComputedRef, type Ref } from "vue";

type NumericSignal = Ref<number> | ComputedRef<number>;

export const useLevelProgressToast = (
	level: NumericSignal,
	levelProgress: NumericSignal,
	isReady: Ref<boolean> | ComputedRef<boolean>,
) => {
	const showLevelProgress = ref(false);
	let timer: number | null = null;

	const hideLater = () => {
		if (timer !== null) {
			window.clearTimeout(timer);
		}
		timer = window.setTimeout(() => {
			showLevelProgress.value = false;
			timer = null;
		}, 3600);
	};

	watch([level, levelProgress], ([nextLevel, nextProgress], [previousLevel, previousProgress]) => {
		if (!isReady.value) {
			return;
		}
		if (
			nextLevel === previousLevel &&
			Math.abs(nextProgress - previousProgress) < 0.001
		) {
			return;
		}

		showLevelProgress.value = true;
		hideLater();
	});

	onUnmounted(() => {
		if (timer !== null) {
			window.clearTimeout(timer);
		}
	});

	return {
		showLevelProgress,
	};
};
