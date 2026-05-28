<script setup>
import { ref } from "vue";

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
    if (!item) {
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
                            }"
                            type="button"
                            draggable="true"
                            @click="selectShopItem(item.id)"
                            @dragstart="
                                emit(
                                    'shop-drag-start',
                                    item.id,
                                    canDragSelectedQuantity(item)
                                        ? normalizedQuantity()
                                        : 1,
                                )
                            "
                            @dragend="emit('drag-end')"
                        >
                            <span class="item-stack">
                                <span
                                    class="item-token"
                                    :style="{
                                        '--item-color': itemVisual(item.id).color,
                                        '--item-accent': itemVisual(item.id).accent,
                                    }"
                                >
                                    {{ itemVisual(item.id).symbol }}
                                </span>
                                <span class="inventory-cell-label">{{ itemLabel(item.id) }}</span>
                                <span class="item-quantity">
                                    {{ item.price }} {{ labels.coins }}
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
                            <span
                                class="item-token"
                                :style="{
                                    '--item-color': itemVisual(selectedShopItem().id).color,
                                    '--item-accent': itemVisual(selectedShopItem().id).accent,
                                }"
                            >
                                {{ itemVisual(selectedShopItem().id).symbol }}
                            </span>
                            <span class="shop-selected-name">
                                {{ itemLabel(selectedShopItem().id) }}
                            </span>
                            <span class="shop-selected-meta">
                                {{ selectedShopItem().price }} {{ labels.coins }}
                                / {{ labels.max }} {{ itemMax(selectedShopItem().id) }}
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
                </div>

                <div class="shop-inventory">
                    <div class="inventory-backpack">
                        <div class="inventory-section-title">{{ labels.backpack }}</div>
                        <div class="inventory-grid">
                            <button
                                v-for="(item, index) in backpack"
                                :key="`shop-backpack-${index}`"
                                class="inventory-cell shop-grid-cell"
                                :class="{
                                    'is-selected': selectedBackpackIndex === index,
                                    'is-draggable': Boolean(item),
                                }"
                                type="button"
                                draggable="true"
                                @click="selectBackpackSlot(index)"
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
                                    <span class="inventory-cell-label">{{ itemLabel(item) }}</span>
                                    <span class="item-quantity">
                                        {{ itemQuantity(item) }}/{{ itemMax(item) }}
                                    </span>
                                </span>
                                <span class="inventory-cell-index">{{ index + 1 }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="inventory-quickbar">
                        <div class="inventory-section-title">{{ labels.quickbar }}</div>
                        <div class="inventory-quickbar-grid">
                            <button
                                v-for="(item, index) in inventory"
                                :key="`shop-quickbar-${index}`"
                                class="inventory-cell shop-grid-cell"
                                :class="{
                                    'is-selected': inventoryIndex === index,
                                    'is-draggable': Boolean(item),
                                }"
                                type="button"
                                draggable="true"
                                @click="assignToQuickbar(index)"
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
                                    <span class="inventory-cell-label">{{ itemLabel(item) }}</span>
                                    <span class="item-quantity">
                                        {{ itemQuantity(item) }}/{{ itemMax(item) }}
                                    </span>
                                </span>
                                <span class="inventory-cell-index">{{ index + 1 }}</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
