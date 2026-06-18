import { computed, ref } from "vue";
import { en } from "./i18n/en";
import { pt } from "./i18n/pt";
import type { InventoryEntry } from "./items";
import { getItemId } from "./items";

export type Language = "pt" | "en";

const LANGUAGE_KEY = "juice-language";

export const translations = { pt, en } as const;

export type Translation = (typeof translations)[Language];

const getInitialLanguage = (): Language => {
	const saved = localStorage.getItem(LANGUAGE_KEY);
	return saved === "en" || saved === "pt" ? saved : "pt";
};

export const useLanguage = () => {
	const language = ref<Language>(getInitialLanguage());
	const text = computed(() => translations[language.value]);

	const setLanguage = (nextLanguage: Language) => {
		language.value = nextLanguage;
		localStorage.setItem(LANGUAGE_KEY, nextLanguage);
	};

	const itemLabel = (entry: InventoryEntry) => {
		const itemId = getItemId(entry);
		if (!itemId) {
			return "";
		}
		const labels = text.value.items as Record<string, string>;
		return labels[itemId] ?? itemId;
	};

	return {
		language,
		text,
		setLanguage,
		itemLabel,
	};
};
