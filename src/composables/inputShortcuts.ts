export type OverlayKey =
	| "farm"
	| "inventory"
	| "barnChest"
	| "shop"
	| "sell"
	| "juice"
	| "contracts"
	| "water"
	| "sulfate";

export type ShortcutKey = {
	code: string;
	key: string;
	keyCode: number;
};

export type OverlayShortcut = ShortcutKey & {
	overlay: OverlayKey;
	clearSelection?: boolean;
	mapKey?: string;
};

export const RADIAL_MENU_SHORTCUT: ShortcutKey = {
	code: "KeyE",
	key: "e",
	keyCode: 69,
};

export const SULFATE_MIXER_SHORTCUT: ShortcutKey = {
	code: "KeyM",
	key: "m",
	keyCode: 77,
};

export const RESET_SAVE_SHORTCUT: ShortcutKey = {
	code: "KeyR",
	key: "r",
	keyCode: 82,
};

export const OVERLAY_SHORTCUTS: OverlayShortcut[] = [
	{ code: "KeyK", key: "k", keyCode: 75, overlay: "farm", mapKey: "camera" },
	{
		code: "KeyG",
		key: "g",
		keyCode: 71,
		overlay: "inventory",
		clearSelection: true,
	},
	{
		code: "KeyL",
		key: "l",
		keyCode: 76,
		overlay: "shop",
		mapKey: "mercadocompra",
		clearSelection: true,
	},
	{
		code: "KeyP",
		key: "p",
		keyCode: 80,
		overlay: "sell",
		mapKey: "mercadovenda",
		clearSelection: true,
	},
	{
		code: "KeyJ",
		key: "j",
		keyCode: 74,
		overlay: "juice",
		mapKey: "centrifugadora",
		clearSelection: true,
	},
];

export const ESCAPE_CLOSE_ORDER: OverlayKey[] = [
	"sulfate",
	"water",
	"juice",
	"sell",
	"shop",
	"contracts",
	"inventory",
	"barnChest",
	"farm",
];

export const SELECTION_OVERLAYS = new Set<OverlayKey>([
	"inventory",
	"barnChest",
	"shop",
	"sell",
	"juice",
]);

const getPressedKey = (event: KeyboardEvent) => {
	return typeof event.key === "string" ? event.key.toLowerCase() : "";
};

export const matchesShortcut = (event: KeyboardEvent, shortcut: ShortcutKey) => {
	return (
		event.code === shortcut.code ||
		getPressedKey(event) === shortcut.key ||
		event.keyCode === shortcut.keyCode
	);
};
