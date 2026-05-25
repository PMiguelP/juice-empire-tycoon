<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { EventBus } from "./game/EventBus";
import PhaserGame from "./PhaserGame.vue";

type SaveData = {
    saveVersion: number;
    level: number;
    coins: number;
    inventory: Array<string | null>;
    backpack?: Array<string | null>;
    selectedSlot: number;
    plotUnlocks?: boolean[];
};

type DragSource = {
    kind: "backpack" | "quickbar" | "sell";
    index: number;
} | null;

const STORAGE_KEY = "juice-save-v1";
const SAVE_VERSION = 3;

const menuOpen = ref(false);
const pauseMenuOpen = ref(true);
const menuMode = ref<"main" | "pause">("main");
const activeIndex = ref(0);
const inventoryIndex = ref(0);
const level = ref(1);
const coins = ref(0);
const inventory = ref<Array<string | null>>([null, null, null, null, null]);
const backpack = ref<Array<string | null>>(
    Array.from({ length: 15 }, () => null),
);
const hasSave = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const farmMenuOpen = ref(false);
const inventoryMenuOpen = ref(false);
const shopMenuOpen = ref(false);
const sellMenuOpen = ref(false);
const selectedBackpackIndex = ref<number | null>(null);
const dragSource = ref<DragSource>(null);
const selectedPlotIndex = ref(0);
const plotUnlocks = ref<boolean[]>([true, false, false]);
const sellSlots = ref<Array<string | null>>(Array.from({ length: 6 }, () => null));

const farmPlots = [
    { name: "South Field", size: "15 tiles", cost: 0 },
    { name: "East Field", size: "15 tiles", cost: 200 },
    { name: "North Field", size: "15 tiles", cost: 200 },
];

const menuItems = [
    { label: "Plant", description: "Place seeds on tilled soil" },
    { label: "Harvest", description: "Collect ready crops" },
    { label: "Water", description: "Water nearby soil" },
    { label: "Seed", description: "Select seed type" },
    { label: "Fertilize", description: "Boost growth speed" },
    { label: "Till", description: "Prepare soil for planting" },
    { label: "Craft", description: "Build simple items" },
    { label: "Cook", description: "Turn crops into meals" },
];

const shopItems = [
    { id: "seed-bag", name: "Seed Bag", price: 50 },
    { id: "shovel", name: "Shovel", price: 150 },
    { id: "potion", name: "HP Potion", price: 75 },
    { id: "roasta", name: "Roasta", price: 10 },
    { id: "chappir", name: "Chappir", price: 50 },
];

const sellPriceMap: Record<string, number> = {
    "seed-bag": 25,
    shovel: 75,
    potion: 35,
    roasta: 5,
    chappir: 25,
};

const setActive = (index: number) => {
    activeIndex.value = index;
};

const selectPlot = (index: number) => {
    selectedPlotIndex.value = index;
};

const applySave = (data: SaveData) => {
    level.value = data.level ?? 1;
    coins.value = data.coins ?? 0;
    inventory.value = Array.from({ length: 5 }, (_, index) => {
        return data.inventory?.[index] ?? null;
    });
    backpack.value = Array.from({ length: 15 }, (_, index) => {
        return data.backpack?.[index] ?? null;
    });
    inventoryIndex.value = Math.min(Math.max(data.selectedSlot ?? 0, 0), 4);
    if (data.plotUnlocks && data.plotUnlocks.length === farmPlots.length) {
        plotUnlocks.value = data.plotUnlocks.slice();
    } else {
        plotUnlocks.value = [true, false, false];
    }
    plotUnlocks.value[0] = true;
};

const getSaveData = (): SaveData => {
    return {
        saveVersion: SAVE_VERSION,
        level: level.value,
        coins: coins.value,
        inventory: inventory.value,
        backpack: backpack.value,
        selectedSlot: inventoryIndex.value,
        plotUnlocks: plotUnlocks.value,
    };
};

const selectBackpackSlot = (index: number) => {
    selectedBackpackIndex.value = index;
};

