<script setup>
defineProps({
    open: { type: Boolean, required: true },
    menuMode: { type: String, required: true },
    hasSave: { type: Boolean, required: true },
    labels: { type: Object, required: true },
    language: { type: String, required: true },
});
const emit = defineEmits(["close", "save-download", "upload", "set-language"]);
</script>

<template>
    <div class="pause-overlay" :class="{ 'is-open': open }">
        <div class="pause-scrim"></div>
        <div class="pause-panel" role="dialog" aria-label="Game menu">
            <div class="pause-title">
                {{ labels.title }}
            </div>
            <div class="pause-subtitle">
                {{ labels.subtitle }}
            </div>
            <div class="pause-language">
                <div class="pause-language-title">{{ labels.language }}</div>
                <div class="pause-language-options">
                    <button
                        class="pause-language-button"
                        :class="{ 'is-active': language === 'pt' }"
                        type="button"
                        @click="emit('set-language', 'pt')"
                    >
                        Português
                    </button>
                    <button
                        class="pause-language-button"
                        :class="{ 'is-active': language === 'en' }"
                        type="button"
                        @click="emit('set-language', 'en')"
                    >
                        English
                    </button>
                </div>
            </div>
            <div class="pause-actions">
                <button
                    class="pause-button is-primary"
                    type="button"
                    @click="emit('close')"
                >
                    {{ labels.resume }}
                </button>
                <button
                    class="pause-button"
                    type="button"
                    @click="emit('save-download')"
                >
                    {{ labels.saveDownload }}
                </button>
                <button
                    class="pause-button"
                    type="button"
                    @click="emit('upload')"
                >
                    {{ labels.upload }}
                </button>
            </div>
            <div class="pause-footnote">
                {{ labels.footnote }}
            </div>
        </div>
    </div>
</template>
