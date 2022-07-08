import { LocationId, Planet, PlanetType, Upgrade, UpgradeState } from "@darkforest_eth/types";
import {
	ArrivingEnergy,
	CaptureStrategy,
	EnergyTravelStats,
	PlanetStats,
	SilverTravelStats,
	UpgradeType,
} from "./types";
import { Utils } from "./Utils";

export const DEFAULT_MIN_PERCENT = 20;
export const DEFAULT_MAX_PERCENT = 80;
const CALC_STATS_INTERVAL = 10000;

export class Stats {
	public allPlanets!: Planet[];
	public targetPlanets!: Planet[];
	public stats!: PlanetStats[];
	public statsById: Record<LocationId, PlanetStats> = {};

	private upgradeMultipliers!: {
		[UpgradeType.Defense]: Upgrade[];
		[UpgradeType.Range]: Upgrade[];
		[UpgradeType.Speed]: Upgrade[];
	};
	private statsInterval: NodeJS.Timer;
	private _minPercent = DEFAULT_MIN_PERCENT;
	private _maxPercent = DEFAULT_MAX_PERCENT;
	private sendPercent = this._maxPercent - this._minPercent;

	constructor(levelFrom?: number, levelTo?: number) {
		(window as any).utils = this;
		this.calcUpgradeMultipliers();
		this.getTargetPlanets();
		this.getAllPlanets(levelFrom, levelTo);
		this.calcStats();
		this.statsInterval = setInterval(() => this.calcStats(), CALC_STATS_INTERVAL);
	}

	public destroy() {
		clearInterval(this.statsInterval);
		(window as any).utils = undefined;
	}

	public get minPercent() {
		return this._minPercent;
	}
	public set minPercent(v: number) {
		this._minPercent = v;
		this.sendPercent = this._maxPercent - this._minPercent;
	}

	public get maxPercent() {
		return this._maxPercent;
	}
	public set maxPercent(v: number) {
		this._maxPercent = v;
		this.sendPercent = this._maxPercent - this._minPercent;
	}

	public getEnergyGrowthTime(
		energyCap: number,
		energyGrowth: number,
		from = this.minPercent,
		to = this.maxPercent
	): number {
		const c = energyCap;
		const p0 = (from / 100) * c;
		const p1 = (to / 100) * c;
		const g = energyGrowth;
		return (c / (4 * g)) * Math.log((p1 * (c - p0)) / (p0 * (c - p1)));
	}

	public calcTravelsToCapture = (
		receiverEnergy: number,
		receiverEnergyCap: number,
		arrivingEnergy: ArrivingEnergy
	) => {
		const travelsNumber = receiverEnergy / arrivingEnergy.withDefense;
		const travelsToCapture = Math.ceil(travelsNumber);
		const extraFromCapturing = (travelsToCapture - travelsNumber) * arrivingEnergy.arriving;
		const energyToPutOnTarget = receiverEnergyCap * (this.minPercent / 100);
		const travelsAfterCapturing = Math.ceil(
			Math.max(energyToPutOnTarget - extraFromCapturing, 0) / arrivingEnergy.arriving
		);
		return travelsToCapture + travelsAfterCapturing;
	};

