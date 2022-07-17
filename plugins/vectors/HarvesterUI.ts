import { html, useEffect, useState } from "https://unpkg.com/htm/preact/standalone.module.js";
import { Harvester } from "./Harvester";

export const HarvesterUI = ({ harvester }: { harvester: Harvester }) => {
	return html`
		<style>
			.harvester {
				margin-right: 10px;
			}
		</style>

		<div class="harvester"></div>
	`;
};
