<script setup>
import { computed } from "vue";

const props = defineProps({
    open: { type: Boolean, required: true },
    menuItems: { type: Array, required: true },
    activeIndex: { type: Number, required: true },
    labels: { type: Object, required: true },
});
const emit = defineEmits(["set-active", "activate"]);

const actionIcons = [
    {
        name: "seed",
        paths: [
            "M17 39c11-18 25-18 33-11-7 7-19 18-33 11Z",
            "M21 39c7-3 14-6 24-12",
            "M25 28c-1-8 6-13 13-14 2 8-2 15-10 18",
        ],
    },
    {
        name: "water",
        paths: [
            "M32 12c9 11 16 20 16 29 0 9-7 15-16 15s-16-6-16-15c0-9 7-18 16-29Z",
            "M24 42c2 4 5 6 10 6",
        ],
    },
    {
        name: "harvest",
        paths: [
            "M18 44c11-6 22-15 30-28",
            "M19 20c10 0 17 5 20 15-11 2-20-2-20-15Z",
            "M43 22c2 8 0 15-8 20-4-8-2-15 8-20Z",
        ],
    },
    {
        name: "fertilize",
        paths: [
            "M19 24h26l5 25H14l5-25Z",
            "M23 24v-7h18v7",
            "M25 38h14",
            "M32 31v14",
        ],
    },
    {
        name: "spray",
        paths: [
            "M19 27h19l5 7v18H18V34l1-7Z",
            "M24 27v-8h10v8",
            "M38 30l10-8",
            "M49 17l4-3",
            "M51 25l5-1",
            "M45 13l2-5",
        ],
    },
];

const currentIcon = computed(() => {
    return actionIcons[props.activeIndex] ?? actionIcons[0];
});

const activeStartAngle = () => {
    const count = Math.max(1, props.menuItems.length);
    return `${props.activeIndex * (360 / count) - 360 / count / 2}deg`;
};

const segmentAngle = () => {
    return `${360 / Math.max(1, props.menuItems.length)}deg`;
};

const setActive = (index) => {
    emit("set-active", index);
};

const activate = (index) => {
    emit("set-active", index);
    emit("activate", index);
};
</script>

<template>
    <div class="radial-overlay" :class="{ 'is-open': open }">
        <div class="radial-scrim"></div>
            <div
                class="radial-wheel"
                role="dialog"
                :aria-label="labels.title"
                :style="{
                    '--item-count': menuItems.length,
                    '--active-index': activeIndex,
                    '--active-start': activeStartAngle(),
                    '--segment-angle': segmentAngle(),
                }"
            >
            <div class="radial-ring"></div>
            <div class="radial-active-slice"></div>
            <div class="radial-center">
                <div class="radial-center-icon">
                    <svg viewBox="0 0 64 64" aria-hidden="true">
                        <path
                            v-for="path in currentIcon.paths"
                            :key="path"
                            :d="path"
                        />
                    </svg>
                </div>
                <div class="radial-focus">
                    {{ menuItems[activeIndex].label }}
                </div>
                <div class="radial-subtitle">
                    {{ menuItems[activeIndex].description }}
                </div>
                <div class="radial-hint">{{ labels.hint }}</div>
            </div>
            <div
                class="radial-items"
            >
                <button
                    v-for="(item, index) in menuItems"
                    :key="item.label"
                    class="radial-item"
                    :class="{ 'is-active': activeIndex === index }"
                    :style="{ '--i': index }"
                    @mouseenter="setActive(index)"
                    @focus="setActive(index)"
                    type="button"
                    :aria-label="item.label"
                    @click="activate(index)"
                >
                    <span class="radial-item-icon">
                        <svg viewBox="0 0 64 64" aria-hidden="true">
                            <path
                                v-for="path in (actionIcons[index] ?? actionIcons[0]).paths"
                                :key="path"
                                :d="path"
                            />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>
