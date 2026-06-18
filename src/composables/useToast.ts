import { onUnmounted, ref } from "vue";

export const useToast = (durationMs = 2400) => {
	const toastMessage = ref("");
	let toastTimer: number | null = null;

	const clearToastTimer = () => {
		if (toastTimer !== null) {
			window.clearTimeout(toastTimer);
			toastTimer = null;
		}
	};

	const showToast = (message: string) => {
		toastMessage.value = message;
		clearToastTimer();
		toastTimer = window.setTimeout(() => {
			toastMessage.value = "";
			toastTimer = null;
		}, durationMs);
	};

	onUnmounted(clearToastTimer);

	return {
		toastMessage,
		showToast,
	};
};