const assignToQuickbar = (slotIndex: number) => {
    if (slotIndex < 0 || slotIndex > 4) {
        return;
    }

    if (selectedBackpackIndex.value === null) {
        inventoryIndex.value = slotIndex;
        saveState();
        return;
    }

    const sourceIndex = selectedBackpackIndex.value;
    const nextBackpack = backpack.value.slice();
    const nextQuickbar = inventory.value.slice();
    const temp = nextQuickbar[slotIndex] ?? null;
    nextQuickbar[slotIndex] = nextBackpack[sourceIndex] ?? null;
    nextBackpack[sourceIndex] = temp;
    inventory.value = nextQuickbar;
    backpack.value = nextBackpack;
    selectedBackpackIndex.value = null;
    saveState();
};

const getItemsByKind = (kind: "backpack" | "quickbar" | "sell") => {
    if (kind === "backpack") {
        return backpack.value;
    }
    if (kind === "quickbar") {
        return inventory.value;
    }
    return sellSlots.value;
};

const setItemsByKind = (kind: "backpack" | "quickbar" | "sell", items: Array<string | null>) => {
    if (kind === "backpack") {
        backpack.value = items;
        return;
    }
    if (kind === "quickbar") {
        inventory.value = items;
        return;
    }
    sellSlots.value = items;
};

const handleDragStart = (kind: "backpack" | "quickbar" | "sell", index: number) => {
    const sourceItems = getItemsByKind(kind);
    if (!sourceItems[index]) {
        return;
    }

    dragSource.value = { kind, index };
};

const handleDragEnd = () => {
    dragSource.value = null;
};

const handleDrop = (kind: "backpack" | "quickbar" | "sell", index: number) => {
    if (!dragSource.value) {
        return;
    }

    const source = dragSource.value;
    if (source.kind === kind && source.index === index) {
        dragSource.value = null;
        return;
    }

    const sourceItems = getItemsByKind(source.kind).slice();
    const targetItems = getItemsByKind(kind).slice();

    const temp = targetItems[index] ?? null;
    targetItems[index] = sourceItems[source.index] ?? null;
    sourceItems[source.index] = temp;

    setItemsByKind(source.kind, sourceItems);
    setItemsByKind(kind, targetItems);

    dragSource.value = null;
    saveState();
};

const getSellPrice = (itemId: string | null) => {
    if (!itemId) {
        return 0;
    }
    return sellPriceMap[itemId] ?? 5;
};

const sellItems = () => {
    let total = 0;
    const next = sellSlots.value.map((item) => {
        total += getSellPrice(item);
        return null;
    });

    if (total <= 0) {
        return;
    }

    coins.value += total;
    sellSlots.value = next;
    saveState();
};

const buyItem = (itemId: string, price: number) => {
    if (coins.value < price) {
        return;
    }

    const preferredIndex = selectedBackpackIndex.value;
    const nextBackpack = backpack.value.slice();
    let targetIndex = -1;

    if (preferredIndex !== null && !nextBackpack[preferredIndex]) {
        targetIndex = preferredIndex;
    } else {
        targetIndex = nextBackpack.findIndex((slot) => !slot);
    }

    if (targetIndex < 0) {
        return;
    }

    coins.value -= price;
    nextBackpack[targetIndex] = itemId;
    backpack.value = nextBackpack;
    saveState();
};

const isPlotUnlocked = (index: number) => {
    if (index === 0) {
        return true;
    }
    return Boolean(plotUnlocks.value[index]);
};

const unlockPlot = (index: number) => {
    if (isPlotUnlocked(index)) {
        return;
    }

    const plot = farmPlots[index];
    if (coins.value < plot.cost) {
        return;
    }

    coins.value -= plot.cost;
    plotUnlocks.value = plotUnlocks.value.map((value, idx) => {
        return idx === index ? true : value;
    });
    saveState();
};

const canUnlockPlot = (index: number) => {
    if (isPlotUnlocked(index)) {
        return false;
    }
    return coins.value >= farmPlots[index].cost;
};

const saveState = () => {
    const data = getSaveData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    hasSave.value = true;
};

