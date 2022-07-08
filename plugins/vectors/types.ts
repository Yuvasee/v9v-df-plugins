import { LocationId } from "@darkforest_eth/types";

export type ArrivingEnergy = {
	arriving: number;
	withDefense: number;
};

export type Vector = {
	from: LocationId;
	to: LocationId;
	type: VectorType;
};

export type VectorType = "C" | "E" | "S" | "Es" | "Se";
