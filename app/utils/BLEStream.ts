let bluetooth = require('nativescript-bluetooth');


export default class BLEStream {

	private _data: ArrayBuffer;
	private dataPointer: number = 0;
	private	transmitting: boolean = false;
	private sco: object;

	async receiver(result: any, sco: object): Promise<void> {
		console.log("BLEStream: Receiving data");
		this.sco = sco;
		if(this.transmitting) await this.retrieveData(result);
		else await this.retrieveSize(result);
	}

	async retrieveData(result: any): Promise<void> {
		this.appendData(result.value);
		let remainingBytes: number = this._data.byteLength - this.dataPointer;
		console.log(`BLEStream: Remaining Bytes: ${remainingBytes}`);
		if(remainingBytes > 0) {
			await this.read()
		}
		this.transmitting = false;
		this.dataPointer = 0;
	}

	async retrieveSize(result: any): Promise<void> {
		this.transmitting = true;
		this.dataPointer = 0;
		let size_str: string = String.fromCharCode.apply(null, new Uint8Array(result.value));
		let size: number = parseInt(size_str);
		this._data = new ArrayBuffer(size)
		console.log(`Obtained data size: ${size}`);
		await this.read();
	}

	appendData(data: ArrayBuffer): void {
		let dataView: Uint8Array = new Uint8Array(this._data);
		let curDataView: Uint8Array = new Uint8Array(data);
		curDataView.forEach((e, i) => {dataView[this.dataPointer+i] = e;});
		this.dataPointer += data.byteLength;

		console.log(`New Data obtained: ${String.fromCharCode.apply(null, new Uint8Array(data))}`);
		console.log(`Current Data: ${String.fromCharCode.apply(null, new Uint8Array(this._data))}`);
	}

	async read(): Promise<void> {
		let rd: Promise<any> = new Promise(resolve => {
			bluetooth.read(this.sco).then((result) => {
				resolve(result);
			}, (err) => {
				console.error(`ERROR: ${err}`);
			});
		});
		let next_read_result: any = await rd;
		this.receiver(next_read_result, this.sco);
	}

	get data(): object {
		let data_str: string = String.fromCharCode.apply(null, new Uint8Array(this._data));
		let data_obj: object = JSON.parse(data_str);
		return data_obj;
	}
}
