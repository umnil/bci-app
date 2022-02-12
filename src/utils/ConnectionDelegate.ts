import * as appSettings from '@nativescript/core/application-settings';
import * as dialogs from '@nativescript/core/ui/dialogs';
//import { BLEStream } from './blestream/BLEStream';
import { Bluetooth, Peripheral, Service } from 'nsblestream';
import { ReadResult } from '@nativescript-community/ble';
import DataUtil from './blestream/DataUtil';
import * as utils from './data';
import { ConnectionState } from '../enums/ConnectionState';

export default class ConnectionDelegate {

	// Class Properties
	private dataUtility: DataUtil = new DataUtil();
	private bluetooth: Bluetooth = new Bluetooth();
	textlog: string = "";

	// Connection States
	private initialized: boolean = false;
	private isScanning: boolean = false;
	private connectionState: ConnectionState = ConnectionState.disconnected;
	private _isPrimaryServiceAvailable: boolean = false;
	private isNotifying: boolean = false;
	private connectingTimeout: number = 10;
	private intentionalDisconnect: boolean = false;

	// collections
	scannedPeripherals: Peripheral[] = [];

	// Values
	selectedPeripheral: Peripheral = null;
	peripheralUUID: string = '';
	device_data: any = {};

	// BLE Service and Characteristic UUIDs
	target_service_UUID: string = "a07498ca-ad5b-474e-940d-16f1fbe7e8cd";
	device_data_UUID: string = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B";
	notify_char_UUID: string = "E62A479C-5184-4AEE-B2D8-C4ADCED4E0F3";
	calibration_char_UUID: string = "E58AC8E3-615A-45C4-A96B-590F64D3492A";
	sys_ctrl_char_UUID: string = "2389DB49-5CA4-443F-8EC8-55DB9AC79143";

	calibration_callback: (any)=>void;

	// Settings
	maxReconnectAttempts: number = appSettings.getNumber("maxReconnectAttempts", 5);
	private reconnectAttempts: number = this.maxReconnectAttempts;
	
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

	/**
	 * connect
	 * The connection work flow when connecting to a peripheral
	 * @param {Peripheral} peripheral - the device to connect to
	 * @returns {boolean} - true if connection was successful
	 */
	async connect(peripheral: Peripheral): Promise<boolean> {
		if(this.connectionState == ConnectionState.connecting) return;

		this.connectionState = ConnectionState.connecting;

		let connectOptions = {
			UUID: peripheral['UUID'],
			autoDiscoverAll: true,
			onConnected: this.onConnect.bind(this),
			onDisconnected: this.onDisconnect.bind(this)
		};

		this.log(`Connecting...`);
		this.bluetooth.connect(connectOptions).then(()=>{
			this.log(`Connecting: Success!`);
		}, (err)=>{
			this.log(`Error connecting! ${err}`);
		});

		// Here we monitor whether the connection was successful by
		// implementing a timeout mechanism
		const startTimer: number = Date.now();
		while (!this.isConnected) {
			let curTimer: number = Date.now();
			let dt: number = curTimer - startTimer;
			let isTimedout: boolean = dt >= this.connectingTimeout*1000;
			if(isTimedout) {
				this.log("Connection timeout...");
				this.disconnect();
				return false;
			}
			await new Promise<void>(resolve => setTimeout(resolve, 10))
		}

		// Now check that we succesfully connected
		if(!this.isConnected) {
			this.connectionState = ConnectionState.disconnected;
			console.error("Something when wrong with establishing a for sure connection");
			return false;
		}

		// Save the ID of the device we connected to for auto connection next
		// time
		appSettings.setString("peripheral", JSON.stringify(peripheral));

		// Now check for appropriate services
		let services: Service[] = this.selectedPeripheral.services;
		let potentialService: Service[] = services.filter(s => {
			this.log(`Service: ${s.UUID}`);
			return s.UUID == this.target_service_UUID
		});

		if(potentialService.length > 0) {
			this.isPrimaryServiceAvailable = true;
		}

		return true;
	}

	/**
	 * onConnect
	 * Process for handing information after a successful connection
	 * @param {Peripheral} peripheral - the peripheral device that was connected to
	 */
	onConnect(peripheral: Peripheral) {
		this.log(`Connected to peripheral: ${peripheral}`);
		this.selectedPeripheral = peripheral;
		this.connectionState = ConnectionState.connected;
	}

	/**
	 * onDisconnected
	 * Handling disconnection if connect fails
	 */
	onDisconnect() {
		this.log('Disconnected');
		this.selectedPeripheral = null;
		this.connectionState = ConnectionState.disconnected;
		if(!this.intentionalDisconnect) {
			// If the user did not explicitly attempt to disconnect, then try
			// to immediately reconnect
			this.reconnect();
		}
	}

