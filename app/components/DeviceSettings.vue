<template>
	<Page @navigatingFrom="refreshSettings">
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
import { EventData } from 'tns-core-modules/data/observable';
import { Switch } from 'tns-core-modules/ui/Switch';
import { Page } from 'tns-core-modules/ui/Page';
import { Vue, Component, Watch } from 'vue-property-decorator';
import Dialogs from 'tns-core-modules/ui/dialogs';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import DeviceList from './DeviceList';
import Calibrate from './Calibrate';

@Component
export default class DeviceSettings extends Vue {
	
	// Members & Attributes
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = this.bus.cd;
	private deviceList: DeviceList = this.bus.deviceList;
	private busy: boolean = false;
	settings: any[] = this.device_settings;
	flags: any = {
		'changed': false
	};

	// Methods
	constructor() {
		super();
		this.bus.DeviceSettings = this;
		this.settings = this.device_settings;
	}

	log: (message: any)=> void = console.log.bind(console.log, "DeviceSettings: ");

	refreshSettings(): void {
		if(this.flags.changed) {
			this.deviceList.refreshSettings();
		}
	}

	setSettingValue(settingName: string, value: any): void {
		let potential_setting: any[] = this.settings.filter(e=>e.name==settingName);
		if(potential_setting.length < 1) {
			this.log(`Failed to get setting name for "${settingName}"`);
		}
		let setting: any = potential_setting[0];
		setting.value = value;
	}

	saveSettings(): void {
		this.device_settings = this.settings;
	}

	startCalibration(): void {
		// save settings
		this.saveSettings();

		// navigate to the calibration screen
		(this as any).$navigateTo(Calibrate);
	}

	stopCalibrating(): void {
		this.setSettingValue('calibrating', false);
		this.setSettingValue('assessingAccuracy', false);
		this.saveSettings();
	}

	// Computeds
	get allSettingComponents(): any {
		let n_settings: number = this.device_settings.length;
		let template: string = this.device_settings.map((e,i)=>`<DeviceSetting${e.type} :setting="setting[${i}]" :flags="flags" />`).join("");
		let components = {
			template: `<StackLayout class="setting-list">${template}</StackLayout>`,
			data: () => ({
				setting: this.settings,
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
