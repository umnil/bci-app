<template>
	<ActionItem ios.position="right">
		<Button :class="statusClass" @loaded="onLoad" />
	</ActionItem>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import { BLEStatusChecker, Status } from '../utils/BLEStatusChecker';
import sleep from '../utils/Sleep';

@Component
export default class StatusIndicator extends Vue {

	// Class Properties
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = this.bus.cd;
	private sc: BLEStatusChecker = this.bus.sc;
	private statusClass: string = "status-indicator status-disconnected";

	@Prop() name: string;

	// Class Methods
	constructor() {
		super();
	}

	log: (message: any)=>void = console.log.bind(console.log, "StatusIndicator: ");

	updateStatusClass(): void {
		this.statusClass = this.getStatusClass();
	}

	getStatusClass(): string {
		if(this.sc.status == undefined) {
			this.sc.status = Status.DISCONNECTED;
		}

		let result: string = "status-indicator";
		let statusClasses: string[] = [
			"status-disconnected",
			"status-connected",
			"status-available",
			"status-live"
		];
		let statusCls: string = statusClasses[this.sc.status];
		result += ` ${statusCls}`;
		return result;
	}

	onLoad(): void {
		this.updateStatusClass();
	}

	// Class Computed Properties (Getters/Setters)

	// Class Watch Properties
	@Watch("sc.status")
	updateFromSCStatus(): void {
	 	this.updateStatusClass();
	}

	@Watch("cd.status")
	@Watch("cd.ecoglinkAvailableStatus")
	@Watch("cd.notifyingStatus")
	updateFromCDStatus(): void {
		this.sc.checkCDStatus();
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
