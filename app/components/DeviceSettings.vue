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

	// Methods
	constructor() {
		super();
		this.bus.DeviceSettings = this;
	}

	onChange(args): void {
		console.log(`CHANGE! ${args.object.id}`);
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

	// Computeds
	get settingComponent(): any {
		return setting => {
			let template: string = `<${setting.type} id="${setting.name}" ${this.setting2attrs(setting)} ${this.actionValue(setting)} text="${setting.value}" />`;
			console.log(template);
			return {
				template: template,
				data: () => ({
					onChange: this.onChange.bind(this)
				})
			}
		};
	}
	
	get selected_device(): string {
		return this.bus.settings_selected_device;
	}

	get device_settings(): any {
		let cur_device: any = this.selected_device_data;
		let device_settings: any[] = [];
		if(cur_device.hasOwnProperty('device_settings')) {
			device_settings = cur_device['device_settings'];
		}
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
	width: 40%;
	background: white;
}
</style>
