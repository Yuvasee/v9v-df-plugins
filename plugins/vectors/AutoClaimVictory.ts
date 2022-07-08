import { LocationId } from "@darkforest_eth/types";

import { AUTO_CLAIM_VICTORY_INTERVAL } from "./constants";
import { Utils } from "./Utils";

export class AutoClaimVictory {
	private interval: NodeJS.Timer;

	constructor() {
		this.interval = setInterval(() => this.loop(), AUTO_CLAIM_VICTORY_INTERVAL);
	}

	destroy() {
		clearInterval(this.interval);
	}

	private loop() {
		if ((df as any).gameover) return;
		const targetIds = (df as any).getTargetPlanets() as LocationId[];
		targetIds
			.map((id) => df.getPlanetWithId(id))
			.filter((p) => Utils.isOwnedByPlayer(p!))
			.forEach((p) => {
				const energyPercent = (p!.energy / p!.energyCap) * 100;
				if (energyPercent >= (df as any).claimVictoryPercentage()) {
					(df as any).claimVictory(p?.locationId);
				}
			});
	}
}
