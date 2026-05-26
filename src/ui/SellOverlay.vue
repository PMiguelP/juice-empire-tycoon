<script setup>
defineProps({
    open: { type: Boolean, required: true },
    backpack: { type: Array, required: true },
    inventory: { type: Array, required: true },
    sellSlots: { type: Array, required: true },
    selectedBackpackIndex: { type: Number, default: null },
    inventoryIndex: { type: Number, required: true },
    getSellPrice: { type: Function, required: true },
});
const emit = defineEmits([
    "close",
    "sell-items",
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
    <div class="sell-overlay" :class="{ 'is-open': open }">
        <div class="sell-scrim"></div>
        <div class="sell-panel" role="dialog" aria-label="Sell items">
            <div class="sell-header">
                <div>
                    <div class="sell-title">Inventory Sell</div>
                    <div class="sell-subtitle">
                        Drag items to the right slots to put them on sale.
                    </div>
                </div>
                <button
                    class="sell-close"
                    type="button"
                    @click="emit('close')"
                    aria-label="Close sell menu"
                >
                    ✕
                </button>
            </div>
            <div class="sell-body">
                <div class="sell-inventory">
                    <div class="inventory-backpack">
                        <div class="inventory-section-title">Backpack</div>
                        <div class="inventory-grid">
                            <button
                                v-for="(item, index) in backpack"
                                :key="`sell-backpack-${index}`"
                                class="inventory-cell"
                                :class="{
                                    'is-selected':
                                        selectedBackpackIndex === index,
                                    'is-draggable': Boolean(item),
                                }"
                                type="button"
                                @click="selectBackpackSlot(index)"
                                draggable="true"
                                @dragstart="
                                    emit('drag-start', 'backpack', index)
                                "
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
                                :key="`sell-quickbar-${index}`"
                                class="inventory-cell"
                                :class="{
                                    'is-selected': inventoryIndex === index,
                                    'is-draggable': Boolean(item),
                                }"
                                type="button"
                                @click="assignToQuickbar(index)"
                                draggable="true"
                                @dragstart="
                                    emit('drag-start', 'quickbar', index)
                                "
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
                    </div>
                </div>
                <div class="sell-list">
                    <div class="sell-section-title">Sell Slots</div>
                    <div class="sell-grid">
                        <button
                            v-for="(item, index) in sellSlots"
                            :key="`sell-slot-${index}`"
                            class="sell-slot"
                            :class="{ 'is-draggable': Boolean(item) }"
                            type="button"
                            draggable="true"
                            @dragstart="emit('drag-start', 'sell', index)"
                            @dragend="emit('drag-end')"
                            @dragover.prevent
                            @drop="emit('drop', 'sell', index)"
                        >
                            <span class="sell-slot-label">
                                {{ item ?? "" }}
                            </span>
                            <span class="sell-slot-price">
                                {{ getSellPrice(item) }}c
                            </span>
                        </button>
                    </div>
                    <button
                        class="sell-action"
                        type="button"
                        @click="emit('sell-items')"
                    >
                        Sell Items
                    </button>
                    <div class="sell-note">Press P or Esc to close.</div>
                </div>
            </div>
        </div>
    </div>
</template>

