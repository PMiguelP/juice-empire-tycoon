<script setup lang="ts">
import type { Translation } from "../i18n";
import type { SulfateItemId, SulfateQuality } from "../composables/usePlayerData";
import WaterPipePuzzle from "./minigames/WaterPipePuzzle.vue";
import SulfateMixer from "./minigames/SulfateMixer.vue";

defineProps<{
	gameReady: boolean;
	waterOpen: boolean;
	sulfateOpen: boolean;
	sulfateId: SulfateItemId;
	labels: Translation["minigames"];
}>();

defineEmits<{
	(event: "water-success", quantity: number): void;
	(event: "water-fail"): void;
	(event: "water-close"): void;
	(event: "sulfate-success", quality: SulfateQuality): void;
	(event: "sulfate-fail"): void;
	(event: "sulfate-close"): void;
}>();
</script>

<template>
	<WaterPipePuzzle
		v-if="gameReady"
		:open="waterOpen"
		:labels="labels.water"
		@success="$emit('water-success', $event)"
		@fail="$emit('water-fail')"
		@close="$emit('water-close')"
	/>
	<SulfateMixer
		v-if="gameReady"
		:open="sulfateOpen"
		:sulfate-id="sulfateId"
		:labels="labels.sulfate"
		@success="$emit('sulfate-success', $event)"
		@fail="$emit('sulfate-fail')"
		@close="$emit('sulfate-close')"
	/>
</template>
