import { isUnconfirmedMoveTx, isUnconfirmedUpgradeTx } from "@darkforest_eth/serde";
import { LocatablePlanet, LocationId, PlanetType } from "@darkforest_eth/types";
import {
	VECTORS_LINE_WIDTH,
	VECTORS_LOOP_INTERVAL,
	VECTORS_STORAGE_KEY,
	VECTORS_COLORS,
	INCOMING_THRESHOLD_S,
} from "./constants";
import { Settings } from "./Settings";
import { Vector, VectorType } from "./types";
import { Utils } from "./Utils";

export class Vectors {
	public vectors: Vector[] = [];

	private settings: Settings;
	private loopInterval: NodeJS.Timer;

	constructor(settings: Settings) {
		this.settings = settings;
		this.loadVectors();
		this.loop();
		this.loopInterval = setInterval(() => this.loop(), VECTORS_LOOP_INTERVAL);
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

			ctx.strokeStyle = VECTORS_COLORS[vector.type].line;
			ctx.fillStyle = VECTORS_COLORS[vector.type].arrow;
			ctx.lineWidth = VECTORS_LINE_WIDTH;

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
		this.vectors.forEach((vector) => {
			const from = df.getPlanetWithId(vector.from)!;
			const to = df.getPlanetWithId(vector.to)!;
			const fromOwned = !Utils.isOwnedByPlayer(from.locationId);
			const toOwned = Utils.isOwnedByPlayer(to.locationId);

			if (fromOwned) {
				return;
			}
			const unconfirmedMove = from.transactions?.getTransactions(isUnconfirmedMoveTx).length;
			const pendingMove = df
				.getUnconfirmedMoves()
				.filter((move) => move.intent.to === vector.to && move.intent.from === vector.from).length;
			if (unconfirmedMove || pendingMove) return;

			const incoming = Utils.getIncoming(to.locationId);
			const incomingSoon = Utils.getIncoming(to.locationId, INCOMING_THRESHOLD_S);

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
			const minPercent = this.settings.defaultMinEnergyPercent;
			const maxPercent = this.settings.defaultMaxEnergyPercent;
			const availableToSendEnergy = from.energy - from.energyCap * (minPercent / 100);
			const toSendEnergy = Math.min(toLackTravelEnergy, availableToSendEnergy);
			const fromWhenReadyEnergy = from.energyCap * (maxPercent / 100);

			const toLackTotalSilver = to.silverCap - to.silver - incoming.silver;
			const toSilverPerRank = Utils.getSilverPerRank(to);
			const toLackRankSilver = Math.max(
				toSilverPerRank[0] ? toSilverPerRank[0] - to.silver - incoming.silver : 0,
				0
			);
			const toSendSilver = toLackRankSilver
				? Math.min(toLackTotalSilver, Math.max(toLackRankSilver, from.silver))
				: Math.min(toLackTotalSilver, from.silverCap);

			if (vector.type === "C") {
				if (toOwned && to.energy >= to.energyCap * (minPercent / 100)) {
					this.dropVectors(vector.from, ["S"]);
					return;
				}
				const toLackEnergy = Math.floor(
					(!toOwned ? to.energy * (to.defense / 100) : 0) +
						to.energyCap * (minPercent / 100) -
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
				to.energy < to.energyCap * 0.99 ? sendE(true) : sendS(false);
			}

			if (vector.type === "Se") {
				to.silver < to.silverCap ? sendS(true) : sendE(false);
			}
		});
	}

	private loadVectors() {
		const loadedVectors = JSON.parse(localStorage.getItem(VECTORS_STORAGE_KEY) || "[]") as Vector[];
		this.vectors = loadedVectors;
	}
}
