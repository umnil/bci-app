import sleep from './Sleep';
import ConnectionDelegate from './ConnectionDelegate';

export enum Status {
	DISCONNECTED,
	CONNECTED,
	AVAILABLE,
	LIVE
}

export class BLEStatusChecker {

	// Class Properties
	private interval: number = 30;
	private timeout: number = 30;
	private cd: ConnectionDelegate;
	private timer: number;
	private checkComplete: boolean = false;
	private done: boolean = false;
	private checking: boolean = false;
	private subscriptions: object[] = [];

	private _status: Status = Status.DISCONNECTED;

	// Class Methods
	constructor(connectionDelegate: ConnectionDelegate) {
		this.cd = connectionDelegate;
		this.startChecking();
	}

	log: (any)=>void = console.log.bind(console, "BLEStatusChecker: ");

	async checkStatus(): Promise<void> {
		this.checkComplete = false;
		this.cd.readSysCtrl().then(this.handleReadSuccess, this.handleReadFailure);
		
		this.startTimer();
		while( !this.timesUp && !this.checkComplete ) {
			await sleep(250);
		}
	}

	handleReadSuccess(result: any): void {
		this.checkComplete = true;
	}

	handleReadFailure(error: any): void {
		this.checkComplete = true;
		this.log(`Not connected! ERROR: ${error}`);
	}

	async startChecking(): Promise<void> {
		this.checking = true;
		while(!this.done) {
			this.checkCDStatus();
			await this.checkStatus();
			await sleep(this.interval*1000);
		}
		this.checking = false;
	}

	checkCDStatus(): void {
		let result: Status = Status.DISCONNECTED;
		if(this.cd.status != 'Connected') {
			result = result;
		}
		else {
			result = Status.CONNECTED;
			if(this.cd.primaryServiceAvailableStatus == "Available") {
				result = Status.AVAILABLE;
				if(this.cd.notifyStatus == "Notifying") {
					result = Status.LIVE;
				}
			}
		}
		this.status = result;
	}

	startTimer(): void {
		this.timer = Date.now();
	}

	subscribe(cb: ()=>void): number {
		let nSubscriptions: number = this.subscriptions.length;
		let id: number = nSubscriptions + 1;
		let newSub: any = {
			'id': id,
			'callback': cb
		};
		this.subscriptions.push(newSub);
		this.cd.log(`SUBSCRIBED! - ${cb.name}`);
		return id;
	}

	// Getters and Setters
	get cur_time(): number {
		return Date.now();
	}

	get dt(): number {
		return this.cur_time - this.timer;
	}

	get timesUp(): boolean {
		return this.dt >= this.timeout;
	}

	get isChecking(): boolean {
		return this.checking;
	}

	get status(): Status {
		return this._status;
	}

	set status(val: Status) {
		this._status = val;
	}
}
