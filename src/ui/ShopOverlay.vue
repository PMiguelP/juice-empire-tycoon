<script setup>
import { ref } from "vue";
import InventoryGrid from "./InventoryGrid.vue";
import InventorySlot from "./InventorySlot.vue";
import ItemIcon from "./ItemIcon.vue";

const props = defineProps({
    open: { type: Boolean, required: true },
    shopItems: { type: Array, required: true },
    coins: { type: Number, required: true },
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
    "buy",
    "select-backpack",
    "assign-quickbar",
    "drag-start",
    "shop-drag-start",
    "drag-end",
    "drop",
]);

const selectedShopItemId = ref(null);
const quantity = ref(1);

const selectShopItem = (itemId) => {
    selectedShopItemId.value = itemId;
    quantity.value = 1;
};

const selectedShopItem = () => {
    return props.shopItems.find((item) => item.id === selectedShopItemId.value) ?? null;
};

const normalizedQuantity = () => {
    return Number(quantity.value);
};

const canBuySelected = () => {
    const item = selectedShopItem();
    const amount = normalizedQuantity();
    if (!item || item.locked) {
        return false;
    }
    return (
        Number.isInteger(amount) &&
        amount >= 1 &&
        amount <= props.itemMax(item.id) &&
        props.coins >= item.price * amount
    );
};

const canDragSelectedQuantity = (item) => {
    const amount = normalizedQuantity();
    return (
        !item.locked &&
        Number.isInteger(amount) &&
        amount >= 1 &&
        amount <= props.itemMax(item.id) &&
        props.coins >= item.price * amount
    );
};

const selectedTotal = () => {
    const item = selectedShopItem();
    if (!item) {
        return 0;
    }
    return item.price * normalizedQuantity();
};

const buySelected = () => {
    const item = selectedShopItem();
    if (!item || !canBuySelected()) {
        return;
    }
    emit("buy", item.id, item.price, normalizedQuantity());
};

const entryId = (entry) => {
    if (!entry) {
        return null;
    }
    return typeof entry === "string" ? entry : entry.id;
};

const entryQuantity = (entry) => {
    if (!entry) {
        return 0;
    }
    return typeof entry === "string" ? 1 : entry.quantity;
};

const availableBackpackRoom = (itemId) => {
    return props.backpack.reduce((total, entry) => {
        const currentId = entryId(entry);
        if (!entry) {
            return total + props.itemMax(itemId);
        }
        if (currentId === itemId) {
            return total + props.itemMax(itemId) - entryQuantity(entry);
        }
        return total;
    }, 0);
};

const buyMax = (item) => {
    if (item.locked) {
        return;
    }

    const maxAffordable = Math.floor(props.coins / item.price);
    const amount = Math.min(
        props.itemMax(item.id),
        maxAffordable,
        availableBackpackRoom(item.id),
    );
    if (amount < 1) {
        return;
    }
    emit("buy", item.id, item.price, amount);
};

const handleShopItemClick = (event, item) => {
    selectShopItem(item.id);
    if (event.shiftKey && !item.locked) {
        buyMax(item);
    }
};

const handleShopDragStart = (event, item) => {
    if (!canDragSelectedQuantity(item)) {
        event.preventDefault();
        return;
    }
    emit("shop-drag-start", item.id, normalizedQuantity());
};

</script>

