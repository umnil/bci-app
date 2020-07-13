import sleep from '../Sleep';
import DataUtil from './DataUtil';
import { RequestQueue, ReadRequest, WriteRequest } from './RequestQueue';
import { 
	Bluetooth,
	ReadOptions,
	WriteOptions,
	ReadResult,
} from 'nativescript-bluetooth';

export interface Transmission {
	msg: string;
	payload: any;
}

export class BLEStream extends Bluetooth {

	private dataUtil: DataUtil = new DataUtil();
	private requestQueue: RequestQueue = new RequestQueue();
	private chunkSize: number;

	// Methods
	constructor(chunkSize=400) {
		super();
		this.chunkSize = chunkSize;
	}

	log: (message: any) => void = console.log.bind(console, 'BLEStream: ');

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

		let requestID: string = this.requestQueue.addRequest(writeOptions);
		this.log(`requestID: ${requestID}`);

		while(!this.requestQueue.checkQueue(requestID)) {
			await sleep(10);
		}

		let result: any = await this.executeStreamWrite(requestID);
		this.requestQueue.popWriteQueue();
		return result;
	}

	private async executeStreamRead(id: string): Promise<ReadResult> {
		
		let readRequest: ReadRequest = <ReadRequest>this.requestQueue.getRequest(id);
		this.log(`readRequest: ${readRequest}`);
		let readResult: ReadResult = await this.read(<ReadOptions>readRequest);

		if(readRequest.transmitting) await this.recvData(readRequest, readResult);
		else await this.recvSize(readRequest, readResult);

		// We're finished with this request, pop it off the stack
		this.requestQueue.popReadQueue;
		return {
			serviceUUID: readRequest.serviceUUID,
			characteristicUUID: readRequest.characteristicUUID,
			value: readRequest.result
		};
	}

	private async executeStreamWrite(id: string): Promise<void> {
		this.log(`WRITE! ${id}`);
		let writeRequest: WriteRequest = <WriteRequest>this.requestQueue.getRequest(id);
		this.log(`request: ${writeRequest.id}`)
		this.log(`Transmission state: ${writeRequest.transmitting}`);

		if(writeRequest.transmitting) await this.sendData(writeRequest);
		else await this.sendSize(writeRequest);
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
		this.log(msg);
		
		if(msg != 'SIZE') {
			// Keep going until we get SIZE msg
			readRequest.transmitting = false;
			await this.executeStreamRead(readRequest.id);
			return;
		}

		let size: number = <number>transmission['payload'];
		readRequest.result = new ArrayBuffer(size);
		await this.executeStreamRead(readRequest.id);
	}
	//
	// sendSize
	private async sendSize(writeRequest: WriteRequest): Promise<void> {
		this.log(`Send Size`);

		writeRequest.transmitting = true;
		(writeRequest as any).pointer = 0;

		let strData: string = this.dataUtil.hex2str(writeRequest.value);
		let size: number = strData.length;
		this.log(`data size: ${size}`);
		writeRequest.result = this.dataUtil.str2arraybuffer(strData);

		let transmission: Transmission = {
			'msg': 'SIZE',
			'payload': size
		};

		//let writeValue: string = this.dataUtil.value2hex(transmission);
		let writeValue: string = JSON.stringify(transmission);
		let tempWriteOptions: WriteOptions = <WriteOptions>JSON.parse(JSON.stringify(writeRequest));
		tempWriteOptions.value = writeValue;
		this.log(`WriteOptions: ${JSON.stringify(tempWriteOptions)}`);
		await this.write(tempWriteOptions).then(_ => this.log('success'), err => this.log(`err: ${err}`));
		await this.executeStreamWrite(writeRequest.id);
	}
	//
	// recvData
	private async recvData(readRequest: ReadRequest, result: ReadResult): Promise<void> {
		let transmission: Transmission = this.dataUtil.data2object(result.value);
		let msg: string = transmission['msg'];
		this.log(msg);

		if(msg != 'DATA') return;

		let dataString: string = <string>transmission['payload'];
		let data: ArrayBuffer = this.dataUtil.str2arraybuffer(dataString);
		this.dataUtil.appendData(readRequest, data);

		let remainingBytes: number = readRequest.result.byteLength - (readRequest as any).pointer;

		this.log(`requestLength: ${readRequest.result.byteLength}`);
		this.log(`pointer: ${(readRequest as any).pointer}`);
		this.log(`Remaining Bytes: ${remainingBytes}`)
		if(remainingBytes > 0) {
			await this.executeStreamRead(readRequest.id);
			return;
		}

		readRequest.transmitting = false;
		(readRequest as any).pointer = 0;
	}
	//
	// sendData
	private async sendData(writeRequest: WriteRequest): Promise<any> {
		let pointer: number = (writeRequest as any).pointer;
		let remainingBytes: number = writeRequest.result.byteLength - pointer;
		let dataSize: number = remainingBytes > this.chunkSize ? this.chunkSize : remainingBytes;
		let curChunk: string = this.dataUtil.arraybuffer2str(writeRequest.result).substr(pointer, dataSize);
		pointer += dataSize;
		(writeRequest as any).pointer = pointer;

		let transmission: Transmission = {
			'msg': 'DATA',
			'payload': curChunk
		};
		remainingBytes = writeRequest.result.byteLength - pointer;

		let writeValue: string = JSON.stringify(transmission);
		let tempWriteOptions: WriteOptions = <WriteOptions>JSON.parse(JSON.stringify(writeRequest));
		tempWriteOptions.value = writeValue;
		await this.write(tempWriteOptions);

		if(remainingBytes > 0) {
			await this.executeStreamWrite(writeRequest.id);
			return;
		}

		writeRequest.transmitting = false;
		(writeRequest as any).pointer = 0;
	}
}
