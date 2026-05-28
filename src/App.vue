<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { EventBus } from "./game/EventBus";
import PhaserGame from "./PhaserGame.vue";
import { STORAGE_KEY, usePlayerData } from "./composables/usePlayerData";
import type { SaveData } from "./composables/usePlayerData";
import { useLanguage } from "./i18n";
import type { Language } from "./i18n";
import { getItemVisual } from "./items";
import { getItemQuantity, getMaxStack, getItemId } from "./items";
import type { InventoryEntry } from "./items";
import { useShop } from "./composables/useShop";
import { useSell } from "./composables/useSell";
import { useDragAndDrop } from "./composables/useDragAndDrop";
import { useInputManager } from "./composables/useInputManager";
import MainMenuOverlay from "./ui/MainMenuOverlay.vue";
import HudOverlay from "./ui/HudOverlay.vue";
import RadialOverlay from "./ui/RadialOverlay.vue";
import FarmOverlay from "./ui/FarmOverlay.vue";
import InventoryOverlay from "./ui/InventoryOverlay.vue";
import ShopOverlay from "./ui/ShopOverlay.vue";
import SellOverlay from "./ui/SellOverlay.vue";
import JuiceOverlay from "./ui/JuiceOverlay.vue";
import PauseOverlay from "./ui/PauseOverlay.vue";

const fileInputRef = ref<HTMLInputElement | null>(null);

const mainMenuOpen = ref(true);
const menuOpen = ref(false);
const pauseMenuOpen = ref(false);
const menuMode = ref<"main" | "pause">("pause");
const farmMenuOpen = ref(false);
const inventoryMenuOpen = ref(false);
const shopMenuOpen = ref(false);
const sellMenuOpen = ref(false);
const juiceMenuOpen = ref(false);

const activeIndex = ref(0);
const selectedPlotIndex = ref(0);
const selectedRecipeIndex = ref(0);
const selectedBackpackIndex = ref<number | null>(null);

const { language, text, setLanguage, itemLabel } = useLanguage();
const itemVisual = getItemVisual;
const itemQuantity = getItemQuantity;
const itemMax = (item: InventoryEntry) => getMaxStack(getItemId(item));
const menuItems = computed(() => text.value.radial.items);
const juiceRecipes = computed(() => text.value.juice.recipesList);

const {
    level,
    coins,
    inventory,
    backpack,
    inventoryIndex,
    sellSlots,
    juiceSlots,
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

const localizedFarmPlots = computed(() => {
    return farmPlots.map((plot, index) => ({
        ...plot,
        name: text.value.farm.plots[index]?.name ?? plot.name,
        size: text.value.farm.plots[index]?.size ?? plot.size,
    }));
});

const { shopItems, buyItem } = useShop(
    coins,
    backpack,
    selectedBackpackIndex,
    saveState,
);
const { getSellPrice, sellItems } = useSell(coins, sellSlots, saveState);
const { handleDragStart, handleShopDragStart, handleDragEnd, handleDrop } =
    useDragAndDrop(
    backpack,
    inventory,
    sellSlots,
    juiceSlots,
    coins,
    saveState,
);

const { attach, detach } = useInputManager({
    mainMenuOpen,
    menuOpen,
    pauseMenuOpen,
    menuMode,
    farmMenuOpen,
    inventoryMenuOpen,
    shopMenuOpen,
    sellMenuOpen,
    juiceMenuOpen,
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

const selectRecipe = (index: number) => {
    selectedRecipeIndex.value = index;
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

const startGame = () => {
    mainMenuOpen.value = false;
    menuMode.value = "pause";
};

const chooseLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
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
        <MainMenuOverlay
            :open="mainMenuOpen"
            :language="language"
            :text="text"
            :has-save="hasSave"
            @start="startGame"
            @set-language="chooseLanguage"
        />
        <HudOverlay
            :level="level"
            :coins="coins"
            :inventory="inventory"
            :inventory-index="inventoryIndex"
            :labels="text.hud"
            :item-label="itemLabel"
            :item-visual="itemVisual"
            :item-quantity="itemQuantity"
            :item-max="itemMax"
        />
        <RadialOverlay
            :open="menuOpen"
            :menu-items="menuItems"
            :active-index="activeIndex"
            :labels="text.radial"
            @set-active="setActive"
        />
        <FarmOverlay
            :open="farmMenuOpen"
            :farm-plots="localizedFarmPlots"
            :selected-plot-index="selectedPlotIndex"
            :coins="coins"
            :is-plot-unlocked="isPlotUnlocked"
            :can-unlock-plot="canUnlockPlot"
            :labels="text.farm"
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
            :labels="text.inventory"
            :item-label="itemLabel"
            :item-visual="itemVisual"
            :item-quantity="itemQuantity"
            :item-max="itemMax"
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
            :labels="text.shop"
            :item-label="itemLabel"
            :item-visual="itemVisual"
            :item-quantity="itemQuantity"
            :item-max="itemMax"
            @close="shopMenuOpen = false"
            @buy="buyItem"
            @shop-drag-start="handleShopDragStart"
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
            :labels="text.sell"
            :item-label="itemLabel"
            :item-visual="itemVisual"
            :item-quantity="itemQuantity"
            :item-max="itemMax"
            @close="sellMenuOpen = false"
            @sell-items="sellItems"
            @select-backpack="selectBackpackSlot"
            @assign-quickbar="assignToQuickbar"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @drop="handleDrop"
        />
        <JuiceOverlay
            :open="juiceMenuOpen"
            :labels="text.juice"
            :recipes="juiceRecipes"
            :selected-recipe-index="selectedRecipeIndex"
            :backpack="backpack"
            :inventory="inventory"
            :juice-slots="juiceSlots"
            :selected-backpack-index="selectedBackpackIndex"
            :inventory-index="inventoryIndex"
            :item-label="itemLabel"
            :item-visual="itemVisual"
            :item-quantity="itemQuantity"
            :item-max="itemMax"
            @close="juiceMenuOpen = false"
            @select-recipe="selectRecipe"
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
            :labels="text.pause"
            :language="language"
            @close="closeMenu"
            @set-language="chooseLanguage"
            @save-download="saveAndDownload"
            @upload="openFilePicker"
        />
    </div>
</template>
