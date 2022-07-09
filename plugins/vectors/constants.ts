import { VectorType } from "./types";

export const SETTINGS_STORAGE_KEY = "v9v_vectors_settings_" + location.href.slice(-42);
export const VECTORS_STORAGE_KEY = "v9v_vectors_" + location.href.slice(-42);

export const VECTORS_LOOP_INTERVAL = 1000; // ms
export const AUTO_CLAIM_VICTORY_INTERVAL = 1000; // ms
export const AUTO_UPDATES_INTERVAL = 1000; // ms

export const VECTORS_LINE_WIDTH = 1;
export const VECTORS_COLORS: Record<VectorType, { line: string; arrow: string }> = {
	C: { line: "#d25f27", arrow: "#d25f2777" },
	E: { line: "dodgerblue", arrow: "#1e90ff77" },
	Es: { line: "cyan", arrow: "#00ffff77" },
	S: { line: "#fccf00", arrow: "#fccf0077" },
	Se: { line: "#a5dc2f", arrow: "#a5dc2f77" },
};

export const INCOMING_THRESHOLD_S = 15;
