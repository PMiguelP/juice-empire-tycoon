<script setup>
defineProps({
    open: { type: Boolean, required: true },
    backpack: { type: Array, required: true },
    inventory: { type: Array, required: true },
    selectedBackpackIndex: { type: Number, default: null },
    inventoryIndex: { type: Number, required: true },
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
        <div class="inventory-panel" role="dialog" aria-label="Inventory">
            <div class="inventory-header">
                <div>
                    <div class="inventory-title">Inventory</div>
                    <div class="inventory-subtitle">
                        Select a backpack slot, then assign to quickbar.
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
                    <div class="inventory-section-title">Backpack</div>
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
                            <span class="inventory-cell-label">
                                {{ item ?? "" }}
                            </span>
                            <span class="inventory-cell-index">
                                {{ index + 1 }}
                            </span>
                        </button>
                    </div>
                </div>
                <div class="inventory-quickbar">
                    <div class="inventory-section-title">Quickbar</div>
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
                            <span class="inventory-cell-label">
                                {{ item ?? "" }}
                            </span>
                            <span class="inventory-cell-index">
                                {{ index + 1 }}
                            </span>
                        </button>
                    </div>
                    <div class="inventory-note">Press G or Esc to close.</div>
                </div>
            </div>
        </div>
    </div>
</template>

