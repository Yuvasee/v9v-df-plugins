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

import { LocatablePlanet, LocationId } from "@darkforest_eth/types";
import {
	html,
	render,
	useEffect,
	useState,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import { Stats } from "./modules/Stats";
import { Utils } from "./modules/Utils";
import { Vectors, VectorType, VECTOR_COLORS } from "./modules/Vectors";

const SETTINGS_STORAGE_KEY = "v9v_vectors_settings_" + location.href.slice(-42);

class Absolutium {
	container: HTMLDivElement;
	stats: Stats;
	vectors: Vectors;
	private autoClaimVictoryInterval: NodeJS.Timer;

	constructor() {
		this.stats = new Stats();
		this.vectors = new Vectors(this.stats);
	}

	render(container: HTMLDivElement) {
		this.container = container;
		render(
			html`
				<${SettingsUI} stats=${this.stats} />
				<${VectorsUI} v=${this.vectors} />
			`,
			container
		);
	}

	draw(ctx: CanvasRenderingContext2D) {
		this.vectors.drawVectors(ctx);
	}

	destroy() {
		this.vectors.destroy();
		this.stats.destroy();
		clearInterval(this.autoClaimVictoryInterval);
		render(html``, this.container);
	}

	autoClaimVictory() {
		if ((df as any).gameover) return;
		const targetIds = (df as any).getTargetPlanets() as LocationId[];
		targetIds
			.map((id) => df.getPlanetWithId(id))
			.filter((p) => Utils.isOwnedByPlayer(p!))
			.forEach((p) => {
				const energyPercent = (p!.energy / p!.energyCap) * 100;
				if (energyPercent >= (df as any).claimVictoryPercentage()) {
					(df as any).claimVictory(p?.locationId);
				}
			});
	}
}

const SettingsUI = ({ stats }: { stats: Stats }) => {
	const {
		open: initOpen,
		minEnergy: initMinEnergy,
		maxEnergy: initMaxEnergy,
	} = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}");

	const [open, setOpen] = useState((initOpen as Boolean) || false);
	const [minEnergy, setMinEnergy] = useState((initMinEnergy as number) || stats.minPercent);
	const [maxEnergy, setMaxEnergy] = useState((initMaxEnergy as number) || stats.maxPercent);

	useEffect(() => {
		localStorage.setItem(
			SETTINGS_STORAGE_KEY,
			JSON.stringify({
				open,
				minEnergy,
				maxEnergy,
			})
		);
	}, [open, minEnergy, maxEnergy]);

	useEffect(() => {
		if (minEnergy >= maxEnergy) {
			setMinEnergy(maxEnergy - 1);
			return;
		}
		stats.minPercent = Number(minEnergy);
	}, [minEnergy]);

	useEffect(() => {
		if (maxEnergy <= minEnergy) {
			setMaxEnergy(minEnergy + 1);
			return;
		}
		stats.maxPercent = Number(maxEnergy);
	}, [maxEnergy]);

	return html`
		<style>
			.absolutium-settings-cog {
				margin-right: 10px;
			}
			.absolutium-settings-toggle {
				border-bottom: 1px dashed gray;
				cursor: pointer;
			}
			.absolutium-settings {
				border-bottom: 1px solid #666;
				padding-bottom: 10px;
			}
			.absolutium-settings-block {
				display: flex;
				flex-direction: column;
			}
			.absolutium-range-input {
				display: flex;
				align-items: center;
			}
			.absolutium-range-input input {
				margin-left: 10px;
				flex-grow: 1;
			}
			.absolutium-range-input span {
				margin-left: 10px;
			}
		</style>
		<span class="absolutium-settings-cog">⚙</span>
		<span class="absolutium-settings-toggle" onclick=${() => setOpen((v) => !v)}>
			Settings (experimental)
		</span>
		${open &&
		html`
			<div class="absolutium-settings">
				<div class="absolutium-settings-block">
					<div>Energy to send</div>
					<div class="absolutium-range-input">
						min
						<input
							type="range"
							min="1"
							max="40"
							value=${minEnergy}
							onchange=${(e: any) => setMinEnergy(e.target.value)}
						/>
						<span>${minEnergy}</span>
					</div>
					<div class="absolutium-range-input">
						max
						<input
							type="range"
							min="60"
							max="99"
							value=${maxEnergy}
							onchange=${(e: any) => setMaxEnergy(e.target.value)}
						/>
						<span>${maxEnergy}</span>
					</div>
				</div>
			</div>
		`}
	`;
};

