<script setup lang="ts">
import { computed, ref, watch } from "vue";
import PhaserGame from "./PhaserGame.vue";
import {
    JUICE_XP_REWARD,
    PLANT_XP_REWARD,
    STORAGE_KEY,
    WATER_XP_REWARD,
    usePlayerData,
} from "./composables/usePlayerData";
import { useLanguage } from "./i18n";
import type { Language } from "./i18n";
import { getItemVisual } from "./items";
import { getItemQuantity, getMaxStack, getItemId } from "./items";
import type { InventoryEntry } from "./items";
import { useInventory } from "./composables/useInventory";
import { useMarket } from "./composables/useMarket";
import { useDragAndDrop } from "./composables/useDragAndDrop";
import { useInputManager } from "./composables/useInputManager";
import { useWaterContainers } from "./composables/useWaterContainers";
import { useRadialActions } from "./composables/useRadialActions";
import { useJuiceCraft } from "./composables/useJuiceCraft";
import { useClockAndContracts } from "./composables/useClockAndContracts";
import { useGameAudio } from "./composables/useGameAudio";
import { useSaveImportExport } from "./composables/useSaveImportExport";
import { useOverlayState } from "./composables/useOverlayState";
import { useGameEvents } from "./composables/useGameEvents";
import { useToast } from "./composables/useToast";
import { useGameSync } from "./composables/useGameSync";
import { useGameRewards } from "./composables/useGameRewards";
import { useQuickbarAssignment } from "./composables/useQuickbarAssignment";
import { useMinigameActions } from "./composables/useMinigameActions";
import { useGameLoop } from "./composables/useGameLoop";
import { usePointerPlanting } from "./composables/usePointerPlanting";
import { useAppSelectionState } from "./composables/useAppSelectionState";
import GameMenuOverlay from "./ui/GameMenuOverlay.vue";
import HudOverlay from "./ui/HudOverlay.vue";
import RadialOverlay from "./ui/RadialOverlay.vue";
import FarmOverlay from "./ui/FarmOverlay.vue";
import InventoryOverlay from "./ui/InventoryOverlay.vue";
import BarnChestOverlay from "./ui/BarnChestOverlay.vue";
import ContractsOverlay from "./ui/ContractsOverlay.vue";
import ShopOverlay from "./ui/ShopOverlay.vue";
import SellOverlay from "./ui/SellOverlay.vue";
import JuiceOverlay from "./ui/JuiceOverlay.vue";
import WaterPipePuzzle from "./ui/minigames/WaterPipePuzzle.vue";
import SulfateMixer from "./ui/minigames/SulfateMixer.vue";

const saveLoaded = ref(false);
const gameReady = ref(false);

const { language, text, setLanguage, itemLabel } = useLanguage();
const { toastMessage, showToast } = useToast();
const itemVisual = getItemVisual;
const itemQuantity = getItemQuantity;
const itemMax = (item: InventoryEntry) => getMaxStack(getItemId(item));
const menuItems = computed(() => text.value.radial.items);
const radialMessages = computed(() => text.value.radial.errors);
const juiceRecipes = computed(() => text.value.juice.recipesList);
const toastLabels = computed(() => text.value.toasts);

const {
    level,
    levelProgress,
    coins,
    inventory,
    backpack,
    barnStorage,
    inventoryIndex,
    plotUnlocks,
    sellSlots,
    juiceSlots,
    farmTrees,
    playerState,
    gameClock,
    contractOffers,
    activeContract,
    sprayerCharge,
    hasSave,
    hasExistingSave,
    farmPlots,
    applySave,
    getSaveData,
    saveState,
    loadState,
    setLevel,
    addCoins,
    addLevel,
    addXp,
    setCoins,
    setInventorySlot,
    setFarmTrees,
    setPlayerState,
    setSprayerCharge,
    advanceTime,
    recordHarvest,
    acceptContract,
    isPlotUnlocked,
    unlockPlot,
    canUnlockPlot,
} = usePlayerData();

