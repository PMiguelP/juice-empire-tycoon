import { computed, watch, type Ref } from "vue";
import { EventBus } from "../game/EventBus";

export const useGameAudio = (
	gameReady: Ref<boolean>,
	mainMenuOpen: Ref<boolean>,
	pauseMenuOpen: Ref<boolean>,
) => {
	const shouldPlayMenuAmbience = computed(() => {
		return gameReady.value && (mainMenuOpen.value || pauseMenuOpen.value);
	});

	const playSound = (key: string, volume = 0.28) => {
		EventBus.emit("audio:play", { key, volume });
	};

	const syncMenuAmbience = () => {
		EventBus.emit("audio:menu-ambience", shouldPlayMenuAmbience.value);
	};

	watch(shouldPlayMenuAmbience, syncMenuAmbience);

	return {
		playSound,
		syncMenuAmbience,
		shouldPlayMenuAmbience,
	};
};
