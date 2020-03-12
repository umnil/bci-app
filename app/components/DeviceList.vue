<template>
	<Page @loaded="loadDevices">
		<ActionBar :title="title" />
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
export default class DeviceList extends Vue {

	// Members
	listSet: string = "";  // Input or Output
	cd: any = connectionDelegate;
	bus: any = (this as any).$bus;
	selection_marker: string = String.fromCharCode(0xf00c);
	settings_symbol: string = String.fromCharCode(0xf013);
	selected_device_setting: string = "";
	devices: any[] = [];

	// Methods
	constructor() {
		super();
		if(this.listSet == "") {
			throw "Cannot create this component without a defined list set";
		}

		this.bus[`${this.listSet}s`] = this;
	}

	toSettings(device: any): void {
		this.bus.settings_selected_device = device.device_name;
		this.bus.settings_io = `${this.listSet.tolowercase()}devices`;
		(this as any).$navigateTo(DeviceSettings);
	}

	select(device: any): void {
		console.log(`Selected: ${device.device_name}`);
		this.selected_device = device.device_name;
		this.setSettings();
		(this.$refs.deviceList as any).refresh();
	}

	loadDevices(): void {
		this.getDevices();
	}

	setSettings(): void {
		let settings: any = {
			'selected_device': this.selected_device,
			'devices': this.devices
		}
		// this.cd.setInputSettings(inputSettings);
		// Call to worker function
	}

	// Computed Properties
	get title(): string {
		return `${this.listSet} Devices`;
	}

	get selected_device(): string {
		// call to worker func
		let devices: any = this.cd.inputDevices;
		return devices.selected_device || "None";
	}

	set selected_device(name: string) {
		// Call to worker func
		let devices: any = this.cd.inputDevices;
		let check: any = devices.selected_device || null;
		if(check == null) return;
		// Call to worker func
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
	getDevices(): void {
		// call to worker func
		let devices: any = this.cd.inputDevices;
		console.log(`${this.listSet.toUpperCase()}S: ${devices.devices}`);
		this.devices = devices.devices || [];
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