	public getPlanetUpgradedStats(planet: LocationId | Planet, targetUpgradeState: UpgradeState) {
		planet = typeof planet === "string" ? df.getPlanetWithId(planet)! : planet;
		const {
			energyCap,
			energyGrowth,
			defense,
			range,
			speed,
			upgradeState: currentUpgradeState,
		} = planet;

		currentUpgradeState.forEach((currentUpgradeValue, i) => {
			if (targetUpgradeState[i] < currentUpgradeValue) {
				// throw new Error('"upgradeState" value is lower than current planet upgrade value');
			}
		});
		if (Utils.getPlanetMaxRank(planet) < targetUpgradeState.reduce((a, b) => a + b, 0)) {
			throw new Error('"upgradeState" sum rank value is higher than planet max rank');
		}

		const result = { energyCap, energyGrowth, defense, range, speed };
		targetUpgradeState.forEach((upgradeToRank, i) => {
			for (let j = currentUpgradeState[i]; j < upgradeToRank; j++) {
				const upgradeTypeRankValues = this.upgradeMultipliers[i as UpgradeType][j];
				result.energyCap *= upgradeTypeRankValues.energyCapMultiplier / 100;
				result.energyGrowth *= upgradeTypeRankValues.energyGroMultiplier / 100;
				result.defense *= upgradeTypeRankValues.defMultiplier / 100;
				result.range *= upgradeTypeRankValues.rangeMultiplier / 100;
				result.speed *= upgradeTypeRankValues.speedMultiplier / 100;
			}
		});
		return result;
	}

	public calcPlanetStats(p: Planet, upgradeState: UpgradeState): PlanetStats {
		const rank = Utils.getPlanetRank(p);
		const maxRank = Utils.getPlanetMaxRank(p);
		const {
			energyCap: maxEnergyCap,
			energyGrowth: maxEnergyGrowth,
			range: maxRange,
			speed: maxSpeed,
		} = this.getPlanetUpgradedStats(p, upgradeState);
		const energyGrowthTime = this.getEnergyGrowthTime(p.energyCap, p.energyGrowth);
		const maxEnergyGrowthTime = this.getEnergyGrowthTime(maxEnergyCap, maxEnergyGrowth);
		const silverPerRank = Utils.getSilverPerRank(p);
		const result = {
			locationId: p.locationId,
			type: p.planetType,
			level: p.planetLevel,
			rank,
			maxRank,
			defense: p.defense,
			range: p.range,
			maxRange,
			speed: p.speed,
			maxSpeed,
			effectiveRange: Utils.getEffectiveRange(p.range, this.sendPercent),
			maxEffectiveRange: Utils.getEffectiveRange(maxRange, this.sendPercent),
			energyCap: p.energyCap,
			maxEnergyCap,
			energyGrowth: p.energyGrowth,
			maxEnergyGrowth,
			energyGrowthTime,
			maxEnergyGrowthTime,
			energyGrowthPerSec: (p.energyCap * (this.sendPercent / 100)) / energyGrowthTime,
			maxEnergyGrowthPerSec: (maxEnergyCap * (this.sendPercent / 100)) / maxEnergyGrowthTime,
			silver: p.silver,
			silverCap: p.silverCap,
			silverGrowth: p.silverGrowth,
			silverPerRank,
			totalSilverForUpgrade: silverPerRank.reduce((a, b, i) => (i < rank ? a : a + b), 0),
		};
		return result;
	}

