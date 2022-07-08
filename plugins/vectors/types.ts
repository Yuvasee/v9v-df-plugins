import {
	ArtifactRarity,
	ArtifactType,
	Biome,
	LocationId,
	PlanetLevel,
	PlanetType,
	WorldCoords,
} from "@darkforest_eth/types";

export type PlanetStats = {
	locationId: LocationId;
	type: PlanetType;
	level: PlanetLevel;
	rank: number;
	maxRank: number;
	defense: number;
	range: number;
	maxRange: number;
	speed: number;
	maxSpeed: number;
	effectiveRange: number;
	maxEffectiveRange: number;
	energyCap: number;
	maxEnergyCap: number;
	energyGrowth: number;
	maxEnergyGrowth: number;
	energyGrowthTime: number;
	maxEnergyGrowthTime: number;
	energyGrowthPerSec: number;
	maxEnergyGrowthPerSec: number;
	silver: number;
	silverCap: number;
	silverGrowth: number;
	silverPerRank: number[];
	totalSilverForUpgrade: number;
};

export type EnergyTravelStats = {
	donorId: LocationId;
	receiverId: LocationId;
	dist: number;
	arrivingEnergy: number;
	arrivingEnergyDefense: number;
	travelTime: number;
	energyPerSec: number;
	energyPerSecDefense: number;
	travelsToCapture: number;
	timeToCapture: number;
	minTravelEnergy: number;
	timeToMinTravelEnergy: number;
};

export type SilverTravelStats = {
	donorId: LocationId;
	receiverId: LocationId;
	timeToCapture: number;
	minDeliveryInterval: number;
	minDeliveryAmount: number;
	timeToFirstSilver: number;
	firstSilver: number;
	timeToRanks: number[];
};

export type ArrivingEnergy = {
	arriving: number;
	withDefense: number;
};

export type CaptureStrategy = {
	captureTimeNoUpgrades: number;
	captureTimeWithFirstUpgrades: number;
};

export enum UpgradeType {
	Defense,
	Range,
	Speed,
}

export type SavedArtifactData = {
	planetId: LocationId;
	coords: WorldCoords;
	type: ArtifactType;
	rarity: ArtifactRarity;
	biome: Biome;
};
