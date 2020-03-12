import { ReadOptions, WriteOptions } from 'nativescript-bluetooth';
import uuidv4 from 'uuidv4';

export interface ReadRequest extends ReadOptions {
	id: string;
}

export interface WriteRequest extends WriteOptions {
	id: string;
}

export class RequestQueue {

	private readQueue: ReadRequest[] = [];
	private writeQueue: WriteRequest[] = [];

	addReadRequest(readOptions: ReadOptions): string {
		let newUUID: string = uuidv4.uuid();
		let readRequest: ReadRequest = <ReadRequest>readOptions;
		readRequest.id = newUUID;
		this.readQueue.unshift(readRequest);
		return newUUID;
	}

	// addWriteRequest
	
	// removeReadRequest
	
	// removeWriteRequest
	
	checkReadQueue(id: string): boolean {
		let curRReq: ReadRequest | null = this.currentReadRequest;

		if(curRReq == null) return false;
		else return id == curRReq.id;
	}
	
	// checkWrtieQueue
	
	private get currentReadRequest(): ReadRequest | null {
		if(this.readQueue.length < 1) return null;
		return this.readQueue[0];
	}

	// get currentWriteRequest
}

