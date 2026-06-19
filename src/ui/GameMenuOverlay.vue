<script setup lang="ts">
import { computed, ref } from "vue";
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

type Tab = "guide" | "locations";
const activeTab = ref<Tab>("guide");

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
		title: props.text.mainMenu.sections.inventory,
		keys: ["G", "1–5"],
		text: props.text.mainMenu.guide.inventory,
		variant: "row",
	},
	{
		title: props.text.mainMenu.sections.quests,
		keys: ["F"],
		text: props.text.mainMenu.guide.quests,
		variant: "combo",
	},
	{
		title: props.text.mainMenu.sections.shortcuts,
		keys: ["M", "Esc"],
		text: props.text.mainMenu.guide.shortcuts,
		variant: "row",
	},
]);

const locationCards = computed(() => [
	{
		exterior: "/assets/Campos_Quests_House.png",
		interior: "/assets/camera.jpg",
		label: props.text.mainMenu.locations.farm,
		desc:  props.text.mainMenu.locations.farmDesc,
	},
	{
		exterior: "/assets/Shop_Items.png",
		interior: "/assets/mercadocompra.png",
		label: props.text.mainMenu.locations.shop,
		desc:  props.text.mainMenu.locations.shopDesc,
	},
	{
		exterior: "/assets/Sell_Item.png",
		interior: "/assets/mercado.jpg",
		label: props.text.mainMenu.locations.sell,
		desc:  props.text.mainMenu.locations.sellDesc,
	},
	{
		exterior: "/assets/Centrifugadora_House.png",
		interior: "/assets/centrifugadora.jpg",
		label: props.text.mainMenu.locations.juicer,
		desc:  props.text.mainMenu.locations.juicerDesc,
	},
	{
		exterior: "/assets/Celeiro_House.png",
		interior: "/assets/barnbau.png",
		label: props.text.mainMenu.locations.barn,
		desc:  props.text.mainMenu.locations.barnDesc,
	},
	{
		exterior: "/assets/Well.png",
		interior: "/assets/Well.png",
		label: props.text.mainMenu.locations.well,
		desc:  props.text.mainMenu.locations.wellDesc,
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
					<button
						class="game-menu-tab"
						:class="{ 'is-active': activeTab === 'guide' }"
						type="button"
						@click="activeTab = 'guide'"
					>
						{{ text.mainMenu.guideTitle }}
					</button>
					<button
						class="game-menu-tab"
						:class="{ 'is-active': activeTab === 'locations' }"
						type="button"
						@click="activeTab = 'locations'"
					>
						{{ text.mainMenu.locationsTitle }}
					</button>
				</div>
				<div class="game-menu-heading">
					<div class="game-menu-title">{{ text.mainMenu.title }}</div>
					<div class="game-menu-subtitle">{{ text.mainMenu.subtitle }}</div>
				</div>

				<!-- Aba: Como jogar -->
				<div v-if="activeTab === 'guide'" class="game-guide-grid">
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
								:class="{ 'is-wide': keyName === 'Esc' || keyName === '1–5' }"
							>
								{{ keyName }}
							</span>
						</div>
						<div class="game-guide-text">{{ card.text }}</div>
					</div>
				</div>

				<!-- Aba: Locais -->
				<div v-else class="game-locations-grid">
					<div
						v-for="loc in locationCards"
						:key="loc.label"
						class="game-location-card"
					>
						<div class="game-location-img-wrap">
							<img
								:src="loc.exterior"
								:alt="loc.label"
								class="game-location-img is-exterior"
							/>
							<img
								:src="loc.interior"
								:alt="loc.label + ' interior'"
								class="game-location-img is-interior"
							/>
							<div class="game-location-hover-hint">{{ text.mainMenu.locations.hoverHint }}</div>
						</div>
						<div class="game-location-label">{{ loc.label }}</div>
						<div class="game-location-desc">{{ loc.desc }}</div>
					</div>
				</div>

				<div class="game-menu-footnote">{{ text.pause.footnote }}</div>
			</section>
		</div>
	</div>
</template>

<style scoped>
/* --- Grelha de locais: 2 colunas --- */
.game-locations-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 14px;
	padding: 0 4px 4px;
	overflow-y: auto;
	max-height: 360px;
}

.game-location-card {
	display: flex;
	flex-direction: column;
	gap: 6px;
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 8px;
	padding: 8px;
	transition: border-color 0.15s;
}

.game-location-card:hover {
	border-color: rgba(255, 255, 255, 0.22);
}

/* --- Contentor da imagem com hover flip --- */
.game-location-img-wrap {
	position: relative;
	width: 100%;
	aspect-ratio: 4 / 3;
	overflow: hidden;
	border-radius: 5px;
	background: #111620;
	cursor: default;
}

/* Imagem exterior: visível por defeito */
.game-location-img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: contain;   /* show full image, no crop */
	image-rendering: pixelated;
	transition: opacity 0.25s ease;
	padding: 6px;          /* small breathing room around the sprite */
	box-sizing: border-box;
}

.game-location-img.is-exterior {
	opacity: 1;
	z-index: 1;
}

.game-location-img.is-interior {
	opacity: 0;
	z-index: 2;
}

/* Hover: mostrar interior, esconder exterior */
.game-location-img-wrap:hover .is-exterior {
	opacity: 0;
}

.game-location-img-wrap:hover .is-interior {
	opacity: 1;
}

/* Dica de hover no canto inferior direito */
.game-location-hover-hint {
	position: absolute;
	bottom: 5px;
	right: 6px;
	z-index: 3;
	font-size: 9px;
	color: rgba(255, 255, 255, 0.45);
	background: rgba(0, 0, 0, 0.55);
	padding: 2px 5px;
	border-radius: 3px;
	pointer-events: none;
	transition: opacity 0.2s;
}

.game-location-img-wrap:hover .game-location-hover-hint {
	opacity: 0;
}

.game-location-label {
	font-size: 11px;
	font-weight: 700;
	color: #e2d9c0;
	text-transform: uppercase;
	letter-spacing: 0.06em;
}

.game-location-desc {
	font-size: 10px;
	color: rgba(226, 217, 192, 0.6);
	line-height: 1.4;
}
</style>
