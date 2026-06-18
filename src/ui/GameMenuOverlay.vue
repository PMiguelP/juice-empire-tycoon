<script setup lang="ts">
import { computed } from "vue";
import type { Language, Translation } from "../i18n";

const props = defineProps<{
	open: boolean;
	isInitial: boolean;
	language: Language;
	text: Translation;
	hasExistingSave: boolean;
}>();

const emit = defineEmits<{
	close: [];
	"save-download": [];
	upload: [];
	"set-language": [language: Language];
}>();

const controlCards = computed(() => [
	{
		title: props.text.mainMenu.sections.movement,
		keys: ["W", "A", "S", "D"],
		text: props.text.mainMenu.guide.movement,
		variant: "wasd",
	},
	{
		title: props.text.mainMenu.sections.interaction,
		keys: ["F", "E"],
		text: props.text.mainMenu.guide.interaction,
		variant: "combo",
	},
	{
		title: props.text.mainMenu.sections.menus,
		keys: ["K", "G", "L", "P", "J"],
		text: props.text.mainMenu.guide.menus,
		variant: "row",
	},
	{
		title: props.text.mainMenu.sections.quickbar,
		keys: ["1", "2", "3", "4", "5", "Esc"],
		text: props.text.mainMenu.guide.quickbar,
		variant: "row",
	},
]);
</script>

<template>
	<div class="game-menu-overlay" :class="{ 'is-open': open }">
		<div class="game-menu-scrim"></div>
		<div class="game-menu-frame" role="dialog" :aria-label="text.mainMenu.title">
			<aside class="game-menu-sidebar">
				<div class="game-menu-vine"></div>
				<div class="game-menu-compass">N</div>
				<div class="game-menu-language">
					<div class="game-menu-side-label">{{ text.mainMenu.language }}</div>
					<div class="game-menu-language-buttons">
						<button
							class="game-menu-lang"
							:class="{ 'is-active': language === 'pt' }"
							type="button"
							@click="emit('set-language', 'pt')"
						>
							Português
						</button>
						<button
							class="game-menu-lang"
							:class="{ 'is-active': language === 'en' }"
							type="button"
							@click="emit('set-language', 'en')"
						>
							English
						</button>
					</div>
				</div>

				<div class="game-menu-actions">
					<button class="game-menu-button is-primary" type="button" @click="emit('close')">
						{{ isInitial && !hasExistingSave ? text.mainMenu.start : text.pause.resume }}
					</button>
					<button class="game-menu-button" type="button" @click="emit('save-download')">
						{{ text.pause.saveDownload }}
					</button>
					<button class="game-menu-button" type="button" @click="emit('upload')">
						{{ text.pause.upload }}
					</button>
				</div>
			</aside>

			<section class="game-menu-guide">
				<div class="game-menu-tabs">
					<button class="game-menu-tab is-active" type="button">
						{{ text.mainMenu.guideTitle }}
					</button>
				</div>
				<div class="game-menu-heading">
					<div class="game-menu-title">{{ text.mainMenu.title }}</div>
					<div class="game-menu-subtitle">{{ text.mainMenu.subtitle }}</div>
				</div>

				<div class="game-guide-grid">
					<div
						v-for="card in controlCards"
						:key="card.title"
						class="game-guide-card"
					>
						<div class="game-guide-card-title">{{ card.title }}</div>
						<div class="game-key-art" :class="`is-${card.variant}`">
							<span
								v-for="keyName in card.keys"
								:key="keyName"
								class="game-keycap"
								:class="{ 'is-wide': keyName === 'Esc' }"
							>
								{{ keyName }}
							</span>
						</div>
						<div class="game-guide-text">{{ card.text }}</div>
					</div>
				</div>

				<div class="game-menu-footnote">{{ text.pause.footnote }}</div>
			</section>
		</div>
	</div>
</template>
