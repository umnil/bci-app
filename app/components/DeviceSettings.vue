<template>
	<Page>
		<ActionBar id="test" :title="selected_device">
			<ActionItem @tap="saveSettings" ios.position="right" android.position="popup">Save</ActionItem>
		</ActionBar>
		<StackLayout>
			<ListView ref="settingList" height="100%" for="setting in device_settings">
				<v-template>
					<GridLayout class="setting" rows="auto" columns="*">
						<Label row="0" class="setting-text" :text="setting.display_name" />
						<component :is="settingComponent(setting)" />
						<!--<TextField id="n_values" horizontalAlignment="right" @returnPress="onChange" text="3" />-->
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
		// console.log(`CHANGE! Name: ${settingName}, value: ${value}`);
		this.settingComponents[settingName] = value;
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
			TextField: "returnPress",
			Slider: "valueChange"
		};

		let result: string = `@${actionMap[setting.type]}="onChange($event)"`;
		return result;
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

		// WORKER message HERE
		/// this.worker.postMessage({data:inputSettings});
		// this.cd.setInputSettings(inputSettings).then();
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

	// Computeds
	get settingComponent(): any {
		return (setting) => {
			let template: string = `<${setting.type} id="${setting.name}" class="setting-input" ${this.setting2attrs(setting)} ${this.actionValue(setting)} width="30%" v-model="value" />`;
			console.log(template);
			let component = {
				template: template,
				data: () => ({
					value: setting.value,
					onChange: this.onChange.bind(this)
				}),
			};
			this.settingComponents[setting.name] = setting.value;
			return component;
		};
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

.setting {
	padding: 20px;
	font-size: 18px;
}

.setting-input {
	text-align:right;
	width: 40%;
	background: white;
}
</style>
