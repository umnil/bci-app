import ConnectionDelegate from '../utils/ConnectionDelegate';
import Prompt from '../models/Prompt';

export class PromptService {

	uuid: string = "E58AC8E3-615A-45C4-A96B-590F64D3492A";
	connection: ConnectionDelegate;
	promptUpdate: (p: string)=>void;

	/**
	 * constructor
	 * Create a service that links the app to the device data available on the
	 * peripheral bluetooth device
	 * @param {ConenctionDelegate} connection - The class reponsible for issuing bluetooth requests
	 */
	constructor(connection: ConnectionDelegate, handler: (p: string)=>void) {
		this.connection = connection;
		this.promptUpdate = handler;
	}

	/**
	 * log
	 * Log messages to the console as well as to stored data displayed on the
	 * app
	 * @param {any} message - the message to log
	 */
	log(message: any) {
		let appendedMessage: string = `prompt: ${message}`;
		this.connection.log(appendedMessage);
	}

	/**
	 * read
	 * Read in the prompt from the peripheral device
	 * @returns {Prompt} - The device data currently stored on the system
	 */
	async read(): Promise<Prompt> {
		this.log("Reading Device Settings");
		return this.connection.streamRead<string>(this.uuid).then(
			(result: string) => new Prompt(result),
			(err) => new Prompt(err)
		);
	}

	/**
	 * subscribe
	 * Subscribe to prompt/instruction notifications from the server. The
	 * prompt is an instruction that is sent to be displayed to the user
	 */
	async subscribe(): Promise<void> {
		this.log("Subscribing to prompt");
		return this.connection.subscribe(this.uuid, this.promptUpdate.bind(this));
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
