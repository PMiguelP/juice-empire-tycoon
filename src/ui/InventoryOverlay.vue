<script setup>
import InventorySlot from "./InventorySlot.vue";
import InventoryGrid from "./InventoryGrid.vue";

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
                    <InventoryGrid>
                        <InventorySlot
                            v-for="(item, index) in backpack"
                            :key="`backpack-${index}`"
                            :item="item"
                            :index="index"
                            :selected="selectedBackpackIndex === index"
                            :item-label="itemLabel"
                            :item-visual="itemVisual"
                            :item-quantity="itemQuantity"
                            :item-max="itemMax"
                            @activate="selectBackpackSlot(index)"
                            @drag-start="emit('drag-start', 'backpack', index)"
                            @drag-end="emit('drag-end')"
                            @drop="emit('drop', 'backpack', index, $event)"
                        />
                    </InventoryGrid>
                </div>
                <div class="inventory-quickbar">
                    <div class="inventory-section-title">{{ labels.quickbar }}</div>
                    <InventoryGrid variant="quickbar">
                        <InventorySlot
                            v-for="(item, index) in inventory"
                            :key="`quickbar-${index}`"
                            :item="item"
                            :index="index"
                            :selected="inventoryIndex === index"
                            :item-label="itemLabel"
                            :item-visual="itemVisual"
                            :item-quantity="itemQuantity"
                            :item-max="itemMax"
                            @activate="assignToQuickbar(index)"
                            @drag-start="emit('drag-start', 'quickbar', index)"
                            @drag-end="emit('drag-end')"
                            @drop="emit('drop', 'quickbar', index, $event)"
                        />
                    </InventoryGrid>
                    <div class="inventory-note">{{ labels.closeHint }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
