import ConnectionDelegate from '../utils/ConnectionDelegate';

export class SystemStatusService {
	uuid: string = "E62A479C-5184-4AEE-B2D8-C4ADCED4E0F3";
	connection: ConnectionDelegate;
	statusUpdate: (SystemStatus)=>void;

	/**
	 * constructor
	 * Create a service to link the app to the system status indicator
	 * @param {ConenctionDelegate} connection - the class for issuing bluetooth requests
	 * @param {(SystemStatus)=>void} callback - callback to handle 
	 */
	constructor(connection: ConnectionDelegate, handler: (SystemStatus)=>void) {
		this.connection = connection;
		this.statusUpdate = handler;
	}

	/**
	 * log
	 * Log messages to the console as well as to stored data displayed on the
	 * app
	 * @param {any} message - the message to log
	 */
	log(message: any) {
		let appendedMessage: string = `DeviceDataService: ${message}`;
		this.connection.log(appendedMessage);
	}

	/**
	 * read
	 * Read in the system status
	 * @returns {SystemStatus} - The device data currently stored on the system
	 */
	async read(): Promise<SystemStatus> {
		this.log("Reading System Status");
		return this.connection.read<SystemStatus>(this.uuid);
	}

	/**
	 * subscribe
	 * Subscribe to notifications from the server. The system status then
	 * issues the a refresh of device data when it receives updates from the
	 * status
	 */
	async subscribe(): Promise<void> {
		this.log("Subscribing to system status");
		return this.connection.subscribe(this.uuid, this.statusUpdate.bind(this));
	}

	/**
	 * unsubscribe
	 * Unsubscribe from the notifications of the server
	 */
	async unsubscribe(): Promise<void> {
		this.log("Unsubscribing from system status");
		return this.connection.unsubscribe(this.uuid);
	}
}
