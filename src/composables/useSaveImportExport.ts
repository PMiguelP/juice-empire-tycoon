import { ref } from "vue";
import type { SaveData } from "./usePlayerData";

export const useSaveImportExport = (
	getSaveData: () => SaveData,
	applySave: (data: SaveData) => void,
	saveState: () => void,
	afterImport?: () => void,
	onImportError?: () => void,
) => {
	const fileInputRef = ref<HTMLInputElement | null>(null);

	const saveAndDownload = () => {
		saveState();
		const blob = new Blob([JSON.stringify(getSaveData(), null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "juice-save.json";
		link.click();
		URL.revokeObjectURL(url);
	};

	const openFilePicker = () => {
		fileInputRef.value?.click();
	};

	const handleFileChange = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			return;
		}
		try {
			const data = JSON.parse(await file.text()) as SaveData;
			if (!data || typeof data !== "object" || !("saveVersion" in data)) {
				throw new Error("Invalid save file");
			}
			applySave(data);
			saveState();
			afterImport?.();
		} catch {
			onImportError?.();
		} finally {
			input.value = "";
		}
	};

	return {
		fileInputRef,
		saveAndDownload,
		openFilePicker,
		handleFileChange,
	};
};
