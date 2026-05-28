<script setup>
defineProps({
    open: { type: Boolean, required: true },
    menuItems: { type: Array, required: true },
    activeIndex: { type: Number, required: true },
    labels: { type: Object, required: true },
});
const emit = defineEmits(["set-active"]);

const setActive = (index) => {
    emit("set-active", index);
};
</script>

<template>
    <div class="radial-overlay" :class="{ 'is-open': open }">
        <div class="radial-scrim"></div>
            <div class="radial-wheel" role="dialog" :aria-label="labels.title">
            <div class="radial-ring"></div>
            <div class="radial-center">
                <div class="radial-title">{{ labels.title }}</div>
                <div class="radial-focus">
                    {{ menuItems[activeIndex].label }}
                </div>
                <div class="radial-subtitle">
                    {{ menuItems[activeIndex].description }}
                </div>
                <div class="radial-hint">{{ labels.hint }}</div>
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
</template>
