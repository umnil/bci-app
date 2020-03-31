import { Transmission } from './BLEStream';
import { ReadRequest, WriteRequest } from './RequestQueue';

export default class DataUtil {

	value2hex(value: any): string {
		let jsonString: string = JSON.stringify(value);
		return this.str2hex(jsonString);
	}

	str2hex(str: string): string {
		let arrayBuffer: ArrayBuffer = new ArrayBuffer(str.length);
		let bufferView: Uint8Array = new Uint8Array(arrayBuffer);
		str.split('').forEach((e,i) => bufferView[i]=str.charCodeAt(i));
		let result: string = Array.prototype.map.call(new Uint8Array(arrayBuffer), x => ('0x'+x.toString(16)).slice(-4)).join(',');
		return result;
	}

	hex2str(hex: string): string {
		let result: string = hex.split(",").map(e=>String.fromCharCode(parseInt(e))).join("");
		return result;
	}

	// Convert Transmitted Data to the object the data represents
	data2object(data: ArrayBuffer): Transmission {
		let strData: string = String.fromCharCode.apply(null, new Uint8Array(data));
		return JSON.parse(strData);
	}

	str2arraybuffer(datastr: string): ArrayBuffer {
		let result: ArrayBuffer = new ArrayBuffer(datastr.length);
		let bufView: Uint8Array = new Uint8Array(result);
		datastr.split('').forEach((e,i)=>{bufView[i]=datastr.charCodeAt(i);});
		return result;
	}

	arraybuffer2str(data: ArrayBuffer): string {
		return String.fromCharCode.apply(null, new Uint8Array(data));		
	}

	arraybuffer2obj(data: ArrayBuffer): object {
		return JSON.parse(this.arraybuffer2str(data));
	}

	// Append to a data ArrayBuffer
	appendData(request: ReadRequest, data: ArrayBuffer): void {
		let dataView: Uint8Array = new Uint8Array(request.result);
		let curDataView: Uint8Array = new Uint8Array(data);
		let dataPointer: number = (request as any).pointer;
		curDataView.forEach((e, i) => {dataView[dataPointer+i] = e;});
		(request as any).pointer += data.byteLength;

		console.log(`New Data obtained: ${String.fromCharCode.apply(null, new Uint8Array(data))}`);
		console.log(`Current Data: ${String.fromCharCode.apply(null, new Uint8Array(request.result))}`);
	}

}
