import * as dialogs from 'tns-core-modules/ui/dialogs';
let bluetooth = require('nativescript-bluetooth');


class ConnectionManager {

	// Class Properties
	obtainedData: string = '';
	peripheralUUID: string = '';
	isConnected: boolean = false;
	status: string = "";
	scannedDevices: any[] = [];
	initialized: boolean = false;
	
	// Methods
	async init(): Promise<void> {
		if(this.initialized) return;
		this.initialized = true;
		// Check Bluetooth
		await this.checkBluetooth();

		// Scan
		await this.scan();

		// Connect
		// Register Notify!
	}

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

	async scan(): Promise<boolean> {
		console.log("Scanning");

		let handleDiscovery = (peripheral) => {
			console.log(peripheral);
			let potentialDevice = this.scannedDevices.filter( device => device['UUID']==peripheral['UUID'] );
			let deviceFound = potentialDevice.length > 0;
			if ( !deviceFound ) {
				peripheral['name'] = peripheral['name'] ? peripheral['name'] : 'Unknown';
				this.scannedDevices.push(peripheral);
			}
			else {
				let device = potentialDevice[0];
				let deviceIndex = this.scannedDevices.indexOf(device);
				this.scannedDevices[deviceIndex] = peripheral;
				this.scannedDevices[deviceIndex]['name'] = this.scannedDevices[deviceIndex]['name'] ? this.scannedDevices[deviceIndex]['name'] : 'Unknown';
			}
			this.scannedDevices.sort( (a, b) => b['RSSI'] - a['RSSI'] );
		};

		let scanningOptions = {
			seconds: 5,
			serviceUUIDs: [],
			onDiscovered: handleDiscovery
		};

		let scanSuccessful: Promise < boolean > = new Promise < boolean > ((resolve) => {
			console.log('bluetooth.startScanning');
			bluetooth.startScanning(scanningOptions).then(
				(result) => {
					resolve(true);
				}, (err) => {
					//this.bluetooth_message = err;
					dialogs.alert(`Failed to scan: ${err}`);
					resolve(false);
				});
		});
		return await scanSuccessful;
	}

	async connect(): Promise<boolean> {
		// TODO: Complete the connection process
		return true;
	}

	async updateDeviceSettings(): Promise<void> {
		// TODO: query the peripheral for settings
		return;
	}
};

export default new ConnectionManager();
