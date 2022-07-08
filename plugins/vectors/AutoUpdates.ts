import { isUnconfirmedUpgradeTx } from "@darkforest_eth/serde";
import { PlanetType } from "@darkforest_eth/types";

import { AUTO_UPDATES_INTERVAL } from "./constants";
import { Utils } from "./Utils";

export class AutoUpdates {
	private interval: NodeJS.Timer;

	constructor() {
		this.interval = setInterval(() => this.loop(), AUTO_UPDATES_INTERVAL);
	}

	destroy() {
		clearInterval(this.interval);
	}

	private loop() {
		df.getMyPlanets()
			.filter((p) => p.planetType === PlanetType.PLANET)
			.filter((p) => !p.transactions?.getTransactions(isUnconfirmedUpgradeTx).length)
			.forEach((p) => {
				const rank = Utils.getPlanetRank(p);
				const silverPerRank = Utils.getSilverPerRank(p);
				if (silverPerRank[0] && p.silver >= silverPerRank[0]) {
					df.upgrade(p.locationId, rank < 4 ? 1 : 2);
				}
			});
	}
}
