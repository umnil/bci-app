import { BLEStream } from '../blestream/BLEStream';
import "globals";

const context: Worker = self as any;

export interface WorkerMessage {
	id: string;
	func: string;
	params: any[];
}

export interface WorkerResponse {
	id: string;
	result: any;
}

let bluetooth: BLEStream = new BLEStream();
 
context.onmessage = async function(msg: MessageEvent): Promise<void> {
	//let func: string = msg.func;
	//let params: any[] = msg.params;
	//let result: any = await context.bluetooth[func].apply(context.bluetooth, params);
	//let response: WorkerResponse = {
		//id: msg.id,
		//result: result
	//};
	//(global as any).postMessage(response);
	console.log(msg);
};
