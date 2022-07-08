import { VectorType } from "./types";

export const SETTINGS_STORAGE_KEY = "v9v_vectors_settings_" + location.href.slice(-42);
export const VECTORS_STORAGE_KEY = "v9v_vectors_" + location.href.slice(-42);

export const VECTORS_LOOP_INTERVAL = 1000; // ms
export const AUTO_CLAIM_VICTORY_INTERVAL = 1000; // ms
export const AUTO_UPDATES_INTERVAL = 1000; // ms

export const VECTORS_LINE_WIDTH = 1;
export const VECTORS_COLORS: Record<VectorType, { line: string; arrow: string }> = {
	C: { line: "#ad593b", arrow: "#ad593b77" },
	E: { line: "dodgerblue", arrow: "#1e90ff77" },
	S: { line: "orangered", arrow: "#ff450077" },
	Es: { line: "cyan", arrow: "#00ffff77" },
	Se: { line: "orange", arrow: "#ffa50077" },
};
