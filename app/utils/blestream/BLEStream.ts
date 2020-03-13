import sleep from './Sleep';
import DataUtil from './DataUtil';
import { RequestQueue, ReadRequest, WriteRequest } from './RequestQueue';
import { 
	Bluetooth,
	ReadOptions,
	WriteOptions,
	ReadResult
} from 'nativescript-bluetooth';

export interface Transmission {
	msg: string;
	payload: any;
}

export class BLEStream extends Bluetooth {

	private dataUtil: DataUtil = new DataUtil();
	private requestQueue: RequestQueue = new RequestQueue();

	// Methods
	async streamRead(readOptions: ReadOptions): Promise<ReadResult> {

		let requestID: string = this.requestQueue.addRequest(readOptions);

		while(!this.requestQueue.checkQueue(requestID)) {
			await sleep(10);
		}

		let result: ReadResult = await this.executeStreamRead(requestID);
		this.requestQueue.popReadQueue();
		return result;
	}

	async streamWrite(writeOptions: WriteOptions): Promise<any> {

	}

	private async executeStreamRead(id: string): Promise<ReadResult> {
		
		let readRequest: ReadRequest = <ReadRequest>this.requestQueue.getRequest(id);
		let readResult: ReadResult = await this.read(<ReadOptions>readRequest);

		if(readRequest.transmitting) this.recvData(readRequest, readResult);
		else this.recvSize(readRequest, readResult);

		// We're finished with this request, pop it off the stack
		this.requestQueue.popReadQueue;
		return {
			serviceUUID: readRequest.serviceUUID,
			characteristicUUID: readRequest.characteristicUUID,
			value: readRequest.result
		};
	}

	private async executeStreamWrite(id: string): Promise<void> {

	}

	// processRead
	//
	// processWrite
	//
	// recvSize
	private async recvSize(readRequest: ReadRequest, result: ReadResult): Promise<void> {

		readRequest.transmitting = true;
		(readRequest as any).pointer = 0;

		let transmission: Transmission = this.dataUtil.data2object(result.value);
		let msg: string = transmission['msg'];
		
		if(msg != 'SIZE') return;

		let size: number = <number>transmission['payload'];
		readRequest.value = new ArrayBuffer(size);
		await this.executeStreamRead(readRequest.id);
	}
	//
	// sendSize
	//
	// recvData
	private async recvData(readRequest: ReadRequest, result: ReadResult): Promise<void> {
		let transmission: Transmission = this.dataUtil.data2object(result.value);
		let msg: string = transmission['msg'];

		if(msg != 'DATA') return;

		let dataString: string = <string>transmission['payload'];
		let data: ArrayBuffer = this.dataUtil.str2arraybuffer(dataString);
		this.dataUtil.appendData(readRequest, data);

		let remainingBytes: number = readRequest.result.byteLength - (readRequest as any).pointer;

		if(remainingBytes > 0) {
			await this.executeStreamRead(readRequest.id);
			return;
		}

		readRequest.transmitting = false;
		(readRequest as any).pointer = 0;
	}
	//
	// sendData
}
