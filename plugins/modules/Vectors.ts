import { isUnconfirmedMoveTx, isUnconfirmedUpgradeTx } from "@darkforest_eth/serde";
import { LocatablePlanet, LocationId, PlanetType } from "@darkforest_eth/types";
import { Stats } from "./Stats";
import { Utils } from "./Utils";

export type Vector = {
	from: LocationId;
	to: LocationId;
	type: VectorType;
};

export type VectorType = "C" | "E" | "S" | "Es" | "Se";

export const VECTOR_COLORS: Record<VectorType, { line: string; arrow: string }> = {
	C: { line: "#ad593b", arrow: "#ad593b77" },
	E: { line: "dodgerblue", arrow: "#1e90ff77" },
	S: { line: "orangered", arrow: "#ff450077" },
	Es: { line: "cyan", arrow: "#00ffff77" },
	Se: { line: "orange", arrow: "#ffa50077" },
};

const VECTORS_STORAGE_KEY = "vectors_" + location.href.slice(-42);
const LINE_WIDTH = 1;
const DEFAULT_LOOP_INTERVAL = 1000; // ms

export class Vectors {
	public vectors: Vector[] = [];

	private stats: Stats;
	private loopInterval: NodeJS.Timer;

	constructor(stats: Stats) {
		this.stats = stats;
		this.loadVectors();
		this.loop();
		this.loopInterval = setInterval(() => this.loop(), DEFAULT_LOOP_INTERVAL);
	}

	public destroy() {
		clearInterval(this.loopInterval);
	}

	public vectorsFrom(from: LocationId) {
		return this.vectors.filter((vector) => vector.from === from);
	}

	public vectorsTo(to: LocationId) {
		return this.vectors.filter((vector) => vector.to === to);
	}

	public createVector(from: LocationId, to: LocationId, type: VectorType) {
		this.dropVectors(from, type === "S" ? ["E", "C"] : type === "E" || type === "C" ? ["S"] : []);
		const newVector = { from, to, type };
		this.vectors.push(newVector);
		this.saveVectors();
	}

	public dropVectors(from: LocationId, keepType: VectorType[] = []) {
		this.vectors = this.vectors.filter(
			(vector) => vector.from !== from || keepType.indexOf(vector.type) !== -1
		);
		this.saveVectors();
	}

	public drawVectors(ctx: CanvasRenderingContext2D) {
		const viewport = ui.getViewport();

		this.vectors.forEach((vector) => {
			const from = df.getPlanetWithId(vector.from) as LocatablePlanet;
			const to = df.getPlanetWithId(vector.to) as LocatablePlanet;
			const fromRad = ui.radiusMap[from.planetLevel];
			const toRad = ui.radiusMap[to.planetLevel];
			const { x: _fromX, y: _fromY } = viewport.worldToCanvasCoords(from.location.coords);
			const { x: _toX, y: _toY } = viewport.worldToCanvasCoords(to.location.coords);
			const angle = Math.atan2(_toY - _fromY, _toX - _fromX);
			const fromX = _fromX + (fromRad / viewport.scale) * Math.cos(angle);
			const fromY = _fromY + (fromRad / viewport.scale) * Math.sin(angle);
			const toX = _toX - (toRad / viewport.scale) * Math.cos(angle);
			const toY = _toY - (toRad / viewport.scale) * Math.sin(angle);
			const arrLen = Math.max(fromRad, 50) / viewport.scale;

			ctx.strokeStyle = VECTOR_COLORS[vector.type].line;
			ctx.fillStyle = VECTOR_COLORS[vector.type].arrow;
			ctx.lineWidth = LINE_WIDTH;

			// Line
			ctx.beginPath();
			ctx.moveTo(fromX, fromY);
			ctx.lineTo(toX, toY);
			ctx.stroke();

			// Path begin arrow
			ctx.beginPath();
			ctx.moveTo(fromX + arrLen * Math.cos(angle), fromY + arrLen * Math.sin(angle));
			ctx.lineTo(
				fromX + arrLen * Math.cos(angle) - arrLen * Math.cos(angle - Math.PI / 10),
				fromY + arrLen * Math.sin(angle) - arrLen * Math.sin(angle - Math.PI / 10)
			);
			ctx.lineTo(
				fromX + arrLen * Math.cos(angle) - arrLen * Math.cos(angle + Math.PI / 10),
				fromY + arrLen * Math.sin(angle) - arrLen * Math.sin(angle + Math.PI / 10)
			);
			ctx.fill();

			// Path end arrow
			ctx.beginPath();
			ctx.moveTo(toX, toY);
			ctx.lineTo(
				toX - arrLen * Math.cos(angle - Math.PI / 10),
				toY - arrLen * Math.sin(angle - Math.PI / 10)
			);
			ctx.lineTo(
				toX - arrLen * Math.cos(angle + Math.PI / 10),
				toY - arrLen * Math.sin(angle + Math.PI / 10)
			);
			ctx.fill();
		});
	}