	/**
	 * disconnect
	 * Called when the user explicitly wants to disconnect
	 * @returns {boolean} - true if disconnect is successful
	 */
	async disconnect(): Promise<boolean> {
		await this.bluetooth.stopScanning();
		if (this.selectedPeripheral == null) {
			this.selectedPeripheral = null;
			this.connectionState = ConnectionState.disconnected;
			this.isNotifying = false;
			this.isPrimaryServiceAvailable = false;
			this.intentionalDisconnect = false;
		}
		this.log(`Disconnecting from ${this.selectedPeripheral}`);
		let connectionOptions = {
			UUID: this.selectedPeripheral['UUID']
		};

		this.intentionalDisconnect = true;
		let disconnect: Promise<boolean> = new Promise<boolean>((resolve) => {
			this.bluetooth.disconnect(connectionOptions).then(()=>{
				this.selectedPeripheral = null;
				this.connectionState = ConnectionState.disconnected;
				this.isNotifying = false;
				this.isPrimaryServiceAvailable = false;
				this.intentionalDisconnect = false;
				resolve(true);
			}, (err)=>{
				this.log(`Failed to disconnect: ${err}`);
				this.selectedPeripheral = null;
				this.connectionState = ConnectionState.disconnected;
				this.isNotifying = false;
				this.isPrimaryServiceAvailable = false;
				this.intentionalDisconnect = false;
				resolve(true);
				resolve(false);
			});
		});

		return await disconnect;
	}

	/**
	 * reconnect
	 * Attempt to reconnect. This is called during unintential disconnects
	 */
	async reconnect(): Promise<void> {
		if(this.reconnectAttempts <= 0) return;
		this.log(`Attempting to reconnect (${this.reconnectAttempts})`);
		let lastPeripheralJSON: string = appSettings.getString("peripheral", "");
		if(lastPeripheralJSON != "") {
			let peripheral: any = JSON.parse(lastPeripheralJSON);
			let result: boolean = await this.connect(peripheral);
			if(result == true) {
				this.reconnectAttempts = this.maxReconnectAttempts;
			}
			else {
				this.reconnectAttempts--;
				return this.reconnect();
			}
		}
	}

	/**
	 * read
	 * convenience function for reading standard characteristics
	 * @param {string} uuid - the UUID of the characteristic
	 * @returns {T} - GenericType
	 */
	async read<T>(uuid: string): Promise<T> {
		let readOptions: any = this.standardRequestOptions;
		readOptions['characteristicUUID'] = uuid;
		return this.bluetooth.read(readOptions).then(
			(result: ReadResult) => utils.ab2T<T>(result.value),
			(err) => {
				this.log(`Failed to read: ${err}`);
				return ({} as T);
			}
		);
	}

	/**
	 * write
	 * convenience function for writing data to the peripheral
	 * @param {string} uuid - the UUID of the characteristic
	 * @param {T} value - the data to write
	 */
	async write<T>(uuid: string, value: T): Promise<void> {
		let writeOptions: any = this.standardRequestOptions;
		writeOptions['characteristicUUID'] = uuid;
		writeOptions['value'] = utils.T2ab(value);
		return this.bluetooth.write(writeOptions).then(
			() => this.log("Successfully wrote system command"),
			(err) => this.log(`Failed to write: ${err}`)
		);
	}

	/**
	 * subscribe
	 * convenience function for subscribing to notifications
	 * @param {string} uuid - the UUID of the characteristic
	 * @param {(T)=>void} onNotify - the callback function to handle notifications
	 */
	async subscribe<T>(uuid: string, onNotify: (arg0: T)=>void): Promise<void> {
		let notifyOptions: any = this.standardRequestOptions;
		notifyOptions['characteristicUUID'] = uuid;
		notifyOptions['onNotify'] = (result: ReadResult) => onNotify(utils.ab2T<T>(result.value));
		return this.bluetooth.startNotifying(notifyOptions).then(
			()=>this.log(`Subscribed to ${uuid}`),
			(err)=>this.log(`Failed to subscribe: ${err}`)
		);
	}

	/**
	 * unsubscribe
	 * convenience function for unsubscribing to notifications
	 * @param {string} uuid - the UUID of the characteristic to unsubscribe from
	 */
	async unsubscribe(uuid: string): Promise<void> {
		let notifyingOptions: any = this.standardRequestOptions;
		notifyingOptions['characteristicUUID'] = uuid;
		return this.bluetooth.stopNotifying(notifyingOptions).then(
			()=>this.log(`Unsubscribed from ${uuid}`),
			(err)=>this.log(`ERROR: Failed to subscribe: ${err}`)
		);
	}

