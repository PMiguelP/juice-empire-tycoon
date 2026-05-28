<script setup>
defineProps({
    open: { type: Boolean, required: true },
    backpack: { type: Array, required: true },
    inventory: { type: Array, required: true },
    selectedBackpackIndex: { type: Number, default: null },
    inventoryIndex: { type: Number, required: true },
    labels: { type: Object, required: true },
    itemLabel: { type: Function, required: true },
    itemVisual: { type: Function, required: true },
    itemQuantity: { type: Function, required: true },
    itemMax: { type: Function, required: true },
});
const emit = defineEmits([
    "close",
    "select-backpack",
    "assign-quickbar",
    "drag-start",
    "drag-end",
    "drop",
]);

const selectBackpackSlot = (index) => {
    emit("select-backpack", index);
};

const assignToQuickbar = (index) => {
    emit("assign-quickbar", index);
};
</script>

<template>
    <div class="inventory-overlay" :class="{ 'is-open': open }">
        <div class="inventory-scrim"></div>
        <div class="inventory-panel" role="dialog" :aria-label="labels.title">
            <div class="inventory-header">
                <div>
                    <div class="inventory-title">{{ labels.title }}</div>
                    <div class="inventory-subtitle">
                        {{ labels.subtitle }}
                    </div>
                </div>
                <button
                    class="inventory-close"
                    type="button"
                    @click="emit('close')"
                    aria-label="Close inventory"
                >
                    ✕
                </button>
            </div>
            <div class="inventory-body">
                <div class="inventory-backpack">
                    <div class="inventory-section-title">{{ labels.backpack }}</div>
                    <div class="inventory-grid">
                        <button
                            v-for="(item, index) in backpack"
                            :key="`backpack-${index}`"
                            class="inventory-cell"
                            :class="{
                                'is-selected': selectedBackpackIndex === index,
                                'is-draggable': Boolean(item),
                            }"
                            type="button"
                            @click="selectBackpackSlot(index)"
                            draggable="true"
                            @dragstart="emit('drag-start', 'backpack', index)"
                            @dragend="emit('drag-end')"
                            @dragover.prevent
                            @drop="emit('drop', 'backpack', index)"
                        >
                            <span v-if="item" class="item-stack">
                                <span
                                    class="item-token"
                                    :style="{
                                        '--item-color': itemVisual(item).color,
                                        '--item-accent': itemVisual(item).accent,
                                    }"
                                >
                                    {{ itemVisual(item).symbol }}
                                </span>
                                <span class="inventory-cell-label">
                                    {{ itemLabel(item) }}
                                </span>
                                <span class="item-quantity">
                                    {{ itemQuantity(item) }}/{{ itemMax(item) }}
                                </span>
                            </span>
                            <span class="inventory-cell-index">
                                {{ index + 1 }}
                            </span>
                        </button>
                    </div>
                </div>
                <div class="inventory-quickbar">
                    <div class="inventory-section-title">{{ labels.quickbar }}</div>
                    <div class="inventory-quickbar-grid">
                        <button
                            v-for="(item, index) in inventory"
                            :key="`quickbar-${index}`"
                            class="inventory-cell"
                            :class="{
                                'is-selected': inventoryIndex === index,
                                'is-draggable': Boolean(item),
                            }"
                            type="button"
                            @click="assignToQuickbar(index)"
                            draggable="true"
                            @dragstart="emit('drag-start', 'quickbar', index)"
                            @dragend="emit('drag-end')"
                            @dragover.prevent
                            @drop="emit('drop', 'quickbar', index)"
                        >
                            <span v-if="item" class="item-stack">
                                <span
                                    class="item-token"
                                    :style="{
                                        '--item-color': itemVisual(item).color,
                                        '--item-accent': itemVisual(item).accent,
                                    }"
                                >
                                    {{ itemVisual(item).symbol }}
                                </span>
                                <span class="inventory-cell-label">
                                    {{ itemLabel(item) }}
                                </span>
                                <span class="item-quantity">
                                    {{ itemQuantity(item) }}/{{ itemMax(item) }}
                                </span>
                            </span>
                            <span class="inventory-cell-index">
                                {{ index + 1 }}
                            </span>
                        </button>
                    </div>
                    <div class="inventory-note">{{ labels.closeHint }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
