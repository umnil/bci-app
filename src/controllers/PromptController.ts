import Prompt from '../models/Prompt';
import { PromptService } from '../services/PromptService';

export class PromptController {
	private bus: Bus;
	private service: PromptService
	public prompt: Prompt;
	
	/**
	 * constructor
	 * Creates a PromptController that is responsible for maintaining the
	 * state of the prompt
	 * @param {Bus} bus - the application bus that holds global objects
	 */
	constructor(bus: Bus) {
		this.bus = bus;
		this.service = new PromptService(bus.cd, this.handlePromptUpdate.bind(this));
		this.prompt = new Prompt("");
	}

	/**
	 * readPrompt
	 * Read the current prompt value
	 */
	async loadSystemStatus(): Promise<void> {
		this.prompt = await this.service.read();
	}

	/**
	 * subscribe
	 * Cause service to subscribe to prompt updates
	 */
	async subscribe(): Promise<void> {
		return this.service.subscribe();
	}

	/**
	 * handlePromptUpdate
	 * store the value of the new prompt when we get it
	 * @param {Prompt}
	 */
	handlePromptUpdate(prompt: string) {
		this.prompt.value = prompt;
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
}
