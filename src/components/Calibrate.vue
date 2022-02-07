<template>
	<Page @loaded="onOpen" @navigatingFrom="stopCalibrating">
		<StackLayout>
			<Label class="instruction" :text="instruction" width="100%" height="100%"/>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { keepAwake, allowSleepAgain } from 'nativescript-insomnia';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import DeviceSettings from './DeviceSettings';
import { PromptController } from '../controllers/PromptController';

@Component
export default class Calibrate extends Vue {

	// Class Properties
	bus: any = (this as any).$bus;
	cd: ConnectionDelegate;
	pc: PromptController;

	// Data
	instruction: string = "Please wait...";

	// Methods
	constructor() {
		super();
		this.cd = this.bus.cd;
		this.pc = this.bus.controllers.promptController;
	}

	log: (message: any) => void = console.log.bind(console, "Calibrate: ");

	onOpen(): void {
		// this.cd.calibrationSubscribe(this.recvCalibrationUpdate.bind(this));
		keepAwake().then(() => {this.log("Keep Awake");});
		this.pc.subscribe();
	}

	stopCalibrating(): void {
		allowSleepAgain().then(() => {this.log("Sleep again");});
		this.bus.DeviceSettings.stopCalibrating();
	}

	 @Watch('pc.prompt.value')
	 recvCalibrationUpdate(): void {
	 	if(this.pc.prompt.value == "END") {
	 		(this as any).$navigateBack();
	 		return;
	 	}

	 	this.log(`CALIBRATE END TIME: ${new Date().toJSON()}`);
	 	this.instruction = this.pc.prompt.value;
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
