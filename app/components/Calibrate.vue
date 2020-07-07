<template>
	<Page @loaded="onOpen" @navigatingFrom="stopCalibrating">
		<StackLayout>
			<Label class="instruction" :text="instruction" width="100%" height="100%"/>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import DeviceSettings from './DeviceSettings';

@Component
export default class Calibrate extends Vue {

	// Class Properties
	bus: any = (this as any).$bus;
	cd: ConnectionDelegate = this.bus.cd;

	// Data
	instruction: string = "Please wait...";

	// Methods
	constructor() {
		super();
	}

	onOpen(): void {
		this.cd.calibrationSubscribe(this.recvCalibrationUpdate.bind(this));
	}

	stopCalibrating(): void {
		this.bus.DeviceSettings.stopCalibrating();
	}

	recvCalibrationUpdate(new_value: any): void {
		if(new_value == "END") {
			(this as any).$navigateBack();
			return;
		}

		this.instruction = new_value;
	}
}
</script>

<style lang="scss" scoped>
@import "../app";

Page {
	background: $orange;
}

.instruction {
	font-size: 36px;
	color: white;
	text-align: center;
}
</style>
