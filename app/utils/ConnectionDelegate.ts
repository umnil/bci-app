import * as dialogs from 'tns-core-modules/ui/dialogs';
let bluetooth = require('nativescript-bluetooth');


class ConnectionManager {

	// Class Properties
	private inputDeviceManager: object = {};
	private outputDeviceManager: object = {};
	obtainedData: string = '';

	peripheralUUID: string = '';
	
	// Methods
	async checkBluetooth(): Promise<boolean> {
		let enabled: boolean = await bluetooth.isBluetoothEnabled();
		console.log(`enabled 1: ${enabled}`);
		while(!enabled) {
			await dialogs.alert("Your bluetooth device is off. Please turn it on.");
			enabled = await bluetooth.isBluetoothEnabled();
			console.log(`enabled 2: ${enabled}`);
		}
		console.log(`enabled 3: ${enabled}`);
		return true;
	}

	async connect(): Promise<boolean> {
		// TODO: Complete the connection process
		return true;
	}

	async updateDeviceSettings(): Promise<void> {
		// TODO: query the peripheral for settings
		return;
	}

	async getDeviceSettings(): Promise<any> {
		await this.updateDeviceSettings();
		return [
			this.inputDeviceManager,
			this.outputDeviceManager
		];
	}

};

export default new ConnectionManager();