const downloadSave = () => {
    const data = JSON.stringify(getSaveData(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "save.json";
    link.click();
    URL.revokeObjectURL(url);
};

const saveAndDownload = () => {
    saveState();
    downloadSave();
};

const setLevel = (nextLevel: number) => {
    level.value = Math.max(1, Math.floor(nextLevel));
    saveState();
};

const addCoins = (delta: number) => {
    coins.value = Math.max(0, coins.value + delta);
    saveState();
};

const addLevel = (delta: number) => {
    level.value = Math.max(1, level.value + delta);
    saveState();
};

const setCoins = (nextCoins: number) => {
    coins.value = Math.max(0, Math.floor(nextCoins));
    saveState();
};

const setInventorySlot = (slotIndex: number, item: string | null) => {
    if (slotIndex < 0 || slotIndex > 4) {
        return;
    }

    const next = inventory.value.slice();
    next[slotIndex] = item;
    inventory.value = next;
    saveState();
};

const loadState = async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved) as SaveData;
        if (parsed.saveVersion === SAVE_VERSION) {
            applySave(parsed);
            hasSave.value = true;
            return;
        }
    }

    hasSave.value = false;

    const response = await fetch("/data/save.json");
    if (!response.ok) {
        return;
    }

    const data = (await response.json()) as SaveData;
    applySave(data);
    saveState();
};

const openFilePicker = () => {
    fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
        return;
    }

    const text = await file.text();
    const data = JSON.parse(text) as SaveData;
    applySave(data);
    saveState();
    pauseMenuOpen.value = false;
    menuMode.value = "pause";
    input.value = "";
};

const closeMenu = () => {
    pauseMenuOpen.value = false;
    if (menuMode.value === "main") {
        menuMode.value = "pause";
    }
};

const handleKey = (event: KeyboardEvent) => {
    if (event.code === "KeyE" && !event.repeat) {
        menuOpen.value = !menuOpen.value;
    }

    if (event.code === "KeyK" && !event.repeat) {
        farmMenuOpen.value = !farmMenuOpen.value;
        if (farmMenuOpen.value) {
            menuOpen.value = false;
            pauseMenuOpen.value = false;
            inventoryMenuOpen.value = false;
        }
        return;
    }

    if (event.code === "KeyG" && !event.repeat) {
        inventoryMenuOpen.value = !inventoryMenuOpen.value;
        selectedBackpackIndex.value = null;
        if (inventoryMenuOpen.value) {
            menuOpen.value = false;
            pauseMenuOpen.value = false;
            farmMenuOpen.value = false;
            shopMenuOpen.value = false;
            sellMenuOpen.value = false;
        }
        return;
    }

    if (
        (event.code === "KeyL" || event.key.toLowerCase() === "l") &&
        !event.repeat
    ) {
        shopMenuOpen.value = !shopMenuOpen.value;
        selectedBackpackIndex.value = null;
        if (shopMenuOpen.value) {
            menuOpen.value = false;
            pauseMenuOpen.value = false;
            farmMenuOpen.value = false;
            inventoryMenuOpen.value = false;
            sellMenuOpen.value = false;
        }
        return;
    }

    if (
        (event.code === "KeyP" || event.key.toLowerCase() === "p") &&
        !event.repeat
    ) {
        sellMenuOpen.value = !sellMenuOpen.value;
        selectedBackpackIndex.value = null;
        if (sellMenuOpen.value) {
            menuOpen.value = false;
            pauseMenuOpen.value = false;
            farmMenuOpen.value = false;
            inventoryMenuOpen.value = false;
            shopMenuOpen.value = false;
        }
        return;
    }

    if (event.code === "Escape") {
        if (sellMenuOpen.value) {
            sellMenuOpen.value = false;
            selectedBackpackIndex.value = null;
            return;
        }
        if (shopMenuOpen.value) {
            shopMenuOpen.value = false;
            selectedBackpackIndex.value = null;
            return;
        }
        if (inventoryMenuOpen.value) {
            inventoryMenuOpen.value = false;
            selectedBackpackIndex.value = null;
            return;
        }
        if (farmMenuOpen.value) {
            farmMenuOpen.value = false;
            return;
        }
        if (menuOpen.value) {
            menuOpen.value = false;
            return;
        }

        menuMode.value = "pause";
        pauseMenuOpen.value = !pauseMenuOpen.value;
        return;
    }

    if (event.code === "KeyR" && event.shiftKey) {
        localStorage.removeItem(STORAGE_KEY);
        hasSave.value = false;
        void loadState();
        return;
    }

    if (event.code.startsWith("Digit")) {
        const keyValue = Number(event.code.replace("Digit", ""));
        if (keyValue >= 1 && keyValue <= 5) {
            inventoryIndex.value = keyValue - 1;
            saveState();
        }
    }
};

