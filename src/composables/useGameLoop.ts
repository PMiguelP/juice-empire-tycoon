import { onMounted, onUnmounted, type Ref } from "vue";

type GameLoopOptions = {
	attachInput: () => void;
	detachInput: () => void;
	gameReady: Ref<boolean>;
	mainMenuOpen: Ref<boolean>;
	pauseMenuOpen: Ref<boolean>;
	advanceTime: (minutes: number) => void;
};

export const useGameLoop = ({
	attachInput,
	detachInput,
	gameReady,
	mainMenuOpen,
	pauseMenuOpen,
	advanceTime,
}: GameLoopOptions) => {
	let clockTimer: number | null = null;

	onMounted(() => {
		attachInput();
		clockTimer = window.setInterval(() => {
			if (!gameReady.value || mainMenuOpen.value || pauseMenuOpen.value) {
				return;
			}
			advanceTime(10);
		}, 3000);
	});

	onUnmounted(() => {
		detachInput();
		if (clockTimer !== null) {
			window.clearInterval(clockTimer);
			clockTimer = null;
		}
	});
};
