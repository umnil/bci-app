<template>
	<ActionItem ios.position="right">
		<Button ref="b" :class="classStatus" />
	</ActionItem>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import sleep from '../utils/Sleep';

enum Status {
	DISCONNECTED,
	CONNECTED,
	AVAILABLE,
	LIVE
}

@Component
export default class SystemStatus extends Vue {

	// Class Properties
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = this.bus.cd;
	private status: number = Status.DISCONNECTED;
	private classStatus: string = this.getClassStatus();
	private pulseCheck: number = 30;

	// Class Methods
	constructor() {
		super();
		this.bus.systemStatus = this;
		this.updateClassStatus();
		this.cd = this.bus.cd;
		this.startChecking();
	}

	log: (any)=>void = console.log.bind(console, "SystemStatus: ");

	setStatus(status: number): void {
		console.log(`Status call! = ${status}`);
		this.status = status;
	}

	getClassStatus(): string {
		if(this.status == undefined) {
			this.status = Status.DISCONNECTED;
		}

		let result: string = "status-indicator";
		let statusClasses: string[] = [
			"status-disconnected",
			"status-connected",
			"status-available",
			"status-live"
		];
		let stateClass: string = statusClasses[this.status];
		return `${result} ${stateClass}`;
	}
	
	updateFromCD(): void {
		let s: number = 0;
		if(this.cd.status == "Disconnected") {
			s =  Status.DISCONNECTED;
		}
		else if(this.cd.status == "Connected") {
			s = Status.CONNECTED;
			if(this.cd.ecoglinkAvailableStatus == "Available") {
				s = Status.AVAILABLE;
				if(this.cd.notifyStatus == "Notifying") {
					s = Status.LIVE;
				}
			}
		}
		this.setStatus(s);
	}

	async startChecking(): Promise<void> {
		while(true) {
			await sleep(this.pulseCheck*1000);
			if(this.status == 3) {
				await this.cd.readSysCtrl();
			}
		}
	}

	// Class Computed Properties (Getters/Setters)

	// Class Watch Properties
	@Watch('status')
	updateClassStatus(): void {
		this.classStatus = this.getClassStatus();
	}

	@Watch('cd.status')
	updateFromCDStatus(): void {
		this.updateFromCD();
	}

	@Watch('cd.ecoglinkAvailableStatus')
	updateFromCDEAS(): void {
		this.updateFromCD();
	}

	@Watch('cd.notifyStatus')
	updateFromCDN(): void {
		this.updateFromCD();
	}
}
</script>

<style lang="scss">
@import "../app";

.status-indicator {
	width: 50px;
	height: 50px;
	color: white;
	border-width: 2px;
	border-color: #808080;
	border-style: solid;
	border-radius: 25px;
}

.status-disconnected {
	background-color: black;
}

.status-connected {
	background-color: yellow;
}

.status-available {
	background-color: blue;
}

.status-live {
	background-color: green;
}
</style>
