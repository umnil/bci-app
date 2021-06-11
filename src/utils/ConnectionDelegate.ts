import * as appSettings from '@nativescript/core/application-settings';
import * as dialogs from '@nativescript/core/ui/dialogs';
import { BLEStream } from './blestream/BLEStream';
import { ReadResult } from '@nativescript-community/ble';
import DataUtil from './blestream/DataUtil';

export default class ConnectionDelegate {

	// Class Properties
	private dataUtility: DataUtil = new DataUtil();
	private bluetooth: BLEStream = new BLEStream();
	textlog: string = "";

	// Connection States
	private initialized: boolean = false;
	private isScanning: boolean = false;
	private done_connecting: boolean = false;
	private isConnecting: boolean = false;
	private isConnected: boolean = false
	private _isEcoglinkAvailable: boolean = false;
	private isNotifying: boolean = false;
	private connectingTimeout: number = 10;
	private intentionalDisconnect: boolean = false;

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
	calibration_char_UUID: string = "E58AC8E3-615A-45C4-A96B-590F64D3492A";
	sys_ctrl_char_UUID: string = "2389DB49-5CA4-443F-8EC8-55DB9AC79143";
	nascar_data_char_UUID: string = "426C55A0-C06A-44C5-BFE6-23275A982549";

	calibration_callback: (any)=>void;

	// Settings
	reconnectAttempts: number = appSettings.getNumber("reconnectAttempts", 5);
	private _ra: number = this.reconnectAttempts;
	
	// Methods

	async init(): Promise<void> {
		if(this.initialized) return;
		this.initialized = true;
		await this.scan();
	}

	log: (message: any) => void = (message: any) => {console.log("BLE Connection: ", message);this.textlog = `${JSON.stringify(message)}\n${this.textlog}`;};

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
			//this.log(peripheral);
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
			serviceUUIDs: [this.target_service_UUID],
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
		this.done_connecting = false;

		let handleConnection = (peripheral) => {
			this.log(peripheral);
			this.log('Connected');

			this.selectedPeripheral = peripheral;
			this.isConnected = true;
			this.done_connecting = true;
		};

		let handleDisconnection = () => {
			this.selectedPeripheral = {};
			this.log('Disconnected');
			this.isConnected = false;
			this.done_connecting = true;
			if(!this.intentionalDisconnect) {
				this.reconnect();
			}
		};

		let connectData = {
			UUID: peripheral['UUID'],
			onConnected: handleConnection,
			onDisconnected: handleDisconnection
		};

		this.log(`Connecting...`);
		this.bluetooth.connect(connectData).then(()=>{
			this.log(`Connecting: Success!`);
		}, (err)=>{
			this.log(`Error connecting! ${err}`);
		});

		const startTimer: number = Date.now();
		while (!this.done_connecting) {
			let curTimer: number = Date.now();
			let dt: number = curTimer - startTimer;
			let isTimedout: boolean = dt >= this.connectingTimeout*1000;
			if(isTimedout) {
				this.log("Connection timeout...");
				await this.disconnect();
				return false;
			}
			await new Promise<void>(resolve => setTimeout(resolve, 10))
		}

		// Now check that we succesfully connected
		if(!this.isConnected) return false;

		appSettings.setString("peripheral", JSON.stringify(peripheral));

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
		this.done_connecting = false;
		this.log(this.selectedPeripheral);
		let connectionOptions = {
			UUID: this.selectedPeripheral['UUID']
		};

		this.intentionalDisconnect = true;
		let disconnect: Promise<boolean> = new Promise<boolean>((resolve) => {
			this.bluetooth.disconnect(connectionOptions).then(()=>{
				this.selectedPeripheral = {};
				this.isConnected = false;
				this.isConnecting = false;
				this.isNotifying = false;
				this.isEcoglinkAvailable = false;
				this.intentionalDisconnect = false;
				resolve(true);
			}, (err)=>{
				this.selectedPeripheral = {};
				this.isConnected = false;
				this.isConnecting = false;
				this.isNotifying = false;
				this.isEcoglinkAvailable = false;
				this.intentionalDisconnect = false;
				resolve(true);
				resolve(false);
			});
		});

