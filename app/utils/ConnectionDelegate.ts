import * as dialogs from 'tns-core-modules/ui/dialogs';
let bluetooth = require('nativescript-bluetooth');


class ConnectionManager {

	// Class Properties
	inputDeviceManager: object = {};
	outputDeviceManager: object = {};
	obtainedData: string = '';
	
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
};

export default new ConnectionManager();