	public getEnergyTravelStats(
		_donor: LocationId | Planet,
		_receiver: LocationId | Planet,
		useDonorMaxStats: boolean,
		donorStats?: PlanetStats
	): EnergyTravelStats | null {
		const donor =
			donorStats || this.statsById[typeof _donor === "string" ? _donor : _donor.locationId];
		const receiver =
			this.statsById[typeof _receiver === "string" ? _receiver : _receiver.locationId];
		const dist = Utils.getDist(donor.locationId, receiver.locationId);
		if (
			donor === receiver ||
			dist > (useDonorMaxStats ? donor.maxEffectiveRange : donor.effectiveRange)
		) {
			return null;
		}
		const isReceiverOwnerByPlayer = Utils.isOwnedByPlayer(receiver.locationId);
		const useDonorRange = useDonorMaxStats ? donor.maxRange : donor.range;
		const useDonorEnergyCap = useDonorMaxStats ? donor.maxEnergyCap : donor.energyCap;
		const useDonorEnergyGrowth = useDonorMaxStats ? donor.maxEnergyGrowth : donor.energyGrowth;
		const arrivingEnergy = Utils.getArrivingEnergy(
			dist,
			useDonorRange,
			useDonorEnergyCap,
			useDonorEnergyCap * (this.sendPercent / 100),
			receiver.defense
		);
		const { energy: receiverEnergy, energyCap: receiverEnergyCap } = df.getPlanetWithId(
			receiver.locationId
		)!;
		const travelsToCapture = this.calcTravelsToCapture(
			receiverEnergy,
			receiverEnergyCap,
			arrivingEnergy
		);
		const travelTime = dist / ((useDonorMaxStats ? donor.maxSpeed : donor.speed) / 100);
		const energyGrowthTime = useDonorMaxStats ? donor.maxEnergyGrowthTime : donor.energyGrowthTime;
		const donorEnergy = df.getPlanetWithId(donor.locationId)!.energy;
		const initialGrowNeeded =
			useDonorMaxStats ||
			donorEnergy < donor.energyCap * ((this.maxPercent + this.minPercent) / 2 / 100);
		const minTravelEnergy = Utils.getTravelEnergy(dist, useDonorRange, useDonorEnergyCap);
		return {
			donorId: donor.locationId,
			receiverId: receiver.locationId,
			dist,
			arrivingEnergy: arrivingEnergy.arriving,
			arrivingEnergyDefense: arrivingEnergy.withDefense,
			travelsToCapture,
			travelTime,
			energyPerSec: Math.round(arrivingEnergy.arriving / energyGrowthTime),
			energyPerSecDefense: Math.round(arrivingEnergy.withDefense / energyGrowthTime),
			timeToCapture: isReceiverOwnerByPlayer
				? 0
				: energyGrowthTime * (travelsToCapture - (initialGrowNeeded ? 0 : 1)) + travelTime,
			minTravelEnergy,
			timeToMinTravelEnergy: this.getEnergyGrowthTime(
				useDonorEnergyCap,
				useDonorEnergyGrowth,
				this.minPercent,
				this.minPercent + (minTravelEnergy / useDonorEnergyCap) * 100
			),
		};
	}

	public getEnergyDonors(
		planet: LocationId | Planet,
		useDonorMaxStats: boolean
	): EnergyTravelStats[] {
		planet = typeof planet === "string" ? planet : planet.locationId;
		return this.stats
			.map((p) => this.getEnergyTravelStats(p.locationId, planet, useDonorMaxStats))
			.filter(Boolean) as EnergyTravelStats[];
	}

	public getEnergyReceivers(
		planet: LocationId | Planet,
		useDonorMaxStats: boolean
	): EnergyTravelStats[] {
		planet = typeof planet === "string" ? planet : planet.locationId;
		return this.stats
			.filter((p) => p.locationId !== planet)
			.map((p) => this.getEnergyTravelStats(planet, p.locationId, useDonorMaxStats))
			.filter(Boolean) as EnergyTravelStats[];
	}

	public getEnergyReceiversRespectUpgrades(planet: LocationId | Planet): EnergyTravelStats[] {
		return this.getEnergyReceivers(planet, false).map((travel) => {
			const bestStrategy = this.calcBestCaptureStrategy(travel.donorId, travel.receiverId);
			travel.timeToCapture = Math.min(
				bestStrategy.captureTimeWithFirstUpgrades,
				travel.timeToCapture
			);
			return travel;
		});
	}

