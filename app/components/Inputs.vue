<template>
	<Page @loaded="loadDevices">
		<StackLayout>
			<ListView for="device in devices" @itemTap="toSettings">
				<v-template>
					<Label :text="device.device_name" />
				</v-template>
			</ListView>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import connectionDelegate from '../utils/ConnectionDelegate';

@Component
export default class Inputs extends Vue {


	// Data
	cd: any = connectionDelegate;
	selected_device: string = "None";
	devices: any[] = [];

	// Methods
	loadDevices() {
		this.getInputDevices();
	}

	toSettings(): void {

	}

	// Watches
	@Watch("cd.device_settings")
	getInputDevices(): void {
		let devices: any = this.cd.device_settings;
		if(devices.hasOwnProperty('inputdevices')) {
			this.selected_device = devices.inputdevices.selected_device;
			this.devices = devices.inputdevices.devices;
		}
	}
}
</script>

<style lang="scss" scoped>
</style>
