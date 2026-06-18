<script setup lang="ts">
import { computed } from "vue";
import type { ItemVisual } from "../items";

const props = defineProps<{
	visual: ItemVisual;
}>();

const imageSrc = computed(() => {
	const image = props.visual.image;
	if (!image) {
		return "";
	}
	if (/^(https?:)?\/\//.test(image) || image.startsWith("data:")) {
		return image;
	}

	const base = import.meta.env.BASE_URL || "/";
	const cleanBase = base.endsWith("/") ? base : `${base}/`;
	const cleanImage = image.startsWith("/") ? image.slice(1) : image;
	return `${cleanBase}${cleanImage}`;
});
</script>

<template>
	<span
		class="item-token"
		:class="{ 'has-image': visual.image }"
		:style="{
			'--item-color': visual.color,
			'--item-accent': visual.accent,
		}"
	>
		<img
			v-if="visual.image"
			class="item-token-image"
			:src="imageSrc"
			:alt="visual.symbol"
			draggable="false"
		/>
		<span v-else>{{ visual.symbol }}</span>
	</span>
</template>
