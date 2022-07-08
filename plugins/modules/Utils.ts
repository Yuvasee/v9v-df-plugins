import { isUnconfirmedFindArtifactTx, isUnconfirmedProspectPlanetTx } from "@darkforest_eth/serde";
import {
	LocatablePlanet,
	LocationId,
	Planet,
	PlanetType,
	QueuedArrival,
	SpaceType,
	UpgradeState,
	WorldCoords,
} from "@darkforest_eth/types";
import { ArrivingEnergy, UpgradeType } from "./types";

export class Utils {
	public static getDist(p0: LocationId | Planet, p1: LocationId | Planet): number {
		return Math.round(
			df.getDist(
				typeof p0 === "string" ? p0 : p0.locationId,
				typeof p1 === "string" ? p1 : p1.locationId
			)
		);
	}

	public static getPlanetRank(planet: Planet): number {
		return planet.upgradeState.reduce((a, b) => a + b, 0);
	}

	public static getPlanetMaxRank(planet: Planet): number {
		if (planet.planetType !== PlanetType.PLANET) return 0;
		if (planet.spaceType === SpaceType.NEBULA) return 3;
		if (planet.spaceType === SpaceType.SPACE) return 4;
		return 5;
	}

	public static getUpgradeStateGoal(p: Planet, priority: UpgradeType): UpgradeState {
		const maxRank = Utils.getPlanetMaxRank(p);
		return {
			[UpgradeType.Defense]: [Math.min(maxRank, 4), maxRank === 5 ? 1 : 0, 0],
			[UpgradeType.Range]: [0, Math.min(maxRank, 4), maxRank === 5 ? 1 : 0],
			[UpgradeType.Speed]: [0, maxRank === 5 ? 1 : 0, Math.min(maxRank, 4)],
		}[priority] as UpgradeState;
	}

	public static getSilverPerRank(planet: Planet): number[] {
		const rank = Utils.getPlanetRank(planet);
		const maxRank = Utils.getPlanetMaxRank(planet);
		const silverPerRank = [];
		for (let i = rank; i < maxRank; i++) {
			silverPerRank.push(Math.floor((i + 1) * 0.2 * planet.silverCap));
		}
		return silverPerRank;
	}

	public static getEffectiveRange(planetRange: number, percentEnergySending = 100, rangeBoost = 1) {
		if (percentEnergySending === 0) return 0;
		return Math.max(Math.log2(percentEnergySending / 5), 0) * planetRange * rangeBoost;
	}

	public static getArrivingEnergy(
		dist: number,
		senderRange: number,
		senderEnergyCap: number,
		sentEnergy: number,
		defense = 100
	): ArrivingEnergy {
		const decayRate = (1 / 2) ** (dist / senderRange);
		const arriving = Math.max(decayRate * sentEnergy - 0.05 * senderEnergyCap, 0);
		return {
			arriving,
			withDefense: arriving / (defense / 100),
		};
	}

	public static getTravelDecayRate(dist: number, senderRange: number): number {
		return (1 / 2) ** (dist / senderRange);
	}

	public static getTravelEnergy(
		dist: number,
		senderRange: number,
		senderEnergyCap: number,
		receiveEnergy = 1
	) {
		const decayRate = Utils.getTravelDecayRate(dist, senderRange);
		return Math.ceil((receiveEnergy + 0.05 * senderEnergyCap) / decayRate);
	}

	public static focusPlanet(planet: Planet | LocatablePlanet | LocationId) {
		planet = typeof planet === "string" ? df.getPlanetWithId(planet)! : planet;
		ui.setSelectedPlanet(planet as LocatablePlanet);
		ui.centerPlanet(planet as LocatablePlanet);
	}

	public static isOwnedByPlayer(planet: LocationId | Planet): boolean {
		planet = typeof planet === "string" ? df.getPlanetWithId(planet)! : planet;
		return planet.owner === df.account;
	}

	public static getIncomingVoyages(
		p: LocationId | Planet,
		arrivalsThreshold?: number
	): QueuedArrival[] {
		p = typeof p === "string" ? p : p.locationId;
		return df
			.getAllVoyages()
			.filter(
				(arrival) =>
					arrival.toPlanet === p &&
					arrival.arrivalTime > Date.now() / 1000 &&
					(arrivalsThreshold ? arrival.arrivalTime < Date.now() / 1000 + arrivalsThreshold : true)
			);
	}

	public static getIncoming = (locationId: LocationId, arrivalsThreshold = 0) => {
		const unconfirmedMoves = df.getUnconfirmedMoves().filter((move) => move.to === locationId);
		const unconfermedEnergy = unconfirmedMoves
			.map((move) => move.forces)
			.reduce((a, b) => a + b, 0);
		const unconfermedSilver = unconfirmedMoves
			.map((move) => move.silver)
			.reduce((a, b) => a + b, 0);

		const arrivingMoves = Utils.getIncomingVoyages(locationId, arrivalsThreshold);
		const arrivingEnergy = arrivingMoves
			.map((arrival) => arrival.energyArriving)
			.reduce((a, b) => a + b, 0);
		const arrivingSilver = arrivingMoves
			.map((arrival) => arrival.silverMoved)
			.reduce((a, b) => a + b, 0);

		return {
			energy: unconfermedEnergy + arrivingEnergy,
			silver: unconfermedSilver + arrivingSilver,
		};
	};

	public static isCoordsInUniverse(coords: WorldCoords): boolean {
		return Math.sqrt(Math.pow(coords.x, 2) + Math.pow(coords.y, 2)) < df.getWorldRadius();
	}

	public static planetHasArtifactToFind(p: Planet): boolean {
		return (
			p.planetType === PlanetType.RUINS && !p.hasTriedFindingArtifact && !p.prospectedBlockNumber
		);
	}

	public static safeFindArtifact(p: LocationId | Planet): void {
		p = typeof p === "string" ? df.getPlanetWithId(p)! : p;
		if (
			!Utils.planetHasArtifactToFind(p) ||
			p.transactions?.getTransactions(isUnconfirmedProspectPlanetTx).length ||
			p.transactions?.getTransactions(isUnconfirmedFindArtifactTx).length
		) {
			return;
		}
		df.prospectPlanet(p.locationId);
	}
}