const {
    activeIndex,
    selectedPlotIndex,
    selectedContractId,
    selectedRecipeIndex,
    pointerPlantSeedId,
    currentMapKey,
    selectedItemId,
    activePlantSeedId,
    selectedContract,
    stopPointerPlanting,
    startPointerPlanting,
    setActive,
    selectPlot,
    selectContract,
    selectRecipe,
} = useAppSelectionState({
    contractOffers,
    inventory,
    inventoryIndex,
    playerState,
});

const { clockLabel, dayPhase, contractSummary } =
    useClockAndContracts(gameClock, activeContract, itemLabel);
const {
    mainMenuOpen,
    menuOpen,
    pauseMenuOpen,
    menuMode,
    farmMenuOpen,
    inventoryMenuOpen,
    barnChestOpen,
    contractsMenuOpen,
    shopMenuOpen,
    sellMenuOpen,
    juiceMenuOpen,
    waterMinigameOpen,
    sulfateMinigameOpen,
    selectedBackpackIndex,
    closeMenu,
    closeContextMenus,
    openFarmMenu,
    openShopMenu,
    openSellMenu,
    openJuiceMenu,
    openBarnChest,
    openContractsMenu,
} = useOverlayState(currentMapKey);
const { playSound, syncMenuAmbience } =
    useGameAudio(gameReady, mainMenuOpen, pauseMenuOpen);
const {
    syncUnlockedFields,
    syncTreeState,
    syncGameDay,
    syncLoadedState,
    afterSaveImport,
    handlePlayerStateChanged,
    handleGameReady,
    handleCurrentActiveScene,
} = useGameSync({
    plotUnlocks,
    farmTrees,
    playerState,
    gameClock,
    selectedItemId: activePlantSeedId,
    saveLoaded,
    gameReady,
    pauseMenuOpen,
    menuMode,
    setPlayerState,
    syncMenuAmbience,
});
const { rewardXp, handleHarvestAccepted } = useGameRewards({
    level,
    text,
    addXp,
    recordHarvest,
    itemLabel,
    showToast,
});

const localizedFarmPlots = computed(() => {
    return farmPlots.map((plot, index) => ({
        ...plot,
        name: text.value.farm.plots[index]?.name ?? plot.name,
        size: text.value.farm.plots[index]?.size ?? plot.size,
    }));
});

const { fileInputRef, saveAndDownload, openFilePicker, handleFileChange } =
    useSaveImportExport(
        getSaveData,
        applySave,
        saveState,
        afterSaveImport,
        () => showToast(text.value.toasts.saveImportFailed),
    );

const handleUnlockPlot = (index: number) => {
    const didUnlock = unlockPlot(index);
    if (didUnlock) {
        playSound("buy", 0.36);
    }
};

const slotInventory = useInventory(
    backpack,
    inventory,
    barnStorage,
    sellSlots,
    juiceSlots,
    saveState,
);
const market = useMarket(level, coins, sellSlots, slotInventory, selectedBackpackIndex, saveState);
const {
    shopItems,
    buyItem,
    getSellPrice,
    sellItems,
    stageSellItem,
    clearSellBench,
} = market;
const { handleDragStart, handleShopDragStart, handleDragEnd, handleDrop } =
    useDragAndDrop(slotInventory, market);
