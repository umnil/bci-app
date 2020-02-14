import connectionDelegate from './ConnectionDelegate';

class DeviceSettings {

	inputDeviceSettings: any = {};
	outputDeviceSettings: any = {};
	initialized: boolean = false;

	// Methods
	async init(): Promise<void> {
		if(this.initialized) return;
		this.initialized = true;
		await connectionDelegate.init();
	}

	async getInputDeviceSettings(): Promise<any> {
		return await this.getDeviceSettings(false);
	}

	async getOuputDeviceSettings(): Promise<any> {
		return await this.getDeviceSettings(true);
	}

	private async getDeviceSettings(output: boolean): Promise<any> {
		console.log("DeviceSettings: Obtaining device settings");
		let result: any = output ? this.outputDeviceSettings : this.inputDeviceSettings;

		if(Object.keys(result).length == 0) {
			result['selected_device'] = 'Disconnected';
		}

		return result;

	}
}

export default new DeviceSettings();
