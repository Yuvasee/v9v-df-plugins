import { LocatablePlanet } from "@darkforest_eth/types";
import { html, useEffect, useState } from "https://unpkg.com/htm/preact/standalone.module.js";
import { VECTORS_COLORS } from "./constants";
import { VectorType } from "./types";
import { Vectors } from "./Vectors";

export const VectorsUI = ({ v }: { v: Vectors }) => {
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
		return html`Vectors. Select a planet.`;
	}

	const planetVectors = v.vectorsFrom(selectedPlanet.locationId);
	const activeC = planetVectors.some((v) => v.type === "C");
	const activeE = planetVectors.some((v) => v.type === "E");
	const activeS = planetVectors.some((v) => v.type === "S");
	const activeEs = planetVectors.some((v) => v.type === "Es");
	const activeSe = planetVectors.some((v) => v.type === "Se");

	return html`
		<div class="vectors-container">
			<div>Vectors</div>
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
		</div>
		${selectMode &&
		html`<div class="vectors-select-indicator">Click on target planet to create a Vector.</div>`}

		<style>
			.vectors-container {
				display: flex;
				justify-content: space-between;
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
				border-color: ${VECTORS_COLORS.C.line};
			}
			#vectors-e-button {
				border-color: ${VECTORS_COLORS.E.line};
			}
			#vectors-s-button {
				border-color: ${VECTORS_COLORS.S.line};
			}
			#vectors-es-button {
				border-color: ${VECTORS_COLORS.Es.line};
			}
			#vectors-se-button {
				border-color: ${VECTORS_COLORS.Se.line};
			}
			#vectors-c-button:disabled {
				background: ${VECTORS_COLORS.C.arrow};
			}
			#vectors-e-button:disabled {
				background: ${VECTORS_COLORS.E.arrow};
			}
			#vectors-s-button:disabled {
				background: ${VECTORS_COLORS.S.arrow};
			}
			#vectors-es-button:disabled {
				background: ${VECTORS_COLORS.Es.arrow};
			}
			#vectors-se-button:disabled {
				background: ${VECTORS_COLORS.Se.arrow};
			}
			.vectors-select-indicator {
				padding-top: 10px;
			}
		</style>
	`;
};

const useForceRender = () => {
	const [n, setN] = useState(0);
	return () => setN((n) => n + 1);
};
