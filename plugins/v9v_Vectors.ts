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
				<${Separator} />
				<${VectorsUI} v=${this.vectors} />
				<${Separator} />
			`,
			container
		);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.vectors.drawVectors(ctx);
	}
}

const Separator = () => html`<div style="height: 1px; background: #333; margin: 10px 0;"></div>`;

export default v9v_Vectors;
