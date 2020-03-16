import { ReadOptions, WriteOptions } from 'nativescript-bluetooth';
import uuidv4 from 'uuidv4';

export interface ReadRequest extends ReadOptions {
	id: string;
	time: number;
	transmitting: boolean;
	result: ArrayBuffer;
}

export interface WriteRequest extends WriteOptions {
	id: string;
	time: number;
	transmitting: boolean;
	result: ArrayBuffer;
}

export class RequestQueue {

	private readQueue: ReadRequest[] = [];
	private writeQueue: WriteRequest[] = [];

	addRequest(readOptions: ReadOptions | WriteOptions): string {
		let newUUID: string = uuidv4.uuid();
		let time: number = Date.now();
		let request: ReadRequest | WriteRequest = <ReadRequest | WriteRequest>readOptions;
		request.id = newUUID;
		request.time = time;
		request.transmitting = false;
		request.result = new ArrayBuffer(null);
		if(request.hasOwnProperty('value')) {
			let r: WriteRequest = <WriteRequest>request;
			this.writeQueue.unshift(r);
		}
		else this.readQueue.unshift(request);
		return newUUID;
	}

	// removeRequest
	removeRequest(id: string): boolean {
		let potentialReadRequest: ReadRequest[] = this.readQueue.filter(e=>e.id == id);
		let potentialWriteRequest: WriteRequest[] = this.writeQueue.filter(e=>e.id == id);
		if(potentialReadRequest.length < 1 && potentialWriteRequest.length < 1) return false;

		if(potentialReadRequest.length > 0) {
			let readRequest: ReadRequest = potentialReadRequest[0];
			if(readRequest.transmitting) return false;
			this.readQueue = this.readQueue.filter(e=>e.id != id);
		}
		else if(potentialWriteRequest.length > 0) {
			let writeRequest: WriteRequest = potentialWriteRequest[0];
			if(writeRequest.transmitting) return false;
			this.writeQueue = this.writeQueue.filter(e=>e.id != id);
		}
		return true;
	}
	
	checkQueue(id: string): boolean {
		let curRReq: ReadRequest | null = this.currentReadRequest;
		let curWReq: WriteRequest | null = this.currentWriteRequest;

		if(curRReq == null && curWReq == null) return false;
		else return curRReq != null ? id == curRReq.id : id == curWReq.id;
	}

	getRequest(id: string): ReadRequest | WriteRequest | null {
		let potentialReadRequest: ReadRequest[] = this.readQueue.filter(e => e.id == id);
		let potentialWriteRequest: WriteRequest[] = this.writeQueue.filter(e => e.id == id);

		if(potentialReadRequest.length < 1 && potentialWriteRequest.length < 1) return null;

		return potentialReadRequest.length > 0 ? potentialReadRequest[0] : potentialWriteRequest[0];
	}

	private getRequestIndex(id: string): number {
		let potReadIndex: number = this.readQueue.reduce((r,e,i) => {r = e.id == id ? i : r;return r;}, -1);
		let potWriteIndex: number = this.writeQueue.reduce((r,e,i) => {r = e.id == id ? i : r;return r;}, -1);
		return potReadIndex != -1 ? potReadIndex : potWriteIndex;
	}

	setTransmitting(id: string, value: boolean): void {
		let index: number = this.getRequestIndex(id);
		if(this.readQueue[index] != undefined) {
			this.readQueue[index].transmitting = value;
		}
		else if(this.writeQueue[index] != undefined) {
			this.writeQueue[index].transmitting = value;
		}
	}

	popReadQueue(): ReadRequest {
		return this.readQueue.pop();
	}

	popWriteQueue(): WriteRequest {
		return this.writeQueue.pop();
	}
	
	private get currentReadRequest(): ReadRequest | null {
		if(this.readQueue.length < 1) return null;
		return this.readQueue[0];
	}

	private get currentWriteRequest(): WriteRequest | null {
		if(this.writeQueue.length < 1) return null;
		return this.writeQueue[0];
	}
}

