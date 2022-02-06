import ConnectionDelegate from '../utils/ConnectionDelegate';
import DeviceData from '../models/DeviceData';

export class DeviceDataService {

	uuid: string = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B";
	connection: ConnectionDelegate;

	/**
	 * constructor
	 * Create a service that links the app to the device data available on the
	 * peripheral bluetooth device
	 * @param {ConenctionDelegate} connection - The class reponsible for issuing bluetooth requests
	 */
	constructor(connection: ConnectionDelegate) {
		this.connection = connection;
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
	 * Read in the device data from the peripheral device
	 * @returns {DeviceData} - The device data currently stored on the system
	 */
	async read(): Promise<DeviceData> {
		this.log("Reading Device Settings");
		return this.connection.streamRead<DeviceData>(this.uuid);
	}

	/**
	 * write
	 * Write the device data to the peripheral device
	 * @param {DeviceData} data - the data object to write
	 */
	async write(data: DeviceData) {
		this.log("Writing device settings");
		return this.connection.streamWrite(this.uuid, data);
	}
}
