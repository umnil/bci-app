import * as appSettings from 'tns-core-modules/application-settings';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import BLEStream from './BLEStream';
let bluetooth = require('nativescript-bluetooth');


class ConnectionManager {

	// Class Properties
	private _isEcoglinkAvailable: boolean = false;

	obtainedData: string = '';
	peripheralUUID: string = '';
	isConnected: boolean = false;
	isConnecting: boolean = false;
	isNotifying: boolean = false;
	status: string = "Disconnected";
	ecoglinkStatus: string = "Offline";
	scannedDevices: any[] = [];
	selectedDevice: any = {};
	initialized: boolean = false;
	device_settings: any = {};

	target_service_UUID: string = "A07498CA-AD5B-474E-940D-16F1FBE7E8CD";
	device_settings_UUID: string = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B";
	notify_char_UUID: string = "E62A479C-5184-4AEE-B2D8-C4ADCED4E0F3";

	stream: BLEStream = new BLEStream();
	
	// Methods
	async init(): Promise<void> {
		if(this.initialized) return;
		this.initialized = true;
		// Check Bluetooth
		await this.checkBluetooth();
		// Scan
		await this.scan();
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

		// Now check for appropriate services
		let services: any[] = this.selectedDevice.services;
		let ecoglinkService: any[] = services.filter(s => {
			console.log(s.UUID);
			return s.UUID == this.target_service_UUID
		});
		if(ecoglinkService.length > 0) {
			this.isEcoglinkAvailable = true;
			this.ecoglinkStatus = "Available";
		}
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
				this.isNotifying = false;
				this.isConnecting = false;
				this.ecoglinkStatus = "Unavailable";
				resolve(true);
			}, (err)=>{
				resolve(false);
			});
		});
		return await disconnect;
	}

	async writeDeviceSettings(): Promise<void> {
		let writeObj: any = this.deviceSettingOptions;
		await this.stream.writer(this.device_settings, writeObj);
	}

	async setInputSettings(inputDevices: any): Promise<void> {
		this.device_settings.inputdevices = inputDevices;
		await this.writeDeviceSettings();
	}

	async setOutputSettings(outputDevices: any): Promise<void> {
		this.device_settings.outputdevices = outputDevices;
		await this.writeDeviceSettings();
	}

	async dataUpdate(result: any): Promise<void> {
		console.log("NOTIFIED!");
		await this._dataUpdate(result);
	}

	async _dataUpdate(result: any): Promise<void> {
		console.log("Calling for data update");
		await this.stream.receiver(result, this.deviceSettingOptions);
		this.device_settings = this.stream.data;
		console.log(`UPDATE: ${this.device_settings}`)
	}

	getInitialValue(): void {
		bluetooth.read(this.deviceSettingOptions).then((result) => {
			this._dataUpdate(result);
		}, (err) => {
			console.log(`OH NO`);
		});
	}

	// Computed Properties
	get serviceDeviceOptions(): any {
		let sco: any = {
			'peripheralUUID': this.selectedDevice['UUID'],
			'serviceUUID': this.target_service_UUID,
		};
		return sco;
	}

	get deviceSettingOptions(): any {
		let options: any = this.serviceDeviceOptions;
		options['characteristicUUID'] = this.device_settings_UUID;
		return options;
	}

	get notifySettingOptions(): any {
		let options: any = this.serviceDeviceOptions;
		options['characteristicUUID'] = this.notify_char_UUID;
		return options;
	}

	get connectionStatus(): string {
		return this.isConnected ? "Connected" : "Disconnected";
	}

	get isEcoglinkAvailable(): boolean {
		return this._isEcoglinkAvailable;
	}

	set isEcoglinkAvailable(value: boolean) {
		this._isEcoglinkAvailable = value;

		// Watches
		this.notify();
	}

	get inputDevices(): any {
		let result: any = {};
		if(this.device_settings.hasOwnProperty('inputdevices')) {
			result = this.device_settings['inputdevices']
		}
		return result;
	}

	get outputDevices(): any {
		let result: any = {};
		if(this.device_settings.hasOwnProperty('outputdevices')) {
			result = this.device_settings['outputdevices'];
		}
		return result
	}

	// Watch
	notify(): void {
		let notifyOptions: any = this.notifySettingOptions;
		notifyOptions['onNotify'] = this.dataUpdate.bind(this);

		if(this.isEcoglinkAvailable) {
			this.getInitialValue();
			bluetooth.startNotifying(notifyOptions)
				.then(() => {
					this.isNotifying = true;
					this.ecoglinkStatus = "Synchronized";
				})
		}
		else {
			bluetooth.stopNotifying(notifyOptions)
				.then(() => {
					this.isNotifying = false;
					this.ecoglinkStatus = "Disynchronized";
				}, (err) => {
					dialogs.alert(err);
				});
		}
	}
};

let connectionManager = new ConnectionManager();
export default connectionManager;
