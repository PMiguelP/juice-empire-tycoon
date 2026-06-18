<script setup>
import { ref } from "vue";
import InventoryGrid from "./InventoryGrid.vue";
import InventorySlot from "./InventorySlot.vue";
import ItemIcon from "./ItemIcon.vue";

const props = defineProps({
    open: { type: Boolean, required: true },
    backpack: { type: Array, required: true },
    inventory: { type: Array, required: true },
    sellSlots: { type: Array, required: true },
    coins: { type: Number, required: true },
    selectedBackpackIndex: { type: Number, default: null },
    inventoryIndex: { type: Number, required: true },
    getSellPrice: { type: Function, required: true },
    labels: { type: Object, required: true },
    itemLabel: { type: Function, required: true },
    itemVisual: { type: Function, required: true },
    itemQuantity: { type: Function, required: true },
    itemMax: { type: Function, required: true },
});

const emit = defineEmits([
    "close",
    "sell-items",
    "stage-sell",
    "clear-sell",
    "select-backpack",
    "assign-quickbar",
    "drag-start",
    "drag-end",
    "drop",
]);

const selectedSource = ref(null);
const quantity = ref(1);

const sourceItems = (kind) => {
    return kind === "backpack" ? props.backpack : props.inventory;
};

const selectedItem = () => {
    if (!selectedSource.value) {
        return null;
    }
    return sourceItems(selectedSource.value.kind)[selectedSource.value.index] ?? null;
};

const selectedQuantity = () => {
    return Number(quantity.value);
};

const selectSource = (kind, index) => {
    const item = sourceItems(kind)[index];
    if (!item) {
        return;
    }
    selectedSource.value = { kind, index };
    quantity.value = 1;
    if (kind === "backpack") {
        emit("select-backpack", index);
    }
};

const canStageSelected = () => {
    const item = selectedItem();
    const amount = selectedQuantity();
    return (
        Boolean(item) &&
        Number.isInteger(amount) &&
        amount >= 1 &&
        amount <= props.itemQuantity(item)
    );
};

const stageSelected = () => {
    if (!selectedSource.value || !canStageSelected()) {
        return;
    }
    emit(
        "stage-sell",
        selectedSource.value.kind,
        selectedSource.value.index,
        selectedQuantity(),
    );
};

const stageMax = (kind, index) => {
    const item = sourceItems(kind)[index];
    if (!item) {
        return;
    }
    emit("stage-sell", kind, index, props.itemQuantity(item));
};

const handleSourceClick = (event, kind, index) => {
    if (event.shiftKey) {
        stageMax(kind, index);
        return;
    }
    selectSource(kind, index);
};

const benchTotal = () => {
    return props.sellSlots.reduce((total, item) => total + props.getSellPrice(item), 0);
};
</script>

