<script setup>
import { computed } from "vue";

const props = defineProps({
    open: { type: Boolean, required: true },
    offers: { type: Array, required: true },
    activeContract: { type: Object, default: null },
    selectedContract: { type: Object, default: null },
    selectedContractId: { type: String, default: null },
    labels: { type: Object, required: true },
    itemLabel: { type: Function, required: true },
});

const emit = defineEmits(["close", "select", "accept"]);

const visibleContract = computed(() => {
    return props.activeContract ?? props.selectedContract ?? props.offers[0] ?? null;
});

const hasActiveContract = computed(() => Boolean(props.activeContract));

const formatDuration = (minutes) => {
    const safeMinutes = Math.max(0, Math.floor(minutes ?? 0));
    return `${String(Math.floor(safeMinutes / 60)).padStart(2, "0")}:${String(
        safeMinutes % 60,
    ).padStart(2, "0")}`;
};

const getProgressText = (contract) => {
    if (!contract) {
        return "-";
    }
    return `${contract.progress ?? 0}/${contract.required}`;
};

const getTimeText = (contract) => {
    if (!contract) {
        return "-";
    }
    return contract.timeLeftLabel ?? formatDuration(contract.durationMinutes);
};

const selectContract = (contract) => {
    emit("select", contract.id);
};

const acceptContract = () => {
    if (!props.selectedContract || hasActiveContract.value) {
        return;
    }
    emit("accept", props.selectedContract.id);
};
</script>

<template>
    <div class="contracts-overlay" :class="{ 'is-open': open }">
        <div class="contracts-scrim"></div>
        <section class="contracts-panel" role="dialog" :aria-label="labels.title">
            <header class="contracts-header">
                <div>
                    <div class="contracts-title">{{ labels.title }}</div>
                    <div class="contracts-subtitle">{{ labels.subtitle }}</div>
                </div>
                <button
                    class="contracts-close"
                    type="button"
                    aria-label="Close contracts"
                    @click="emit('close')"
                >
                    x
                </button>
            </header>

            <div class="contracts-layout">
                <aside class="contracts-detail">
                    <div class="contracts-section-title">
                        {{ activeContract ? labels.activeTitle : labels.selectedTitle }}
                    </div>
                    <template v-if="visibleContract">
                        <div class="contracts-detail-fruit">
                            {{ itemLabel(visibleContract.fruitId) }}
                        </div>
                        <div class="contracts-detail-grid">
                            <span>{{ labels.requirement }}</span>
                            <strong>{{ visibleContract.required }}x</strong>
                            <span>{{ labels.progress }}</span>
                            <strong>{{ getProgressText(visibleContract) }}</strong>
                            <span>{{ labels.reward }}</span>
                            <strong>{{ visibleContract.reward }}</strong>
                            <span>{{ labels.time }}</span>
                            <strong>{{ getTimeText(visibleContract) }}</strong>
                        </div>
                    </template>
                    <p v-else class="contracts-empty">{{ labels.noActive }}</p>

                    <button
                        class="contracts-action"
                        type="button"
                        :disabled="!selectedContract || hasActiveContract"
                        @click="acceptContract"
                    >
                        {{ hasActiveContract ? labels.activeLocked : labels.accept }}
                    </button>
                    <div class="contracts-hint">{{ labels.closeHint }}</div>
                </aside>

                <div class="contracts-board">
                    <div class="contracts-section-title">{{ labels.offersTitle }}</div>
                    <button
                        v-for="contract in offers"
                        :key="contract.id"
                        class="contracts-card"
                        :class="{
                            'is-selected': selectedContractId === contract.id,
                            'is-active': activeContract?.id === contract.id,
                        }"
                        type="button"
                        @click="selectContract(contract)"
                    >
                        <span class="contracts-card-fruit">
                            {{ itemLabel(contract.fruitId) }}
                        </span>
                        <span class="contracts-card-meta">
                            {{ labels.requirement }}: {{ contract.required }}x
                        </span>
                        <span class="contracts-card-meta">
                            {{ labels.reward }}: {{ contract.reward }}
                        </span>
                        <span class="contracts-card-pill">
                            {{ labels.time }} {{ formatDuration(contract.durationMinutes) }}
                        </span>
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>