const VectorsUI = ({ v }: { v: Vectors }) => {
	const forceRender = useForceRender();
	const [selectedPlanet, setSelectedPlanet] = useState<LocatablePlanet | null>(null);
	const [selectMode, setSelectMode] = useState(false);

	useEffect(() => {
		const getSelectedPlanet = () => {
			const planet = ui.getSelectedPlanet() || null;
			setSelectedPlanet(planet);
		};
		const interval = setInterval(getSelectedPlanet, 200);
		return () => clearInterval(interval);
	}, []);

	const clickDrop = () => {
		v.dropVectors(selectedPlanet!.locationId);
		forceRender();
	};

	const clickCreate = (vectorType: VectorType) => {
		const createVector = () => {
			const to = ui.getHoveringOverPlanet();
			if (to && selectedPlanet!.locationId !== to.locationId) {
				v.createVector(selectedPlanet!.locationId, to.locationId, vectorType);
				window.removeEventListener("click", createVector);
				setSelectMode(false);
				selectedPlanet && ui.setSelectedPlanet(selectedPlanet);
			}
			if (!to) {
				window.removeEventListener("click", createVector);
				setSelectMode(false);
				selectedPlanet && ui.setSelectedPlanet(selectedPlanet);
			}
		};
		setSelectMode(true);
		setTimeout(() => window.addEventListener("click", createVector));
	};

	if (!selectedPlanet) {
		return html`Select planet`;
	}

	const planetVectors = v.vectorsFrom(selectedPlanet.locationId);
	const activeC = planetVectors.some((v) => v.type === "C");
	const activeE = planetVectors.some((v) => v.type === "E");
	const activeS = planetVectors.some((v) => v.type === "S");
	const activeEs = planetVectors.some((v) => v.type === "Es");
	const activeSe = planetVectors.some((v) => v.type === "Se");

	return html`
		<style>
			.vectors-container {
				padding: 10px 0 10px;
				border-bottom: 1px solid #666;
			}
			.vectors-container button {
				padding: 0 10px;
				margin: 0 10px;
			}
			.vectors-container button:hover {
				border: 1px solid white;
			}
			.vectors-container button:disabled {
				cursor: default;
				border: 1px solid gray;
				color: gray;
			}
			.vectors-container button:disabled:hover {
				background: none;
				border: 1px solid gray;
				color: gray;
			}
			#vectors-c-button {
				border-color: ${VECTOR_COLORS.C.line};
			}
			#vectors-e-button {
				border-color: ${VECTOR_COLORS.E.line};
			}
			#vectors-s-button {
				border-color: ${VECTOR_COLORS.S.line};
			}
			#vectors-es-button {
				border-color: ${VECTOR_COLORS.Es.line};
			}
			#vectors-se-button {
				border-color: ${VECTOR_COLORS.Se.line};
			}
			#vectors-c-button:disabled {
				background: ${VECTOR_COLORS.C.arrow};
			}
			#vectors-e-button:disabled {
				background: ${VECTOR_COLORS.E.arrow};
			}
			#vectors-s-button:disabled {
				background: ${VECTOR_COLORS.S.arrow};
			}
			#vectors-es-button:disabled {
				background: ${VECTOR_COLORS.Es.arrow};
			}
			#vectors-se-button:disabled {
				background: ${VECTOR_COLORS.Se.arrow};
			}
			.vectors-select-indicator {
				padding-top: 10px;
			}
		</style>
		<div class="vectors-container">
			Vectors:
			<button disabled=${activeC} onclick=${() => clickCreate("C")} id="vectors-c-button">C</button>
			<button disabled=${activeE} onclick=${() => clickCreate("E")} id="vectors-e-button">E</button>
			<button disabled=${activeS} onclick=${() => clickCreate("S")} id="vectors-s-button">S</button>
			<button disabled=${activeEs} onclick=${() => clickCreate("Es")} id="vectors-es-button">
				Es
			</button>
			<button disabled=${activeSe} onclick=${() => clickCreate("Se")} id="vectors-se-button">
				Se
			</button>
			<button disabled=${!planetVectors.length} onclick=${() => clickDrop()}>X</button>

			${selectMode && html`<div class="vectors-select-indicator">Select target planet</div>`}
		</div>
	`;
};

const useForceRender = () => {
	const [n, setN] = useState(0);
	return () => setN((n) => n + 1);
};

export default Absolutium;