		return await disconnect;
	}

	async reconnect(): Promise<void> {
		if(this._ra <= 0) return;
		this.log(`Attempting to reconnect (${this._ra})`);
		let lastPeripheralJSON: string = appSettings.getString("peripheral", "");
		if(lastPeripheralJSON != "") {
			let peripheral: any = JSON.parse(lastPeripheralJSON);
			let result: boolean = await this.connect(peripheral);
			if(result == true) {
				this._ra = this.reconnectAttempts;
			}
			else {
				this._ra--;
				return this.reconnect();
			}
		}
	}

	async readDeviceSettings(): Promise<void> {
		this.log("Reading Device Settings");
		return this.bluetooth.streamRead(this.deviceSettingRequestOptions).then(
			(result: ReadResult) => {
				this.updateDeviceSettings(result);
			},
			(err) => {
				this.log(`Failed to read device settings| ${err}`);
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

	handleCalibrationUpdate(result: ReadResult): void {
		let data: any = this.dataUtility.arraybuffer2obj(result.value);
		this.calibration_callback(data);
	}

	async setInputDeviceData(inputDevicesData: any): Promise<void> {
		this.device_data.inputdevices = inputDevicesData;
		await this.writeDeviceData();

		// reload
		await this.readDeviceSettings();
	}

	async setOutputDeviceData(outputDeviceData: any): Promise<void> {
		this.device_data.outputdevices = outputDeviceData;
		await this.writeDeviceData();

		// reload
		await this.readDeviceSettings();
	}

	async writeDeviceData(): Promise<void> {
		let writeObj: any = this.deviceSettingRequestOptions;
		writeObj['value'] = this.dataUtility.value2hex(this.device_data);
		await this.bluetooth.streamWrite(writeObj);
	}

	async writeSysCtrl(cmd: string): Promise<void> {
		let writeObj: any = this.sysCtrlRequestOptions;
		writeObj['value'] = JSON.stringify(cmd); // this.dataUtility.str2hex(cmd);
		await this.bluetooth.write(writeObj).then(
			()=>this.log("writeSysCtrl: Success"),
			(err)=>this.log(`writeSysCtrl: Error | ${err}`)
		);
		this.readDeviceSettings();
	}

	async writeNascarData(data: any): Promise<void> {
		let writeObj: any = this.nascarDataRequestOptions;
		writeObj['value'] = JSON.stringify(data);
		await this.bluetooth.write(writeObj).then(
			()=>this.log("NASCAR DATA WRITE: Success"),
			(err)=>this.log(`NASCAR DATA WRITE: Error | ${err}`)
		);
	}

	async calibrationSubscribe(cb: (any)=>void): Promise<void> {
		this.calibration_callback = cb;
		let requestOptions: any = this.standardRequestOptions;
		requestOptions['characteristicUUID'] = this.calibration_char_UUID;
		requestOptions['onNotify'] = this.handleCalibrationUpdate.bind(this);
		await this.bluetooth.startNotifying(requestOptions).then(()=>{
			this.log("Calibration Subscribed!");
		}, (err)=>{
			this.log(`Calibration Subscription error: ${err}`);
		});
	}

	async readSysCtrl(): Promise<boolean> {
		this.log("readSysCtrl");
		let result: boolean = false;
		let readObj: any = this.sysCtrlRequestOptions;
		let r: any = await this.bluetooth.read(readObj).then((rslt: any)=>{
			result = true;
			return rslt;
		},(err)=>{
			result = false;
			this.log(`ReadNotify ERR: ${err}`);
			this.isEcoglinkAvailable = false;
		});
		this.log(`Read Sys Ctrl: ${result}`);

		return result;
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

	get sysCtrlRequestOptions(): any {
		let options: any = this.standardRequestOptions;
		options['characteristicUUID'] = this.sys_ctrl_char_UUID;
		return options;
	}

	get nascarDataRequestOptions(): any {
		let options: any = this.standardRequestOptions;
		options['characteristicUUID'] = this.nascar_data_char_UUID;
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
			this.readDeviceSettings();
			this.bluetooth.startNotifying(notifyOptions)
				.then(() => {
					this.isNotifying = true;
				}, (err) => {
					this.log(`ERR: ${err}`);
				});
		}
		else {
			if(!this.isNotifying) return;
			this.bluetooth.stopNotifying(notifyOptions)
				.then(() => {
					this.isNotifying = false;
				}, (err) => {
					this.isNotifying = false;
					this.log(`notify err: ${err}`);
				});
			this.device_data = {};
		}
	}
};
