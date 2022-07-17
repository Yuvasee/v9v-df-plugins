import { html, render } from "https://unpkg.com/htm/preact/standalone.module.js";
import { Harvester } from "./vectors/Harvester";
import { HarvesterUI } from "./vectors/HarvesterUI";

class v9v_Harvester {
	container: HTMLDivElement;
	harvester: Harvester;

	constructor() {
		this.harvester = new Harvester();
	}

	destroy() {
		this.harvester.destroy();
		render(html``, this.container);
	}

	render(container: HTMLDivElement) {
		this.container = container;
		render(html` <${HarvesterUI} harvester=${this.harvester} /> `, container);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.harvester.draw(ctx);
	}
}

export default v9v_Harvester;
