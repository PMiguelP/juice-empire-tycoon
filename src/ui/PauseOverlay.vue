<script setup>
defineProps({
    open: { type: Boolean, required: true },
    menuMode: { type: String, required: true },
    hasSave: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "save-download", "upload"]);
</script>

<template>
    <div class="pause-overlay" :class="{ 'is-open': open }">
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
                    @click="emit('close')"
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
                    @click="emit('save-download')"
                >
                    Save & Download
                </button>
                <button
                    class="pause-button"
                    type="button"
                    @click="emit('upload')"
                >
                    Upload Save
                </button>
            </div>
            <div class="pause-footnote">
                Saves are stored locally in your browser.
            </div>
        </div>
    </div>
</template>

