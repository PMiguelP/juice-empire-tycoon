import type { SprayerChargeSave, SulfateItemId, SulfateQuality } from "./types";
import { SPRAYER_CHARGE_USES } from "./constants";

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
	return {
		...charge,
		usesLeft: Math.max(1, Math.floor(charge.usesLeft ?? SPRAYER_CHARGE_USES)),
	};
};
