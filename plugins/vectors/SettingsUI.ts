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
			.absolutium-settings-cog {
				margin-right: 10px;
			}
			.absolutium-settings-toggle {
				border-bottom: 1px dashed gray;
				cursor: pointer;
			}
			.absolutium-settings {
				border-bottom: 1px solid #666;
				padding-bottom: 10px;
			}
			.absolutium-settings-block {
				display: flex;
				flex-direction: column;
			}
			.absolutium-range-input {
				display: flex;
				align-items: center;
			}
			.absolutium-range-input input {
				margin-left: 10px;
				flex-grow: 1;
			}
			.absolutium-range-input span {
				margin-left: 10px;
			}
		</style>
		<span class="absolutium-settings-cog">⚙</span>
		<span class="absolutium-settings-toggle" onclick=${() => setOpen((v) => !v)}>Settings</span>
		${open &&
		html`
			<div class="absolutium-settings">
				<div class="absolutium-settings-block">
					<div>Energy to send</div>
					<div class="absolutium-range-input">
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
					<div class="absolutium-range-input">
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
			</div>
		`}
	`;
};
