import { SETTINGS_STORAGE_KEY } from "plugins/vectors/constants";

type SettingsState = {
	open: boolean;
	defaultMinEnergyPercent: number;
	defaultMaxEnergyPercent: number;
};

export class Settings {
	private _open: boolean;
	private _defaultMinEnergyPercent = 20;
	private _defaultMaxEnergyPercent = 80;

	constructor() {
		const { open, defaultMinEnergyPercent, defaultMaxEnergyPercent } = JSON.parse(
			localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}"
		) as SettingsState;

		this._open = open || false;
		this._defaultMinEnergyPercent = defaultMinEnergyPercent || 20;
		this._defaultMaxEnergyPercent = defaultMaxEnergyPercent || 80;
	}

	get open() {
		return this._open;
	}

	set open(value) {
		this._open = value;
		this.saveState();
	}

	get defaultMinEnergyPercent() {
		return this._defaultMinEnergyPercent;
	}

	set defaultMinEnergyPercent(value) {
		this._defaultMinEnergyPercent = value;
		this.saveState();
	}

	get defaultMaxEnergyPercent() {
		return this._defaultMaxEnergyPercent;
	}

	set defaultMaxEnergyPercent(value) {
		this._defaultMaxEnergyPercent = value;
		this.saveState();
	}

	private saveState() {
		localStorage.setItem(
			SETTINGS_STORAGE_KEY,
			JSON.stringify({
				open: this._open,
				defaultMinEnergyPercent: this._defaultMinEnergyPercent,
				defaultMaxEnergyPercent: this._defaultMaxEnergyPercent,
			})
		);
	}
}