	public saveVectors() {
		localStorage.setItem(VECTORS_STORAGE_KEY, JSON.stringify(this.vectors));
	}

	private loop() {
		// Upgrade planets
		df.getMyPlanets()
			.filter((p) => p.planetType === PlanetType.PLANET)
			.filter((p) => !p.transactions?.getTransactions(isUnconfirmedUpgradeTx).length)
			.forEach((p) => {
				const stats = this.stats.statsById[p.locationId];
				if (stats.silverPerRank[0] && p.silver >= stats.silverPerRank[0]) {
					df.upgrade(p.locationId, stats.rank < 4 ? 1 : 2);
				}
			});

		this.vectors.forEach((vector) => {
			const from = df.getPlanetWithId(vector.from)!;
			const to = df.getPlanetWithId(vector.to)!;
			const fromOwned = !Utils.isOwnedByPlayer(from.locationId);
			const toOwned = Utils.isOwnedByPlayer(to.locationId);
			const toStats = this.stats.statsById[to.locationId];

			if (fromOwned) {
				return;
			}
			const unconfirmedMove = from.transactions?.getTransactions(isUnconfirmedMoveTx).length;
			const pendingMove = df
				.getUnconfirmedMoves()
				.filter((move) => move.to === vector.to && move.from === vector.from).length;
			if (unconfirmedMove || pendingMove) return;

			const incoming = Utils.getIncoming(to.locationId);
			const incomingSoon = Utils.getIncoming(to.locationId, 15);

			const toLackEnergy =
				(!toOwned ? to.energy * (to.defense / 100) : 0) +
				to.energyCap -
				incomingSoon.energy -
				(toOwned ? to.energy : 0);
			const dist = Utils.getDist(from.locationId, to.locationId);
			const minTravelEnergy = Utils.getTravelEnergy(dist, from.range, from.energyCap);
			const toLackTravelEnergy = Utils.getTravelEnergy(
				dist,
				from.range,
				from.energyCap,
				toLackEnergy
			);
			const availableToSendEnergy = from.energy - from.energyCap * (this.stats.minPercent / 100);
			const toSendEnergy = Math.min(toLackTravelEnergy, availableToSendEnergy);
			const fromWhenReadyEnergy = from.energyCap * (this.stats.maxPercent / 100);

			const toLackTotalSilver = to.silverCap - to.silver - incoming.silver;
			const toLackRankSilver = Math.max(
				toStats.silverPerRank[0] ? toStats.silverPerRank[0] - to.silver - incoming.silver : 0,
				0
			);
			const toSendSilver = toLackRankSilver
				? Math.min(toLackTotalSilver, Math.max(toLackRankSilver, from.silver))
				: Math.min(toLackTotalSilver, from.silverCap);

			if (vector.type === "C") {
				if (toOwned && to.energy >= to.energyCap * (this.stats.minPercent / 100)) {
					this.dropVectors(vector.from, ["S"]);
					return;
				}
				const toLackEnergy = Math.floor(
					(!toOwned ? to.energy * (to.defense / 100) : 0) +
						to.energyCap * (this.stats.minPercent / 100) -
						incoming.energy -
						(toOwned ? to.energy : 0)
				);
				if (toLackEnergy <= 2) return;
				const toLackTravelEnergy = Utils.getTravelEnergy(
					dist,
					from.range,
					from.energyCap,
					toLackEnergy
				);
				const toSendEnergy = Math.min(toLackTravelEnergy, availableToSendEnergy);
				if (from.energy < fromWhenReadyEnergy && availableToSendEnergy < toLackTravelEnergy) return;
				if (toSendEnergy < minTravelEnergy) return;
				df.move(from.locationId, to.locationId, Math.floor(toSendEnergy), 0);
			}

			const sendE = (withS: boolean) => {
				if (toLackEnergy <= 0) return;
				if (from.energy < fromWhenReadyEnergy) return;
				if (toSendEnergy < minTravelEnergy) return;
				df.move(
					from.locationId,
					to.locationId,
					Math.floor(toSendEnergy),
					Math.floor(withS ? Math.min(toSendSilver, from.silver) : 0)
				);
			};

			const sendS = (withE: boolean) => {
				if (toSendSilver <= 0) return;
				if (from.silver < toSendSilver) return;
				if (minTravelEnergy > availableToSendEnergy) return;
				df.move(
					from.locationId,
					to.locationId,
					Math.floor(withE ? Math.max(toSendEnergy, minTravelEnergy) : minTravelEnergy),
					Math.floor(toSendSilver)
				);
			};

			if (vector.type === "E") {
				sendE(false);
			}

			if (vector.type === "S") {
				sendS(false);
			}

			if (vector.type === "Es") {
				sendE(true);
			}

			if (vector.type === "Se") {
				sendS(true);
			}
		});
	}

	private loadVectors() {
		const loadedVectors = JSON.parse(localStorage.getItem(VECTORS_STORAGE_KEY) || "[]") as Vector[];
		this.vectors = loadedVectors;
	}
}
