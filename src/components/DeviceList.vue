<template>
	<Page @loaded="refreshSettings">
		<ActionBar :title="title">
			<StatusIndicator name="main" />
		</ActionBar>
		<StackLayout>
			<ListView ref="deviceList" for="device in devices" height="100%" v-show="!busy">
				<v-template>
					<StackLayout orientation="horizontal" width="100%" height="55">
						<Label :class="selectionclass(device.device_name)" :text="selectionMarker" />
						<Label class="device-listing" :text="device.device_name" @tap="select(device)"/>
						<Label class="fa settings" :text="settingsSymbol" @tap="toSettings(device)" />
					</StackLayout>
				</v-template>
			</ListView>
			<Label horizontalAlignment="center" text="Please wait..." />
			<ActivityIndicator :busy="busy"></ActivityIndicator>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Dialogs } from '@nativescript/core/ui/dialogs';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import { default as DeviceSettingsVue } from './DeviceSettings.vue';
import { DeviceDataController } from '../controllers/DeviceDataController';

@Component
export default class DeviceList extends Vue {

	@Prop() listSet: string

	// Members
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate;
	private ddc: DeviceDataController;
	private busy: boolean = false;
	selectionMarker: string = String.fromCharCode(0xf00c);
	settingsSymbol: string = String.fromCharCode(0xf013);
	selectedDeviceSetting: string = "";

	// Methods
	constructor() {
		super();
		this.cd = this.bus.cd;
		this.ddc = this.bus.controllers.deviceDataController;
		this.bus.deviceList = this;
	}

	/**
	 * toSettings
	 * Navigate to the settings page of the given device
	 * @param {DeviceSettings} device - the device who's settings to view
	 */
	toSettings(device: any): void {
		let properties = {
			props: {
				collectionName: `${this.listSet.toLowerCase()}devices`,
				deviceName: device.device_name,
				deviceSettings: device.device_settings,
				refreshSettings: this.refreshSettings.bind(this)
			}
		};
		this.$navigateTo(DeviceSettingsVue, properties);
	}

	/**
	 * select
	 * Function used to select the desired device
	 * @param {DeviceSettings} device - the settings for the device
	 */
	select(device: DeviceSettings): void {
		console.log(`Selected: ${device.device_name}`);
		this.selectedDevice = device.device_name;
		this.setDevice();
		(this.$refs.deviceList as any).refresh();
	}

	/**
	 * setDevice
	 * Use the DeviceDataController to store the selection on the server
	 */
	setDevice(): void {
		this.busy = true;
		this.ddc.deviceData[this.listIndex].selected_device = this.selectedDevice
		this.ddc.saveDeviceSettingsCollection(this.listIndex, this.deviceList).then(
			()=>{this.busy = false;},
			(err)=>{this.busy = false; Dialogs.alert("Failed to select device");}
		);
	}

	refreshSettings(): void {
		this.busy = true;
		this.ddc.loadDeviceData().then(
			()=>{this.busy = false;},
			(err)=>{this.bus = false;Dialogs.alert("Failed to refresh settings");}
		);
	}

	// Computed Properties
	get title(): string {
		return `${this.listSet} Devices`;
	}

	get listIndex(): string {
		return `${this.listSet.toLowerCase()}devices`;
	}

	get deviceList(): DeviceSettingsCollection {
		return this.ddc.deviceData[this.listIndex];
	}

	get selectedDevice(): string {
		return this.deviceList.selected_device || "None";
	}

	set selectedDevice(name: string) {
		this.deviceList.selected_device = name;
	}

	get selectionclass() {
		return deviceName => ({
			"fa": true,
			"selection-marker": true,
			"invisible": deviceName != this.selectedDevice
		});
	}

	get devices(): DeviceSettings[] {
		return this.deviceList.devices;
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
