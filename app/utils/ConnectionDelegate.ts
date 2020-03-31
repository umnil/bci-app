import * as appSettings from 'tns-core-modules/application-settings';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { BLEStream } from './blestream/BLEStream';
import { ReadResult } from 'nativescript-bluetooth';
import DataUtil from './blestream/DataUtil';

export default class ConnectionDelegate {

	// Class Properties
	private dataUtility: DataUtil = new DataUtil();
	private bluetooth: BLEStream = new BLEStream();

	// Connection States
	private initialized: boolean = false;
	private isScanning: boolean = false;
	private isConnecting: boolean = false;
	private isConnected: boolean = false
	private _isEcoglinkAvailable: boolean = false;
	private isNotifying: boolean = false;

	// collections
	scannedPeripherals: any[] = [];

	// Values
	selectedPeripheral: any = {};
	peripheralUUID: string = '';
	device_data: any = {};

	// BLE Service and Characteristic UUIDs
	target_service_UUID: string = "a07498ca-ad5b-474e-940d-16f1fbe7e8cd";
	device_data_UUID: string = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B";
	notify_char_UUID: string = "E62A479C-5184-4AEE-B2D8-C4ADCED4E0F3";

	// Methods
	async init(): Promise<void> {
		if(this.initialized) return;
		this.initialized = true;
		await this.scan();
	}

	log: (message: any) => void = console.log.bind(console, "BLE Connection: ");

	async checkBluetooth(): Promise<boolean> {
		let enabled: boolean = await this.bluetooth.isBluetoothEnabled();

		while(!enabled) {
			await dialogs.alert("Your bluetooth device may be off. Please turn it on.");
			enabled = await this.bluetooth.isBluetoothEnabled();
		}
		return true;
	}

