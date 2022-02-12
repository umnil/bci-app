import SystemControlSignal from '../models/SystemControlSignal';
import { SystemControlSignalService } from '../services/SystemControlSignalService';

export class SystemControlSignalController {
	private bus: Bus;;
	private service: SystemControlSignalService;
	public controlSignal: SystemControlSignal;

	/**
	 * constructor
	 * create the system controll signal to send message backe and forth from
	 * and to the system
	 * @param {Bus} bus - the application bus that holds global objects
	 */
	constructor(bus: Bus) {
		this.bus = bus;
		this.service = new SystemControlSignalService(bus.cd);
		this.controlSignal = new SystemControlSignal();
	}

	/**
	 * loadSignal
	 * Reads the current value of the control signal stored on the system
	 */
	async loadControlSignal(): Promise<void> {
		this.controlSignal = await this.service.read();
	}

	/**
	 * sendCommand
	 * sends a command to the system
	 * @param {string} command - the string command to send
	 */
	async sendCommand(command: string): Promise<void> {
		this.controlSignal.command = command;
		return this.service.write(this.controlSignal);
	}
}
