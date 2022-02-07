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
import { DeviceDataController } from '../controllers/DeviceDataController';

@Component
export default class Home extends Vue {

	// Data
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate;
	private ddc: DeviceDataController;
	private inputDeviceName: string = "None";
	private outputDeviceName: string = "None";

	// Methods
	constructor() {
		super();
		this.cd = this.bus.cd;
		this.ddc = this.bus.controllers.deviceDataController;
	}

	getInputDeviceName(): string {
		return this.ddc.deviceData.inputdevices.selected_device || "None";
	}

	getOutputDeviceName(): string {
		return this.ddc.deviceData.outputdevices.selected_device || "None";
	}

	// Computed
	get inputDeviceText(): string {
		return `Input Device: ${this.inputDeviceName}`;
	}

	get outputDeviceText(): string {
		return `Output Device: ${this.outputDeviceName}`;
	}

	updateNames(): void {
		this.inputDeviceName = this.getInputDeviceName();
		this.outputDeviceName = this.getOutputDeviceName();
	}

	// Watched Properties
	@Watch("cd.status")
	updateByStatus(): void {
		this.updateNames();
	}

	@Watch("ddc.deviceData.inputdevices.selected_device")
	updateByInputDevice(): void {
		this.updateNames();
	}

	@Watch("ddc.deviceData.outputdevices.selected_device")
	updateByOutputDevice(): void {
		this.updateNames();
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