	/**
	 * streamRead
	 * convenience function for reading a stream service on the connected device
	 * @param {string} UUID - the uuid of the service
	 * @returns {T} - Generic type
	 */
	async streamRead<T>(uuid: string): Promise<T> {
		this.log("Stream read");
		let service: Service | null = this.selectedPeripheral.services.reduce((p: Service | null, c: Service)=>c.UUID.toLowerCase() == uuid.toLowerCase() ? c : p, null);
		if (service == null) {
			console.error("Failed to find service");
			return;
		}
		return this.bluetooth.streamRead(this.selectedPeripheral, service).then(
			(result: ArrayBuffer) => utils.ab2T<T>(result),
			(err) => {
				this.log(`Failed to stream read: ${err}`);
				return ({} as T)
			}
		);
	}

	/**
	 * streamWrite
	 * convenience function for writing to a stremable service
	 * @param {string} uuid - the service UUID
	 * @param {T} data - a generice data type
	 */
	async streamWrite<T>(uuid: string, data: T) {
		this.log("Stream write");
		let service: Service | null = this.selectedPeripheral.services.reduce((p: Service | null, c: Service)=>c.UUID.toLowerCase() == uuid.toLowerCase() ? c : p, null);
		if (service == null) {
			console.error("Failed to find service");
			return;
		}

		let value: ArrayBuffer = utils.T2ab(data);
		return this.bluetooth.streamWrite(this.selectedPeripheral, service, value).then(
			()=>this.log(`stream wrote data`),
			(err)=>this.log(`Failed to stream write: ${err}`)
		);
	}

	/**
	 * watch
	 * Add an event listener to a propert value
	 */
	watch(propertyName: string, handler: ()=>void) {
		let truePropertyName: string = `_${propertyName}`;
		if (!Object.keys(this).includes(truePropertyName)) {
			console.log(Object.keys(this));
			console.error(`Property '${propertyName}' does not exist. Cannot watch`)
			return;
		}

		let watcherName: string = propertyName + "Watchers";
		if (!Object.keys(this).includes(watcherName)) this[watcherName] = [];
		this[watcherName].push(handler);
	}

	async readDeviceSettings(): Promise<void> {
		this.log("Reading Device Settings");
		let deviceSettingsService: Service = this.selectedPeripheral.services.filter((value: Service) => value.UUID == this.device_data_UUID)[0];
		return this.bluetooth.streamRead(this.selectedPeripheral, deviceSettingsService).then(
			(result: ArrayBuffer) => {
				this.updateDeviceSettings(result);
			},
			(err) => {
				this.log(`Failed to read device settings | ${err}`);
			}
		);
	}

	private updateDeviceSettings(result: ArrayBuffer): void {
		this.device_data = this.dataUtility.arraybuffer2obj(result);
	}

	private handleNotifyUpdate(result: ReadResult): void {
		this.log("NOTIFIED!");
		this.updateDeviceSettings(result.value);
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
		let device_data_str: string = JSON.stringify(this.device_data);
		let data: ArrayBuffer = this.dataUtility.str2arraybuffer(device_data_str);
		let deviceDataService: Service = this.selectedPeripheral.services.filter(v => v.UUID == this.device_data_UUID)[0];
		await this.bluetooth.streamWrite(this.selectedPeripheral, deviceDataService, data);
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
			this.isPrimaryServiceAvailable = false;
		});
		this.log(`Read Sys Ctrl: ${result}`);

		return result;
	}

	// Computed Properties
	get isConnecting(): boolean {
		return this.connectionState == ConnectionState.connecting;
	}

	get isConnected(): boolean {
		return this.connectionState == ConnectionState.connected;
	}

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

	get scanningStatus(): string {
		return this.isScanning ? "Scanning" : "Not Scanning";
	}

	get connectingStatus(): string {
		return this.isConnecting ? "Connecting" : "Not Connecting";
	}

	get connectionStatus(): string {
		return this.isConnected ? "Connected" : "Disconnected";
	}

	get primaryServiceAvailableStatus(): string {
		return this.isPrimaryServiceAvailable ? "Available" : "Unavailable";
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

	private get isPrimaryServiceAvailable(): boolean {
		return this._isPrimaryServiceAvailable;
	}

	private set isPrimaryServiceAvailable(value: boolean) {
		console.log("Setting isPrimaryServiceAvailable");
		this._isPrimaryServiceAvailable = value;

		// notify watchers
		if (!Object.keys(this).includes("isPrimaryServiceAvailableWatchers")) {
			console.log("No watchers");
			return;
		}
		for (let watcher of this["isPrimaryServiceAvailableWatchers"]) {
			watcher(value);
		}
	}

	// Watch
	notify(): void {
		let notifyOptions: any = this.notifyCharRequestOptions;
		notifyOptions['onNotify'] = this.handleNotifyUpdate.bind(this);

		if(this.isPrimaryServiceAvailable) {
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
