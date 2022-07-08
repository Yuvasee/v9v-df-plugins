/**
 * COPY NEXT LINE TO GAME CLIENT
export { default } from "http://127.0.0.1:2222/v9v_Vectors.js?dev";
 * ///////////////////////////////////////////////////////////////////
 *
 * # Energy and silver automated logistics with clear visualization. 
 * - "C" mode. Captures planet and puts min energy on it, then automatically self-drops.
 * - "E" mode. Captures if needed + repeatedly sends energy until target reaches energy cap.
 *   Sends only when donor reaches max effective energy level (default is 80%).
 * - "S" mode. Sends silver until target reaches silver cap. Not sends when donor silver < 10% of cap.
 * - "Es" mode. Like "E" mode + sends silver.
 * - "Se" mode. Like "S" mode + sends energy.
 * 
 * ## Auto-upgrades
 * - Always on.
 * - Automatically upgrades planets when they have enough silver.
 * - Maximizes distance, then speed.
 *
 * ## Auto-claim victory
 * - Always on.
 * - Checks all the time for victory conditions and claims victory when ready.
 * 
 * ## What else?
 * - All the settings and vectors for the game are persisted to browser local.
 * 
 * ////////////////////////////////////////////////////////////////////
 */

import { html, render } from "https://unpkg.com/htm/preact/standalone.module.js";
import { AutoClaimVictory } from "./vectors/AutoClaimVictory";
import { AutoUpdates } from "./vectors/AutoUpdates";
import { Settings } from "./vectors/Settings";
import { SettingsUI } from "./vectors/SettingsUI";
import { Vectors } from "./vectors/Vectors";
import { VectorsUI } from "./vectors/VectorsUI";

class v9v_Vectors {
	container: HTMLDivElement;
	settings: Settings;
	vectors: Vectors;
	autoClaimVictory: AutoClaimVictory;
	autoUpdates: AutoUpdates;

	constructor() {
		this.settings = new Settings();
		this.vectors = new Vectors(this.settings);
		this.autoClaimVictory = new AutoClaimVictory();
		this.autoUpdates = new AutoUpdates();
	}

	destroy() {
		this.vectors.destroy();
		this.autoClaimVictory.destroy();
		this.autoUpdates.destroy();
		render(html``, this.container);
	}

	render(container: HTMLDivElement) {
		this.container = container;
		render(
			html`
				<${SettingsUI} settings=${this.settings} />
				<${VectorsUI} v=${this.vectors} />
			`,
			container
		);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.vectors.drawVectors(ctx);
	}
}

export default v9v_Vectors;
