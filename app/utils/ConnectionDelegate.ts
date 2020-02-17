import * as appSettings from 'tns-core-modules/application-settings';
import * as dialogs from 'tns-core-modules/ui/dialogs';
let bluetooth = require('nativescript-bluetooth');


class ConnectionManager {

	// Class Properties
	obtainedData: string = '';
	peripheralUUID: string = '';
	isConnected: boolean = false;
	isConnecting: boolean = false;
	status: string = "Disconnected";
	scannedDevices: any[] = [];
	selectedDevice: any = {};
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

	async scan(timeout: number = 5): Promise<boolean> {
		this.status = "Scanning";
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
			seconds: timeout,
			serviceUUIDs: [],
			onDiscovered: handleDiscovery
		};

		let scanSuccessful: Promise < boolean > = new Promise < boolean > ((resolve) => {
			console.log('bluetooth.startScanning');
			bluetooth.startScanning(scanningOptions).then(
				(result) => {
					resolve(true);
				},
				async function(err) {

					await dialogs.alert(`Failed to scan: ${err}`);
					resolve(false);
				});
		});
		let result: boolean = await scanSuccessful;
		this.status = this.connectionStatus;
		return result;
	}

	async connect(peripheral: any): Promise<boolean> {
		let done: boolean = false;
		this.isConnecting = true;
		let handleConnection = (peripheral) => {
			console.log(peripheral);
			console.log('Connected');
			this.selectedDevice = peripheral;
			this.isConnected = true;
			this.status = this.connectionStatus;
			done = true;
		};

		let handleDisconnection = () => {
			this.selectedDevice = {};
			console.log('Disconnected');
			this.isConnected = false;
			this.status = this.connectionStatus;
			done = true;
		};

		let connectData = {
			UUID: peripheral['UUID'],
			onConnected: handleConnection,
			onDisconnected: handleDisconnection
		};

		console.log(`Connecting...`);
		this.status = "Connecting...";
		await bluetooth.connect(connectData);

		while (!done) {
			await new Promise<void>(resolve => setTimeout(resolve, 10))
		}

		appSettings.setString("UUID", peripheral['UUID']);
		this.isConnecting = false;
		this.status = this.connectionStatus;
		return true;
	}

	async disconnect(): Promise<boolean> {
		console.log(this.isConnected);
		console.log(this.selectedDevice);
		let connectionOptions = {
			UUID: this.selectedDevice['UUID']
		};

		let disconnect: Promise<boolean> = new Promise<boolean>((resolve) => {
			bluetooth.disconnect(connectionOptions).then(()=>{
				this.isConnected = false;
				resolve(true);
			}, (err)=>{
				resolve(false);
			});
		});
		return await disconnect;
	}

	async updateDeviceSettings(): Promise<void> {
		// TODO: query the peripheral for settings
		return;
	}

	get connectionStatus(): string {
		return this.isConnected ? "Connected" : "Disconnected";
	}
};

let connectionManager = new ConnectionManager();
export default connectionManager;
