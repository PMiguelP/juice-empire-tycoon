<script setup>
defineProps({
	variant: { type: String, default: "default" },
});
</script>

<template>
	<div :class="variant === 'quickbar' ? 'inventory-quickbar-grid' : 'inventory-grid'">
		<slot />
	</div>
</template>
