<template>
	<Page @loaded="loadDevices">
		<ActionBar title="Output Devices" />
		<StackLayout>
			<ListView ref="deviceList" for="device in devices" height="100%">
				<v-template>
					<StackLayout orientation="horizontal" width=100%>
						<Label :class="selectionclass(device.device_name)" :text="marker"></Label>
						<Label class="device-listing" :text="device.device_name" @tap="select(device)" />
						<Label class="fa settings" :text="settings_symbol" @tap="toSettings(device)"/>
					</StackLayout>
				</v-template>
			</ListView>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import connectionDelegate from '../utils/ConnectionDelegate';
import DeviceSettings from './DeviceSettings';

@Component
export default class Outputs extends Vue {

	// Data
	cd: any = connectionDelegate;
	bus: any = (this as any).$bus;
	marker: string = String.fromCharCode(0xf00c);
	settings_symbol: string = String.fromCharCode(0xf013);
	selected_device_setting: string = "";
	devices: any[] = [];

	// Methods
	constructor() {
		super();
		this.bus.Outputs = this;
	}

	select(device: any): void {
		console.log(`Selected: ${device.device_name}`);
		this.selected_device = device.device_name;
		this.setOutputSettings();
		(this.$refs.deviceList as any).refresh();

	}

	toSettings(deviceName: string): void {

	}

	loadDevices(): void {
		this.getOutputDevices();
	}

	setOutputSettings(): void {
		let outputSettings: any = {
			'selected_device': this.selected_device,
			'devices': this.devices
		}
		this.cd.setOutputSettings(outputSettings);
	}

	get selected_device(): string {
		let outputDevice: any = this.cd.outputDevices;
		return outputDevice.selected_device || "None";
	}

	set selected_device(name: string) {
		let outputDevices: any = this.cd.outputDevices;
		let check: any = outputDevices.selected_device || null;
		if(check == null) return;
		this.cd.outputDevices.selected_device = name;
	}

	// Computed
	get selectionclass() {
		return device_name => ({
			"fa": true,
			"selection-marker": true,
			"invisible": device_name != this.selected_device
		});
	}

	// Watches
	@Watch("cd.device_settings")
	getOutputDevices(): void {
		let outputDevices: any = this.cd.outputDevices;
		this.devices = outputDevices.devices || [];
	}
}
</script>

<style lang="scss" scoped>
@import '../app';

.invisible {
	opacity: 0.0;
}

.settings {
	width: 100%;
	text-align: right;
	padding-right: 50px;
	color: $orange;
	font-size: 36px;
}

.selection-marker {
	padding-left: 20px;
	color: $orange;
}

.device-listing {
	padding: 20px;
}
</style>
