import * as appSettings from 'tns-core-modules/application-settings';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import WorkerDelegate from './workers/WorkerDelegate';

export default class ConnectionDelegate {

	// Class Properties
	// private bluetooth: BLEStream = new BLEStream();
	private bluetoothWorker: WorkerDelegate = new WorkerDelegate();

	// Connection States
	private initialized: boolean = false;
	private isScanning: boolean = false;
	private isConnecting: boolean = false;
	private isConnected: boolean = false
	private _isEcoglinkAvailable: boolean = false;
	private isNotifying: boolean = false;

	// collections
	scannedDevices: any[] = [];
	device_settings: any = {};
	workerIDs: string[] = [];

	// Values
	selectedDevice: any = {};
	peripheralUUID: string = '';

	// BLE Service and Characteristic UUIDs
	target_service_UUID: string = "A07498CA-AD5B-474E-940D-16F1FBE7E8CD";
	device_settings_UUID: string = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B";
	notify_char_UUID: string = "E62A479C-5184-4AEE-B2D8-C4ADCED4E0F3";

	// Methods
	async init(): Promise<void> {
		if(this.initialized) return;
		this.initialized = true;
		await this.checkBluetooth();
		await this.scan();
	}

	log(message: string): void {
		console.log(`BLE Connection: ${message}`);
	}

	async checkBluetooth(): Promise<boolean> {
		let enabled: boolean = false; // await this.bluetoothWorker.awaitJob('isBluetoothEnabled', []);

		while(!enabled) {
			await dialogs.alert("Your bluetooth device is off. Please turn it on.");
			//enabled = await this.bluetooth.isBluetoothEnabled();
		}
		return true;
	}

	async scan(timeout: number = 5): Promise<boolean> {
		if(this.isScanning) return;

		this.isScanning = true;

		let handleDiscovery = (peripheral) => {
			this.log(peripheral);
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
			this.log('bluetooth.startScanning');
			// this.bluetooth.startScanning(scanningOptions).then(
			// 	(result) => {
			// 		resolve(true);
			// 	},
			// 	async function(err) {
			// 		await dialogs.alert(`Failed to scan: ${err}`);
			// 		resolve(false);
			// 	});
		});
		let result: boolean = await scanSuccessful;
		this.isScanning = false;
		return result;
	}

	async connect(peripheral: any): Promise<boolean> {
		if(this.isConnecting) return;
		
		this.isConnecting = true;
		let done: boolean = false;

		let handleConnection = (peripheral) => {
			this.log(peripheral);
			this.log('Connected');

			this.selectedDevice = peripheral;
			this.isConnected = true;
			done = true;
		};

		let handleDisconnection = () => {
			this.selectedDevice = {};
			this.log('Disconnected');
			this.isConnected = false;
			done = true;
		};

		let connectData = {
			UUID: peripheral['UUID'],
			onConnected: handleConnection,
			onDisconnected: handleDisconnection
		};

		this.log(`Connecting...`);
		//await this.bluetooth.connect(connectData);

		while (!done) {
			await new Promise<void>(resolve => setTimeout(resolve, 10))
		}

		appSettings.setString("UUID", peripheral['UUID']);

		// Now check for appropriate services
		let services: any[] = this.selectedDevice.services;
		let ecoglinkService: any[] = services.filter(s => {
			this.log(s.UUID);
			return s.UUID == this.target_service_UUID
		});

		if(ecoglinkService.length > 0) {
			this.isEcoglinkAvailable = true;
		}
		
		this.isConnecting = false;
		return true;
	}

	async disconnect(): Promise<boolean> {
		this.log(this.selectedDevice);
		let connectionOptions = {
			UUID: this.selectedDevice['UUID']
		};

		let disconnect: Promise<boolean> = new Promise<boolean>((resolve) => {
			// this.bluetooth.disconnect(connectionOptions).then(()=>{
			// 	this.isConnected = false;
			// 	this.isNotifying = false;
			// 	this.isEcoglinkAvailable = false;
			// 	resolve(true);
			// }, (err)=>{
			// 	resolve(false);
			// });
		});
		return await disconnect;
	}

	// ======== OLD METHODS ==========

	async writeDeviceSettings(): Promise<void> {
		//let writeObj: any = this.deviceSettingOptions;
		//await this.stream.sendStream(this.device_settings, writeObj);
	}

	async setInputSettings(inputDevices: any): Promise<void> {
		//this.device_settings.inputdevices = inputDevices;
		//await this.writeDeviceSettings();
	}

	async setOutputSettings(outputDevices: any): Promise<void> {
		//this.device_settings.outputdevices = outputDevices;
		//await this.writeDeviceSettings();
	}

	async dataUpdate(result: any): Promise<void> {
		this.log("NOTIFIED!");
		await this._dataUpdate(result);
	}

	async _dataUpdate(result: any): Promise<void> {
		this.log("Calling for data update");
		//await this.stream.receiver(result, this.deviceSettingOptions);
		//this.device_settings = this.stream.data;
		this.log(`UPDATE: ${this.device_settings}`)
	}

	getInitialValue(): void {
		// this.bluetooth.read(this.deviceSettingOptions).then((result) => {
		// 	this._dataUpdate(result);
		// }, (err) => {
		// 	console.log(`OH NO`);
		// });
	}

	// Computed Properties
	private get isEcoglinkAvailable(): boolean {
		return this._isEcoglinkAvailable;
	}

	private set isEcoglinkAvailable(value: boolean) {
		this._isEcoglinkAvailable = value;

		// Watches
		this.notify();
	}

	get scanningStatus(): string {
		return this.isScanning ? "Scanning" : "Not Scanning";
	}

	get connectingStatus(): string {
		return this.isConnecting ? "Connecting" : "Not Connecting";
	}

	get connectionStatus(): string {
		return this.isConnected ? "Connected" : "Disconnected";
	}

	ecoglinkAvailableStatus(): string {
		return this.isEcoglinkAvailable ? "Available" : "Unavailable";
	}
	
	notifyStatus(): string {
		return this.isNotifying ? "Notyfing" : "Not Notifying";
	}

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

	get inputDevices(): any {
		// let result: any = {};
		// if(this.device_settings.hasOwnProperty('inputdevices')) {
		// 	result = this.device_settings['inputdevices']
		// }
		// return result;
		return null;
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
			// this.bluetooth.startNotifying(notifyOptions)
			// 	.then(() => {
			// 		this.isNotifying = true;
			// 	})
		}
		else {
			// this.bluetooth.stopNotifying(notifyOptions)
			// 	.then(() => {
			// 		this.isNotifying = false;
			// 	}, (err) => {
			// 		dialogs.alert(err);
			// 	});
		}
	}
};
