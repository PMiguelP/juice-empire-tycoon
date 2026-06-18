<script setup>
import { computed } from "vue";
import ItemIcon from "./ItemIcon.vue";

const props = defineProps({
    level: { type: Number, required: true },
    levelProgress: { type: Number, default: 1 },
    showLevelProgress: { type: Boolean, default: false },
    coins: { type: Number, required: true },
    inventory: { type: Array, required: true },
    inventoryIndex: { type: Number, required: true },
    day: { type: Number, required: true },
    timeLabel: { type: String, required: true },
    contract: { type: Object, default: null },
    labels: { type: Object, required: true },
    itemLabel: { type: Function, required: true },
    itemVisual: { type: Function, required: true },
    itemQuantity: { type: Function, required: true },
    itemMax: { type: Function, required: true },
    sprayerCharge: { type: Object, default: null },
});

const levelProgressPercent = computed(() => {
    return `${Math.min(100, Math.max(0, props.levelProgress * 100))}%`;
});

const getEntryId = (entry) => {
    return typeof entry === "string" ? entry : entry?.id ?? null;
};

const isChargedSprayer = (entry) => {
    return getEntryId(entry) === "sprayer" && Boolean(props.sprayerCharge);
};
</script>

<template>
    <div class="hud" aria-hidden="true">
        <div class="hud-top">
            <div
                class="hud-level"
                :class="{ 'is-progress-visible': showLevelProgress }"
            >
                <div class="hud-level-main">
                    <span class="hud-level-label">{{ labels.level }}</span>
                    <span class="hud-level-value">{{ level }}</span>
                </div>
                <div class="hud-level-progress" aria-hidden="true">
                    <span :style="{ width: levelProgressPercent }"></span>
                </div>
            </div>
            <div class="hud-clock">
                <span>{{ labels.day }} {{ day }}</span>
                <strong>{{ timeLabel }}</strong>
            </div>
            <div class="hud-coins">
                <span class="hud-coins-icon">◎</span>
                <span class="hud-coins-value">{{ coins }}</span>
            </div>
        </div>
        <div v-if="contract" class="hud-contract">
            <span class="hud-contract-title">
                {{ contract.completed ? labels.contractComplete : labels.contractToday }}
            </span>
            <span class="hud-contract-body">
                {{ contract.itemName }} {{ contract.progress }}/{{ contract.required }}
                · {{ contract.reward }} {{ labels.coins }}
                <template v-if="contract.timeLeftLabel">
                    · {{ labels.contractTimeLeft }} {{ contract.timeLeftLabel }}
                </template>
            </span>
        </div>
        <div class="hud-inventory">
            <div
                v-for="index in 5"
                :key="index"
                class="inventory-slot"
                :class="{ 'is-selected': inventoryIndex === index - 1 }"
            >
                <span
                    v-if="inventory[index - 1]"
                    class="item-stack is-compact"
                    :class="{ 'is-charged-sprayer': isChargedSprayer(inventory[index - 1]) }"
                >
                    <ItemIcon :visual="itemVisual(inventory[index - 1])" />
                    <span class="item-quantity">
                        {{ itemQuantity(inventory[index - 1]) }}/{{ itemMax(inventory[index - 1]) }}
                    </span>
                </span>
            </div>
        </div>
    </div>
</template>