	async scan(timeout: number = 5): Promise<boolean> {
		if(this.isScanning) return;

		this.isScanning = true;

		let handleDiscovery = (peripheral) => {
			this.log(peripheral);
			let potentialPeripheral = this.scannedPeripherals.filter( device => device['UUID']==peripheral['UUID'] );
			let peripheralFound = potentialPeripheral.length > 0;
			if ( !peripheralFound ) {
				peripheral['name'] = peripheral['name'] ? peripheral['name'] : 'Unknown';
				this.scannedPeripherals.push(peripheral);
			}
			else {
				let curPeripheral = potentialPeripheral[0];
				let peripheralIndex = this.scannedPeripherals.indexOf(curPeripheral);
				this.scannedPeripherals[peripheralIndex] = peripheral;
				this.scannedPeripherals[peripheralIndex]['name'] = this.scannedPeripherals[peripheralIndex]['name'] ? this.scannedPeripherals[peripheralIndex]['name'] : 'Unknown';
			}
			this.scannedPeripherals.sort( (a, b) => b['RSSI'] - a['RSSI'] );
		};

		let scanningOptions = {
			seconds: timeout,
			serviceUUIDs: [],
			onDiscovered: handleDiscovery
		};

		let scanSuccessful: Promise < boolean > = new Promise < boolean > ((resolve) => {
			this.log('bluetooth.startScanning');
			this.bluetooth.startScanning(scanningOptions).then(
				(result) => {
					resolve(true);
				},
				async function(err) {
					await dialogs.alert(`Failed to scan: ${err}`);
					resolve(false);
				});
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

			this.selectedPeripheral = peripheral;
			this.isConnected = true;
			done = true;
		};

		let handleDisconnection = () => {
			this.selectedPeripheral = {};
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
		await this.bluetooth.connect(connectData);

		while (!done) {
			await new Promise<void>(resolve => setTimeout(resolve, 10))
		}

		appSettings.setString("UUID", peripheral['UUID']);

		// Now check for appropriate services
		let services: any[] = this.selectedPeripheral.services;
		let ecoglinkService: any[] = services.filter(s => {
			this.log(`Service: ${s.UUID}`);
			return s.UUID == this.target_service_UUID
		});

		if(ecoglinkService.length > 0) {
			this.isEcoglinkAvailable = true;
		}
		
		this.isConnecting = false;
		return true;
	}

	async disconnect(): Promise<boolean> {
		this.log(this.selectedPeripheral);
		let connectionOptions = {
			UUID: this.selectedPeripheral['UUID']
		};

		let disconnect: Promise<boolean> = new Promise<boolean>((resolve) => {
			this.bluetooth.disconnect(connectionOptions).then(()=>{
				this.isConnected = false;
				this.isConnecting = false;
				this.isNotifying = false;
				this.isEcoglinkAvailable = false;
				resolve(true);
			}, (err)=>{
				resolve(false);
			});
		});

		return await disconnect;
	}

	private getInitialValue(): void {
		this.log("Getting Initial Value!");
		this.bluetooth.streamRead(this.deviceSettingRequestOptions).then(
			(result: ReadResult) => {
				this.updateDeviceSettings(result);
			}
		);
	}

	private updateDeviceSettings(result: ReadResult): void {
		this.device_data = this.dataUtility.arraybuffer2obj(result.value);
	}

	private handleNotifyUpdate(result: ReadResult): void {
		this.log("NOTIFIED!");
		this.updateDeviceSettings(result);
	}

	async setInputDeviceData(inputDevicesData: any): Promise<void> {
		this.device_data.inputdevices = inputDevicesData;
		await this.writeDeviceData();
	}

	async setOutputDeviceData(outputDeviceData: any): Promise<void> {
		this.device_data.outputdevices = outputDeviceData;
		await this.writeDeviceData();
	}

	async writeDeviceData(): Promise<void> {
		let writeObj: any = this.deviceSettingRequestOptions;
		writeObj['value'] = this.dataUtility.value2hex(this.device_data);
		await this.bluetooth.streamWrite(writeObj);
	}

	// Computed Properties
	get standardRequestOptions(): any {
		return {
			'peripheralUUID': this.selectedPeripheral['UUID'],
			'serviceUUID': this.target_service_UUID,
		};
	}

	get deviceSettingRequestOptions(): any {
		let options: any = this.standardRequestOptions;
		options['characteristicUUID'] = this.device_data_UUID;
		return options;
	}

	get notifyCharRequestOptions(): any {
		let options: any = this.standardRequestOptions;
		options['characteristicUUID'] = this.notify_char_UUID;
		return options;
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

	get ecoglinkAvailableStatus(): string {
		return this.isEcoglinkAvailable ? "Available" : "Unavailable";
	}
	
	get notifyStatus(): string {
		return this.isNotifying ? "Notifying" : "Not Notifying";
	}

	get status(): string {
		if(this.isScanning) return this.scanningStatus;
		else if(this.isConnecting) return this.connectingStatus;
		else return this.connectionStatus;
	}

	get inputDevices(): any {
		let result: any = {};
		if(this.device_data.hasOwnProperty('inputdevices')) {
			result = this.device_data['inputdevices']
		}
		return result;
	}

	get outputDevices(): any {
		let result: any = {};
		if(this.device_data.hasOwnProperty('outputdevices')) {
			result = this.device_data['outputdevices'];
		}
		return result
	}

	private get isEcoglinkAvailable(): boolean {
		return this._isEcoglinkAvailable;
	}

	private set isEcoglinkAvailable(value: boolean) {
		this._isEcoglinkAvailable = value;
		this.notify();
	}

	// Watch
	notify(): void {
		let notifyOptions: any = this.notifyCharRequestOptions;
		notifyOptions['onNotify'] = this.handleNotifyUpdate.bind(this);

		if(this.isEcoglinkAvailable) {
			this.getInitialValue();
			this.bluetooth.startNotifying(notifyOptions)
				.then(() => {
					this.isNotifying = true;
				})
		}
		else {
			if(!this.isNotifying) return;
			this.bluetooth.stopNotifying(notifyOptions)
				.then(() => {
					this.isNotifying = false;
				}, (err) => {
					dialogs.alert(err);
				});
		}
	}
};
