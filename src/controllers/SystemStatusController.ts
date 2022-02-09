import { SystemStatusService } from '../services/SystemStatusService';

export class SystemStatusController {
	bus: Bus;
	service: SystemStatusService;
	systemStatus: SystemStatus;
	
	private _isNotifying: boolean = false;

	/**
	 * constructor
	 * Creates a SystemStatusController that is responsible for maintaining the
	 * state of the data transfered using the SystemStatusService
	 * @param {Bus} bus - the application bus that holds global objects
	 */
	constructor(bus: Bus) {
		this.bus = bus;
		this.service = new SystemStatusService(bus.cd, this.handleStatusUpdate.bind(this));
		this.bus.cd.watch("isPrimaryServiceAvailable", this.handleBluetoothStatusUpdate.bind(this));
	}

	/**
	 * loadSystemStatus
	 * Uses the SystemStatusService to retrieve device data for the rest of the
	 * applilcation to use
	 */
	async loadSystemStatus(): Promise<void> {
		this.systemStatus = await this.service.read();
	}

	/**
	 * handleStatusUpdate
	 * The function handles what happens when the system sends an update on
	 * it's status. In this case, we need to ensure our device data is reloaded
	 * on system status changes.
	 * @param {SystemStatus}
	 */
	handleStatusUpdate(status: SystemStatus) {
		this.systemStatus = status;
		this.bus.controllers.deviceDataController.loadDeviceData();
	}

	/**
	 * handleBluetoothStatusUpdate
	 * The connection is also indicative of the status value. So we also watch
	 * for updates on the status of the bluetooth connection itself
	 */
	handleBluetoothStatusUpdate() {
		console.log('SystemStatusController received bluetooth update');
		this.service.subscribe().then(
			()=>{
				console.log(`controllers: ${this.bus.controllers.deviceDataController.loadDeviceData}`);
				this.isNotifying = true;
				this.bus.controllers.deviceDataController.loadDeviceData();
			},
			(err)=>{
				console.error(`Failed to subscribe ${err}`);
				this.isNotifying = false;
			}
		);
	}

	/**
	 * watch
	 * Add an event listener to a propert value
	 * @param {string} propertyName - the name of the property to watch
	 * @param {()=>void} handler - the callback to call when the value updates
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

	/**
	 * notifyWatchers
	 * For any listener that has a watch on the given property, run their
	 * callbacks
	 * @param {string} propertyName
	 */
	notifyWatchers(propertyName: string) {
		let watchList: string = `${propertyName}Watchers`;
		if (!Object.keys(this).includes(watchList)) return;
		for (let watcher of this[watchList]) {
			watcher();
		}
	}

	get isNotifying(): boolean {
		return this._isNotifying;
	}

	set isNotifying(value: boolean) {
		this._isNotifying = value;

		// notify watchers
		this.notifyWatchers("isNotifying");
	}
}