const { selectBackpackSlot, assignToQuickbar } = useQuickbarAssignment(
    selectedBackpackIndex,
    inventoryIndex,
    slotInventory,
    saveState,
);
const { fillSelectedContainer, emptySelectedContainer } = useWaterContainers(
    inventory,
    inventoryIndex,
    slotInventory,
);
const { handleJuiceCraft } = useJuiceCraft({
    recipes: juiceRecipes,
    selectedRecipeIndex,
    juiceSlots,
    backpack,
    quickbar: inventory,
    inventory: slotInventory,
    xpReward: JUICE_XP_REWARD,
    addXp,
    itemLabel,
    onJuiceCrafted: recordHarvest,
    playSound,
    showToast,
    labels: toastLabels,
});
const {
    selectedSulfateId,
    requestSulfateMixer,
    closeWaterMinigame,
    closeSulfateMinigame,
    handleWaterMinigameSuccess,
    handleWaterMinigameFail,
    handleSulfateMinigameSuccess,
    handleSulfateMinigameFail,
} = useMinigameActions({
    waterMinigameOpen,
    sulfateMinigameOpen,
    selectedItemId,
    inventoryIndex,
    inventory: slotInventory,
    setSprayerCharge,
    fillSelectedContainer,
    closeContextMenus,
    playSound,
    showToast,
    text,
});
const { activateRadialAction } = useRadialActions({
    activeIndex,
    menuItems,
    messages: radialMessages,
    quickbar: inventory,
    quickbarIndex: inventoryIndex,
    inventory: slotInventory,
    sprayerCharge,
    setSprayerCharge,
    emptyWaterContainer: emptySelectedContainer,
    onHarvestAccepted: handleHarvestAccepted,
    onWaterAccepted: () => rewardXp(WATER_XP_REWARD),
    startPointerPlanting,
    openSulfateMixer: requestSulfateMixer,
    notify: showToast,
});

const { attach, detach } = useInputManager({
    enabled: gameReady,
    mainMenuOpen,
    menuOpen,
    pauseMenuOpen,
    menuMode,
    farmMenuOpen,
    inventoryMenuOpen,
    barnChestOpen,
    contractsMenuOpen,
    shopMenuOpen,
    sellMenuOpen,
    juiceMenuOpen,
    waterMinigameOpen,
    sulfateMinigameOpen,
    selectedBackpackIndex,
    inventoryIndex,
    hasSave,
    saveState,
    loadState,
    storageKey: STORAGE_KEY,
    currentMapKey,
    pointerPlantSeedId,
    cancelPointerPlanting: stopPointerPlanting,
    activateRadialAction: () => activateRadialAction(activeIndex.value),
    openSulfateMixer: requestSulfateMixer,
});

useGameLoop({
    attachInput: attach,
    detachInput: detach,
    gameReady,
    mainMenuOpen,
    pauseMenuOpen,
    advanceTime,
});

const { handlePointerPlantRequest } = usePointerPlanting({
    selectedItemId,
    inventoryIndex,
    inventory: slotInventory,
    messages: radialMessages,
    playSound,
    showToast,
    rewardPlant: () => rewardXp(PLANT_XP_REWARD),
});

useGameEvents({
    setLevel,
    addLevel,
    addCoins,
    setCoins,
    setInventorySlot,
    handleGameReady,
    syncUnlockedFields,
    syncTreeState,
    syncGameDay,
    syncMenuAmbience,
    setFarmTrees,
    handlePlayerStateChanged,
    openFarmMenu,
    openShopMenu,
    openSellMenu,
    openJuiceMenu,
    openBarnChest,
    openContractsMenu,
    handlePointerPlantRequest,
    loadInitialState: async () => {
        await loadState();
        syncLoadedState();
    },
});

const handleRadialActivate = (index: number) => {
    activateRadialAction(index);
    menuOpen.value = false;
};

const acceptSelectedContract = (contractId: string) => {
    const accepted = acceptContract(contractId);
    if (accepted) {
        playSound("buy", 0.22);
        contractsMenuOpen.value = false;
    }
};

const startGame = () => {
    mainMenuOpen.value = false;
    menuMode.value = "pause";
    syncMenuAmbience();
};

const closeGameMenu = () => {
    if (mainMenuOpen.value) {
        startGame();
        return;
    }
    closeMenu();
};

const chooseLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
};

watch(selectedItemId, (itemId) => {
    if (pointerPlantSeedId.value && itemId !== pointerPlantSeedId.value) {
        stopPointerPlanting();
    }
});
</script>

