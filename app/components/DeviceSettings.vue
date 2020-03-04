<template>
	<Page @loaded="loadSettings">
		<ActionBar :title="selected_device"></ActionBar>
		<StackLayout>
			<ListView ref="settingList" height="100%" for="setting in device_settings">
				<v-template>
					<GridLayout class="setting" rows="auto" columns="*">
						<Label row="0" class="setting-text" :text="setting.display_name" />
						<!--<TextField class="setting-input" hint="HI" secure="false" returnKeyType="done" maxLength="10" :text="setting.value"></TextField>-->
						<TextField row="0" class="setting-input" horizontalAlignment="right" :text="setting.value"></TextField>
					</GridLayout>
				</v-template>
			</ListView>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
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

	loadSettings(): void {
		console.log(`settings: ${JSON.stringify(this.device_settings)}`);
	}

	// Computeds
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