<template>
    <div class="shop-overlay" :class="{ 'is-open': open }">
        <div class="shop-scrim"></div>
        <div class="shop-panel" role="dialog" :aria-label="labels.title">
            <div class="shop-header">
                <div>
                    <div class="shop-title">{{ labels.title }}</div>
                    <div class="shop-subtitle">{{ labels.subtitle }}</div>
                </div>
                <div class="shop-coin-badge">
                    <span class="hud-coins-icon">◎</span>
                    <span>{{ coins }}</span>
                </div>
                <button
                    class="shop-close"
                    type="button"
                    @click="emit('close')"
                    aria-label="Close shop"
                >
                    x
                </button>
            </div>

            <div class="shop-body">
                <div class="shop-list">
                    <div class="shop-section-title">{{ labels.shop }}</div>
                    <div class="shop-items">
                        <button
                            v-for="item in shopItems"
                            :key="item.id"
                            class="inventory-cell shop-grid-cell"
                            :class="{
                                'is-selected': selectedShopItemId === item.id,
                                'is-draggable': canDragSelectedQuantity(item),
                                'is-locked': item.locked,
                            }"
                            type="button"
                            :draggable="canDragSelectedQuantity(item)"
                            @click="handleShopItemClick($event, item)"
                            @dragstart="handleShopDragStart($event, item)"
                            @dragend="emit('drag-end')"
                        >
                            <span class="item-stack">
                                <ItemIcon :visual="itemVisual(item.id)" />
                                <span class="inventory-cell-label">{{ itemLabel(item.id) }}</span>
                                <span class="item-quantity">
                                    <template v-if="item.locked">
                                        {{ labels.unlockLevel(item.unlockLevel) }}
                                    </template>
                                    <template v-else>
                                        {{ item.price }} {{ labels.coins }}
                                    </template>
                                </span>
                            </span>
                            <span class="inventory-cell-index">{{ itemMax(item.id) }}</span>
                        </button>
                    </div>
                </div>

                <div class="shop-controls">
                    <div class="shop-section-title">{{ labels.quantity }}</div>
                    <div class="shop-selected">
                        <template v-if="selectedShopItem()">
                            <ItemIcon :visual="itemVisual(selectedShopItem().id)" />
                            <span class="shop-selected-name">
                                {{ itemLabel(selectedShopItem().id) }}
                            </span>
                            <span class="shop-selected-meta">
                                <template v-if="selectedShopItem().locked">
                                    {{ labels.unlockLevel(selectedShopItem().unlockLevel) }}
                                </template>
                                <template v-else>
                                    {{ selectedShopItem().price }} {{ labels.coins }}
                                    / {{ labels.max }} {{ itemMax(selectedShopItem().id) }}
                                </template>
                            </span>
                        </template>
                        <span v-else class="shop-selected-empty">
                            {{ labels.selectItem }}
                        </span>
                    </div>
                    <input
                        v-model.number="quantity"
                        class="shop-quantity-input"
                        type="number"
                        min="1"
                        :max="selectedShopItem() ? itemMax(selectedShopItem().id) : 1"
                    />
                    <div class="shop-total">
                        {{ labels.total }}: {{ selectedTotal() }} {{ labels.coins }}
                    </div>
                    <button
                        class="shop-buy-button"
                        type="button"
                        :disabled="!canBuySelected()"
                        @click="buySelected"
                    >
                        {{ labels.buy }}
                    </button>
                    <div class="shop-note">{{ labels.shiftHint }}</div>
                </div>

                <div class="shop-inventory">
                    <div class="inventory-backpack">
                        <div class="inventory-section-title">{{ labels.backpack }}</div>
                        <InventoryGrid>
                            <InventorySlot
                                v-for="(item, index) in backpack"
                                :key="`shop-backpack-${index}`"
                                :item="item"
                                :index="index"
                                :selected="selectedBackpackIndex === index"
                                :item-label="itemLabel"
                                :item-visual="itemVisual"
                                :item-quantity="itemQuantity"
                                :item-max="itemMax"
                                @activate="emit('select-backpack', index)"
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
                                :key="`shop-quickbar-${index}`"
                                :item="item"
                                :index="index"
                                :selected="inventoryIndex === index"
                                :item-label="itemLabel"
                                :item-visual="itemVisual"
                                :item-quantity="itemQuantity"
                                :item-max="itemMax"
                                @activate="emit('assign-quickbar', index)"
                                @drag-start="emit('drag-start', 'quickbar', index)"
                                @drag-end="emit('drag-end')"
                                @drop="emit('drop', 'quickbar', index, $event)"
                            />
                        </InventoryGrid>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
