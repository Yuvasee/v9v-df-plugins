import { html, useEffect, useState } from "https://unpkg.com/htm/preact/standalone.module.js";
import { Settings } from "./Settings";

export const SettingsUI = ({ settings }: { settings: Settings }) => {
	const [open, setOpen] = useState(settings.open);
	const [minEnergy, setMinEnergy] = useState(settings.defaultMinEnergyPercent);
	const [maxEnergy, setMaxEnergy] = useState(settings.defaultMaxEnergyPercent);

	useEffect(() => {
		if (minEnergy >= maxEnergy) {
			setMinEnergy(maxEnergy - 1);
			return;
		}
		settings.defaultMinEnergyPercent = Number(minEnergy);
	}, [minEnergy]);

	useEffect(() => {
		if (maxEnergy <= minEnergy) {
			setMaxEnergy(minEnergy + 1);
			return;
		}
		settings.defaultMaxEnergyPercent = Number(maxEnergy);
	}, [maxEnergy]);

	return html`
		<style>
			.vectors-settings-cog {
				margin-right: 10px;
			}
			.vectors-settings-toggle {
				border-bottom: 1px dashed gray;
				cursor: pointer;
			}
			.vectors-settings-block {
				display: flex;
				flex-direction: column;
			}
			.vectors-range-input {
				display: flex;
				align-items: center;
			}
			.vectors-range-input input {
				margin-left: 10px;
				flex-grow: 1;
			}
			.vectors-range-input span {
				margin-left: 10px;
			}
		</style>

		<span class="vectors-settings-cog">⚙</span>
		<span class="vectors-settings-toggle" onclick=${() => setOpen((v) => !v)}>Settings</span>

		${open &&
		html`
			<div class="vectors-settings-block">
				<div>Energy to send</div>

				<div class="vectors-range-input">
					min
					<input
						type="range"
						min="1"
						max="40"
						value=${minEnergy}
						onchange=${(e: any) => setMinEnergy(e.target.value)}
					/>
					<span>${minEnergy}</span>
				</div>

				<div class="vectors-range-input">
					max
					<input
						type="range"
						min="60"
						max="99"
						value=${maxEnergy}
						onchange=${(e: any) => setMaxEnergy(e.target.value)}
					/>
					<span>${maxEnergy}</span>
				</div>
			</div>
		`}
	`;
};
