<script setup>
defineProps({
    level: { type: Number, required: true },
    coins: { type: Number, required: true },
    inventory: { type: Array, required: true },
    inventoryIndex: { type: Number, required: true },
    labels: { type: Object, required: true },
    itemLabel: { type: Function, required: true },
    itemVisual: { type: Function, required: true },
    itemQuantity: { type: Function, required: true },
    itemMax: { type: Function, required: true },
});
</script>

<template>
    <div class="hud" aria-hidden="true">
        <div class="hud-top">
            <div class="hud-level">
                <span class="hud-level-label">{{ labels.level }}</span>
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
                <span v-if="inventory[index - 1]" class="item-stack is-compact">
                    <span
                        class="item-token"
                        :style="{
                            '--item-color': itemVisual(inventory[index - 1]).color,
                            '--item-accent': itemVisual(inventory[index - 1]).accent,
                        }"
                    >
                        {{ itemVisual(inventory[index - 1]).symbol }}
                    </span>
                    <span class="inventory-item">
                        {{ itemLabel(inventory[index - 1]) }}
                    </span>
                    <span class="item-quantity">
                        {{ itemQuantity(inventory[index - 1]) }}/{{ itemMax(inventory[index - 1]) }}
                    </span>
                </span>
            </div>
        </div>
    </div>
</template>
