<template>
	<StackLayout>
		<Label class="device-label" text="Selected Input Device" />
		<Label class="device-name" :text="inputDeviceName" style="text-align: center;" />
		<Label class="device-label" text="Selected OutputDevice" />
		<Label class="device-name" :text="outputDeviceName" style="text-align: center;" />
	</StackLayout>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ConnectionDelegate from '../utils/ConnectionDelegate';

@Component
export default class Home extends Vue {

	// Data
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate;

	// Methods
	constructor() {
		super();
		this.cd = this.bus.cd;
	}

	// Computed
	get inputDeviceName(): string {
		let inputDevices: any = this.cd.inputDevices;
		return this.cd.inputDevices.selected_device || "None";
	}

	get outputDeviceName(): string {
		let outputDevices: any = null; // this.cd.outputDevices;
		return this.cd.outputDevices.selected_device || "None";
	}

	get inputDeviceText(): string {
		return `Input Device: ${this.inputDeviceName}`;
	}

	get outputDeviceText(): string {
		return `Output Device: ${this.outputDeviceName}`;
	}
}
</script>

<style lang="scss" scoped>
@import "../app";

Label {
	font-size: 28px;
}

.device-label {
	border-bottom: 5px solid black;
	margin: 20% 0px 0px 0px;
	text-align:center;
}

.device-name {
	background-color: $orange;
	border-color: $orange;
	border-radius: 20px;
	margin: 0px 20px;
	padding: 10px 0px;
}

</style>
