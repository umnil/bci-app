<template>
	<Page @navigatingFrom="checkRefreshSettings">
		<ActionBar id="test" :title="selected_device" />
		<StackLayout>
			<StackLayout v-show="!busy">
				<Label class="setting-list-label" text="Save setting changes" />
				<GridLayout v-show="flags.changed" class="setting-list" rows="44" columns="*">
					<Button col="0" class="setting-item-label" text="Save Settings" @tap="saveSettings" />
				</GridLayout>
				<GridLayout v-show="!flags.changed" class="setting-list" rows="44" columns="*">
					<Label col="0" class="setting-item-label disabled" text="Save Settings" />
				</GridLayout>
	
				<Label class="setting-list-label" text="Device Settings" />
				<component :is="allSettingComponents" />
			</StackLayout>
			<StackLayout v-show="busy">
				<Label horizontalAlignment="center" text="Please wait..." />
				<ActivityIndicator :busy="busy"></ActivityIndicator>
			</StackLayout>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { EventData } from '@nativescript/core/data/observable';
import Switch from '@nativescript/core/ui/Switch.vue';
import Page from '@nativescript/core/ui/Page.vue';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Dialogs } from '@nativescript/core/ui/dialogs';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import DeviceList from './DeviceList.vue';
import Calibrate from './Calibrate.vue';
import { DeviceDataController } from '../controllers/DeviceDataController';

@Component
export default class DeviceSettings extends Vue {

	@Prop() collectionName: string;
	@Prop() deviceName: string;
	@Prop() deviceSettings: any;
	@Prop() refreshSettings: ()=>void;
	
	// Members & Attributes
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate;
	private ddc: DeviceDataController;
	private busy: boolean = false;
	flags: any = {
		'changed': false
	};

	// Methods
	constructor() {
		super();
		this.cd = this.bus.cd;
		this.ddc = this.bus.controllers.deviceDataController;
		this.bus.DeviceSettings = this;
	}

	log: (message: any)=> void = console.log.bind(console.log, "DeviceSettings: ");

	/**
	 * checkRefreshSettings
	 * When the page loads refresh the current device settings in case it's
	 * recently changed.
	 */
	checkRefreshSettings(): void {
		if(this.flags.changed) {
			this.refreshSettings();
		}
	}

	setSettingValue(settingName: string, value: any): void {
		let potential_setting: any[] = this.deviceSettings.filter(e=>e.name==settingName);
		if(potential_setting.length < 1) {
			this.log(`Failed to get setting name for "${settingName}"`);
		}
		let setting: any = potential_setting[0];
		setting.value = value;
	}

	/**
	 * saveSettings
	 * save the current settings information by sending it all to the server
	 */
	saveSettings(): void {
		console.log("Saving settings");
		this.busy = true;
		let deviceData: any = {
			device_name: this.deviceName,
			device_settings: this.deviceSettings
		};
		this.ddc.saveDeviceSettings(this.collectionName, this.deviceName, deviceData).then(
			()=>{this.busy=false;this.flags.changed=false;},
			(err)=>{this.busy=false;Dialogs.alert("Failed to save settings");}
		);
	}

	startCalibration(): void {
		// save settings
		this.saveSettings();

		// navigate to the calibration screen
		(this as any).$navigateTo(Calibrate);
	}

	stopCalibrating(): void {
		this.setSettingValue('calibrating', false);
		this.setSettingValue('assessing_accuracy', false);
		this.saveSettings();
	}

	// Computeds
	get allSettingComponents(): any {
		let n_settings: number = this.deviceSettings.length;
		let template: string = this.deviceSettings.map((e,i)=>`<DeviceSetting${e.type} :setting="setting[${i}]" :flags="flags" />`).join("");
		let components = {
			template: `<StackLayout class="setting-list">${template}</StackLayout>`,
			data: () => ({
				setting: this.deviceSettings,
				flags: this.flags
			})
		};
		return components;
	}

	get selected_device(): string {
		return this.bus.settings_selected_device;
	}

	get device_settings(): any[] {
		let cur_device: any = this.selected_device_data;
		let device_settings: any[] = [];
		if(cur_device.hasOwnProperty('device_settings')) {
			device_settings = cur_device['device_settings'];
		}
		return device_settings;
	}

	set device_settings(new_device_settings: any[]) {
		this.busy = true;
		let cur_device: any = this.selected_device_data;
		cur_device['device_settings'] = new_device_settings;
		console.log(`New Device Settings: ${JSON.stringify(cur_device)}`);
		this.selected_device_data = cur_device;
	}

	get selected_device_data(): any {
		let cur_devices: any[] = this.io_device_array;
		if(cur_devices.length < 1) return {};

		let potentialDevice: any[] = cur_devices.filter(device => device.device_name == this.selected_device);
		if(potentialDevice.length < 1) return {};

		return potentialDevice[0];
	}

	set selected_device_data(device_data: any) {
		let cur_device_array: any[] = this.io_device_array;
		let new_device_data: any[] = cur_device_array.map(device => {
			if(device.device_name == device_data.device_name) return device_data;
			else return device;
		});
		console.log(`New selected device data: ${JSON.stringify(new_device_data)}`);
		this.io_device_array = new_device_data;
	}

	get io_device_array(): any[] {
		let io: string = this.bus.settings_io;
		return this.cd[io]['devices'];
	}
	
	set io_device_array(device_array: any[]) {
		let io: string = this.bus.settings_io;
		let device_data: any = JSON.parse(JSON.stringify(this.cd[io]));
		device_data['devices'] = device_array;

		console.log(`New Device Array: ${JSON.stringify(device_data)}`);
		let _io: string = io.substring(0, io.indexOf("D"));
		let capitalize: (string) => string = (word: string): string => {
			let firstLetter: string = word[0];
			let remainingWord: string = word.substring(1);
			return `${firstLetter.toUpperCase()}${remainingWord}`
		};
		let func_name: string = `set${capitalize(_io)}DeviceData`;
		console.log(`function: ${func_name}`);
		console.log(`f: ${this.cd[func_name]}`);
		(this.cd[func_name])(device_data).then(
			()=>{this.busy=false;this.flags.changed=false;},
			(err)=>{this.busy=false;Dialogs.alert("Failed to save settings");}
		);
	}

	// Watches

	// Properties
}
</script>

<style lang="scss">
@import "../app";

.setting {
	border-width: 0px;
	padding: 40px;
	font-size: 18px;
}

.setting-input {
	border-width: 0px;
	text-align:right;
	width: 100%;
	background: white;
}

Button.setting-input {
	width: 100%;
	text-align: center;
	padding: 20px;
	background: $orange;
	color: white;
	border-radius: 20px;
	border-color: $orange;
}

</style>
