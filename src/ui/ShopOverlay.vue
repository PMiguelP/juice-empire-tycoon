<script setup>
defineProps({
    open: { type: Boolean, required: true },
    shopItems: { type: Array, required: true },
    coins: { type: Number, required: true },
    backpack: { type: Array, required: true },
    inventory: { type: Array, required: true },
    selectedBackpackIndex: { type: Number, default: null },
    inventoryIndex: { type: Number, required: true },
});
const emit = defineEmits([
    "close",
    "buy",
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
    <div class="shop-overlay" :class="{ 'is-open': open }">
        <div class="shop-scrim"></div>
        <div class="shop-panel" role="dialog" aria-label="Shop">
            <div class="shop-header">
                <div>
                    <div class="shop-title">Merchant Shop & Inventory</div>
                    <div class="shop-subtitle">
                        Click items to buy, then manage in your inventory.
                    </div>
                </div>
                <button
                    class="shop-close"
                    type="button"
                    @click="emit('close')"
                    aria-label="Close shop"
                >
                    ✕
                </button>
            </div>
            <div class="shop-body">
                <div class="shop-list">
                    <div class="shop-section-title">Shop</div>
                    <div class="shop-items">
                        <button
                            v-for="item in shopItems"
                            :key="item.id"
                            class="shop-item"
                            type="button"
                            :disabled="coins < item.price"
                            @click="emit('buy', item.id, item.price)"
                        >
                            <span class="shop-item-name">{{ item.name }}</span>
                            <span class="shop-item-price">
                                {{ item.price }} coins
                            </span>
                        </button>
                    </div>
                    <div class="shop-coins">Available: {{ coins }}</div>
                </div>
                <div class="shop-inventory">
                    <div class="inventory-backpack">
                        <div class="inventory-section-title">Backpack</div>
                        <div class="inventory-grid">
                            <button
                                v-for="(item, index) in backpack"
                                :key="`shop-backpack-${index}`"
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
                                :key="`shop-quickbar-${index}`"
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
                        <div class="inventory-note">
                            Press L or Esc to close.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

