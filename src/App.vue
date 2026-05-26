<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { EventBus } from "./game/EventBus";
import PhaserGame from "./PhaserGame.vue";
import { STORAGE_KEY, usePlayerData } from "./composables/usePlayerData";
import type { SaveData } from "./composables/usePlayerData";
import { useShop } from "./composables/useShop";
import { useSell } from "./composables/useSell";
import { useDragAndDrop } from "./composables/useDragAndDrop";
import { useInputManager } from "./composables/useInputManager";
import HudOverlay from "./ui/HudOverlay.vue";
import RadialOverlay from "./ui/RadialOverlay.vue";
import FarmOverlay from "./ui/FarmOverlay.vue";
import InventoryOverlay from "./ui/InventoryOverlay.vue";
import ShopOverlay from "./ui/ShopOverlay.vue";
import SellOverlay from "./ui/SellOverlay.vue";
import PauseOverlay from "./ui/PauseOverlay.vue";

const fileInputRef = ref<HTMLInputElement | null>(null);

const menuOpen = ref(false);
const pauseMenuOpen = ref(true);
const menuMode = ref<"main" | "pause">("main");
const farmMenuOpen = ref(false);
const inventoryMenuOpen = ref(false);
const shopMenuOpen = ref(false);
const sellMenuOpen = ref(false);

const activeIndex = ref(0);
const selectedPlotIndex = ref(0);
const selectedBackpackIndex = ref<number | null>(null);

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

const {
    level,
    coins,
    inventory,
    backpack,
    inventoryIndex,
    sellSlots,
    hasSave,
    farmPlots,
    applySave,
    getSaveData,
    saveState,
    loadState,
    setLevel,
    addCoins,
    addLevel,
    setCoins,
    setInventorySlot,
    isPlotUnlocked,
    unlockPlot,
    canUnlockPlot,
} = usePlayerData();

const { shopItems, buyItem } = useShop(
    coins,
    backpack,
    selectedBackpackIndex,
    saveState,
);
const { getSellPrice, sellItems } = useSell(coins, sellSlots, saveState);
const { handleDragStart, handleDragEnd, handleDrop } = useDragAndDrop(
    backpack,
    inventory,
    sellSlots,
    saveState,
);

const { attach, detach } = useInputManager({
    menuOpen,
    pauseMenuOpen,
    menuMode,
    farmMenuOpen,
    inventoryMenuOpen,
    shopMenuOpen,
    sellMenuOpen,
    selectedBackpackIndex,
    inventoryIndex,
    hasSave,
    saveState,
    loadState,
    storageKey: STORAGE_KEY,
});

const setActive = (index: number) => {
    activeIndex.value = index;
};

const selectPlot = (index: number) => {
    selectedPlotIndex.value = index;
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

onMounted(() => {
    attach();
    void loadState();

    EventBus.on("hud:set-level", setLevel);
    EventBus.on("hud:add-level", addLevel);
    EventBus.on("hud:add-coins", addCoins);
    EventBus.on("hud:set-coins", setCoins);
    EventBus.on("hud:set-slot", setInventorySlot);
});

onUnmounted(() => {
    detach();

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
        <HudOverlay
            :level="level"
            :coins="coins"
            :inventory="inventory"
            :inventory-index="inventoryIndex"
        />
        <RadialOverlay
            :open="menuOpen"
            :menu-items="menuItems"
            :active-index="activeIndex"
            @set-active="setActive"
        />
        <FarmOverlay
            :open="farmMenuOpen"
            :farm-plots="farmPlots"
            :selected-plot-index="selectedPlotIndex"
            :coins="coins"
            :is-plot-unlocked="isPlotUnlocked"
            :can-unlock-plot="canUnlockPlot"
            @close="farmMenuOpen = false"
            @select-plot="selectPlot"
            @unlock-plot="unlockPlot"
        />
        <InventoryOverlay
            :open="inventoryMenuOpen"
            :backpack="backpack"
            :inventory="inventory"
            :selected-backpack-index="selectedBackpackIndex"
            :inventory-index="inventoryIndex"
            @close="inventoryMenuOpen = false"
            @select-backpack="selectBackpackSlot"
            @assign-quickbar="assignToQuickbar"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @drop="handleDrop"
        />
        <ShopOverlay
            :open="shopMenuOpen"
            :shop-items="shopItems"
            :coins="coins"
            :backpack="backpack"
            :inventory="inventory"
            :selected-backpack-index="selectedBackpackIndex"
            :inventory-index="inventoryIndex"
            @close="shopMenuOpen = false"
            @buy="buyItem"
            @select-backpack="selectBackpackSlot"
            @assign-quickbar="assignToQuickbar"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @drop="handleDrop"
        />
        <SellOverlay
            :open="sellMenuOpen"
            :backpack="backpack"
            :inventory="inventory"
            :sell-slots="sellSlots"
            :selected-backpack-index="selectedBackpackIndex"
            :inventory-index="inventoryIndex"
            :get-sell-price="getSellPrice"
            @close="sellMenuOpen = false"
            @sell-items="sellItems"
            @select-backpack="selectBackpackSlot"
            @assign-quickbar="assignToQuickbar"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @drop="handleDrop"
        />
        <PauseOverlay
            :open="pauseMenuOpen"
            :menu-mode="menuMode"
            :has-save="hasSave"
            @close="closeMenu"
            @save-download="saveAndDownload"
            @upload="openFilePicker"
        />
    </div>
</template>
const data = JSON.stringify(getSaveData(), null, 2);