<template>
    <div class="app-shell">
        <PhaserGame @current-active-scene="handleCurrentActiveScene" />
        <div
            v-if="gameReady"
            class="time-tint"
            :class="`is-${dayPhase}`"
            aria-hidden="true"
        />
        <input
            v-if="gameReady"
            ref="fileInputRef"
            class="visually-hidden"
            type="file"
            accept="application/json"
            @change="handleFileChange"
        />
        <GameMenuOverlay
            v-if="gameReady"
            :open="mainMenuOpen || pauseMenuOpen"
            :is-initial="mainMenuOpen"
            :language="language"
            :text="text"
            :has-existing-save="hasExistingSave"
            @close="closeGameMenu"
            @set-language="chooseLanguage"
            @save-download="saveAndDownload"
            @upload="openFilePicker"
        />
        <HudOverlay
            v-if="gameReady"
            :level="level"
            :level-progress="levelProgress"
            :coins="coins"
            :inventory="inventory"
            :inventory-index="inventoryIndex"
            :day="gameClock.day"
            :time-label="clockLabel"
            :contract="contractSummary"
            :sprayer-charge="sprayerCharge"
            :labels="text.hud"
            :item-label="itemLabel"
            :item-visual="itemVisual"
            :item-quantity="itemQuantity"
            :item-max="itemMax"
        />
        <RadialOverlay
            v-if="gameReady"
            :open="menuOpen"
            :menu-items="menuItems"
            :active-index="activeIndex"
            :labels="text.radial"
            @set-active="setActive"
            @activate="handleRadialActivate"
        />
        <div v-if="gameReady && activePlantSeedId" class="plant-mode-hint">
            {{ text.radial.plantModeHint }}
        </div>
        <FarmOverlay
            v-if="gameReady"
            :open="farmMenuOpen"
            :farm-plots="localizedFarmPlots"
            :selected-plot-index="selectedPlotIndex"
            :coins="coins"
            :is-plot-unlocked="isPlotUnlocked"
            :can-unlock-plot="canUnlockPlot"
            :labels="text.farm"
            @close="farmMenuOpen = false"
            @select-plot="selectPlot"
            @unlock-plot="handleUnlockPlot"
        />
        <ContractsOverlay
            v-if="gameReady"
            :open="contractsMenuOpen"
            :offers="contractOffers"
            :active-contract="contractSummary"
            :selected-contract="selectedContract"
            :selected-contract-id="selectedContract?.id ?? null"
            :labels="text.contracts"
            :item-label="itemLabel"
            @close="contractsMenuOpen = false"
            @select="selectContract"
            @accept="acceptSelectedContract"
        />
        <InventoryOverlay
            v-if="gameReady"
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
        <BarnChestOverlay
            v-if="gameReady"
            :open="barnChestOpen"
            :backpack="backpack"
            :storage="barnStorage"
            :inventory="inventory"
            :selected-backpack-index="selectedBackpackIndex"
            :inventory-index="inventoryIndex"
            :item-label="itemLabel"
            :item-visual="itemVisual"
            :item-quantity="itemQuantity"
            :item-max="itemMax"
            @close="barnChestOpen = false"
            @select-backpack="selectBackpackSlot"
            @assign-quickbar="assignToQuickbar"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @drop="handleDrop"
        />
        <ShopOverlay
            v-if="gameReady"
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
            v-if="gameReady"
            :open="sellMenuOpen"
            :backpack="backpack"
            :inventory="inventory"
            :sell-slots="sellSlots"
            :coins="coins"
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
            @stage-sell="stageSellItem"
            @clear-sell="clearSellBench"
            @select-backpack="selectBackpackSlot"
            @assign-quickbar="assignToQuickbar"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @drop="handleDrop"
        />
        <JuiceOverlay
            v-if="gameReady"
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
            @craft="handleJuiceCraft"
        />
        <WaterPipePuzzle
            v-if="gameReady"
            :open="waterMinigameOpen"
            :labels="text.minigames.water"
            @success="handleWaterMinigameSuccess"
            @fail="handleWaterMinigameFail"
            @close="closeWaterMinigame"
        />
        <SulfateMixer
            v-if="gameReady"
            :open="sulfateMinigameOpen"
            :sulfate-id="selectedSulfateId"
            :labels="text.minigames.sulfate"
            @success="handleSulfateMinigameSuccess"
            @fail="handleSulfateMinigameFail"
            @close="closeSulfateMinigame"
        />
        <div v-if="gameReady && toastMessage" class="game-toast">
            {{ toastMessage }}
        </div>
    </div>
</template>
