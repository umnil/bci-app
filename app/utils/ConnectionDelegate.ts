import * as appSettings from 'tns-core-modules/application-settings';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import BLEStream from './blestream/BLEStream';

export enum ConnectionStatus {
	Disconnected = "Disconnected",
	Connecting = "Connecting",
	Connected = "Connected"
}

export enum ScanningStatus {
	NotScanning = "Not Scanning",
	Scanning = "Scanning"
}

export enum ECOGLINKStatus {
	Unavailable = "Unavailable",
	Available = "Available",
	Linked = "Linked"
}

export default class ConnectionManager {

	// Class Properties
	private _isEcoglinkAvailable: boolean = false;
	private blueooth: BLEStream = new BLEStream();

	// Status and States
	initialized: boolean = false;
	scanningStatus: ScanningStatus = ScanningStatus.NotScanning;
	connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;
	private _ecoglinkStatus: ECOGLINKStatus = ECOGLINKStatus.Unavailable;
	isNotifying: boolean = false;

	// collections
	scannedDevices: any[] = [];

	// Values
	selectedDevice: any = {};

	// BLE Service and Characteristic UUIDs
	target_service_UUID: string = "A07498CA-AD5B-474E-940D-16F1FBE7E8CD";
	device_settings_UUID: string = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B";
	notify_char_UUID: string = "E62A479C-5184-4AEE-B2D8-C4ADCED4E0F3";

	// ========OLD========

	obtainedData: string = '';
	peripheralUUID: string = '';
	device_settings: any = {};
	
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
		let enabled: boolean = await this.bluetooth.isBluetoothEnabled();

		while(!enabled) {
			await dialogs.alert("Your bluetooth device is off. Please turn it on.");
			enabled = await bluetooth.isBluetoothEnabled();
		}
		return true;
	}

	async scan(timeout: number = 5): Promise<boolean> {
		if(this.scanningStatus == ScanningStatus.Scanning) return;

		this.scanningStatus = ScanningStatus.Scanning

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
		this.scanningStatus = scanningStatus.NotScanning;
		return result;
	}

	async connect(peripheral: any): Promise<boolean> {
		if(this.connectionStatus == ConnectionStatus.Connecting) return;
		
		this.connectionStatus = ConnectionStatus.Connecting;
		let done: boolean = false;

		let handleConnection = (peripheral) => {
			this.log(peripheral);
			this.log('Connected');

			this.selectedDevice = peripheral;
			this.connectionStatus = ConnectionStatus.Connected;
			done = true;
		};

		let handleDisconnection = () => {
			this.selectedDevice = {};
			this.log('Disconnected');
			this.connectionStatus = ConnectionStatus.Disconnected;
			done = true;
		};

		let connectData = {
			UUID: peripheral['UUID'],
			onConnected: handleConnection,
			onDisconnected: handleDisconnection
		};

		this.log(`Connecting...`);
		await bluetooth.connect(connectData);

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
			this.ecoglinkStatus = ECOGLINKStatus.Available;
		}
		
		return true;
	}

	async disconnect(): Promise<boolean> {
		this.log(this.connectionStatus);
		this.log(this.selectedDevice);
		let connectionOptions = {
			UUID: this.selectedDevice['UUID']
		};

		let disconnect: Promise<boolean> = new Promise<boolean>((resolve) => {
			bluetooth.disconnect(connectionOptions).then(()=>{
				this.connectionStatus = ConnectionStatus.Disconnected;
				this.isNotifying = false;
				this.ecoglinkStatus = ECOGLINKStatus.Unavailable;
				resolve(true);
			}, (err)=>{
				resolve(false);
			});
		});
		return await disconnect;
	}

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
		this.bluetooth.read(this.deviceSettingOptions).then((result) => {
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

	get ecoglinkStatus(): ECOGLINKStatus {
		return this._ecoglinkStatus;
	}

	set ecoglinkStatus(value: ECOGLINKStatus) {
		this._ecoglinkStatus = value;

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

		if(this.ecoglinkStatus != ECOGLINKStatus.Unavailable) {
			this.getInitialValue();
			bluetooth.startNotifying(notifyOptions)
				.then(() => {
					this.isNotifying = true;
				})
		}
		else {
			bluetooth.stopNotifying(notifyOptions)
				.then(() => {
					this.isNotifying = false;
				}, (err) => {
					dialogs.alert(err);
				});
		}
	}
};
