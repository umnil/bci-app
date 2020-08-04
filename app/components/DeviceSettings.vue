<template>
	<Page>
		<ActionBar id="test" :title="selected_device">
			<ActionItem @tap="saveSettings" ios.position="right" android.position="popup">Save</ActionItem>
		</ActionBar>
		<StackLayout>
			<Label class="setting-list-label" text="Device Settings" />
			<StackLayout class="setting-list">
				<component :is="allSettingComponents" />
				<!--<DeviceSettingItem :setting="device_settings[0]"/>-->
				<!--<Label col="0" :id="setting.name" :text="setting.display_name" />-->
				<!--<Label col="1" v-model="setting.value" />-->
				<!--<Label col="2" class="fa" :text="String.fromCharCode(0xf054)" />-->
			</StackLayout>
			<ListView ref="settingList" height="100%" for="setting in device_settings">
				<v-template>
					<GridLayout class="setting" rows="auto" columns="*, *, *" width="100%">
						<Label col="0" colSpan="1" class="setting-text" :text="setting.display_name" />
						<component col="1" colSpan="2" :is="settingComponent(setting)" />
					</GridLayout>
				</v-template>
			</ListView>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { EventData } from 'tns-core-modules/data/observable';
import { Switch } from 'tns-core-modules/ui/Switch';
import { Page } from 'tns-core-modules/ui/Page';
import { Vue, Component, Watch } from 'vue-property-decorator';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import Calibrate from './Calibrate';

@Component
export default class DeviceSettings extends Vue {
	
	// Members & Attributes
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = this.bus.cd;
	settings: any[] = [];
	settingComponents: {} = {};

	// Methods
	constructor() {
		super();
		this.bus.DeviceSettings = this;
	}

	onChange(args): void {
		let valueMap: object = {
			TextField: "text",
			Slider: "value"
		};
		let input: any = args.object;
		let settingName: string = input.id;
		let settingType: string = this.getSettingByName(settingName).type;
		let value: any = input[valueMap[settingType]];
		this.settingComponents[settingName] = value;
	}

	switchValue(args): void {
		let input: any = args.object;
		let settingName: string = input.id;
		let settingType: string = this.getSettingByName(settingName).type;
		this.settingComponents[settingName] = !this.settingComponents[settingName];
		if(this.settingComponents[settingName] == true) {
			if(
				settingName == 'calibrating' ||
				settingName == 'assessingAccuracy'
			) this.startCalibration();
		}
	}

	setting2attrs(setting: any): string {
		let reservedValues: string[] = [
			'type',
			'name',
			'display_name',
			'value'
		];
		return Object.keys(setting)
			.filter(e => !reservedValues.includes(e))
			.map(e => `${e}="${setting[e]}"`).join(' ');
	}

	actionValue(setting: any): string {
		let actionMap: any = {
			Button: "tap",
			TextField: "returnPress",
			Slider: "valueChange"
		};

		let processMap: any = {
			Button: "switchValue($event)",
			TextField: "onChange($event)",
			Slider: "onChange($event)"
		}

		let action: string = actionMap[setting.type];
		let process: string = processMap[setting.type];
		let result: string = `@${action}="${process}"`;
		return result;
	}

	reactiveValue(setting: any): string {
		let includedTypes: any[] = [
			"TextField",
			"Slider"
		];

		if(includedTypes.indexOf(setting.type) != -1) return 'v-model="value"';

		return "";
	}

	getSettingByName(settingName: string): any {
		let device_settings: any[] = this.device_settings;
		let potential_setting: any[] = device_settings.filter(e => e.name == settingName);
		if(potential_setting.length < 1) return null;

		return potential_setting[0];
	}

	setSettingValue(settingName: string, value: any): void {
		let settingIndex: number = this.settings.reduce((r, c, i) => r = c.name == settingName ? i : -1, -1);
		console.log(`Setting ${settingName}, index ${settingIndex} to ${value}`);
		let curSettings: any = JSON.parse(JSON.stringify(this.settings))
		curSettings[settingIndex]['value'] = value;

		let iodevice: string = this.bus.settings_io;
		let deviceIndex: number = this.io_device_array.reduce((r, c, i) => {r = c.device_name == this.selected_device ? i : r;return r;}, -1);
		let inputSettings: any = null; // JSON.parse(JSON.stringify(this.cd.device_settings[iodevice]));
		inputSettings['devices'][deviceIndex]['device_settings'] = curSettings;
	}

	saveSettings(): void {
		let curSettings: any = JSON.parse(JSON.stringify(this.settings));
		curSettings.map(setting => {
			setting.value = this.settingComponents[setting.name];
			return setting;
		});
		console.log(curSettings);
		this.settings = curSettings;
		this.device_settings = this.settings;
	}

	startCalibration(): void {
		// save settings
		this.saveSettings();

		// navigate to the calibration screen
		(this as any).$navigateTo(Calibrate);
	}

	stopCalibrating(): void {
		this.settingComponents['calibrating'] = false;
		this.settingComponents['assessingAccuracy'] = false;
		this.saveSettings();
	}

	// Computeds
	get settingComponent(): any {
		return (setting) => {
			console.log(JSON.stringify(setting));
			let template: string = `<${setting.type} id="${setting.name}" class="setting-input" col="1" colSpan="2" ${this.setting2attrs(setting)} ${this.actionValue(setting)} ${this.reactiveValue(setting)} />`;
			console.log(template);
			let component = {
				template: template,
				data: () => ({
					value: setting.value,
					onChange: this.onChange.bind(this),
					switchValue: this.switchValue.bind(this)
				}),
			};
			this.settingComponents[setting.name] = setting.value;
			return component;
		};
	}

	get allSettingComponents(): any {
		let components = {
			template: `<DeviceSettingItem :setting="setting" />`,
			data: () => ({
				setting: this.device_settings[0]
			})
		};
		return components;
	}

	get settingComponentTemplate(): string {
		// return settings.map((e) => {
		// 	return "<DeviceSettingItem setting"
		// }).join("\n");
		return "";
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
		this.settings = device_settings;
		return device_settings;
	}

	set device_settings(new_device_settings: any[]) {
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
		(this.cd[func_name])(device_data);
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
