<script setup lang="ts">
import type { Language, Translation } from "../i18n";

defineProps<{
	open: boolean;
	language: Language;
	text: Translation;
	hasSave: boolean;
}>();

const emit = defineEmits<{
	start: [];
	"set-language": [language: Language];
}>();
</script>

<template>
	<div class="main-menu-overlay" :class="{ 'is-open': open }">
		<div class="main-menu-scrim"></div>
		<div class="main-menu-panel" role="dialog" :aria-label="text.mainMenu.title">
			<div class="main-menu-copy">
				<div class="main-menu-title">{{ text.mainMenu.title }}</div>
				<div class="main-menu-subtitle">{{ text.mainMenu.subtitle }}</div>
			</div>

			<div class="main-menu-language">
				<div class="main-menu-section-title">{{ text.mainMenu.language }}</div>
				<div class="language-options" role="group" :aria-label="text.mainMenu.language">
					<button
						class="language-button"
						:class="{ 'is-active': language === 'pt' }"
						type="button"
						@click="emit('set-language', 'pt')"
					>
						Português
					</button>
					<button
						class="language-button"
						:class="{ 'is-active': language === 'en' }"
						type="button"
						@click="emit('set-language', 'en')"
					>
						English
					</button>
				</div>
			</div>

			<div class="guide-panel">
				<div class="main-menu-section-title">{{ text.mainMenu.guideTitle }}</div>
				<div class="guide-list">
					<div
						v-for="entry in text.mainMenu.guide"
						:key="entry.key"
						class="guide-row"
					>
						<span class="guide-key">{{ entry.key }}</span>
						<span class="guide-text">{{ entry.text }}</span>
					</div>
				</div>
			</div>

			<button class="main-menu-start" type="button" @click="emit('start')">
				{{ hasSave ? text.mainMenu.continue : text.mainMenu.start }}
			</button>
		</div>
	</div>
</template>