<template>
    <div class="sell-overlay" :class="{ 'is-open': open }">
        <div class="sell-scrim"></div>
        <div class="sell-panel" role="dialog" :aria-label="labels.title">
            <div class="sell-header">
                <div>
                    <div class="sell-title">{{ labels.title }}</div>
                    <div class="sell-subtitle">{{ labels.subtitle }}</div>
                </div>
                <div class="sell-coin-badge">
                    <span class="hud-coins-icon">◎</span>
                    <span>{{ coins }}</span>
                </div>
                <button
                    class="sell-close"
                    type="button"
                    @click="emit('close')"
                    aria-label="Close sell menu"
                >
                    x
                </button>
            </div>

            <div class="sell-body">
                <div class="sell-inventory">
                    <div class="inventory-backpack">
                        <div class="inventory-section-title">{{ labels.backpack }}</div>
                        <InventoryGrid>
                            <InventorySlot
                                v-for="(item, index) in backpack"
                                :key="`sell-backpack-${index}`"
                                :item="item"
                                :index="index"
                                :selected="
                                    selectedSource?.kind === 'backpack' &&
                                    selectedSource?.index === index
                                "
                                :item-label="itemLabel"
                                :item-visual="itemVisual"
                                :item-quantity="itemQuantity"
                                :item-max="itemMax"
                                @activate="handleSourceClick($event, 'backpack', index)"
                                @drag-start="
                                    emit(
                                        'drag-start',
                                        'backpack',
                                        index,
                                        selectedSource?.kind === 'backpack' &&
                                            selectedSource?.index === index
                                            ? selectedQuantity()
                                            : null,
                                    )
                                "
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
                                :key="`sell-quickbar-${index}`"
                                :item="item"
                                :index="index"
                                :selected="
                                    selectedSource?.kind === 'quickbar' &&
                                    selectedSource?.index === index
                                "
                                :item-label="itemLabel"
                                :item-visual="itemVisual"
                                :item-quantity="itemQuantity"
                                :item-max="itemMax"
                                @activate="handleSourceClick($event, 'quickbar', index)"
                                @drag-start="
                                    emit(
                                        'drag-start',
                                        'quickbar',
                                        index,
                                        selectedSource?.kind === 'quickbar' &&
                                            selectedSource?.index === index
                                            ? selectedQuantity()
                                            : null,
                                    )
                                "
                                @drag-end="emit('drag-end')"
                                @drop="emit('drop', 'quickbar', index, $event)"
                            />
                        </InventoryGrid>
                    </div>
                </div>

                <div class="sell-controls">
                    <div class="sell-section-title">{{ labels.quantity }}</div>
                    <div class="sell-selected">
                        <template v-if="selectedItem()">
                            <ItemIcon :visual="itemVisual(selectedItem())" />
                            <span class="sell-selected-name">{{ itemLabel(selectedItem()) }}</span>
                            <span class="sell-selected-meta">
                                {{ labels.max }} {{ itemQuantity(selectedItem()) }}
                            </span>
                        </template>
                        <span v-else class="sell-selected-empty">
                            {{ labels.selectItem }}
                        </span>
                    </div>
                    <input
                        v-model.number="quantity"
                        class="sell-quantity-input"
                        type="number"
                        min="1"
                        :max="selectedItem() ? itemQuantity(selectedItem()) : 1"
                    />
                    <button
                        class="sell-action"
                        type="button"
                        :disabled="!canStageSelected()"
                        @click="stageSelected"
                    >
                        {{ labels.add }}
                    </button>
                    <div class="sell-note">{{ labels.shiftHint }}</div>
                    <div class="sell-note">{{ labels.closeHint }}</div>
                </div>

                <div class="sell-list">
                    <div class="sell-section-title">{{ labels.slots }}</div>
                    <div class="sell-grid">
                        <InventorySlot
                            v-for="(item, index) in sellSlots"
                            :key="`sell-slot-${index}`"
                            class="sell-slot sell-grid-cell"
                            :item="item"
                            :index="index"
                            :show-index="false"
                            :item-label="itemLabel"
                            :item-visual="itemVisual"
                            :item-quantity="itemQuantity"
                            :item-max="itemMax"
                            @drag-start="emit('drag-start', 'sell', index)"
                            @drag-end="emit('drag-end')"
                            @drop="emit('drop', 'sell', index, $event)"
                        >
                            <template #content>
                                <span v-if="item" class="item-stack">
                                    <ItemIcon :visual="itemVisual(item)" />
                                    <span class="sell-slot-label">{{ itemLabel(item) }}</span>
                                    <span class="item-quantity">
                                        {{ itemQuantity(item) }}/{{ itemMax(item) }}
                                    </span>
                                </span>
                            </template>
                            <template #footer>
                                <span class="sell-slot-price">
                                    {{ getSellPrice(item) }} {{ labels.coins }}
                                </span>
                            </template>
                        </InventorySlot>
                    </div>
                    <div class="sell-total">
                        {{ labels.total }}: {{ benchTotal() }} {{ labels.coins }}
                    </div>
                    <button
                        class="sell-action"
                        type="button"
                        :disabled="benchTotal() <= 0"
                        @click="emit('sell-items')"
                    >
                        {{ labels.action }}
                    </button>
                    <button class="sell-action is-secondary" type="button" @click="emit('clear-sell')">
                        {{ labels.clear }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
