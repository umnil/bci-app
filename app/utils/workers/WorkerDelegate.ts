import { WorkerMessage, WorkerResponse } from './ble'
import sleep from '../Sleep';
import uuidv4 from 'uuidv4';
import WorkerScript from 'nativescript-worker-loader!./ble';

enum WorkerStatus {
	PENDING,
	COMPLETE
}

interface WorkerStatusEntry {
	id: string;
	status: WorkerStatus;
	result: any;
}

export default class WorkerDelegate {

	private worker = new WorkerScript();
	private workerQueue: WorkerStatusEntry[] = [];

	constructor() {
		this.worker.onmessage = this.handleMessage;
	}
 
	async awaitJob(func: string, params: any[]): Promise<any> {
	// 	let id: string = uuidv4.uuid();
	// 	let message: WorkerMessage = {
	// 		id: id,
	// 		func: func,
	// 		params: params
	// 	};
	// 	let entry: WorkerStatusEntry = {
	// 		id: id,
	// 		status: WorkerStatus.PENDING,
	// 		result: null
	// 	};
	// 	this.workerQueue.push(entry);
	// 	this.worker.postMessage(message);
	// 	while(entry.status == WorkerStatus.PENDING) {
	// 		await sleep(50);
	// 	}
	// 	return entry.result;
	}

	private handleMessage(response: WorkerResponse): void {
	// 	let entry: WorkerStatusEntry = this.workerQueue.filter(e => e.id == response.id)[0];
	// 	entry.result = response.result;
	// 	this.workerQueue = this.workerQueue.filter(e => e.id != entry.id);
	// 	entry.status = WorkerStatus.COMPLETE;
	}

}
