import ConnectionDelegate from '../utils/ConnectionDelegate';
import SystemControlSignal from '../models/SystemControlSignal';

export class SystemControlSignalService {

	uuid: string = "2389DB49-5CA4-443F-8EC8-55DB9AC79143";
	connection: ConnectionDelegate;

	/**
	 * constructor
	 * Create a service that links the app to the system control asignal
	 * available on the peripheral bluetooth device. This signal is used for
	 * issuing system commands; e.g., refreshing the device list, etc.
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
		let appendedMessage: string = `SystemControlSignalService: ${message}`;
		this.connection.log(appendedMessage);
	}

	/**
	 * read
	 * Read in the device data from the peripheral device
	 * @returns {SystemControlSignal} - The current value of the control signal
	 */
	async read(): Promise<SystemControlSignal> {
		this.log("Reading");
		return this.connection.read<string>(this.uuid).then((value: string) => {
			return new SystemControlSignal(value);
		}, (err) => {
			this.log(`ERR: ${err}`);
			return new SystemControlSignal("");
		});
	}

	/**
	 * write
	 * Write a command value to the peripheral device
	 * @param {SystemControlSignal} signal - the signal to send
	 */
	async write(signal: SystemControlSignal): Promise<void> {
		this.log(`Writing ${signal.command}`);
		await this.connection.write(this.uuid, signal.command);
		this.log(`Done writing command: ${signal.command}`);
	}
}
