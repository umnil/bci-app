export default class SystemControlSignal {
	command: string;

	/**
	 * constructor
	 * create a new system control signal value
	 * @param {string} value - the value of the control signal
	 */
	constructor(value?: string) {
		this.command = value;
	}
}
