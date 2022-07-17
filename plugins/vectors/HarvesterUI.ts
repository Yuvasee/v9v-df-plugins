import { ArtifactType } from "@darkforest_eth/types";
import { html, useEffect, useState } from "https://unpkg.com/htm/preact/standalone.module.js";
import { Harvester } from "./Harvester";

export const HarvesterUI = ({ harvester }: { harvester: Harvester }) => {
	const [highlight, setHighlight] = useState(harvester.show);

	const handleHighlightChange = (e: any) => {
		const v = Number(e.target.value) as ArtifactType;
		setHighlight(v);
		harvester.show = v;
	};

	return html`
		<style>
			.absolutium-harvester {
			}
		</style>
		<div class="absolutium-harvester">
			<div>
				<span style="padding-right: 10px;">Highlight ruins</span>
				<select value=${highlight} onchange=${handleHighlightChange}>
					<option value=${null}>None</option>
					<option value=${ArtifactType.Unknown}>All</option>
					<option value=${ArtifactType.BlackDomain}>Black Domain</option>
					<option value=${ArtifactType.BloomFilter}>Bloom Filter</option>
					<option value=${ArtifactType.Colossus}>Colossus</option>
					<option value=${ArtifactType.Monolith}>Monolith</option>
					<option value=${ArtifactType.PhotoidCannon}>Photoid Cannon</option>
					<option value=${ArtifactType.PlanetaryShield}>Planetary Shield</option>
					<option value=${ArtifactType.Pyramid}>Pyramid</option>
					<option value=${ArtifactType.Wormhole}>Wormhole</option>
				</select>
			</div>
		</div>
	`;
};
