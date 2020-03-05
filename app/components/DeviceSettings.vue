<template>
	<Page @loaded="onLoad">
		<ActionBar id="test" :title="selected_device"></ActionBar>
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
import connectionDelegate from '../utils/ConnectionDelegate';

@Component
export default class DeviceSettings extends Vue {
	
	// Members & Attributes
	cd: any = connectionDelegate;
	bus: any = (this as any).$bus;
	_settings: any[] = [];
	settingComponents: object = {};

	// Methods
	constructor() {
		super();
		this.bus.DeviceSettings = this;
	}

	onChange(args): void {
		let valueMap: object = {
			TextField: "text"
		};
		let input: any = args.object;
		let settingName: string = input.id;
		let settingType: string = this.getSettingByName(settingName).type;
		let value: any = input[valueMap[settingType]];
		console.log(`CHANGE! Name: ${settingName}, value: ${value}`);
		this.setSettingValue(settingName, value);
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
			TextField: "returnPress"
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
		let settingIndex: number = this._settings.reduce((r, c, i) => r = c.name == settingName ? i : -1, -1);
		console.log(`Setting ${settingName}, index ${settingIndex} to ${value}`);
		this._settings[settingIndex]['value'] = value;

		let iodevice: string = this.bus.settings_io;
		let deviceIndex: number = this.io_device_array.reduce((r, c, i) => r = c.device_name == this.selected_device ? i : -1, -1);
		let inputSettings: any = this.cd.device_settings[iodevice]
		inputSettings['devices'][deviceIndex]['device_settings'] = this._settings;
		this.cd.setInputSettings(inputSettings).then();
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
				computed: {
					[setting.name]: {
						get: () => this.getSettingByName(setting.name).value,
						set: (val) => {this.setSettingValue(setting.name, val);return false;}
					}
				}
			};
			this.settingComponents[setting.name] = component;
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
		this._settings = device_settings;
		return device_settings;
	}

	get selected_device_data(): any {
		let cur_devices: any[] = this.io_device_array;
		if(cur_devices.length < 1) return {};

		let potentialDevice: any[] = cur_devices.filter(device => device.device_name == this.selected_device);
		if(potentialDevice.length < 1) return {};

		return potentialDevice[0];
	}

	get io_device_array(): any[] {
		let iodevices: string = this.bus.settings_io;
		let result_device_array: any[] = [];
		if(this.cd.device_settings.hasOwnProperty(iodevices)) {
			result_device_array = this.cd.device_settings[iodevices]['devices'];
		}
		return result_device_array;
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