onMounted(() => {
    window.addEventListener("keydown", handleKey);
    void loadState();

    EventBus.on("hud:set-level", setLevel);
    EventBus.on("hud:add-level", addLevel);
    EventBus.on("hud:add-coins", addCoins);
    EventBus.on("hud:set-coins", setCoins);
    EventBus.on("hud:set-slot", setInventorySlot);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKey);

    EventBus.off("hud:set-level", setLevel);
    EventBus.off("hud:add-level", addLevel);
    EventBus.off("hud:add-coins", addCoins);
    EventBus.off("hud:set-coins", setCoins);
    EventBus.off("hud:set-slot", setInventorySlot);
});
</script>

<template>
    <div class="app-shell">
        <PhaserGame />
        <input
            ref="fileInputRef"
            class="visually-hidden"
            type="file"
            accept="application/json"
            @change="handleFileChange"
        />
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
        <div class="radial-overlay" :class="{ 'is-open': menuOpen }">
            <div class="radial-scrim"></div>
            <div class="radial-wheel" role="dialog" aria-label="Action wheel">
                <div class="radial-ring"></div>
                <div class="radial-center">
                    <div class="radial-title">Actions</div>
                    <div class="radial-focus">
                        {{ menuItems[activeIndex].label }}
                    </div>
                    <div class="radial-subtitle">
                        {{ menuItems[activeIndex].description }}
                    </div>
                    <div class="radial-hint">Press E to close</div>
                </div>
                <div class="radial-items" style="--item-count: 8">
                    <button
                        v-for="(item, index) in menuItems"
                        :key="item.label"
                        class="radial-item"
                        :style="{ '--i': index }"
                        @mouseenter="setActive(index)"
                        @focus="setActive(index)"
                        type="button"
                    >
                        <span class="radial-item-label">
                            {{ item.label }}
                        </span>
                    </button>
                </div>
            </div>
        </div>
        <div class="farm-overlay" :class="{ 'is-open': farmMenuOpen }">
            <div class="farm-scrim"></div>
            <div class="farm-panel" role="dialog" aria-label="Farm map">
                <div class="farm-header">
                    <div>
                        <div class="farm-title">Farm Map</div>
                        <div class="farm-subtitle">Manage your plots</div>
                    </div>
                    <button
                        class="farm-close"
                        type="button"
                        @click="farmMenuOpen = false"
                        aria-label="Close farm map"
                    >
                        ✕
                    </button>
                </div>
                <div class="farm-content">
                    <div class="farm-nav">
                        <div class="farm-nav-title">My Farm</div>
                        <button
                            v-for="(plot, index) in farmPlots"
                            :key="plot.name"
                            class="farm-nav-button"
                            :class="{
                                'is-active': selectedPlotIndex === index,
                            }"
                            type="button"
                            @click="selectPlot(index)"
                        >
                            <span class="farm-nav-name">{{ plot.name }}</span>
                            <span class="farm-nav-meta">
                                {{
                                    isPlotUnlocked(index)
                                        ? "Unlocked"
                                        : "Locked"
                                }}
                            </span>
                        </button>
                    </div>
                    <div class="farm-minimap" aria-hidden="true">
                        <button
                            v-for="(plot, index) in farmPlots"
                            :key="`${plot.name}-mini`"
                            class="farm-plot"
                            :class="{
                                'is-selected': selectedPlotIndex === index,
                                'is-locked': !isPlotUnlocked(index),
                            }"
                            type="button"
                            @click="selectPlot(index)"
                        >
                            <span class="farm-plot-label">{{ index + 1 }}</span>
                        </button>
                    </div>
                    <div class="farm-detail">
                        <div class="farm-detail-title">
                            {{ farmPlots[selectedPlotIndex].name }}
                        </div>
                        <div class="farm-detail-meta">
                            Plot size: {{ farmPlots[selectedPlotIndex].size }}
                        </div>
                        <div class="farm-detail-meta">
                            Status:
                            {{
                                isPlotUnlocked(selectedPlotIndex)
                                    ? "Unlocked"
                                    : "Locked"
                            }}
                        </div>
                        <div class="farm-detail-meta">
                            Available coins: {{ coins }}
                        </div>
                        <div class="farm-detail-actions">
                            <button
                                class="farm-action"
                                type="button"
                                :disabled="!canUnlockPlot(selectedPlotIndex)"
                                @click="unlockPlot(selectedPlotIndex)"
                            >
                                {{
                                    isPlotUnlocked(selectedPlotIndex)
                                        ? "Ready"
                                        : `Unlock for ${farmPlots[selectedPlotIndex].cost} coins`
                                }}
                            </button>
                        </div>
                        <div class="farm-detail-note">Press K to close.</div>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="inventory-overlay"
            :class="{ 'is-open': inventoryMenuOpen }"
        >
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
                        @click="inventoryMenuOpen = false"
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
                                    'is-selected':
                                        selectedBackpackIndex === index,
                                    'is-draggable': Boolean(item),
                                }"
                                type="button"
                                @click="selectBackpackSlot(index)"
                                draggable="true"
                                @dragstart="handleDragStart('backpack', index)"
                                @dragend="handleDragEnd"
                                @dragover.prevent
                                @drop="handleDrop('backpack', index)"
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
                                @dragstart="handleDragStart('quickbar', index)"
                                @dragend="handleDragEnd"
                                @dragover.prevent
                                @drop="handleDrop('quickbar', index)"
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
                            Press G or Esc to close.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="shop-overlay" :class="{ 'is-open': shopMenuOpen }">
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
                        @click="shopMenuOpen = false"
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
                                @click="buyItem(item.id, item.price)"
                            >
                                <span class="shop-item-name">{{
                                    item.name
                                }}</span>
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
                                        handleDragStart('backpack', index)
                                    "
                                    @dragend="handleDragEnd"
                                    @dragover.prevent
                                    @drop="handleDrop('backpack', index)"
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
                                        handleDragStart('quickbar', index)
                                    "
                                    @dragend="handleDragEnd"
                                    @dragover.prevent
                                    @drop="handleDrop('quickbar', index)"
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
        <div class="pause-overlay" :class="{ 'is-open': pauseMenuOpen }">
            <div class="pause-scrim"></div>
            <div class="pause-panel" role="dialog" aria-label="Game menu">
                <div class="pause-title">
                    {{ menuMode === "main" ? "Main Menu" : "Game Menu" }}
                </div>
                <div class="pause-subtitle">
                    {{
                        menuMode === "main"
                            ? hasSave
                                ? "Continue where you left off"
                                : "Start your farm adventure"
                            : "Manage your save and resume"
                    }}
                </div>
                <div class="pause-actions">
                    <button
                        class="pause-button is-primary"
                        type="button"
                        @click="closeMenu"
                    >
                        {{
                            menuMode === "main"
                                ? hasSave
                                    ? "Resume Game"
                                    : "Start Game"
                                : "Resume"
                        }}
                    </button>
                    <button
                        class="pause-button"
                        type="button"
                        @click="saveAndDownload"
                    >
                        Save & Download
                    </button>
                    <button
                        class="pause-button"
                        type="button"
                        @click="openFilePicker"
                    >
                        Upload Save
                    </button>
                </div>
                <div class="pause-footnote">
                    Saves are stored locally in your browser.
                </div>
            </div>
        </div>
    </div>
</template>
