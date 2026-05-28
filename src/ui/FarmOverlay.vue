<script setup>
defineProps({
    open: { type: Boolean, required: true },
    farmPlots: { type: Array, required: true },
    selectedPlotIndex: { type: Number, required: true },
    coins: { type: Number, required: true },
    isPlotUnlocked: { type: Function, required: true },
    canUnlockPlot: { type: Function, required: true },
    labels: { type: Object, required: true },
});
const emit = defineEmits(["close", "select-plot", "unlock-plot"]);

const selectPlot = (index) => {
    emit("select-plot", index);
};

const unlockPlot = (index) => {
    emit("unlock-plot", index);
};
</script>

<template>
    <div class="farm-overlay" :class="{ 'is-open': open }">
        <div class="farm-scrim"></div>
        <div class="farm-panel" role="dialog" :aria-label="labels.title">
            <div class="farm-header">
                <div>
                    <div class="farm-title">{{ labels.title }}</div>
                    <div class="farm-subtitle">{{ labels.subtitle }}</div>
                </div>
                <button
                    class="farm-close"
                    type="button"
                    @click="emit('close')"
                    aria-label="Close farm map"
                >
                    ✕
                </button>
            </div>
            <div class="farm-content">
                <div class="farm-nav">
                    <div class="farm-nav-title">{{ labels.myFarm }}</div>
                    <button
                        v-for="(plot, index) in farmPlots"
                        :key="plot.name"
                        class="farm-nav-button"
                        :class="{ 'is-active': selectedPlotIndex === index }"
                        type="button"
                        @click="selectPlot(index)"
                    >
                        <span class="farm-nav-name">{{ plot.name }}</span>
                        <span class="farm-nav-meta">
                            {{ isPlotUnlocked(index) ? labels.unlocked : labels.locked }}
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
                        {{ labels.plotSize }}: {{ farmPlots[selectedPlotIndex].size }}
                    </div>
                    <div class="farm-detail-meta">
                        {{ labels.status }}:
                        {{
                            isPlotUnlocked(selectedPlotIndex)
                                ? labels.unlocked
                                : labels.locked
                        }}
                    </div>
                    <div class="farm-detail-meta">
                        {{ labels.availableCoins }}: {{ coins }}
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
                                    ? labels.ready
                                    : labels.unlockFor(farmPlots[selectedPlotIndex].cost)
                            }}
                        </button>
                    </div>
                    <div class="farm-detail-note">{{ labels.closeHint }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
