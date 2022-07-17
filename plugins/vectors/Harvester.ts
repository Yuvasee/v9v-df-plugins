import {
	ArtifactRarity,
	ArtifactType,
	LocatablePlanet,
	Planet,
	PlanetLevel,
	PlanetType,
	WorldCoords,
} from "@darkforest_eth/types";
import { Utils } from "./Utils";

const RARITY_COLORS = {
	[ArtifactRarity.Common]: "lightgray",
	[ArtifactRarity.Rare]: "dodgerblue",
	[ArtifactRarity.Epic]: "blueviolet",
	[ArtifactRarity.Legendary]: "fuchsia",
	[ArtifactRarity.Mythic]: "darkorange",
};

export class Harvester {
	public show: ArtifactType | null = null;

	private allRuinsData: {
		planet: Planet;
		artifact: {
			type: ArtifactType;
			rarity: ArtifactRarity;
		};
	}[] = [];

	constructor() {
		this.allRuinsData = Utils.getAllPlanets(PlanetLevel.ONE)
			.filter((p) => p.planetType === PlanetType.RUINS)
			.map((p) => ({
				planet: p,
				artifact: (df as any).getDeterministicArtifact(p.locationId),
			}));
	}

	public destroy() {}

	public draw(ctx: CanvasRenderingContext2D) {
		if (this.show === null) return;
		const viewport = ui.getViewport();

		let render: { coords: WorldCoords; color: string }[];

		if (this.show === ArtifactType.Unknown) {
			render = this.allRuinsData.map((data) => ({
				coords: (data.planet as LocatablePlanet).location.coords,
				color: RARITY_COLORS[data.artifact.rarity],
			}));
		} else {
			render = this.allRuinsData
				.filter((data) => data.artifact.type === this.show)
				.map((data) => ({
					coords: (data.planet as LocatablePlanet).location.coords,
					color: RARITY_COLORS[data.artifact.rarity],
				}));
		}

		render.forEach((r) => {
			ctx.beginPath();
			ctx.strokeStyle = r.color;
			const coords = viewport.worldToCanvasCoords(r.coords);
			ctx.arc(coords.x, coords.y, 200 / viewport.scale, 0, 2 * Math.PI);
			ctx.stroke();
		});
	}
}
