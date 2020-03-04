<template>
	<Page @loaded="loadDevices">
		<ActionBar title="Input Devices" />
		<StackLayout>
			<ListView ref="deviceList" for="device in devices" height="100%">
				<v-template>
					<StackLayout orientation="horizontal" width="100%">
						<Label :class="selectionclass(device.device_name)" :text="marker" />
						<Label class="device-listing" :text="device.device_name" @tap="select(device)"/>
						<Label class="fa settings" :text="settings_symbol" @tap="toSettings(device)" />
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
export default class Inputs extends Vue {

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
		this.bus.Inputs = this;
	}

	toSettings(device: any): void {
		this.bus.settings_selected_device = device.device_name;
		this.bus.settings_io = "inputdevices";
		(this as any).$navigateTo(DeviceSettings);
	}

	select(device: any): void {
		console.log(`Selected: ${device.device_name}`);
		this.selected_device = device.device_name;
		this.setInputSettings();
		(this.$refs.deviceList as any).refresh();
	}

	loadDevices(): void {
		this.getInputDevices();
	}

	setInputSettings(): void {
		let inputSettings: any = {
			'selected_device': this.selected_device,
			'devices': this.devices
		}
		this.cd.setInputSettings(inputSettings);
	}

	get selected_device(): string {
		let inputDevices: any = this.cd.inputDevices;
		return inputDevices.selected_device || "None";
	}

	set selected_device(name: string) {
		let inputDevices: any = this.cd.inputDevices;
		let check: any = inputDevices.selected_device || null;
		if(check == null) return;
		this.cd.inputDevices.selected_device = name;
	}

	// Computed
	get selectionclass() {
		return device_name => ({
			"fa": true,
			"selection-marker": true,
			"invisible": device_name != this.selected_device
		});
	}

	@Watch("cd.device_settings")
	getInputDevices(): void {
		let inputDevices: any = this.cd.inputDevices;
		console.log(`INPUTS: ${inputDevices.devices}`);
		this.devices = inputDevices.devices || [];
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
