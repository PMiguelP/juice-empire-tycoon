import type { SprayerChargeSave, SulfateItemId, SulfateQuality } from "./types";

const SULFATE_QUALITIES = new Set<SulfateQuality>(["perfect", "good", "poor"]);
const SULFATE_IDS = new Set<SulfateItemId>([
	"sulfate-basic",
	"sulfate-strong",
	"sulfate-premium",
]);

export const normalizeSprayerCharge = (
	charge?: SprayerChargeSave | null,
): SprayerChargeSave | null => {
	if (!charge) {
		return null;
	}
	if (!SULFATE_QUALITIES.has(charge.quality) || !SULFATE_IDS.has(charge.sulfateId)) {
		return null;
	}
	return { ...charge };
};
