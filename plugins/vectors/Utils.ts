import { LocationId, Planet, PlanetType, QueuedArrival, SpaceType } from "@darkforest_eth/types";

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

	public static getSilverPerRank(planet: Planet): number[] {
		const rank = Utils.getPlanetRank(planet);
		const maxRank = Utils.getPlanetMaxRank(planet);
		const silverPerRank = [];
		for (let i = rank; i < maxRank; i++) {
			silverPerRank.push(Math.floor((i + 1) * 0.2 * planet.silverCap));
		}
		return silverPerRank;
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
		const unconfirmedMoves = df
			.getUnconfirmedMoves()
			.filter((move) => move.intent.to === locationId);
		const unconfermedEnergy = unconfirmedMoves
			.map((move) => move.intent.forces)
			.reduce((a, b) => a + b, 0);
		const unconfermedSilver = unconfirmedMoves
			.map((move) => move.intent.silver)
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
}