	public getSilverDonors(receiver: LocationId | Planet): SilverTravelStats[] {
		const receiverId = typeof receiver === "string" ? receiver : receiver.locationId;
		const receiverStats = this.statsById[receiverId];
		const minesAsReceivers = this.getEnergyReceivers(receiverId, false)
			.filter((travel) => this.statsById[travel.receiverId].type === PlanetType.SILVER_MINE)
			.filter((travel) => travel.dist < this.statsById[travel.receiverId].effectiveRange);
		const minesAsDonors = minesAsReceivers.map((travel) =>
			this.getEnergyTravelStats(travel.receiverId, receiverId, false)
		);
		return minesAsReceivers.map((travel, i) => {
			const mineStats = this.statsById[travel.receiverId];
			const minDeliveryInterval = minesAsDonors[i]!.timeToMinTravelEnergy;
			const minDeliveryAmount = mineStats.silverGrowth * minDeliveryInterval;
			const timeToFirstSilver =
				travel.timeToCapture + minDeliveryInterval + minesAsDonors[i]!.travelTime;
			const firstSilver = Math.min(mineStats.silverCap, mineStats.silver + minDeliveryAmount);
			return {
				donorId: travel.receiverId,
				receiverId: receiverId,
				timeToCapture: travel.timeToCapture,
				minDeliveryInterval,
				minDeliveryAmount,
				timeToFirstSilver,
				firstSilver,
				timeToRanks: receiverStats.silverPerRank.map((_, i, arr) => {
					const neededSilver = arr.slice(0, i + 1).reduce((a, b) => a + b, 0);
					let nDeliveries = 0;
					let receivedSilver = firstSilver;
					while (receivedSilver < neededSilver) {
						receivedSilver += minDeliveryAmount;
						nDeliveries++;
					}
					return timeToFirstSilver + minDeliveryInterval * nDeliveries;
				}),
			};
		});
	}

	public calcBestCaptureStrategy(
		start: LocationId | Planet,
		target: LocationId | Planet
	): CaptureStrategy {
		start = typeof start === "string" ? df.getPlanetWithId(start)! : start;
		target = typeof target === "string" ? df.getPlanetWithId(target)! : target;
		const travelNoUpgrades = this.getEnergyTravelStats(start, target, false);
		const silverDonors = this.getSilverDonors(start).sort(
			(a, b) => a.timeToRanks[0] - b.timeToRanks[0]
		);
		const topSilverDonor = silverDonors[0];
		const firstSilverRanks = topSilverDonor.timeToRanks.filter(
			(t) => t === topSilverDonor.timeToRanks[0]
		).length;
		const startStatsAfterFirstUpgrade = this.calcPlanetStats(start, [
			0,
			Math.min(firstSilverRanks, 4),
			0,
		]);
		const travelAfterUpgrades = this.getEnergyTravelStats(
			start,
			target,
			true,
			startStatsAfterFirstUpgrade
		);
		return {
			captureTimeNoUpgrades: travelNoUpgrades!.timeToCapture,
			captureTimeWithFirstUpgrades:
				topSilverDonor.timeToFirstSilver + travelAfterUpgrades!.timeToCapture,
		};
	}

	// Private methods

	private calcUpgradeMultipliers(): void {
		const def = [] as Upgrade[];
		const range = [] as Upgrade[];
		const speed = [] as Upgrade[];
		for (let i = 0; i <= 3; i++) {
			def.push(df.getUpgrade(0, i));
			range.push(df.getUpgrade(1, i));
			speed.push(df.getUpgrade(2, i));
		}
		this.upgradeMultipliers = {
			[UpgradeType.Defense]: def,
			[UpgradeType.Range]: range,
			[UpgradeType.Speed]: speed,
		};
	}

	private getTargetPlanets(): void {
		const ids = (df as any).getTargetPlanets() as LocationId[];
		this.targetPlanets = df.getPlanetsWithIds(ids);
	}

	private getAllPlanets(levelFrom?: number, levelTo?: number): void {
		let planets = Array.from(df.getAllPlanets());
		if (levelFrom) {
			planets = planets.filter((p) => p.planetLevel >= levelFrom);
		}
		if (levelTo) {
			planets = planets.filter((p) => p.planetLevel <= levelTo);
		}
		this.allPlanets = planets;
	}

	private calcStats(): void {
		const start = performance.now();
		this.getAllPlanets(1);
		this.stats = this.allPlanets.map((p) => {
			const result = this.calcPlanetStats(p, Utils.getUpgradeStateGoal(p, UpgradeType.Range));
			this.statsById[p.locationId] = result;
			return result;
		});
		console.log(`Stats calculated (${performance.now() - start}ms)`);
	}
}
