<template>
	<Page @loaded="loadDevices">
		<ActionBar :title="title" />
		<StackLayout>
			<ListView ref="deviceList" for="device in devices" height="100%" v-show="!busy">
				<v-template>
					<StackLayout orientation="horizontal" width="100%">
						<Label :class="selectionclass(device.device_name)" :text="selection_marker" />
						<Label class="device-listing" :text="device.device_name" @tap="select(device)"/>
						<Label class="fa settings" :text="settings_symbol" @tap="toSettings(device)" />
					</StackLayout>
				</v-template>
			</ListView>
			<Label horizontalAlignment="center" text="Please wait..." />
			<ActivityIndicator :busy="busy"></ActivityIndicator>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import Dialogs from 'tns-core-modules/ui/dialogs';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import DeviceSettings from './DeviceSettings';

@Component
export default class DeviceList extends Vue {

	// Members
	private listSet: string = "";  // Input or Output
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = this.bus.cd;
	private busy: boolean = false;
	selection_marker: string = String.fromCharCode(0xf00c);
	settings_symbol: string = String.fromCharCode(0xf013);
	selected_device_setting: string = "";
	devices: any[] = [];

	// Methods
	constructor() {
		super();
	}

	toSettings(device: any): void {
		this.bus.settings_selected_device = device.device_name;
		this.bus.settings_io = `${this.listSet.toLowerCase()}Devices`;
		(this as any).$navigateTo(DeviceSettings);
	}

	select(device: any): void {
		console.log(`Selected: ${device.device_name}`);
		this.selected_device = device.device_name;
		this.setDevice();
		(this.$refs.deviceList as any).refresh();
	}

	loadDevices(): void {
		this.getListSet();
		if(this.listSet == "") {
			throw "Cannot create this component without a defined list set";
		}

		this.bus[`${this.listSet}s`] = this;
		this.getDevices();
	}

	setDevice(): void {
		this.busy = true;
		let deviceData: any = {
			'selected_device': this.selected_device,
			'devices': this.devices
		}
		this.cd[`set${this.listSet}DeviceData`](deviceData).then(
			()=>{this.busy = false;},
			(err)=>{this.busy = false;Dialogs.alert("Failed");}
		);
	}

	// Computed Properties
	get title(): string {
		return `${this.listSet} Devices`;
	}

	get deviceIndex(): string {
		return `${this.listSet.toLowerCase()}Devices`;
	}

	get selected_device(): string {
		// call to worker func
		let devices: any = this.cd[this.deviceIndex];
		return devices.selected_device || "None";
	}

	set selected_device(name: string) {
		this.cd[this.deviceIndex].selected_device = name;
	}

	// Computed
	get selectionclass() {
		return device_name => ({
			"fa": true,
			"selection-marker": true,
			"invisible": device_name != this.selected_device
		});
	}

	@Watch("bus.listSet")
	getListSet(): void {
		this.listSet = (this as any).$bus.listSet;
		console.log(`listSet: ${this.listSet}`);
	}

	@Watch("cd.device_settings")
	getDevices(): void {
		// call to worker func
		let devices: any = this.listSet == "Input" ? this.cd.inputDevices : this.cd.outputDevices;
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
