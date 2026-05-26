<script setup>
defineProps({
    level: { type: Number, required: true },
    coins: { type: Number, required: true },
    inventory: { type: Array, required: true },
    inventoryIndex: { type: Number, required: true },
});
</script>

<template>
    <div class="hud" aria-hidden="true">
        <div class="hud-top">
            <div class="hud-level">
                <span class="hud-level-label">Level</span>
                <span class="hud-level-value">{{ level }}</span>
            </div>
            <div class="hud-coins">
                <span class="hud-coins-icon">◎</span>
                <span class="hud-coins-value">{{ coins }}</span>
            </div>
        </div>
        <div class="hud-inventory">
            <div
                v-for="index in 5"
                :key="index"
                class="inventory-slot"
                :class="{ 'is-selected': inventoryIndex === index - 1 }"
            >
                <span class="inventory-item">
                    {{ inventory[index - 1] ?? "" }}
                </span>
            </div>
        </div>
    </div>
</template>

