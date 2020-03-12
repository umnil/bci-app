import sleep from './Sleep';
import { RequestQueue } from './RequestQueue';
import { 
	Bluetooth,
	ReadOptions,
	WriteOptions,
	ReadResult
} from 'nativescript-bluetooth';

export default class BLEStream extends Bluetooth {

	private requestQueue: RequestQueue = new RequestQueue();

	// Methods
	async streamRead(readOptions: ReadOptions): Promise<ReadResult> {

		let requestID: string = this.requestQueue.addReadRequest(readOptions);

		while(!this.requestQueue.checkReadQueue(requestID)) {
			await sleep(10);
		}

		let result: ReadResult = await this.executeStreamRead(requestID);
		return result;
	}

	async streamWrite(writeOptions: WriteOptions): Promise<any> {

	}

	async executeStreamRead(id: string): Promise<ReadResult> {
		// Change this
		return {
			serviceUUID: '',
			characteristicUUID: '',
			value: new ArrayBuffer(null)
		};
	}

	async executeStreamWrite(id: string): Promise<void> {

	}
}
